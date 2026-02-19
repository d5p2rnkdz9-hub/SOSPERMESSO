# Technology Stack: Netlify Functions + Notion API Integration

**Project:** SOS Permesso — v4.1 Server-Side Functions
**Researched:** 2026-02-19
**Scope:** submit-prassi, vote-prassi, notion-webhook Netlify Functions + Notion API write operations

---

## Current State (Verified from Codebase)

All three target functions **already exist** in `netlify/functions/`. This research documents the
exact stack in place, the exact API methods used, and one critical compatibility issue that must
be verified before launch.

```
netlify/functions/
  submit-prassi.mjs     — creates Notion page with Status=Pending
  vote-prassi.mjs       — retrieves page + increments number property
  notion-webhook.mjs    — verifies Notion webhook signature, triggers rebuild with 30min debounce
```

---

## Installed Library Versions (Verified from package.json + node_modules)

| Library | Installed Version | Purpose |
|---------|------------------|---------|
| `@notionhq/client` | `5.8.0` (^5.8.0 in package.json) | Notion API client |
| `@netlify/blobs` | `10.6.0` (^10.6.0 in package.json) | KV store for debounce state |
| `@11ty/eleventy` | `3.1.2` | SSG (unchanged) |
| `dotenv` | `17.2.3` | Env var loading (build scripts only, not functions) |

**Node version:** 22 LTS (configured via `NODE_VERSION = "22"` in `netlify.toml`)

---

## Netlify Functions v2 API

### Handler Signature (Verified from Existing Functions)

All three functions use the **Netlify Functions v2 API** — ESM modules with web-standard
Request/Response objects. The exact pattern used:

```javascript
// netlify/functions/my-function.mjs
export default async (req, context) => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

**v2 vs v1 differences:**
- v2: `export default async (req, context) => ...` with standard `Request`/`Response`
- v1: `exports.handler = async (event, context) => { return { statusCode: 200, body: '...' } }`
- v2 is already the pattern used — do NOT mix in v1 patterns

**Request body parsing:**
- JSON body: `const data = await req.json()`
- Raw body (for HMAC): `const body = await req.text()`
- HTTP method: `req.method` (string: 'GET', 'POST', 'OPTIONS')
- Headers: `req.headers.get('x-notion-signature')`

**Response construction:**
- `new Response(JSON.stringify(data), { status: 200, headers: { ... } })`
- `new Response(null, { status: 204, headers: { ... } })` — for OPTIONS preflight

### Function URL Routing (Verified)

File name maps directly to URL path:

```
netlify/functions/submit-prassi.mjs  →  /.netlify/functions/submit-prassi
netlify/functions/vote-prassi.mjs    →  /.netlify/functions/vote-prassi
netlify/functions/notion-webhook.mjs →  /.netlify/functions/notion-webhook
```

Client-side `src/scripts/prassi.js` already calls `/.netlify/functions/submit-prassi`
and `/.netlify/functions/vote-prassi` — these are correctly wired.

### netlify.toml Configuration (Already Complete)

```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

`esbuild` bundler handles `.mjs` ESM files correctly. No changes needed.

---

## CORS Pattern (Verified from Existing Functions)

Both submit-prassi and vote-prassi implement CORS for client-side fetch calls:

```javascript
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// Handle OPTIONS preflight — browser sends this before POST
if (req.method === 'OPTIONS') {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
```

**Why `*` is acceptable for these endpoints:** Only POST accepted, no credentials or cookies
involved. If authentication is added later, restrict to `https://www.sospermesso.it`.

`notion-webhook.mjs` does NOT need CORS — it is called by Notion's servers, not by browsers.

---

## Notion API Methods (Verified from Codebase)

### Client Initialization

```javascript
import { Client } from "@notionhq/client";
const notion = new Client({ auth: process.env.NOTION_API_KEY });
```

`NOTION_API_KEY` is set as a Netlify environment variable. Functions read it via `process.env`.

### pages.create — Create Page in Database (submit-prassi.mjs)

```javascript
const response = await notion.pages.create({
  parent: { database_id: process.env.PRASSI_DB_ID },
  properties: {
    "Citta": {
      title: [{ text: { content: city.trim() } }]
    },
    "Descrizione": {
      rich_text: [{ text: { content: description.trim() } }]
    },
    "Data esperienza": {
      date: date ? { start: date } : null
    },
    "Categoria": {
      rich_text: category ? [{ text: { content: category.trim() } }] : []
    },
    "Pagina": {
      url: pageUrl || null
    },
    "Slug pagina": {
      rich_text: pageSlug ? [{ text: { content: pageSlug } }] : []
    },
    "Status": {
      select: { name: "Pending" }
    },
    "Voti Confermo": {
      number: 0
    },
    "Voti Non Confermo": {
      number: 0
    }
  }
});
// response.id = new page's Notion UUID
```

**Property type shapes (verified from both functions and prassiLocali.js):**

| Notion Property Type | Write Shape | Read Access |
|---------------------|-------------|-------------|
| Title | `{ title: [{ text: { content: "val" } }] }` | `page.properties.X.title[0].plain_text` |
| Rich Text | `{ rich_text: [{ text: { content: "val" } }] }` | `page.properties.X.rich_text[0].plain_text` |
| Number | `{ number: 42 }` | `page.properties.X.number` |
| Select | `{ select: { name: "Option Name" } }` | `page.properties.X.select.name` |
| Date | `{ date: { start: "2026-02-19" } }` or `{ date: null }` | `page.properties.X.date.start` |
| URL | `{ url: "https://..." }` or `{ url: null }` | `page.properties.X.url` |

### pages.retrieve — Read Current Values (vote-prassi.mjs)

```javascript
const page = await notion.pages.retrieve({ page_id: id });
// page_id is the Notion page UUID (32 hex chars, dashes optional)

const currentCount = page.properties["Voti Confermo"]?.number || 0;
```

Returns the full page object with all properties. Accessing `.number` on a number property
gives the numeric value directly (not nested further).

### pages.update — Partial Property Update (vote-prassi.mjs)

```javascript
await notion.pages.update({
  page_id: id,
  properties: {
    "Voti Confermo": { number: newCount }
  }
});
```

Only specified properties are updated. All other properties remain unchanged.
`newCount` is computed as `currentCount + 1` using the value from pages.retrieve.

### Error Codes (Verified Pattern from vote-prassi.mjs)

```javascript
} catch (error) {
  if (error.code === 'object_not_found') {
    // Page ID does not exist or integration lacks access
    return new Response(JSON.stringify({ error: 'Prassi non trovata' }), { status: 404 });
  }
  // General Notion API or network error
  return new Response(JSON.stringify({ error: 'Errore interno' }), { status: 500 });
}
```

Notion SDK errors expose `.code` (string enum). Relevant codes:
- `'object_not_found'` — page ID invalid or no access
- `'rate_limited'` — hit 429 rate limit
- `'unauthorized'` — invalid API key
- `'validation_error'` — malformed property payload

---

## CRITICAL: @notionhq/client v5 and Notion API 2025-09-03

**Confidence: MEDIUM** — WebSearch findings, not verified against official SDK docs directly.

### The Compatibility Risk

Notion released API version `2025-09-03` in late 2025 introducing multi-source databases.
`@notionhq/client` v5 targets this API version. A breaking change affects page creation:

| API Version | Parent field for pages.create |
|-------------|------------------------------|
| Pre-2025-09-03 | `parent: { database_id: "abc123" }` |
| 2025-09-03+ | `parent: { type: "data_source_id", data_source_id: "abc123" }` |

**The existing `submit-prassi.mjs` uses the OLD pattern** (`database_id`).

This could mean:
1. The function silently fails on real submissions (returns 500 from Notion API)
2. The SDK v5 handles backward compatibility transparently (cannot confirm without testing)
3. The existing Prassi DB (created before 2025-09-03) still accepts `database_id` parent type

### Mitigation: Test Before Launch

Run this against the live function on Netlify (or locally via `netlify dev`):

```bash
curl -X POST https://www.sospermesso.it/.netlify/functions/submit-prassi \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Roma",
    "description": "Test submission dev — da eliminare",
    "date": "2026-02-19",
    "category": "Test",
    "pageUrl": "https://www.sospermesso.it/",
    "pageSlug": "test-dev"
  }'
```

**If the response is `{ success: true, id: "..." }` → No action needed.**

**If the response is a 500 error → Update `submit-prassi.mjs`:**

```javascript
// Change from:
parent: { database_id: process.env.PRASSI_DB_ID }

// To:
parent: { type: "data_source_id", data_source_id: process.env.PRASSI_DB_ID }
```

The `PRASSI_DB_ID` value itself does not change — only the parent object shape.

**Context:** `prassiLocali.js` (build-time) already uses `notion.search()` filtering on
`page.parent?.data_source_id`, suggesting the Prassi DB has a `data_source_id` accessible
via the 2025-09-03 API.

---

## Netlify Build Hook (Verified from notion-webhook.mjs)

### Trigger Pattern

```javascript
const buildResponse = await fetch(process.env.NETLIFY_BUILD_HOOK_URL, {
  method: 'POST',
  body: JSON.stringify({ trigger_title: 'Notion content updated' })
});
```

**Build Hook URL format (from Netlify docs):**
```
https://api.netlify.com/build_hooks/{HOOK_ID}
```

The full URL (including `https://api.netlify.com/build_hooks/`) is stored in env var
`NETLIFY_BUILD_HOOK_URL`. Create this hook in: Netlify Dashboard > Site > Build & Deploy >
Build hooks > Add build hook.

**Optional query parameters (not currently used, available if needed):**
- `?trigger_title=My+message` — custom deploy message in Netlify dashboard
- `?trigger_branch=main` — specify branch to build
- `?clear_cache=true` — force cache-busted rebuild

### Debounce via @netlify/blobs (Verified)

```javascript
import { getStore } from '@netlify/blobs';

const store = getStore('webhook-state');
const lastTriggerStr = await store.get('last-build-trigger');
const lastTrigger = lastTriggerStr ? new Date(lastTriggerStr) : null;
const DEBOUNCE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

if (lastTrigger && (now - lastTrigger) < DEBOUNCE_WINDOW_MS) {
  // Skip build — still within debounce window
  return new Response(JSON.stringify({ message: 'Debounced' }), { status: 200 });
}

await store.set('last-build-trigger', now.toISOString());
// trigger build...
```

**Why Blobs:** Functions are stateless between invocations. `process.env` cannot be written at
runtime. Blobs provide true cross-invocation persistence without a database.

**@netlify/blobs v10.6.0** is installed and works in Netlify Functions without additional config.
The store name `'webhook-state'` is arbitrary and scoped to the site.

---

## Webhook Signature Verification (Verified from notion-webhook.mjs)

```javascript
import crypto from 'crypto';

// Read raw body BEFORE json() to preserve exact bytes for HMAC
const body = await req.text();
const signature = req.headers.get('x-notion-signature');

const expectedSignature = 'sha256=' + crypto
  .createHmac('sha256', process.env.NOTION_WEBHOOK_SECRET)
  .update(body)
  .digest('hex');

// Timing-safe comparison prevents timing attacks
const match = Buffer.from(signature).length === Buffer.from(expectedSignature).length
  && crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
```

`crypto` is a Node.js built-in — no import in package.json needed. Available in Node 22.

---

## Notion API Rate Limits (Verified via Official Docs)

| Limit | Value |
|-------|-------|
| Average rate per integration | 3 requests/second |
| Burst | Some burst allowed above average |
| Rate-limited response code | HTTP 429 |
| Retry guidance | `Retry-After` header (integer seconds) |
| Max blocks per pages.create | 1,000 total; 100 per array |

**Impact on vote-prassi:** Each vote = 2 sequential API calls (retrieve + update).
Under normal usage (community site, not viral), 3 req/sec is more than sufficient.
429 errors surface to users as the generic 500 message — acceptable for MVP.

---

## Environment Variables Reference

| Variable | Set Where | Required By | Notes |
|----------|-----------|-------------|-------|
| `NOTION_API_KEY` | Netlify env vars | All functions + build scripts | Already configured |
| `PRASSI_DB_ID` | Netlify env vars | `submit-prassi.mjs`, `prassiLocali.js` | Prassi database ID |
| `NETLIFY_BUILD_HOOK_URL` | Netlify env vars | `notion-webhook.mjs` | Full build hook URL |
| `NOTION_WEBHOOK_SECRET` | Netlify env vars | `notion-webhook.mjs` | HMAC signing secret |

**Note on PRASSI_DB_ID pattern:** Unlike permit/document database IDs (hardcoded in data files
per project convention), `PRASSI_DB_ID` is read from env var. This is correct: functions run
server-side, env vars are safe in that context, and it avoids putting a writable database ID
in source code.

---

## What Is Not Implemented (Known Gaps)

| Gap | Status | Risk |
|-----|--------|------|
| Server-side rate limiting for votes | Not implemented — client-side localStorage only | Low for MVP; determined user can vote multiple times |
| Input sanitization beyond length/type | Basic validation only | Low — content goes to Notion (not rendered as HTML), reviewed before approval |
| Retry logic for Notion 429 errors | Not implemented | Low — 429 is surfaced as generic 500 to user |
| Structured logging / error monitoring | Console.log/error only | Low — Netlify dashboard shows function logs |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Netlify Functions v2 handler pattern | HIGH | Verified from codebase |
| @notionhq/client version | HIGH | Verified from package.json + node_modules |
| pages.retrieve + pages.update pattern | HIGH | Verified from vote-prassi.mjs |
| pages.create property shapes | HIGH | Verified from submit-prassi.mjs + prassiLocali.js |
| v5 `database_id` vs `data_source_id` risk | MEDIUM | WebSearch findings, not verified with SDK docs |
| Build hook URL format | MEDIUM | WebSearch + Netlify docs fetch |
| Rate limits (3 req/sec) | HIGH | Official Notion docs (multiple sources confirm) |

---

## Sources

- Notion API rate limits: [developers.notion.com/reference/request-limits](https://developers.notion.com/reference/request-limits)
- Notion API 2025-09-03 upgrade guide: [developers.notion.com/docs/upgrade-guide-2025-09-03](https://developers.notion.com/docs/upgrade-guide-2025-09-03)
- Notion API 2025-09-03 FAQ: [developers.notion.com/docs/upgrade-faqs-2025-09-03](https://developers.notion.com/docs/upgrade-faqs-2025-09-03)
- Netlify Functions v2 get started: [docs.netlify.com/build/functions/get-started/](https://docs.netlify.com/build/functions/get-started/)
- Netlify Functions v2 migration: [developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/](https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/)
- Netlify Build Hooks docs: [docs.netlify.com/build/configure-builds/build-hooks/](https://docs.netlify.com/build/configure-builds/build-hooks/)
- @notionhq/client npm: [npmjs.com/package/@notionhq/client](https://www.npmjs.com/package/@notionhq/client)
- notion-sdk-js releases: [github.com/makenotion/notion-sdk-js/releases](https://github.com/makenotion/notion-sdk-js/releases)
- @netlify/blobs npm: [npmjs.com/package/@netlify/blobs](https://www.npmjs.com/package/@netlify/blobs)

---
*Researched 2026-02-19 for v4.1 milestone*
