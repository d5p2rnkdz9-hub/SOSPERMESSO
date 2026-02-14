# Roadmap: SOS Permesso v3.1

**Milestone:** v3.1 Prassi Locali + Notion-11ty Completion
**Created:** 2026-02-07
**Updated:** 2026-02-14 — Phase 42.2 complete
**Phases:** 39-46 + 42.1, 42.2 (continues from v3.0 which ended at phase 38)

## Overview

Complete Notion-11ty integration, build collaborative "prassi locali" infrastructure for crowdsourced questura notes, then clean up build pipeline and populate remaining content.

| Phase | Name | Goal | Requirements |
|-------|------|------|--------------|
| 39 | Document Pages | Document pages generated via 11ty data + templates | DOC-01 to DOC-04 |
| 40 | Permit Pages | Permit pages generated via 11ty data + templates | PERM-01 to PERM-04 |
| 41 | Prassi Locali MVP | Crowdsourced local questura practices on document pages | PRASSI-01 to PRASSI-04 |
| 42 | Build Pipeline | Unified build command, old script cleanup | BUILD-01 to BUILD-04 |
| 42.1 | Fix Prassi Integration | Debug + fix prassi section not rendering in built pages | PRASSI-01 to PRASSI-04 |
| 42.2 | Requirements & Docs Cleanup | Track all v3.1 requirements, generate Phase 41 verification | — |
| 43 | Populate Blank Permits | Add Notion content for 17 placeholder permits | CONTENT-01 to CONTENT-02 |
| 44 | Costi Section | Cost information section on document pages | COSTI-01 to COSTI-02 |
| 45 | Content Validation | Review pass on all generated content | VALID-01 to VALID-02 |
| 46 | Dizionario Link Revision | Fix partial matching coverage for glossary links | DIZIO-01 to DIZIO-02 |

---

## Phase 39: Document Pages ✓

**Goal:** Document pages (primo rilascio + rinnovo) generated via 11ty instead of standalone script.

**Status:** Complete (2026-02-07)

**Plans:** 2 plans

Plans:
- [x] 39-01-PLAN.md — Data layer: documents.js data file + Liquid filters
- [x] 39-02-PLAN.md — Templates: primo, rinnovo, and redirect page templates

**Requirements:**
- DOC-01: 11ty data file fetches document data from Notion
- DOC-02: Liquid template renders document pages (primo/rinnovo)
- DOC-03: Generated pages have same URLs as current
- DOC-04: Redirect pages generated via 11ty for URL aliases

**Success Criteria:**
1. `_data/documents.js` exists and fetches from Notion API
2. Liquid templates render primo and rinnovo pages
3. Build produces `documenti-*-primo.html` and `documenti-*-rinnovo.html` files
4. URL aliases redirect correctly
5. Generated pages are visually identical to current pages

**Dependencies:** None (starts fresh)

**Technical Notes:**
- Adapt logic from `scripts/build-documents.js` and `scripts/notion-client.js`
- Template logic from `scripts/templates/primo.js` and `rinnovo.js` becomes Liquid
- Keep current HTML structure for CSS compatibility

---

## Phase 40: Permit Pages ✓

**Goal:** Permit pages (Q&A sections) generated via 11ty instead of standalone script.

**Status:** Complete (2026-02-09)

**Plans:** 2 plans

Plans:
- [x] 40-01-PLAN.md — Data layer: permits.js data file + getSectionBorderColor filter
- [x] 40-02-PLAN.md — Template: permits.liquid + old file conflict handling + visual verification

**Requirements:**
- PERM-01: 11ty data file fetches permit data and page blocks from Notion
- PERM-02: Liquid template renders permit Q&A pages
- PERM-03: Variant pages (parent/child) generated correctly
- PERM-04: Generated pages have same URLs as current

**Success Criteria:**
1. `_data/permits.js` exists and fetches permits + page blocks from Notion
2. Liquid template renders Q&A sections with colored borders
3. Variant parent and child pages generate correctly
4. Build produces `permesso-*.html` files matching current URLs
5. Generated pages are visually identical to current pages

**Dependencies:** Phase 39 (establishes Notion data file patterns)

**Technical Notes:**
- Adapt logic from `scripts/build-permits.js`
- Template logic from `scripts/templates/permesso.js` becomes Liquid
- Q&A parsing logic needs careful migration (multiple Notion formats)
- Variant detection preserved from current implementation

---

## Phase 41: Prassi Locali MVP ✓

**Goal:** Crowdsourced local questura practices on document pages — users can submit, view, and vote on practical tips about how specific questure handle procedures.

**Status:** Complete (2026-02-10)

**Plans:** 4 plans

Plans:
- [x] 41-01-PLAN.md — Static core: data layer + display section on document pages
- [x] 41-02-PLAN.md — Netlify Functions: submission + voting endpoints
- [x] 41-03-PLAN.md — Interactive layer: modal form, voting UI, webhook auto-deploy
- [x] 41-04-PLAN.md — Visual verification checkpoint

**Requirements:**
- PRASSI-01: Submission form on document pages sends data via Netlify Function to Notion DB
- PRASSI-02: "Prassi locali" section on document pages displays approved notes, filterable by city
- PRASSI-03: Upvote/downvote system (anonymous, localStorage + IP rate limiting)
- PRASSI-04: Manual moderation workflow (approve in Notion, rebuild to publish)

**Success Criteria:**
1. Document pages have a "Prassi locali" section showing approved practices
2. Users can submit new practices via inline form
3. Practices are filterable by city (client-side)
4. Upvote/downvote works with abuse prevention
5. Submissions appear in Notion for moderation
6. Approved submissions appear on site after rebuild

**Dependencies:** Phases 39, 40 (document and permit pages must work via 11ty)

**Technical Notes:**
- Static core: approved notes baked into pages at build time
- Thin dynamic layer: Netlify Functions for form submission + upvoting
- Notion DB as content store (submissions table, moderation queue)
- Future phase: pre-approved user auth for submitters

---

## Phase 42: Build Pipeline ✓

**Goal:** Unified build command, webhook debounce for auto-rebuild, old script cleanup, and content audit report for downstream phases.

**Status:** Complete (2026-02-14)

**Plans:** 3 plans

Plans:
- [x] 42-01-PLAN.md — Build unification: inline notion-client.js, simplify build command, remove obsolete scripts
- [x] 42-02-PLAN.md — Webhook debounce: 30-min debounce via Netlify Blobs on notion-webhook.mjs
- [x] 42-03-PLAN.md — Content audit: generate structured report of Notion content quality issues

**Requirements:**
- BUILD-01: Single `npm run build` command generates all pages
- BUILD-02: Netlify configured with `NOTION_API_KEY` env var
- BUILD-03: Build completes in under 120 seconds
- BUILD-04: Old build scripts removed after migration verified

**Success Criteria:**
1. `npm run build` produces complete site including Notion-sourced pages
2. Netlify env vars documented and configured
3. Build time measured and under 120s
4. Old scripts removed: `build-documents.js`, `build-permits.js`
5. Production deployment works with Notion integration

**Dependencies:** Phases 39, 40 (all page types must work before cleanup)

**Technical Notes:**
- Build command simplified from two-step to single `npx @11ty/eleventy`
- notion-client.js inlined into permits.js (matching documents.js self-contained pattern)
- 20+ obsolete scripts removed (old build scripts, one-time migration/fix scripts)
- Webhook debounce prevents multiple builds during batch Notion editing sessions
- Content audit script generates report for Phase 43 and Phase 45

---

## Phase 42.1: Fix Prassi Integration

**Goal:** Fix prassi locali section not rendering in built document pages by removing old static HTML files that block Liquid template generation.

**Status:** Complete (2026-02-14)

**Plans:** 1 plan

Plans:
- [x] 42.1-01-PLAN.md — Delete old static document files, remove filesystem guard from documents.js, verify build

**Requirements:**
- PRASSI-01: Submission form on document pages sends data via Netlify Function to Notion DB
- PRASSI-02: "Prassi locali" section on document pages displays approved notes, filterable by city
- PRASSI-03: Upvote/downvote system (anonymous, localStorage + IP rate limiting)
- PRASSI-04: Manual moderation workflow (approve in Notion, rebuild to publish)

**Success Criteria:**
1. Built document pages include prassi.css link in `<head>`
2. Built document pages include prassi section HTML after document content
3. Built document pages include prassi.js script tag
4. Submission modal opens and submits to Netlify Function
5. Voting UI renders and communicates with vote endpoint
6. .env.example documents PRASSI_DB_ID

**Dependencies:** Phase 42 (build pipeline must be working)

**Root Cause:** Old static `documenti-*.html` files in `src/pages/` cause `documents.js` to skip those slugs from its data arrays (via `fs.existsSync` check). The Liquid pagination templates never generate pages for those slugs — old static files are served instead, lacking prassi CSS, section, and JS.

---

## Phase 42.2: Requirements & Docs Cleanup

**Goal:** Bring requirements tracking up to date -- add all v3.1 roadmap requirements to REQUIREMENTS.md and generate missing Phase 41 verification.

**Status:** Complete (2026-02-14)

**Plans:** 1 plan

Plans:
- [x] 42.2-01-PLAN.md — Update REQUIREMENTS.md (add 8 requirements) + generate Phase 41 VERIFICATION.md

**Success Criteria:**
1. REQUIREMENTS.md includes PRASSI-01..04, CONTENT-01..02, COSTI-01..02, VALID-01..02, DIZIO-01..02
2. Phase 41 VERIFICATION.md generated (after 42.1 fixes the integration)
3. Traceability table updated with all requirements mapped to phases

**Dependencies:** Phase 42.1 (prassi must work before verification can pass)

**Technical Notes:**
- REQUIREMENTS.md currently tracks 16 requirements (DOC, PERM, BUILD, PRASSI) -- needs 8 more (CONTENT, COSTI, VALID, DIZIO)
- Phase 41 never had a VERIFICATION.md -- needs retroactive generation using build output evidence

---

## Phase 43: Populate Blank Permits

**Goal:** Add Notion content for the 17 placeholder permit pages.

**Requirements:**
- CONTENT-01: All 17 placeholder permits have Q&A content in Notion
- CONTENT-02: Generated pages render correctly with new content

**Dependencies:** Phase 40 (permit page generation must work)

---

## Phase 44: Costi Section

**Goal:** Add cost information section to document pages.

**Requirements:**
- COSTI-01: Cost data sourced from Notion
- COSTI-02: Costi section rendered on document pages

**Dependencies:** Phase 39 (document page templates)

---

## Phase 45: Content Validation

**Goal:** Review pass on all generated content for accuracy and completeness.

**Requirements:**
- VALID-01: All document pages reviewed for accuracy
- VALID-02: All permit pages reviewed for accuracy

**Dependencies:** Phases 43, 44 (all content populated first)

---

## Phase 46: Dizionario Link Revision

**Goal:** Fix partial matching coverage for glossary links across all pages.

**Requirements:**
- DIZIO-01: Glossary term matching improved
- DIZIO-02: All relevant terms linked correctly

**Dependencies:** Phase 45 (content finalized before link pass)

---

## Risk Mitigation

**API rate limiting:** Notion API has rate limits. If build is slow, consider:
- Caching responses during build
- Parallel fetching where possible

**Netlify Functions cold start:** Prassi locali submission/voting uses serverless functions. Consider:
- Keep functions small and focused
- Warm-up strategies if latency is an issue

**Moderation bottleneck:** Manual Notion moderation may not scale. Monitor volume and consider:
- Batch approval workflows
- Pre-approved contributor access (Phase 2)

---
*Roadmap created: 2026-02-07*
*Updated: 2026-02-14 — Phase 42.2 complete*
