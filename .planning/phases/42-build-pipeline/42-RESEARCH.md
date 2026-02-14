# Phase 42: Build Pipeline - Research

**Researched:** 2026-02-14
**Domain:** Build automation, webhook integration, Notion API, Netlify deployment
**Confidence:** HIGH

## Summary

This phase unifies the build command, adds Notion webhook rebuild triggers with debouncing, cleans up obsolete scripts, and generates a content audit list for downstream phases. The core technologies are well-established: Notion's native webhook API (2025-09-03 version), Netlify build hooks, and Netlify Blobs for debounce state management.

**Key findings:**
- Notion supports native webhooks for database changes (no third-party service needed)
- Netlify Blobs provides zero-config persistent storage for debounce state
- The project already has a working webhook handler (`notion-webhook.mjs`) that can be extended
- Build command can be simplified to single-step (`npx @11ty/eleventy`)
- Several scripts can be safely removed; some must be preserved due to active imports

**Primary recommendation:** Use Notion native webhooks with database automations, implement 30-minute debounce using Netlify Blobs for state persistence, extend existing webhook handler, and generate content audit using custom Node.js script with NLP-inspired quality checks.

## Standard Stack

The established tools for build automation and webhook integration:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Notion Webhooks API | 2025-09-03 | Database change notifications | Native Notion feature, no third-party needed |
| Netlify Build Hooks | Current | Programmatic build triggering | Built into Netlify, simple POST requests |
| Netlify Blobs | Current | Persistent state storage | Zero-config, integrated with Netlify Functions |
| @notionhq/client | ^5.8.0 | Notion API access | Official Notion SDK for Node.js |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @netlify/blobs | Latest | Blobs SDK for Functions | When writing Netlify Functions that need storage |
| crypto (Node.js) | Built-in | HMAC signature verification | Already used in notion-webhook.mjs |
| depcheck | Latest | Find unused dependencies | One-time: verify safe script removal |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Notion native webhooks | Zapier/Make/n8n | Third-party adds latency, cost, complexity; Notion native is simpler |
| Netlify Blobs | Upstash Redis | Redis is more powerful but overkill for simple debounce timestamps |
| Custom audit script | AI-powered tools (Clearscope, etc.) | AI tools are expensive and overkill for structured Notion data |

**Installation:**
```bash
# For audit script (if needed beyond existing deps)
npm install --save-dev depcheck

# Blobs SDK (if extending webhook)
npm install @netlify/blobs
```

## Architecture Patterns

### Recommended Project Structure
```
netlify/functions/
├── notion-webhook.mjs       # Webhook handler (EXTEND)
├── submit-prassi.mjs         # Prassi submission (KEEP)
└── vote-prassi.mjs           # Prassi voting (KEEP)

scripts/
├── build-sitemap.js          # Sitemap generation (KEEP)
├── templates/
│   ├── helpers.js            # Template filters (KEEP - imported by 11ty)
│   └── dizionario-map.json   # Dictionary mapping (KEEP - imported by 11ty)
├── translation-memory.js     # Translation cache (KEEP)
├── translate-batch.js        # Translation runner (KEEP)
├── audit-content.js          # Content audit generator (NEW)
└── [DELETE: build-documents.js, build-permits.js, notion-client.js, etc.]

.planning/
└── AUDIT-content.md          # Generated audit report (NEW)
```

### Pattern 1: Notion Webhook with 30-Minute Debounce
**What:** Accept Notion database change events, store last trigger timestamp in Netlify Blobs, trigger build only if 30+ minutes since last trigger
**When to use:** Content databases that users edit in batches (Documenti Questura, Database permessi)

**Example:**
```javascript
// Source: Netlify Blobs official docs + existing notion-webhook.mjs
import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  // [Existing signature verification code...]

  if (payload.type === 'event' &&
      (eventType === 'page.content_updated' || eventType === 'data_source.schema_updated')) {

    // Check debounce window
    const store = getStore('webhook-state');
    const lastTriggerStr = await store.get('last-build-trigger');
    const lastTrigger = lastTriggerStr ? new Date(lastTriggerStr) : null;
    const now = new Date();
    const thirtyMinutes = 30 * 60 * 1000;

    if (lastTrigger && (now - lastTrigger) < thirtyMinutes) {
      console.log(`[webhook] Debounced: ${Math.round((now - lastTrigger) / 60000)}min since last trigger`);
      return new Response(JSON.stringify({ message: 'Debounced' }), { status: 200 });
    }

    // Update timestamp and trigger build
    await store.set('last-build-trigger', now.toISOString());

    const buildResponse = await fetch(process.env.NETLIFY_BUILD_HOOK_URL, {
      method: 'POST',
      body: JSON.stringify({ trigger_title: 'Notion content updated' })
    });

    // [Rest of handler...]
  }
};
```

### Pattern 2: Content Audit Script
**What:** Fetch all entries from Notion databases, check for formatting issues, output structured markdown report
**When to use:** Before content cleanup phases to identify problems systematically

**Example:**
```javascript
// Source: Notion API pagination docs + NLP audit patterns
const { Client } = require("@notionhq/client");

async function auditDatabase(notion, databaseId, dbName) {
  const issues = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: 100
    });

    for (const page of response.results) {
      // Check capitalization
      const title = page.properties.Title?.title?.[0]?.plain_text;
      if (title && title[0] !== title[0].toUpperCase()) {
        issues.push({
          db: dbName,
          page: page.id,
          field: 'Title',
          issue: 'Missing capitalization',
          value: title,
          suggestion: title[0].toUpperCase() + title.slice(1)
        });
      }

      // Check for overly synthetic text (too many technical markers)
      const notes = page.properties.Notes?.rich_text?.[0]?.plain_text || '';
      if (notes.match(/\b(art\.|comma|d\.lgs|n\.|del)\b.*\b(art\.|comma|d\.lgs|n\.|del)\b.*\b(art\.|comma|d\.lgs|n\.|del)\b/i)) {
        issues.push({
          db: dbName,
          page: page.id,
          field: 'Notes',
          issue: 'Overly technical/synthetic wording',
          value: notes.substring(0, 100) + '...',
          suggestion: 'Simplify for user-facing text'
        });
      }
    }

    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return issues;
}
```

### Pattern 3: Unified Build Command
**What:** Single `npm run build` command that triggers 11ty, which fetches Notion data via `_data/*.js` files
**When to use:** This is the standard 11ty pattern; data files run automatically during build

**Before (two-step):**
```json
"scripts": {
  "build": "npm run build:docs && npm run build:11ty",
  "build:docs": "node scripts/build-documents.js",
  "build:11ty": "npx @11ty/eleventy"
}
```

**After (single-step):**
```json
"scripts": {
  "build": "npx @11ty/eleventy",
  "build:sitemap": "node scripts/build-sitemap.js"
}
```

Why: 11ty automatically runs `_data/documents.js`, `_data/permits.js`, etc. during build. No separate step needed.

### Anti-Patterns to Avoid
- **Rebuilding on every Notion edit:** Without debounce, user making 10 edits triggers 10 builds (wastes time, Netlify build minutes)
- **Removing helpers.js:** `eleventy.config.mjs` imports filters from it; removal breaks build
- **Using third-party webhook services:** Notion has native webhooks; adding Zapier/Make adds unnecessary complexity
- **Manual audit:** Checking 60+ permit pages and 60+ document pages manually is error-prone and slow

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persistent state in serverless | Custom file-based state, S3, DynamoDB | Netlify Blobs | Zero-config, integrated, automatically scoped per site |
| Webhook signature verification | Custom crypto logic | Existing `notion-webhook.mjs` pattern | Already implements timing-safe HMAC comparison |
| Notion pagination | Manual while loop with bug-prone cursors | Pattern from `_data/documents.js` | Already handles has_more/next_cursor correctly |
| Finding unused dependencies | Manual grep + review | `depcheck` npm package | AST-based analysis, finds unused imports accurately |
| Content quality checks | Manual review | Automated audit script | Systematic, reproducible, flags patterns humans miss |

**Key insight:** Serverless state management is tricky (functions are stateless), but Netlify Blobs solves it with zero configuration. Similarly, Notion's pagination is easy to get wrong (infinite loops, missed pages), but the project's existing data files already implement it correctly.

## Common Pitfalls

### Pitfall 1: Rate Limit Exceeded During Audit
**What goes wrong:** Content audit script fetches all pages from two large databases, hits Notion's 3 requests/second rate limit, script crashes with 429 errors
**Why it happens:** Notion API enforces 3 requests/second average; fetching 100+ pages too quickly triggers rate limiting
**How to avoid:**
- Use `page_size: 100` (maximum) to minimize requests
- Implement retry logic with exponential backoff when receiving 429 status
- Add artificial delay between database queries (1 second between databases)
**Warning signs:** Console shows "rate_limited" errors, script exits before completing all databases

### Pitfall 2: Removing Scripts with Active Imports
**What goes wrong:** Delete `scripts/templates/helpers.js` thinking it's obsolete; build breaks because `eleventy.config.mjs` imports filters from it
**Why it happens:** Scripts may be imported by 11ty config, data files, or other scripts even if not listed in `package.json` scripts
**How to avoid:**
1. Search codebase for imports: `grep -r "require.*scripts/" eleventy.config.mjs _data/*.js`
2. Run `depcheck` to identify actually unused dependencies
3. Test build after each deletion: `npm run build`
**Warning signs:** Build fails with "Cannot find module" error after script deletion

### Pitfall 3: Debounce State Race Conditions
**What goes wrong:** Two webhook events arrive 1 second apart; both check Blobs (no recent trigger), both update timestamp, both trigger builds (defeats debounce purpose)
**Why it happens:** Netlify Functions run concurrently; no atomic read-modify-write for Blobs
**How to avoid:**
- Accept this limitation (rare, and Netlify queues duplicate builds anyway)
- Use consistent timestamps (ISO string format) to make race conditions detectable in logs
- Consider adding random jitter (0-60 seconds) to debounce window if racing becomes problematic
**Warning signs:** Logs show multiple builds triggered within seconds despite debounce logic

### Pitfall 4: Webhook Subscription Scope Too Narrow
**What goes wrong:** Create Notion webhook for "Database permessi" only; edits to "Documenti Questura" don't trigger rebuilds
**Why it happens:** Notion webhooks must specify which pages/databases to watch; default is narrow
**How to avoid:**
- Create separate webhook subscriptions for each database (Database permessi + Documenti Questura)
- Or use workspace-level subscription with filtering in the handler
- Document which databases trigger rebuilds in CONTEXT.md
**Warning signs:** Manual Notion edits don't trigger builds; webhook endpoint receives no requests

### Pitfall 5: Build Hook URL Exposure
**What goes wrong:** Commit `.env` file containing `NETLIFY_BUILD_HOOK_URL` to git; anyone with repo access can trigger unlimited builds
**Why it happens:** Build hook URLs are secret credentials; exposing them allows abuse
**How to avoid:**
- Add `.env` to `.gitignore` (likely already done)
- Create `.env.example` with placeholder values
- Store real URLs only in Netlify UI environment variables
- Rotate build hook URL if accidentally exposed
**Warning signs:** `.env` appears in `git status`; unexpected builds trigger from unknown sources

## Code Examples

Verified patterns from official sources and existing code:

### Extending notion-webhook.mjs with Debounce
```javascript
// Source: Existing notion-webhook.mjs + Netlify Blobs docs
import crypto from 'crypto';
import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('x-notion-signature');

    // [Existing signature verification logic...]

    const payload = JSON.parse(body);

    // Handle verification challenge
    if (payload.type === 'url_verification') {
      return new Response(JSON.stringify({ challenge: payload.challenge }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle content update events with debounce
    if (payload.type === 'event') {
      const eventType = payload.event?.type;

      if (eventType === 'page.content_updated' || eventType === 'data_source.schema_updated') {
        console.log('[notion-webhook] Content change detected');

        // Check debounce window (30 minutes)
        const store = getStore('webhook-state');
        const lastTriggerStr = await store.get('last-build-trigger');
        const lastTrigger = lastTriggerStr ? new Date(lastTriggerStr) : null;
        const now = new Date();
        const DEBOUNCE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

        if (lastTrigger && (now - lastTrigger) < DEBOUNCE_WINDOW_MS) {
          const minutesSince = Math.round((now - lastTrigger) / 60000);
          console.log(`[notion-webhook] Debounced: ${minutesSince}min since last trigger (< 30min)`);
          return new Response(JSON.stringify({
            message: 'Debounced',
            minutes_since_last: minutesSince
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Update timestamp BEFORE triggering build (prevents race conditions somewhat)
        await store.set('last-build-trigger', now.toISOString());
        console.log('[notion-webhook] Triggering build (30min window passed)');

        // Trigger Netlify build
        const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
        const buildResponse = await fetch(buildHookUrl, {
          method: 'POST',
          body: JSON.stringify({
            trigger_title: 'Notion content updated',
            clear_cache: false
          })
        });

        if (!buildResponse.ok) {
          console.error('[notion-webhook] Build trigger failed:', buildResponse.status);
          return new Response(JSON.stringify({ error: 'Build trigger failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          message: 'Build triggered',
          last_trigger: now.toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('[notion-webhook] Event ignored:', eventType);
      return new Response(JSON.stringify({ message: 'Event ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: 'Unknown event type' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[notion-webhook] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### Content Audit Script Structure
```javascript
// Source: Notion API docs + existing _data/documents.js pagination pattern
// File: scripts/audit-content.js

require('dotenv').config();
const { Client } = require("@notionhq/client");
const fs = require('fs');
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Database IDs
const DOCUMENTI_DB = "1ad7355e-7f7f-8088-a065-e814c92e2cfd";
const PERMESSI_DB = "2cd7355e-7f7f-8053-8130-e9c246190699";

async function auditDatabase(databaseId, dbName, fieldChecks) {
  console.log(`\nAuditing ${dbName}...`);
  const issues = [];
  let pageCount = 0;

  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: 100
    });

    for (const page of response.results) {
      pageCount++;

      // Run all field checks
      for (const check of fieldChecks) {
        const issue = check(page, dbName);
        if (issue) issues.push(issue);
      }
    }

    hasMore = response.has_more;
    startCursor = response.next_cursor;

    // Rate limit: 3 req/sec, so add small delay between pages
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 350)); // ~2.8 req/sec
    }
  }

  console.log(`  Checked ${pageCount} pages, found ${issues.length} issues`);
  return issues;
}

// Field check functions
const checks = {
  capitalization: (page, dbName) => {
    const title = page.properties["Nome permesso"]?.title?.[0]?.plain_text ||
                  page.properties["Nome documento"]?.title?.[0]?.plain_text;

    if (title && title[0] !== title[0].toUpperCase()) {
      return {
        db: dbName,
        pageId: page.id.replace(/-/g, ''),
        field: 'Title',
        issue: 'Missing capitalization',
        current: title,
        suggested: title[0].toUpperCase() + title.slice(1)
      };
    }
  },

  syntheticText: (page, dbName) => {
    const notes = page.properties["Info extra su doc rilascio"]?.rich_text?.[0]?.plain_text || '';

    // Flag if 3+ legal references in one field (overly technical)
    const legalRefs = (notes.match(/\b(art\.|comma|d\.lgs|n\.|del|legge)\b/gi) || []).length;
    if (legalRefs >= 3) {
      return {
        db: dbName,
        pageId: page.id.replace(/-/g, ''),
        field: 'Notes',
        issue: 'Overly synthetic/technical text',
        current: notes.substring(0, 80) + '...',
        suggested: 'Simplify for user-facing display'
      };
    }
  },

  unclearWording: (page, dbName) => {
    const title = page.properties["Nome permesso"]?.title?.[0]?.plain_text ||
                  page.properties["Nome documento"]?.title?.[0]?.plain_text;

    // Flag vague terms
    if (title && /\b(generico|vario|altro|ecc\.?)\b/i.test(title)) {
      return {
        db: dbName,
        pageId: page.id.replace(/-/g, ''),
        field: 'Title',
        issue: 'Unclear/vague wording',
        current: title,
        suggested: 'Use specific term instead of generic placeholder'
      };
    }
  }
};

async function generateAuditReport() {
  console.log('Starting content audit...');

  const allIssues = [];

  // Audit both databases
  allIssues.push(...await auditDatabase(DOCUMENTI_DB, 'Documenti Questura', [
    checks.capitalization,
    checks.syntheticText,
    checks.unclearWording
  ]));

  // Small delay between databases (rate limit)
  await new Promise(resolve => setTimeout(resolve, 1000));

  allIssues.push(...await auditDatabase(PERMESSI_DB, 'Database permessi', [
    checks.capitalization,
    checks.syntheticText,
    checks.unclearWording
  ]));

  // Generate markdown report
  const report = generateMarkdownReport(allIssues);

  // Write to .planning/
  const outputPath = path.join(process.cwd(), '.planning', 'AUDIT-content.md');
  fs.writeFileSync(outputPath, report, 'utf8');

  console.log(`\nAudit complete! Report written to: ${outputPath}`);
  console.log(`Total issues found: ${allIssues.length}`);
}

function generateMarkdownReport(issues) {
  const now = new Date().toISOString().split('T')[0];

  let md = `# Content Audit Report\n\n`;
  md += `**Generated:** ${now}\n`;
  md += `**Total Issues:** ${issues.length}\n\n`;
  md += `This audit identifies Notion database entries needing cleanup. `;
  md += `Actual fixes should be done in Phase 43 (Populate Blank Permits) or Phase 45 (Content Validation).\n\n`;

  // Group by database
  const byDb = {};
  for (const issue of issues) {
    if (!byDb[issue.db]) byDb[issue.db] = [];
    byDb[issue.db].push(issue);
  }

  for (const [dbName, dbIssues] of Object.entries(byDb)) {
    md += `## ${dbName} (${dbIssues.length} issues)\n\n`;

    // Group by issue type
    const byType = {};
    for (const issue of dbIssues) {
      if (!byType[issue.issue]) byType[issue.issue] = [];
      byType[issue.issue].push(issue);
    }

    for (const [issueType, typeIssues] of Object.entries(byType)) {
      md += `### ${issueType} (${typeIssues.length})\n\n`;
      md += `| Page ID | Field | Current | Suggested |\n`;
      md += `|---------|-------|---------|----------|\n`;

      for (const issue of typeIssues) {
        const notionUrl = `https://notion.so/${issue.pageId}`;
        md += `| [${issue.pageId.substring(0, 8)}...](${notionUrl}) | ${issue.field} | ${issue.current} | ${issue.suggested} |\n`;
      }

      md += `\n`;
    }
  }

  return md;
}

// Run audit
generateAuditReport().catch(console.error);
```

### Safe Script Removal Check
```bash
# Source: Standard Node.js dependency analysis pattern

# 1. Find all imports referencing scripts/
echo "Checking for imports from scripts/ directory..."
grep -r "require.*scripts/" eleventy.config.mjs _data/*.js netlify/functions/*.mjs 2>/dev/null

# 2. Check package.json scripts
echo "Checking package.json scripts..."
cat package.json | grep -A1 "\"scripts\""

# 3. Run depcheck (optional - checks dependencies in package.json)
npx depcheck

# 4. List scripts to remove (safe after verification)
echo "Scripts to REMOVE (replaced by 11ty):"
ls scripts/build-documents.js scripts/build-permits.js scripts/notion-client.js 2>/dev/null

echo "Scripts to KEEP (still imported):"
ls scripts/templates/helpers.js scripts/templates/dizionario-map.json scripts/build-sitemap.js scripts/translation-*.js 2>/dev/null

echo "Scripts to REVIEW (one-time migrations):"
ls scripts/fix-*.js scripts/update-*.js scripts/migrate-*.js scripts/add-*.js scripts/remove-*.js 2>/dev/null
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual Notion checks → manual deploys | Notion webhooks → auto-rebuild | Notion API 2025-09-03 | Real-time updates without manual intervention |
| Two-step build (scripts + 11ty) | Single-step 11ty build | 11ty v3.0+ with async data | Simpler, faster, fewer failure points |
| Third-party webhook services (Zapier, Make) | Notion native webhooks | Notion added native webhooks ~2024 | Lower latency, no third-party costs |
| File-based state (`.last-build`) | Netlify Blobs | Netlify Blobs GA 2023 | Works in serverless, no filesystem needed |
| `databases.query` API | `search` API with parent filter | Notion 2025-09-03 multi-source | Workaround for permission issues |

**Deprecated/outdated:**
- **`build-documents.js` + `build-permits.js`**: Replaced by 11ty data files (`_data/documents.js`, `_data/permits.js`); old scripts generate static HTML, new approach uses Liquid templates
- **`notion-client.js`**: Replaced by inline Notion clients in each data file; centralized client was harder to maintain with different database IDs
- **`manifest.json` + `slug-map.json`**: Replaced by `_data/slugMap.js`; static JSON required manual updates, JS module is more maintainable
- **Two-step build**: 11ty runs data files automatically; separate `build:docs` step is redundant

## Open Questions

Things that couldn't be fully resolved:

1. **Notion webhook subscription scope**
   - What we know: Notion webhooks can watch specific databases or entire workspaces
   - What's unclear: Does watching 2 databases (Documenti + Permessi) require 2 separate webhooks, or can one webhook watch multiple databases?
   - Recommendation: Test with single webhook watching workspace, filter events in handler by database ID

2. **Debounce race condition acceptability**
   - What we know: Netlify Blobs uses eventual consistency (60s propagation); two simultaneous webhook calls could both pass debounce check
   - What's unclear: How often does this happen in practice? Is it worth adding complexity (Redis, locks) to prevent?
   - Recommendation: Start with simple Blobs-based debounce; monitor logs for evidence of racing; accept that Netlify queues duplicate builds anyway

3. **Content audit coverage completeness**
   - What we know: Audit should check user-facing fields (permit names, document names, notes)
   - What's unclear: Which Notion properties are actually displayed on the site vs. internal-only?
   - Recommendation: Review `_data/documents.js` and `_data/permits.js` to see which properties are extracted; audit only those fields

4. **One-time migration script removal criteria**
   - What we know: Scripts like `fix-language-switcher-position.js` were one-time fixes
   - What's unclear: Is there historical value in keeping them (documentation of changes), or should they be deleted?
   - Recommendation: Check git history (if fix is in a commit, script is redundant); delete scripts where commit message documents the change

5. **Sitemap generation timing**
   - What we know: `build-sitemap.js` currently runs separately (`npm run build:sitemap`)
   - What's unclear: Should it run automatically after 11ty build, or remain manual?
   - Recommendation: Add as 11ty plugin or post-build hook so sitemap is always current; don't require manual invocation

## Sources

### Primary (HIGH confidence)
- [Notion Webhooks API Reference](https://developers.notion.com/reference/webhooks) - Event types, subscription setup, signature verification
- [Notion API Request Limits](https://developers.notion.com/reference/request-limits) - 3 req/sec rate limit, 429 handling
- [Notion Database Query (Pagination)](https://developers.notion.com/reference/post-database-query) - page_size, start_cursor, has_more, next_cursor
- [Netlify Build Hooks](https://docs.netlify.com/build/configure-builds/build-hooks/) - POST trigger, query parameters, custom payload
- [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) - getStore, set, get, zero-config persistence
- Existing codebase: `notion-webhook.mjs`, `_data/documents.js`, `eleventy.config.mjs`

### Secondary (MEDIUM confidence)
- [Notion Webhook Actions (Help Center)](https://www.notion.com/help/webhook-actions) - Database automation triggers, webhook button actions
- [Notion Database Automations](https://www.notion.com/help/database-automations) - Trigger types, 3-second multi-trigger window
- [Netlify Functions Overview](https://docs.netlify.com/build/functions/overview/) - Serverless function deployment, environment variables
- [Upstash Redis with Netlify](https://upstash.com/blog/netlify-edge-redis) - Alternative debounce strategy (not chosen, but validated as option)
- [npm depcheck](https://www.npmjs.com/package/depcheck) - Unused dependency detection
- [npm-prune command](https://docs.npmjs.com/cli/v8/commands/npm-prune/) - Remove extraneous packages

### Tertiary (LOW confidence)
- [AI-Powered Content Auditing](https://blog.on-page.ai/ai-and-content-auditing/) - NLP-based quality checks (adapted for custom script)
- [n8n vs Zapier vs Make (2026)](https://zapier.com/blog/n8n-vs-make/) - Third-party webhook alternatives (not recommended)
- [Debouncing in Queueing Systems](https://www.inngest.com/blog/debouncing-in-queuing-systems-optimizing-efficiency-in-async-workflows) - Distributed debounce patterns (complex, not needed)
- [AWS Lambda Debounce](https://repost.aws/questions/QUJaXi3xrkRbaMIBaCfnIwgA/how-to-implement-a-debounce-mechanism-in-aws-lambda-using-node-js) - Serverless debounce strategies (AWS-specific, but concepts apply)

## Metadata

**Confidence breakdown:**
- Notion webhooks: HIGH - Official API docs confirm native webhook support, event types verified
- Netlify build hooks: HIGH - Official docs with examples, pattern already used in project
- Debounce with Blobs: MEDIUM - Blobs API is official but debounce pattern is custom; race condition handling uncertain
- Content audit patterns: MEDIUM - NLP concepts adapted from AI audit tools; custom script needs testing
- Script removal safety: HIGH - Can verify with grep/depcheck; existing imports already documented

**Research date:** 2026-02-14
**Valid until:** 2026-03-16 (30 days - stable APIs, but Notion/Netlify may add features)

---

**Note for planner:** The existing `notion-webhook.mjs` is a solid foundation; extending it with Netlify Blobs for debounce is straightforward. Build command simplification is safe (verified no dependencies on `build:docs` step). Script removal requires careful verification but is low-risk with proper testing. Content audit is net-new work; estimate 4-6 hours for script development and testing.
