# Project Research Summary

**Project:** SOS Permesso — v4.1 Prassi Locali Completion + Notes Bug Fix
**Domain:** Serverless UGC submission/voting with Notion as CMS and Netlify as host
**Researched:** 2026-02-19
**Confidence:** HIGH (all three functions verified from codebase; official Netlify + Notion docs used throughout)

## Executive Summary

The v4.1 milestone is **wiring and verification, not writing from scratch.** All three Netlify Functions (`submit-prassi.mjs`, `vote-prassi.mjs`, `notion-webhook.mjs`) already exist in `netlify/functions/`, the client-side `prassi.js` already calls the correct endpoints, and `_data/prassiLocali.js` already fetches approved entries at build time. What remains is: setting missing env vars in Netlify, choosing and configuring a rebuild trigger approach, adding security controls to the two public endpoints (rate limiting + honeypot), and wiring the Notion database automation. There is also one standalone bug fix needed: the field name "Info extra su doc rilascio" must be updated to "Info extra su doc rilascio/rinnovo" in `documents.js` and `permits.js`.

The single biggest technical risk is a breaking API change in `@notionhq/client` v5 (installed at 5.8.0): Notion's 2025-09-03 API version may require `parent: { type: "data_source_id", data_source_id: "..." }` instead of the `parent: { database_id: "..." }` pattern currently in `submit-prassi.mjs`. This is a MEDIUM-confidence finding (WebSearch, not directly verified from SDK source) and must be tested live before launch with a single curl call against the deployed function. If it fails, a one-line fix resolves it.

The rebuild trigger design has two valid paths: (A) Notion Automation pointing directly to the Netlify Build Hook URL — simple, no code, but requires a paid Notion plan — and (B) the already-coded `notion-webhook.mjs` which receives Notion API webhook subscriptions, verifies HMAC signatures, and calls the build hook with a 30-minute debounce via `@netlify/blobs`. Both can coexist. A critical anti-pattern: do NOT point a Notion Automation at `notion-webhook.mjs` — Automation "Send webhook" does not include `X-Notion-Signature`, so signature verification will always fail (401).

---

## Key Findings

### Recommended Stack

No new dependencies are needed. The current stack handles everything:

**Core technologies already in place:**
- `@notionhq/client` v5.8.0 — Notion API reads/writes in functions and build scripts
- `@netlify/blobs` v10.6.0 — KV store for cross-invocation debounce state in `notion-webhook.mjs`
- Netlify Functions v2 (ESM, `export default async (req, context) => ...`) — all three functions use this pattern correctly
- `netlify.toml` `[functions]` block with `node_bundler = "esbuild"` — already configured, no changes needed
- Node 22 LTS — set via `NODE_VERSION = "22"` in `netlify.toml`

**One configuration addition needed:**
- Netlify rate limiting via `config` export in `submit-prassi.mjs` and `vote-prassi.mjs` (no new library; this is a Netlify platform feature activated by exporting a `config` object from the function file)

**Field name bug fix (not a stack change):**
- `_data/documents.js` and `_data/permits.js`: change `"Info extra su doc rilascio"` to `"Info extra su doc rilascio/rinnovo"` to match the actual Notion property name

### Expected Features

**Must have before accepting real submissions (ship-blockers):**
- Rate limiting on `submit-prassi.mjs`: 3 requests per 180 seconds per IP (Netlify `config` export)
- Rate limiting on `vote-prassi.mjs`: 20 requests per 180 seconds per IP (Netlify `config` export)
- Honeypot field: hidden `website` input in form HTML + server-side rejection in `submit-prassi.mjs`
- Server-side description max length: 2000 chars (currently only 20-char minimum is enforced server-side)
- Notion DB setup: Pending/Approved/Rejected status values + "Da approvare" filtered view in Notion UI
- Rebuild trigger configured: either Notion Automation (Option A, paid plan) or Notion API webhook subscription with `NOTION_WEBHOOK_SECRET` (Option B)
- `PRASSI_DB_ID` hardcoded in `_data/prassiLocali.js` (matching project convention for data files)

**Should have (security closure, not strictly ship-blockers):**
- `vote-prassi.mjs`: verify page belongs to Prassi DB before incrementing vote (currently any Notion page ID is accepted)
- `vote-prassi.mjs`: check Status=Approved before accepting votes
- Admin Notion views: "Approvate" and "Rifiutate" for reference

**Defer (not needed at current scale):**
- Server-side per-IP vote deduplication beyond rate limiting
- AI-powered content classification
- Custom admin dashboard (Notion is the admin UI)
- Category filtering in the rendered UI
- Pagination on prassi entries (flat display adequate for dozens-per-city)

### Architecture Approach

The system is a three-tier pipeline: browser form → Netlify Functions → Notion database → 11ty build → static site. All tiers are already implemented. The missing pieces are configuration (env vars, Notion automation) and security controls (rate limiting, honeypot).

**Key architectural decision — two webhook mechanisms exist, do not conflate them:**

1. **Notion Automation "Send webhook"** — Notion UI feature, sends a plain POST with no signature to any URL. For this project, point it directly at the Netlify Build Hook URL. No function involved. Requires Notion paid plan.

2. **Notion API webhook subscription** — Developer-level, sends HMAC-signed POST to `notion-webhook.mjs`, which debounces with `@netlify/blobs` and calls the Build Hook. Already fully implemented. Fires on all content changes (not just approvals). Requires `NOTION_WEBHOOK_SECRET` env var set in both Notion API subscription config and Netlify.

**Anti-pattern to avoid:** Pointing Notion Automation at `notion-webhook.mjs`. Automation does not send `X-Notion-Signature` so HMAC verification returns 401 every time.

**Major components:**
1. `netlify/functions/submit-prassi.mjs` — validates input, creates Notion page with Status=Pending
2. `netlify/functions/vote-prassi.mjs` — read-increment-write on Notion vote count properties
3. `netlify/functions/notion-webhook.mjs` — receives Notion API events, 30-min debounce via Blobs, triggers build hook
4. `_data/prassiLocali.js` — build-time Notion query for Status=Approved, groups by pageSlug then city
5. `src/scripts/prassi.js` — browser-side form, voting UI, localStorage dedup (already wired to functions)

### Critical Pitfalls

1. **CORS headers missing on error response paths** — `corsHeaders` constant must be included in every `return new Response(...)` call: success, validation error (400), rate limit (429), and catch block (500). Missing CORS on error paths means browsers cannot read the error body and the developer sees a CORS error instead of the actual problem. Both `submit-prassi.mjs` and `vote-prassi.mjs` need verification here.

2. **Build Hook URL is an unauthenticated secret** — Any POST to the Build Hook URL triggers a production rebuild. Treat it like an API key: store only in Netlify env vars and Notion automation config, never in git. Each rebuild takes ~72 seconds. At 300 free build minutes/month, ~250 malicious triggers exhaust the budget. If the URL leaks, rotate it immediately in Netlify Dashboard.

3. **@notionhq/client v5 `database_id` vs `data_source_id` parent field** — `submit-prassi.mjs` uses `parent: { database_id: process.env.PRASSI_DB_ID }`. Notion's 2025-09-03 API (targeted by v5) may require `parent: { type: "data_source_id", data_source_id: "..." }`. Test with a live curl before launch. If it returns 500, the one-line fix is: change `{ database_id: ... }` to `{ type: "data_source_id", data_source_id: ... }`. Confidence on this risk: MEDIUM.

4. **Vote endpoint race condition** — `vote-prassi.mjs` does read-then-write (retrieve count, increment, update). Two simultaneous votes on the same entry both read count=5, both write count=6 instead of count=7. Notion has no atomic increment. This is a known, acceptable limitation at small scale — document it in code comments and do not attempt to fix with locks (stateless functions cannot lock).

5. **`prassiLocali.js` uses `notion.search()` instead of `notion.databases.query()`** — A comment in the file notes this is a workaround for permission issues with `dataSources.query`. `search()` scans the entire workspace, not just the Prassi DB. If Notion integration permissions are updated to allow `databases.query`, switch to `notion.databases.query({ database_id: PRASSI_DB_ID })` for reliability and performance.

---

## Implications for Roadmap

### Phase 1: Environment Setup and Function Smoke Tests
**Rationale:** All functions exist but cannot run without env vars. Verifying basic wiring first saves debugging time later. Live testing catches the `database_id` vs `data_source_id` risk before any other work.
**Delivers:** `PRASSI_DB_ID` and `NOTION_API_KEY` confirmed in Netlify env vars; `submit-prassi` and `vote-prassi` tested live via curl against deployed site.
**Addresses:** @notionhq/client v5 compatibility risk (Pitfall #3 above)
**Test command:** `curl -X POST https://www.sospermesso.it/.netlify/functions/submit-prassi -H "Content-Type: application/json" -d '{"city":"Roma","description":"Test submission dev — da eliminare","pageSlug":"test-dev"}'` — expect `{ success: true, id: "..." }`.

### Phase 2: Bug Fix — Field Name in documents.js and permits.js
**Rationale:** Standalone, low-risk fix with no dependencies. Ship this before anything else to unblock correct data display.
**Delivers:** `"Info extra su doc rilascio"` renamed to `"Info extra su doc rilascio/rinnovo"` in `_data/documents.js` and `_data/permits.js`. Rebuild and verify the field appears on permit/document pages.
**Avoids:** Regression risk from doing this mid-stream when other changes are in flight.

### Phase 3: Security Controls on Public Endpoints
**Rationale:** Endpoints are publicly reachable now. Rate limiting and honeypot must be in place before any promotion of the feature or accepting real submissions.
**Delivers:**
- Rate limiting config export on `submit-prassi.mjs` (3 per 180s per IP)
- Rate limiting config export on `vote-prassi.mjs` (20 per 180s per IP)
- Hidden `website` honeypot field in form HTML + server-side rejection in `submit-prassi.mjs`
- Server-side 2000-char max on description in `submit-prassi.mjs`
**Uses:** Netlify `config` export (no new library), CSS `display: none` for honeypot
**Avoids:** Bot spam flooding admin moderation queue (FEATURES.md ship-blocker #3)

### Phase 4: Rebuild Trigger Wiring
**Rationale:** Without a rebuild trigger, approved prassi never appear on the site. This is the last functional gap before end-to-end flow works.
**Delivers:** Choose and configure one rebuild approach:
- Option A (if Notion workspace is on paid plan): Create Notion Automation on Prassi DB — trigger "Status property edited to Approved", action "Send webhook" to `NETLIFY_BUILD_HOOK_URL`. Create the hook in Netlify Dashboard, add `NETLIFY_BUILD_HOOK_URL` to Netlify env vars.
- Option B (if free plan or want broader coverage): Register Notion API webhook subscription pointing to `/.netlify/functions/notion-webhook`. Set `NOTION_WEBHOOK_SECRET` in Netlify env vars.
**Avoids:** Anti-pattern of pointing Notion Automation at `notion-webhook.mjs` (ARCHITECTURE.md critical distinction). Never commit `NETLIFY_BUILD_HOOK_URL` to git (Pitfall #2).

### Phase 5: Notion Database Setup (Admin Views)
**Rationale:** No-code phase. Sets up the admin moderation interface so the admin can efficiently process submissions.
**Delivers:** Three Notion views in Prassi DB: "Da approvare" (Status=Pending, sorted by created time ascending), "Approvate" (Status=Approved), "Rifiutate" (Status=Rejected). Verify Rejected is a selectable Status value.
**Implements:** Admin workflow from FEATURES.md moderation section.
**Note:** This can be done in parallel with Phase 3 or 4 — it is a Notion UI task, not a code task.

### Phase 6: PRASSI_DB_ID Hardcoding + prassiLocali.js Review
**Rationale:** Code consistency cleanup. `prassiLocali.js` reads `PRASSI_DB_ID` from env var, unlike all other data files that hardcode their DB IDs. Hardcoding matches project convention and removes one env var dependency from build time.
**Delivers:** `PRASSI_DB_ID` hardcoded in `_data/prassiLocali.js`. Optionally: switch `notion.search()` to `notion.databases.query()` if integration permissions allow.
**Avoids:** Env var misconfiguration causing silent build failures where prassi section renders empty.

### Phase 7: End-to-End Validation
**Rationale:** Final gating check before feature is considered live.
**Delivers:** Full flow exercised: form submission → Notion Pending entry → admin approval → rebuild fires → approved entry appears on permit page. Test with a real submission from the live site.
**Addresses:** All four FEATURES.md MVP must-haves confirmed working.

### Phase Ordering Rationale

- **Env setup before security:** Cannot test security controls without the function running. Phase 1 confirms the base works.
- **Bug fix early:** The `documents.js`/`permits.js` field name fix is unrelated to prassi and should not be blocked by prassi work. Ship it independently.
- **Security before promotion:** Rate limiting and honeypot must exist before the feature is publicized.
- **Rebuild trigger after security:** No point wiring automation before the endpoints are hardened.
- **Validation last:** End-to-end test proves the entire chain works together.

### Research Flags

Phases with well-documented patterns (skip additional research):
- **Phase 3 (Rate limiting):** Netlify `config` export with `rateLimit` is confirmed in official Netlify docs for all plan tiers. Implementation is a few lines.
- **Phase 5 (Notion DB setup):** Standard Notion UI operations, no code involved.
- **Phase 6 (Hardcode DB ID):** Mechanical change matching established project pattern.

Phases needing care but not additional research:
- **Phase 1 (Smoke test):** The `database_id` vs `data_source_id` risk is MEDIUM confidence. The test is simple; if it fails the fix is trivial.
- **Phase 4 (Rebuild trigger):** Must verify Notion workspace plan before choosing Option A vs B. Both paths are clearly documented.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All three functions verified from codebase; library versions confirmed from package.json + node_modules |
| Features | HIGH | Security controls researched from official Netlify and honeypot documentation; Notion plan requirement for Automation confirmed |
| Architecture | HIGH | All function code read directly; two-mechanism webhook distinction verified from official Notion docs |
| Pitfalls | HIGH | CORS, race condition, build hook exposure, spam — all confirmed from official sources and community docs. One MEDIUM: v5 API parent field change |

**Overall confidence:** HIGH

### Gaps to Address

- **@notionhq/client v5 `parent` field compatibility**: Must test live before declaring Phase 1 complete. Cannot resolve without a real API call against the Prassi DB.
- **Notion workspace plan**: Determines whether Rebuild Trigger Option A (Automation) is available. Check before Phase 4.
- **`notion.search()` permission for `databases.query()`**: The existing workaround works but is inefficient. Whether the integration can be upgraded to allow `databases.query` needs verification in the Notion integration settings.
- **CORS coverage on error paths**: Research confirms this is a common bug. Review both functions line-by-line to confirm `corsHeaders` is included in every response branch, including the `catch` block.

---

## Sources

### Primary (HIGH confidence)
- Notion API rate limits: [developers.notion.com/reference/request-limits](https://developers.notion.com/reference/request-limits)
- Notion API 2025-09-03 upgrade guide: [developers.notion.com/docs/upgrade-guide-2025-09-03](https://developers.notion.com/docs/upgrade-guide-2025-09-03)
- Netlify Functions v2 get started: [docs.netlify.com/build/functions/get-started/](https://docs.netlify.com/build/functions/get-started/)
- Netlify Build Hooks docs: [docs.netlify.com/build/configure-builds/build-hooks/](https://docs.netlify.com/build/configure-builds/build-hooks/)
- Netlify Rate Limiting docs: [docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)
- Notion Webhook Actions (Automation): [notion.com/help/webhook-actions](https://www.notion.com/help/webhook-actions)
- Notion Database Automations: [notion.com/help/database-automations](https://www.notion.com/help/database-automations)
- Notion API Webhooks Reference: [developers.notion.com/reference/webhooks](https://developers.notion.com/reference/webhooks)
- @netlify/blobs npm: [npmjs.com/package/@netlify/blobs](https://www.npmjs.com/package/@netlify/blobs)
- Honeypot field technique: [css-tricks.com/building-a-honeypot-field-that-works/](https://css-tricks.com/building-a-honeypot-field-that-works/)
- Project codebase: `netlify/functions/`, `_data/prassiLocali.js`, `src/scripts/prassi.js`

### Secondary (MEDIUM confidence)
- Netlify CORS support guide: Netlify community answers on CORS with Functions
- Netlify esbuild bundling behavior: [answers.netlify.com](https://answers.netlify.com) community threads
- Cold start benchmarks: [punits.dev/blog/vercel-netlify-cloudflare-serverless-cold-starts](https://punits.dev/blog/vercel-netlify-cloudflare-serverless-cold-starts/)

### Tertiary (supporting context)
- Notion API 2025-09-03 FAQ: [developers.notion.com/docs/upgrade-faqs-2025-09-03](https://developers.notion.com/docs/upgrade-faqs-2025-09-03) — `database_id` vs `data_source_id` risk, MEDIUM confidence only

---
*Research completed: 2026-02-19*
*Ready for roadmap: yes*
