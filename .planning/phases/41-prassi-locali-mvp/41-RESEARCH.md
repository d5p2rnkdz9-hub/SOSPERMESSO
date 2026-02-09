# Phase 41: Prassi Locali MVP - Research

**Researched:** 2026-02-09
**Domain:** Serverless form submission, voting systems, Notion webhooks, autocomplete UI
**Confidence:** MEDIUM-HIGH

## Summary

The Prassi Locali MVP requires integrating four key technologies: Netlify Functions for serverless API endpoints, Notion API for submission storage and moderation workflow, client-side voting with abuse prevention, and autocomplete/typeahead for city selection. The standard stack is well-established and mature.

**Core architecture:** Static-first with thin dynamic layer. Approved content is baked into pages at build time via 11ty data files (like existing `documents.js`). Dynamic operations (form submission, voting) use Netlify Functions with Notion as the database. Webhook-triggered rebuilds publish approved submissions.

**Key findings:**
- Netlify Functions v2.0 uses modern Web Platform standards (Request/Response API)
- Notion webhooks support signature verification and event filtering for database updates
- Rate limiting requires external storage (Upstash Redis) in serverless environments
- HTML5 `<datalist>` provides native autocomplete but has accessibility limitations
- Existing contact form modal pattern is ideal foundation for submission UI

**Primary recommendation:** Use Netlify Functions with @notionhq/client for submissions, Upstash Redis (@upstash/ratelimit) for vote rate limiting, Notion webhooks + Build Hooks for auto-deploy, and enhanced `<datalist>` with JavaScript fallback for city autocomplete.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @notionhq/client | ^5.8.0 | Notion API integration | Already in use, official SDK, supports search & page creation |
| Netlify Functions | v2.0 | Serverless API endpoints | Built-in platform feature, automatic deployment, Web Platform API |
| @upstash/ratelimit | Latest | Rate limiting for serverless | Only connectionless HTTP-based solution, multi-region support |
| @upstash/redis | Latest | Serverless Redis storage | Required backend for @upstash/ratelimit |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| crypto (Node.js built-in) | N/A | HMAC-SHA256 for webhook verification | Validating Notion webhook signatures |
| dotenv | ^17.2.3 | Environment variable management | Already in use for NOTION_API_KEY |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Upstash Redis | In-memory localStorage + IP checks | Free but less robust, no cross-instance persistence |
| Notion webhooks | Scheduled builds (cron) | Simpler setup but delayed publish (not real-time) |
| Datalist element | Custom autocomplete library (autoComplete.js) | More control/features but adds 10KB+ dependency |

**Installation:**
```bash
npm install @upstash/redis @upstash/ratelimit
```

## Architecture Patterns

### Recommended Project Structure
```
netlify/
├── functions/           # Serverless function endpoints
│   ├── submit-prassi.js # Form submission → Notion
│   └── vote-prassi.js   # Vote submission with rate limiting
_data/
└── prassiLocali.js      # 11ty data file (fetch approved from Notion)
src/
├── components/
│   └── prassi-form.html # Submission modal (similar to contact-form.html)
└── scripts/
    └── prassi.js        # Client-side voting logic
```

### Pattern 1: Netlify Function for Form Submission
**What:** Accept form POST, validate, create Notion page with Status=Pending
**When to use:** Any user-generated content that requires moderation
**Example:**
```javascript
// netlify/functions/submit-prassi.js
// Source: Netlify Functions v2.0 API (modern Web Platform standard)
export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { city, description, date, category, pageUrl } = await req.json();

  // Validate inputs
  if (!city || !description || description.length < 20) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  try {
    const response = await notion.pages.create({
      parent: { database_id: process.env.PRASSI_DB_ID },
      properties: {
        "Città": { title: [{ text: { content: city } }] },
        "Descrizione": { rich_text: [{ text: { content: description } }] },
        "Data esperienza": { date: date ? { start: date } : null },
        "Categoria": { select: category ? { name: category } : null },
        "Pagina": { url: pageUrl },
        "Status": { select: { name: "Pending" } },
        "Voti Confermo": { number: 0 },
        "Voti Non Confermo": { number: 0 }
      }
    });

    return new Response(JSON.stringify({
      success: true,
      id: response.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Notion API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### Pattern 2: Rate-Limited Voting Endpoint
**What:** Accept vote, apply rate limiting, update Notion page counts
**When to use:** Any public interaction requiring abuse prevention
**Example:**
```javascript
// netlify/functions/vote-prassi.js
// Source: @upstash/ratelimit documentation
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 votes per 60 seconds
});

export default async (req, context) => {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { id, voteType } = await req.json(); // voteType: 'confermo' | 'non_confermo'

  // Rate limit by IP
  const { success, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response(JSON.stringify({
      error: 'Too many votes. Try again later.',
      remaining: 0
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Update Notion page vote counts
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const property = voteType === 'confermo' ? 'Voti Confermo' : 'Voti Non Confermo';

  try {
    // Fetch current count
    const page = await notion.pages.retrieve({ page_id: id });
    const currentCount = page.properties[property].number || 0;

    // Increment
    await notion.pages.update({
      page_id: id,
      properties: {
        [property]: { number: currentCount + 1 }
      }
    });

    return new Response(JSON.stringify({
      success: true,
      remaining,
      newCount: currentCount + 1
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Vote update failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to vote' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### Pattern 3: 11ty Data File for Approved Content
**What:** Fetch only "Approved" status items from Notion, return for static generation
**When to use:** Content that changes infrequently, requires moderation
**Example:**
```javascript
// _data/prassiLocali.js
// Based on existing _data/documents.js pattern
const { Client } = require("@notionhq/client");

const PRASSI_DB_ID = process.env.PRASSI_DB_ID;

module.exports = async function() {
  if (!process.env.NOTION_API_KEY) {
    console.warn('[prassiLocali.js] NOTION_API_KEY not set - returning empty array');
    return [];
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // Search for pages in prassi database with Status = "Approved"
    const allPages = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response = await notion.search({
        filter: { property: 'object', value: 'page' },
        start_cursor: startCursor,
        page_size: 100
      });

      const dbPages = response.results.filter(page =>
        (page.parent?.database_id === PRASSI_DB_ID ||
         page.parent?.data_source_id === PRASSI_DB_ID) &&
        page.properties["Status"]?.select?.name === "Approved"
      );
      allPages.push(...dbPages);

      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    console.log(`[prassiLocali.js] Fetched ${allPages.length} approved prassi`);

    return allPages.map(page => ({
      id: page.id,
      city: page.properties["Città"]?.title?.[0]?.plain_text || null,
      description: page.properties["Descrizione"]?.rich_text?.[0]?.plain_text || null,
      date: page.properties["Data esperienza"]?.date?.start || null,
      category: page.properties["Categoria"]?.select?.name || null,
      votiConfermo: page.properties["Voti Confermo"]?.number || 0,
      votiNonConfermo: page.properties["Voti Non Confermo"]?.number || 0,
    }));
  } catch (error) {
    console.error(`[prassiLocali.js] Notion fetch failed: ${error.message}`);
    return [];
  }
};
```

### Pattern 4: Notion Webhook Verification
**What:** Validate incoming webhook requests using HMAC-SHA256 signature
**When to use:** Receiving Notion webhooks to trigger builds
**Example:**
```javascript
// netlify/functions/notion-webhook.js
// Source: Notion Webhooks documentation
import crypto from 'crypto';

export default async (req, context) => {
  const signature = req.headers.get('x-notion-signature');
  const body = await req.text();

  // Verify signature
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', process.env.NOTION_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return new Response('Invalid signature', { status: 401 });
  }

  const payload = JSON.parse(body);

  // Trigger Netlify build when prassi approved
  if (payload.event === 'data_source.schema_updated' ||
      payload.event === 'page.content_updated') {

    // Call Netlify Build Hook
    await fetch(process.env.NETLIFY_BUILD_HOOK_URL, { method: 'POST' });

    return new Response('Build triggered', { status: 200 });
  }

  return new Response('Event ignored', { status: 200 });
};
```

### Pattern 5: Enhanced Datalist Autocomplete
**What:** HTML5 `<datalist>` for native autocomplete with JavaScript enhancements
**When to use:** Known list of options (questura cities), keyboard-accessible
**Example:**
```html
<!-- Source: HTML5 Datalist documentation + accessibility enhancements -->
<label for="city-input">Città Questura <span class="required">*</span></label>
<input
  type="text"
  id="city-input"
  name="city"
  list="city-options"
  autocomplete="off"
  placeholder="Inizia a scrivere..."
  required
  aria-describedby="city-hint"
>
<datalist id="city-options">
  <option value="Torino">
  <option value="Milano">
  <option value="Roma">
  <!-- ... 105 questure total -->
</datalist>
<span id="city-hint" class="form-hint">
  Seleziona dalla lista o scrivi il nome della tua città
</span>

<script>
// Fallback: validate that input matches a datalist option
const cityInput = document.getElementById('city-input');
const cityOptions = Array.from(document.querySelectorAll('#city-options option'))
  .map(opt => opt.value);

cityInput.addEventListener('blur', () => {
  if (!cityOptions.includes(cityInput.value)) {
    cityInput.setCustomValidity('Seleziona una città dalla lista');
  } else {
    cityInput.setCustomValidity('');
  }
});
</script>
```

### Anti-Patterns to Avoid
- **Don't store votes in localStorage only:** Loses cross-device persistence, trivial to bypass
- **Don't use in-memory rate limiting:** Serverless functions are stateless, each invocation is fresh
- **Don't skip webhook signature verification:** Allows anyone to trigger builds
- **Don't fetch all Notion pages including Pending/Rejected:** Exposes unmoderated content

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting in serverless | Custom Redis client + sliding window algorithm | @upstash/ratelimit | Handles multi-region, implements 3 algorithms (fixed/sliding/token), production-tested |
| Webhook signature validation | Custom HMAC comparison with string equality | crypto.timingSafeEqual() for comparison | Prevents timing attacks that could leak signature |
| Autocomplete dropdown | Custom fuzzy search + keyboard nav + ARIA | Enhanced `<datalist>` or autoComplete.js | Native accessibility, 88% browser support, graceful degradation |
| Form validation | Manual regex checks | HTML5 built-in validation + pattern attribute | Browser-native, accessible error messages, no JS required |
| Notion page creation | Raw HTTP requests to Notion API | @notionhq/client | Handles pagination, retries, type safety, version compatibility |

**Key insight:** Serverless environments are stateless. Any "remembering" (rate limits, user sessions) requires external storage. Don't assume in-memory persistence.

## Common Pitfalls

### Pitfall 1: Stateless Serverless Functions
**What goes wrong:** Developer assumes function memory persists between invocations, stores vote counts or rate limit data in-memory variables
**Why it happens:** Coming from traditional server patterns where process memory is long-lived
**How to avoid:** Always use external storage (Redis, database) for any state that must survive beyond a single request
**Warning signs:** Rate limiting that works in local dev but fails in production, vote counts that reset randomly

### Pitfall 2: Notion Webhook Event Aggregation
**What goes wrong:** Expecting immediate webhook delivery after status change, but events like `page.content_updated` are aggregated and can delay by minutes
**Why it happens:** Notion batches rapid changes to reduce webhook noise
**How to avoid:** Use non-aggregated events for critical workflows (e.g., `page.locked`), or accept minute-scale delay for `content_updated`. Test with real Notion edits, not just API calls.
**Warning signs:** Webhook arrives 2-5 minutes after approval, multiple rapid changes only trigger one webhook

### Pitfall 3: Datalist Accessibility Limitations
**What goes wrong:** Visually impaired users can't navigate autocomplete, font size doesn't scale with zoom
**Why it happens:** Browser native rendering has accessibility gaps (NVDA+Firefox doesn't announce options)
**How to avoid:** Add aria-describedby hint text, test with screen readers, consider autoComplete.js for critical forms
**Warning signs:** Screen reader users report "can't find city selection", mobile users struggle with small text

### Pitfall 4: CORS Errors from Client-Side Fetch
**What goes wrong:** Browser blocks fetch() to Netlify Function due to missing CORS headers
**Why it happens:** Serverless functions don't include CORS headers by default
**How to avoid:** Add CORS headers to all Response objects in functions:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',  // Or specific domain
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```
**Warning signs:** Network tab shows 200 response but JavaScript console errors with CORS policy violation

### Pitfall 5: Notion Search API Doesn't Support Filtering
**What goes wrong:** Attempting to use `filter` parameter in `notion.search()` to get only "Approved" pages
**Why it happens:** Notion Search API only supports `{ property: 'object', value: 'page' }` filter, not property-based filtering
**How to avoid:** Fetch all pages from database, filter in JavaScript after retrieval (like existing `documents.js` pattern)
**Warning signs:** API returns 400 error "filter not supported", or returns all pages ignoring Status filter

### Pitfall 6: localStorage Voting Bypass
**What goes wrong:** User clears localStorage or uses incognito mode to vote unlimited times
**Why it happens:** localStorage is client-controlled and easily manipulated
**How to avoid:** Always combine localStorage (UX convenience) with server-side rate limiting (actual enforcement)
**Warning signs:** Vote counts spike unnaturally, same IP submits hundreds of votes

## Code Examples

Verified patterns from official sources:

### Fetch with Error Handling (Client-Side)
```javascript
// Source: MDN Web Docs - Using the Fetch API
async function submitPrassi(formData) {
  try {
    const response = await fetch('/.netlify/functions/submit-prassi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Submission failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Submit error:', error);
    throw error;
  }
}
```

### Modal Form Pattern (Based on Existing contact-form.html)
```javascript
// Open modal
function openPrassiModal(pageUrl) {
  const modal = document.getElementById('prassi-modal');
  document.getElementById('page-url-input').value = pageUrl; // Pre-fill
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Form submission
document.getElementById('prassi-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Invio in corso...';

  try {
    const result = await submitPrassi(data);

    // Show success message with preview
    showSuccessPreview(data);

    // Reset form
    e.target.reset();
  } catch (error) {
    showError('Errore durante l\'invio. Riprova.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Invia esperienza';
  }
});
```

### Questura Cities List (105 total)
```javascript
// Source: Wikipedia - Provinces of Italy (105 provincial capitals)
const QUESTURA_CITIES = [
  "Agrigento", "Alessandria", "Ancona", "Aosta", "Arezzo", "Ascoli Piceno",
  "Asti", "Avellino", "Bari", "Barletta-Andria-Trani", "Belluno", "Benevento",
  "Bergamo", "Biella", "Bologna", "Bolzano", "Brescia", "Brindisi",
  "Cagliari", "Caltanissetta", "Campobasso", "Caserta", "Catania", "Catanzaro",
  "Chieti", "Como", "Cosenza", "Cremona", "Crotone", "Cuneo",
  "Enna", "Fermo", "Ferrara", "Firenze", "Foggia", "Forlì-Cesena",
  "Frosinone", "Genova", "Gorizia", "Grosseto", "Imperia", "Isernia",
  "L'Aquila", "La Spezia", "Latina", "Lecce", "Lecco", "Livorno",
  "Lodi", "Lucca", "Macerata", "Mantova", "Massa-Carrara", "Matera",
  "Messina", "Milano", "Modena", "Monza e Brianza", "Napoli", "Novara",
  "Nuoro", "Oristano", "Padova", "Palermo", "Parma", "Pavia",
  "Perugia", "Pesaro e Urbino", "Pescara", "Piacenza", "Pisa", "Pistoia",
  "Pordenone", "Potenza", "Prato", "Ragusa", "Ravenna", "Reggio Calabria",
  "Reggio Emilia", "Rieti", "Rimini", "Roma", "Rovigo", "Salerno",
  "Sassari", "Savona", "Siena", "Siracusa", "Sondrio", "Sud Sardegna",
  "Taranto", "Teramo", "Terni", "Torino", "Trapani", "Trento",
  "Treviso", "Trieste", "Udine", "Varese", "Venezia", "Verbano-Cusio-Ossola",
  "Vercelli", "Verona", "Vibo Valentia", "Vicenza", "Viterbo"
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Netlify Functions (classic) | Netlify Functions 2.0 | 2023-2024 | Web Platform API (Request/Response), not AWS Lambda signature |
| Database filtering via Notion query API | Search API + client-side filter | 2025 API v2025-09-03 | Must fetch all pages, filter by Status in JS |
| In-memory rate limiting | External Redis (Upstash) | Always (serverless nature) | Required for stateless environments |
| jQuery autocomplete plugins | Native `<datalist>` or autoComplete.js | 2018+ (88% support) | Zero dependency for basic use case |

**Deprecated/outdated:**
- **Notion `databases.query` with filters:** API v2025-09-03 moved to multi-source data model, filtering unreliable. Use `search()` + JS filter instead.
- **Netlify Functions (classic):** Old `exports.handler = async (event, context)` signature still works but v2.0 Web Platform API is preferred.

## Open Questions

Things that couldn't be fully resolved:

1. **Exact Notion webhook event for Status property change**
   - What we know: `page.content_updated` fires on property changes, but is aggregated (delayed)
   - What's unclear: Whether `data_source.schema_updated` fires on property value changes or only schema changes
   - Recommendation: Subscribe to both events, test in staging with real Notion edits, accept 1-5 minute delay

2. **Category tag predefined list**
   - What we know: User requested optional category field
   - What's unclear: Should categories be predefined (dropdown) or free-text?
   - Recommendation: Start with free-text (simpler MVP), add predefined list in Phase 2 based on common patterns

3. **Vote count refresh strategy**
   - What we know: Votes stored in Notion, but static pages show build-time counts
   - What's unclear: Should votes display live (fetch on page load) or stale (build-time)?
   - Recommendation: Display stale counts (build-time), with "(aggiornato al [date])" indicator. Live counts require client-side fetch on every page load (performance cost).

4. **Questura city list completeness**
   - What we know: 105 provincial capitals have questure
   - What's unclear: Are there additional questura locations beyond provincial capitals?
   - Recommendation: Use 105 cities list as baseline, add "Altro" option for edge cases, monitor submissions for missing cities

## Sources

### Primary (HIGH confidence)
- [Netlify Functions Overview](https://docs.netlify.com/build/functions/overview/) - Architecture, limits, deployment
- [Notion Webhooks Documentation](https://developers.notion.com/reference/webhooks) - Setup, verification, event types
- [MDN: Datalist Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist) - Browser API reference
- [@upstash/ratelimit GitHub](https://github.com/upstash/ratelimit-js) - Rate limiting implementation
- [Upstash Serverless Rate Limiting](https://upstash.com/blog/upstash-ratelimit) - Serverless rate limiting patterns

### Secondary (MEDIUM confidence)
- [Netlify Functions Intro Blog](https://www.netlify.com/blog/intro-to-serverless-functions/) - Best practices overview
- [MDN: Sending Forms Through JavaScript](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Sending_forms_through_JavaScript) - Form submission patterns
- [Notion Webhooks Guide (SES)](https://softwareengineeringstandard.com/2025/08/31/notion-webhooks/) - Integration patterns
- [Vanilla JavaScript Form Handling](https://strapi.io/blog/vanilla-javascript-form-handling-guide) - Form validation patterns

### Tertiary (LOW confidence)
- [10 Best Autocomplete Libraries](https://www.cssscript.com/best-autocomplete/) - Comparison (WebSearch only)
- [Wikipedia: Provinces of Italy](https://en.wikipedia.org/wiki/Provinces_of_Italy) - 105 questure count
- [Datalist Accessibility Support](https://a11ysupport.io/tech/html/datalist_element) - Browser/SR matrix (not verified)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official SDKs already in use, Netlify built-in, Upstash widely adopted
- Architecture: HIGH - Patterns verified from official docs, matches existing codebase conventions
- Pitfalls: MEDIUM - Based on documentation warnings + common serverless issues, not project-specific testing

**Research date:** 2026-02-09
**Valid until:** 2026-03-09 (30 days - stable stack, mature APIs)

**Key constraints from CONTEXT.md:**
- Modal overlay form (decided pattern: like contact-form.html)
- City autocomplete required (datalist chosen as baseline)
- "Confermo/Non confermo" voting framing (decided terminology)
- Flat display MVP (no accordion - decided scope)
- Webhook auto-deploy (decided over scheduled builds)
- Status flow: Pending → Approved (or Rejected) (decided workflow)
