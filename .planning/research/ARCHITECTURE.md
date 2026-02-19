# Architecture Patterns: Netlify Functions + Notion Automation

**Domain:** Serverless functions integrated with 11ty SSG + Notion CMS + Netlify Build Hooks
**Researched:** 2026-02-19
**Confidence:** HIGH (all three functions already exist in the codebase; architecture is validated)

---

## Current State Assessment

All three Netlify Functions are **already written and present** in `netlify/functions/`:

| File | Status | Purpose |
|------|--------|---------|
| `netlify/functions/submit-prassi.mjs` | EXISTS — needs review | Creates Notion page with Status=Pending |
| `netlify/functions/vote-prassi.mjs` | EXISTS — needs review | Increments vote counts in Notion |
| `netlify/functions/notion-webhook.mjs` | EXISTS — needs review | Receives Notion signals, triggers Netlify rebuild |

The `netlify.toml` already has `[functions]` section configured (`directory = "netlify/functions"`, `node_bundler = "esbuild"`).

The client-side `src/scripts/prassi.js` already calls `/.netlify/functions/submit-prassi` and `/.netlify/functions/vote-prassi`.

**This milestone is primarily about wiring, configuration, and validation — not writing new code from scratch.**

---

## System Architecture

```
USER BROWSER
     |
     | form submit / vote click
     v
CLIENT: src/scripts/prassi.js
     |
     | fetch POST /.netlify/functions/submit-prassi
     | fetch POST /.netlify/functions/vote-prassi
     v
NETLIFY FUNCTIONS (serverless, deployed automatically with site)
     |
     | @notionhq/client v5.8.0
     | process.env.NOTION_API_KEY
     v
NOTION PRASSI DATABASE (PRASSI_DB_ID)
     |
     | Status property: "Pending" → (admin sets) → "Approved"
     |
     | Notion Automation trigger: "Status property edited to Approved"
     |
     | Notion Automation action: "Send webhook"
     |   HTTP POST → NETLIFY_BUILD_HOOK_URL
     |   (no signature required — Notion Automation sends directly to Build Hook)
     v
NETLIFY BUILD HOOK
     |
     | triggers npm run build
     v
11ty BUILD: _data/prassiLocali.js fetches Status="Approved" entries
     |
     v
_site/ regenerated with approved prassi visible on permit pages
```

---

## Component Boundaries

### Existing Components (no changes needed)

| Component | Location | Responsibility | Integration Points |
|-----------|----------|---------------|-------------------|
| Prassi submission form | `src/scripts/prassi.js` | UI form, modal, validation, fetch call | Calls `/.netlify/functions/submit-prassi` |
| Prassi voting UI | `src/scripts/prassi.js` | Vote buttons, localStorage dedup, fetch call | Calls `/.netlify/functions/vote-prassi` |
| Prassi data file | `_data/prassiLocali.js` | Fetches approved entries from Notion at build time | Reads `PRASSI_DB_ID` env var, queries Notion API |
| Notion client (build) | `_data/*.js` files | Notion reads during 11ty build | `@notionhq/client`, `NOTION_API_KEY` |
| 11ty build pipeline | `eleventy.config.mjs` | Generates all pages including prassi sections | Consumes `_data/prassiLocali.js` |

### Existing Functions (written, need wiring/validation)

| Function | Location | Responsibility | Status |
|----------|----------|---------------|--------|
| `submit-prassi.mjs` | `netlify/functions/` | Creates Notion page (Status=Pending), validates input | Written. Issue: uses `process.env.PRASSI_DB_ID` — inconsistent with project hardcode pattern |
| `vote-prassi.mjs` | `netlify/functions/` | Read-then-increment vote on Notion page | Written. Rate limiting: client-side localStorage only (acceptable for MVP) |
| `notion-webhook.mjs` | `netlify/functions/` | Receives webhook, debounces, triggers Build Hook | Written. Handles Notion API subscription format (with `x-notion-signature`) |

### Infrastructure to Configure (not code, but Netlify UI / Notion UI)

| Item | Where to Configure | What to Set |
|------|-------------------|------------|
| Netlify Build Hook | Netlify Dashboard > Site > Build & deploy > Build hooks | Create hook, copy URL to `NETLIFY_BUILD_HOOK_URL` env var |
| `NETLIFY_BUILD_HOOK_URL` env var | Netlify Dashboard > Site > Environment variables | Paste Build Hook URL |
| `PRASSI_DB_ID` env var | Netlify Dashboard > Site > Environment variables | Paste Prassi Notion database ID |
| `NOTION_WEBHOOK_SECRET` env var | Netlify Dashboard > Site > Environment variables | Set if using Notion API webhooks (see note below) |
| Notion Automation | Notion DB > Automations | Trigger: Status=Approved, Action: Send webhook to Build Hook |

---

## Critical Architecture Decision: Two Different Webhook Mechanisms

There are **two distinct webhook approaches** in this system. Understanding the difference is essential.

### Mechanism A: Notion Automation "Send Webhook" Action (SIMPLER — recommended)

**What it is:** A Notion UI feature. In a database, you create an Automation that says "when Status property changes to Approved, send a POST request to URL X."

**How it works:**
- Notion sends a raw POST request directly to the target URL
- No `X-Notion-Signature` header
- Payload contains selected database properties as JSON (configurable in UI)
- No verification token or secret

**For this project:** Point the Automation directly at the Netlify Build Hook URL.

```
Notion Automation → POST https://api.netlify.com/build_hooks/{hook_id}
```

This is the simplest path. No intermediate function needed. Notion calls the Build Hook directly.

**Limitation:** Available only on Notion paid plans. Requires manual setup in Notion UI per database.

### Mechanism B: Notion API Webhook Subscription (COMPLEX — already implemented in notion-webhook.mjs)

**What it is:** A developer-level feature. You register a webhook subscription via the Notion API, providing your endpoint URL. Notion then sends all content change events to that endpoint with HMAC-SHA256 signature verification.

**How it works:**
- Notion sends POST to `/.netlify/functions/notion-webhook`
- Header: `X-Notion-Signature: sha256={hmac}`
- Payload: `{ type: "event", event: { type: "page.content_updated", ... } }`
- Requires a `verification_token` (stored as `NOTION_WEBHOOK_SECRET`)
- Fires on ALL content changes, not just Status changes

**For this project:** `notion-webhook.mjs` implements this path. It handles signature verification, debounces with 30-min window via `@netlify/blobs`, then calls the Build Hook.

**Limitation:** API webhook subscriptions are a developer feature requiring API registration. Fires on all changes (broader than just approval), hence the debounce.

### Which to Use

| Approach | Setup Complexity | Works for Status Change | Auth Required | Recommended |
|----------|-----------------|------------------------|---------------|-------------|
| Notion Automation → Build Hook directly | Low (UI only) | Yes (precise trigger) | No | Yes, for simple rebuild trigger |
| Notion API Webhook → notion-webhook.mjs → Build Hook | High (API registration) | Yes (all changes) | Yes (HMAC) | Yes, if already registered or need fine-grained control |

**Both can coexist.** The Automation approach triggers only on approval (precise). The API webhook triggers on any content change (broader, useful for permit content updates too).

For v4.1 prassi feature specifically, the Notion Automation approach is simplest. The `notion-webhook.mjs` function is already implemented and provides broader coverage.

---

## Data Flow: Submission Path

```
1. User fills form in prassi modal
   └─ src/scripts/prassi.js validates city (must be in 105-city list)
   └─ description >= 20 chars

2. fetch POST /.netlify/functions/submit-prassi
   Body: { city, description, date, category, pageUrl, pageSlug }

3. submit-prassi.mjs (Netlify Function):
   ├─ CORS preflight handled (OPTIONS → 204)
   ├─ Validates required fields server-side (city, description)
   ├─ Validates city against 105-city list (duplicate of client check)
   ├─ Creates Notion page in PRASSI_DB_ID:
   │   Properties: Citta (title), Descrizione, Data esperienza,
   │               Categoria, Pagina (url), Slug pagina,
   │               Status="Pending", Voti Confermo=0, Voti Non Confermo=0
   └─ Returns: { success: true, id: "notion-page-id" }

4. Client shows success preview with pending badge
   └─ Modal auto-closes after 3 seconds

5. Admin sees new entry in Notion with Status=Pending
   └─ Admin reviews, sets Status → "Approved"

6. [If Notion Automation configured]:
   └─ Automation fires → POST to Netlify Build Hook
   └─ Netlify triggers npm run build

7. During build: _data/prassiLocali.js
   └─ Searches Notion for Status="Approved" pages in PRASSI_DB_ID
   └─ Groups by pageSlug, then by city
   └─ Returns object available to Liquid templates as {{ prassiLocali }}

8. Pages with prassi sections now show approved entry
```

## Data Flow: Voting Path

```
1. User clicks "Confermo" or "Non confermo" button
   └─ src/scripts/prassi.js checks localStorage for existing vote
   └─ If voted: shows "Hai già votato" message, stops

2. fetch POST /.netlify/functions/vote-prassi
   Body: { id: "notion-page-id", voteType: "confermo"|"non_confermo" }

3. vote-prassi.mjs (Netlify Function):
   ├─ Validates id (non-empty string)
   ├─ Validates voteType (must be "confermo" or "non_confermo")
   ├─ notion.pages.retrieve({ page_id: id }) → gets current count
   ├─ Increments: currentCount + 1
   ├─ notion.pages.update with new count
   └─ Returns: { success: true, newCount, voteType }

4. Client:
   ├─ Updates button count display
   ├─ Stores vote in localStorage: { voteType, timestamp }
   │   └─ 24-hour expiry (then user can vote again)
   └─ Marks buttons as disabled/voted
```

## Data Flow: Rebuild-on-Approval Path (Notion Automation)

```
Option A — Notion Automation → Build Hook directly (simplest):

1. Admin sets Status → "Approved" in Notion
2. Automation: trigger "Property edited: Status = Approved"
3. Automation: action "Send webhook" → POST https://api.netlify.com/build_hooks/{id}
4. Netlify starts build immediately
5. Build runs npm run build (Notion fetch + 11ty)
6. New pages deployed with approved prassi

Option B — Notion API Webhook → notion-webhook.mjs → Build Hook:

1. Any Notion content change fires event
2. Notion sends POST to https://sospermesso.it/.netlify/functions/notion-webhook
   Header: X-Notion-Signature: sha256={hmac}
   Body: { type: "event", event: { type: "page.content_updated", ... } }
3. notion-webhook.mjs:
   ├─ Verifies signature with NOTION_WEBHOOK_SECRET
   ├─ Checks @netlify/blobs store for last-build-trigger timestamp
   ├─ If < 30 minutes ago: returns "Debounced", no build
   ├─ If >= 30 minutes: updates timestamp, calls NETLIFY_BUILD_HOOK_URL
   └─ Returns { message: "Build triggered" }
4. Netlify starts build, site rebuilds
```

---

## Integration Points with Existing Components

### What Already Works (no changes needed)

- `netlify.toml`: `[functions]` section already configured
- `package.json`: `@notionhq/client` and `@netlify/blobs` already in `dependencies`
- `src/scripts/prassi.js`: already calls both function endpoints
- `_data/prassiLocali.js`: already fetches approved prassi during build
- All three function files: already written and present
- CORS handling: already implemented in both submit and vote functions

### What Needs Configuration (not code)

1. **Netlify environment variables** (Netlify Dashboard):
   - `PRASSI_DB_ID`: the Notion database ID for prassi submissions
   - `NETLIFY_BUILD_HOOK_URL`: created in Netlify Dashboard > Build hooks
   - `NOTION_WEBHOOK_SECRET`: only needed if using API webhook subscription

2. **Local `.env` file** (development only):
   - Same variables as above, already have `.env.example` as reference
   - `netlify dev` reads `.env` automatically

3. **Notion Automation** (if using Option A for rebuild):
   - Trigger: "Property edited" → Status property → "Approved"
   - Action: "Send webhook" → NETLIFY_BUILD_HOOK_URL
   - No custom headers needed

### What Needs Code Review/Fix

**Issue 1: `submit-prassi.mjs` uses `process.env.PRASSI_DB_ID`**
- The project pattern hardcodes Notion DB IDs in data files
- Functions are a different context — env vars are appropriate here (functions run server-side, not build-time)
- This is actually correct for functions. The pattern only applies to `_data/*.js` files where IDs are in the file for simplicity since no other env var mechanism is available.
- VERDICT: Keep as-is. Functions using env vars for DB IDs is correct and aligns with `NOTION_API_KEY` pattern.

**Issue 2: `_data/prassiLocali.js` reads `PRASSI_DB_ID` from env var too**
- Inconsistency: other data files (`permits.js`, `documents.js`) hardcode DB IDs
- This means `PRASSI_DB_ID` must be set both locally and on Netlify
- VERDICT: Either hardcode the ID in `prassiLocali.js` (matching other data files) OR ensure env var is set everywhere. Hardcoding is simpler and matches project convention.

**Issue 3: `notion-webhook.mjs` uses `@netlify/blobs` for debounce state**
- `getStore()` works automatically in Netlify Functions v2 context
- In local dev with `netlify dev`, blobs use a local sandbox store (does not persist between dev server restarts)
- VERDICT: Fine for production. Local testing of webhook debounce requires accepting that state resets on restart.

**Issue 4: `prassiLocali.js` uses `notion.search()` instead of `notion.databases.query()`**
- The code searches all pages and filters by `parent.database_id` matching `PRASSI_DB_ID`
- This is a workaround noted in the comment: "Fetch all pages using search API (workaround for dataSources.query permission)"
- This scales poorly: searches ALL workspace pages, not just the prassi database
- VERDICT: Flag for review — if the integration has `databases.query` permission, use `notion.databases.query({ database_id: PRASSI_DB_ID })` instead.

---

## Local Testing Approach

### Setup

```bash
# 1. Install Netlify CLI globally (if not installed)
npm install -g netlify-cli

# 2. Create .env with required vars (already have .env.example)
cp .env.example .env
# Fill in: NOTION_API_KEY, PRASSI_DB_ID, NETLIFY_BUILD_HOOK_URL

# 3. Link to Netlify site (one-time)
netlify link

# 4. Start local dev server with functions
netlify dev
# This serves site at localhost:8888
# Functions available at localhost:8888/.netlify/functions/
```

### Testing submit-prassi

```bash
curl -X POST http://localhost:8888/.netlify/functions/submit-prassi \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Milano",
    "description": "A Milano chiedono sempre una copia extra del codice fiscale",
    "pageSlug": "documenti-lavoro-subordinato-primo"
  }'
# Expected: { "success": true, "id": "..." }
```

### Testing vote-prassi

```bash
curl -X POST http://localhost:8888/.netlify/functions/vote-prassi \
  -H "Content-Type: application/json" \
  -d '{"id": "NOTION_PAGE_ID", "voteType": "confermo"}'
# Expected: { "success": true, "newCount": 1, "voteType": "confermo" }
```

### Testing notion-webhook

```bash
# 1. Set NOTION_WEBHOOK_SECRET in .env
# 2. Generate a valid signature:
node -e "
  const crypto = require('crypto');
  const body = JSON.stringify({type:'event', event:{type:'page.content_updated'}});
  const sig = 'sha256=' + crypto.createHmac('sha256', process.env.NOTION_WEBHOOK_SECRET).update(body).digest('hex');
  console.log('Signature:', sig);
  console.log('Body:', body);
"
# 3. Send request with signature:
curl -X POST http://localhost:8888/.netlify/functions/notion-webhook \
  -H "Content-Type: application/json" \
  -H "X-Notion-Signature: sha256=COMPUTED_VALUE" \
  -d '{"type":"event","event":{"type":"page.content_updated"}}'
```

### Testing End-to-End Rebuild

Netlify Build Hook can be triggered locally:

```bash
curl -X POST "$NETLIFY_BUILD_HOOK_URL"
# Triggers a production Netlify build (note: this builds on Netlify, not locally)
```

For local 11ty build with prassi data:

```bash
npm run build
# Fetches from Notion (NOTION_API_KEY + PRASSI_DB_ID must be in .env)
# Approved prassi appear in _site/ output
```

---

## Suggested Build Order

Build in this order to validate each layer before the next:

**Phase 1 — Environment and function wiring**
1. Verify `PRASSI_DB_ID` and `NOTION_API_KEY` are set in Netlify environment variables
2. Run `netlify dev`, test `submit-prassi` with curl — confirm Notion page is created
3. Test `vote-prassi` with curl using a real page ID from step 2

**Phase 2 — Rebuild trigger**
4. Create Netlify Build Hook in dashboard, add `NETLIFY_BUILD_HOOK_URL` env var
5. Choose rebuild trigger approach:
   - Option A (simple): Configure Notion Automation to POST directly to Build Hook URL
   - Option B (comprehensive): Register Notion API webhook subscription pointing to `notion-webhook` function, add `NOTION_WEBHOOK_SECRET`
6. Approve a test submission in Notion, verify site rebuilds

**Phase 3 — End-to-end validation**
7. Submit a prassi via the form on a live permit page
8. Approve it in Notion
9. Verify rebuild fires
10. Verify approved prassi appears on the permit page

**Phase 4 — Code quality fixes (optional but recommended)**
11. Review `_data/prassiLocali.js`: hardcode `PRASSI_DB_ID` to match project pattern for data files, or confirm env var approach is intentional
12. Review `prassiLocali.js` search vs query: switch to `notion.databases.query()` if permission allows
13. Add rate limiting to `vote-prassi` if localStorage-only becomes insufficient

---

## Patterns to Follow

### Pattern 1: Netlify Functions v2 ESM Format

All three functions correctly use the v2 format:

```javascript
// Correct v2 pattern (used in all three .mjs files)
export default async (req, context) => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

Do not use the legacy v1 format (`exports.handler`).

### Pattern 2: CORS for Browser-Facing Functions

Both `submit-prassi` and `vote-prassi` correctly handle CORS:

```javascript
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
// Handle OPTIONS preflight before any logic
if (req.method === 'OPTIONS') {
  return new Response(null, { status: 204, headers: corsHeaders });
}
```

### Pattern 3: Graceful Degradation (from data files)

The `_data/prassiLocali.js` returns an empty object when env vars are missing — 11ty builds succeed even without prassi data. This pattern should be maintained.

### Pattern 4: Rate Limiting Approach

Current: client-side localStorage (24-hour expiry per page ID per browser).
This is intentional for MVP — no server-side rate limiting in `vote-prassi.mjs`. Acceptable because:
- Vote inflation requires physical access to 105 questure data (not zero effort)
- Votes are advisory community signals, not legally binding
- Server-side rate limiting (by IP) would require additional infrastructure

If server-side rate limiting is added later, the pattern is:
```javascript
// Netlify Functions don't expose client IP directly in v2
// Use context.ip (available in v2) or X-Forwarded-For header
const ip = context.ip || req.headers.get('x-forwarded-for')?.split(',')[0];
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Using Notion Automation Payload to Trigger notion-webhook.mjs

Notion Automation "Send webhook" does NOT send `X-Notion-Signature`. If you point the Automation to `notion-webhook.mjs`, it will fail signature verification and return 401.

Correct use:
- Notion Automation → Netlify Build Hook URL directly (Option A)
- Notion API webhook subscription → `notion-webhook.mjs` (Option B)

Do not mix the two.

### Anti-Pattern 2: Calling notion.databases.query() Without Verifying Permission

The current `prassiLocali.js` uses `notion.search()` as a workaround. If you switch to `notion.databases.query()`, confirm the integration has "Read content" permission on the prassi database specifically. If the integration was created with limited scope, the query will return 403.

### Anti-Pattern 3: Triggering a Build on Every Vote

Vote function modifies a Notion page property. This could fire the API webhook (Option B) and trigger a rebuild. At scale this creates unnecessary builds. The 30-minute debounce in `notion-webhook.mjs` mitigates this, but consider:
- Votes should NOT trigger rebuilds (vote counts update in real-time via JS, not via static site)
- Only approval (Status=Approved) should trigger rebuild
- If using API webhooks, add event filtering: only rebuild for pages from the PRASSI_DB_ID that change Status, not vote count properties

### Anti-Pattern 4: Hardcoding Build Hook URL in Code

`NETLIFY_BUILD_HOOK_URL` must be an env var, never committed to the repo. This URL triggers production builds without any authentication. Anyone with the URL can trigger rebuilds. Keep it in Netlify environment variables only.

---

## Scalability Considerations

| Concern | MVP (current) | At 100 submissions/day | At 1000/day |
|---------|--------------|------------------------|-------------|
| Submission writes | Direct Notion API write | Same | May hit Notion rate limits (3 req/sec) |
| Vote writes | Direct Notion read+write | Same | Race condition risk on popular entries |
| Rebuild frequency | On every approval (manual) | Same | Same (manual approval is bottleneck) |
| Prassi display | Built into static pages | Same | Same (static, fast) |

Vote race condition: two simultaneous votes on the same prassi page both read count=5, both write count=6 instead of count=7. Acceptable for community voting MVP. Fix if needed: use Notion's atomic number increment if API supports it (check Notion API docs for `increment` operation).

---

## Environment Variables Reference

| Variable | Where Set | Used By | Required |
|----------|----------|---------|----------|
| `NOTION_API_KEY` | Netlify env vars + `.env` | All data files + all functions | Yes |
| `PRASSI_DB_ID` | Netlify env vars + `.env` | `_data/prassiLocali.js`, `submit-prassi.mjs` | Yes |
| `NETLIFY_BUILD_HOOK_URL` | Netlify env vars + `.env` | `notion-webhook.mjs`, Notion Automation (directly) | Yes for rebuild |
| `NOTION_WEBHOOK_SECRET` | Netlify env vars + `.env` | `notion-webhook.mjs` only | Only for Option B |

Note: `PRASSI_DB_ID` is used as env var in both the data file and the function. This is an intentional deviation from the "hardcode DB IDs" pattern that applies to the main permit/document databases. The prassi DB ID may differ per environment (dev vs prod), and keeping it in env vars gives flexibility.

---

## Files Reference

### Files That Exist (no new files needed for core feature)

```
netlify/
  functions/
    submit-prassi.mjs      — creates pending submission in Notion
    vote-prassi.mjs        — increments vote counts in Notion
    notion-webhook.mjs     — receives Notion API events, triggers rebuild

_data/
    prassiLocali.js        — fetches approved prassi at build time

src/scripts/
    prassi.js             — client-side form + voting UI
```

### Configuration Files That Need Updates

```
.env                      — add PRASSI_DB_ID, NETLIFY_BUILD_HOOK_URL, NOTION_WEBHOOK_SECRET
.env.example              — already documents all four variables (no change needed)
netlify.toml              — already has [functions] block (no change needed)
```

### Netlify Dashboard Configuration

```
Site > Environment variables:
  NOTION_API_KEY          — already set (used for build)
  PRASSI_DB_ID            — add this
  NETLIFY_BUILD_HOOK_URL  — add after creating hook
  NOTION_WEBHOOK_SECRET   — add if using Option B

Site > Build & deploy > Build hooks:
  Create hook named "Notion prassi approval"
  Copy generated URL → NETLIFY_BUILD_HOOK_URL
```

---

## Sources

- [Notion Webhook Actions – Help Center](https://www.notion.com/help/webhook-actions) — Automation webhook behavior, no signature, direct POST
- [Notion Database Automations – Help Center](https://www.notion.com/help/database-automations) — Property-change triggers
- [Notion API Webhooks Reference](https://developers.notion.com/reference/webhooks) — Developer subscription format, HMAC-SHA256 signature
- [Netlify Build Hooks Documentation](https://docs.netlify.com/build/configure-builds/build-hooks/) — POST to trigger rebuild, URL format
- [Netlify Functions v2 – Get Started](https://docs.netlify.com/build/functions/get-started/) — ESM default export format, Request/Response API
- [Netlify Blobs Documentation](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) — getStore, local dev sandbox behavior
- [netlify dev local testing](https://www.netlify.com/blog/2021/12/12/how-to-test-serverless-functions-locally/) — Local function testing approach

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Function code (submit, vote) | HIGH | Code exists, pattern is standard Netlify v2 + Notion API |
| notion-webhook.mjs signature handling | HIGH | Standard HMAC-SHA256, matches Notion API docs |
| Notion Automation vs API webhook distinction | HIGH | Clearly documented, two separate mechanisms |
| Netlify Build Hook trigger | HIGH | Simple POST, well-documented |
| @netlify/blobs in local dev | MEDIUM | Works but local sandbox doesn't persist; production behavior verified |
| Race condition on votes | MEDIUM | Known pattern, acceptable for MVP; atomic increment via API unverified |
| Notion search() vs databases.query() permission | LOW | Workaround in prassiLocali.js suggests permission issue exists; needs manual verification |

---
*Research conducted 2026-02-19 for v4.1 milestone (Netlify Functions + Notion Automation for prassi)*
