# Roadmap: SOS Permesso v3.1

**Milestone:** v3.1 Prassi Locali + Notion-11ty Completion
**Created:** 2026-02-07
**Updated:** 2026-02-16 — Phase 44.1 planned
**Phases:** 39-46 + 42.1, 42.2, 44.1 (continues from v3.0 which ended at phase 38)

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
| 44.1 | URL Coverage & Content Preservation | Permit redirects, parent pages for variants, content migration | URL-01 to URL-03 |
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

## Phase 43: Populate Blank Permits ✓

**Goal:** Add Notion content for all placeholder permit pages so zero "Contenuto in arrivo" pages remain.

**Status:** Complete (2026-02-16)

**Plans:** 4 plans

Plans:
- [x] 43-01-PLAN.md — Audit permits, merge duplicates, study reference model
- [x] 43-02-PLAN.md — Populate protezione category permits + user spot-check
- [x] 43-03-PLAN.md — Populate lavoro category permits + user spot-check
- [x] 43-04-PLAN.md — Populate remaining categories (motivi familiari, altro) + final verification

**Requirements:**
- CONTENT-01: All placeholder permits have Q&A content in Notion
- CONTENT-02: Generated pages render correctly with new content

**Dependencies:** Phase 40 (permit page generation must work)

**Technical Notes:**
- Content transformation from Notion database columns + NOTES into Q&A narrative
- Two-step process: backfill HTML content into Notion, then generate from column data
- Processed by Macrocategoria (protezione first) with user checkpoints between batches
- Reference model: "Attesa occupazione (art.22)" page for tone and structure
- 8 permits populated, 3 skipped by user (not recognized in DB), 3 duplicates archived
- Familiari di titolari rewritten from Trento-specific to standard Q&A format
- 2 old static files deleted (attivita-sportiva without art.27, familiari-di-titolari)

---

## Phase 44: Costi Section ✓

**Goal:** Add itemized cost breakdown section to document pages (primo rilascio and rinnovo), sourced from Notion cost columns.

**Status:** Complete (2026-02-16)

**Plans:** 1 plan

Plans:
- [x] 44-01-PLAN.md — Data layer (cost fields from Notion) + templates (costi section) + CSS + visual verification

**Requirements:**
- COSTI-01: Cost data sourced from Notion database properties
- COSTI-02: Costi section rendered on document pages (primo and rinnovo)

**Dependencies:** Phase 39 (document page templates)

**Technical Notes:**
- Cost columns already exist in Notion DB (bollettino, marca da bollo per primo/rinnovo)
- Kit postale 30 EUR added conditionally based on existing `method` field
- 40 EUR electronic permit fee is ALREADY INCLUDED in bollettino (never listed separately)
- Section placement: after document notes, before prassi locali
- Hidden entirely when no cost data exists for a permit

---

## Phase 44.1: URL Coverage & Content Preservation (INSERTED)

**Goal:** Ensure every Notion DB permit has a working HTML page, old URLs redirect to canonical pages, variant permits have parent/hub pages, and content from old static files is preserved in Notion before those files become pure redirects.

**Dependencies:** Phase 44 (all content and costs populated)

**Plans:** 3 plans

Plans:
- [ ] 44.1-01-PLAN.md — Content audit: compare 34 static files vs Notion, migrate unique content, document findings
- [ ] 44.1-02-PLAN.md — Extend variant detection (3 parent pages) + permit redirect system (~28 URLs) + slugMap fix
- [ ] 44.1-03-PLAN.md — Delete old static files, clean build, full verification + user spot-check

**Requirements:**
- URL-01: Every permit in Notion DB generates an HTML page (no 404s for canonical URLs)
- URL-02: All old permit URLs (34 static files in src/pages/) redirect to correct canonical pages
- URL-03: Unique content from old static files is migrated to Notion before files are replaced with redirects

**Success Criteria:**
1. Permit redirect system (like documentRedirects.js) generates redirect pages for ~28 old URLs
2. Parent/hub pages exist for variant groups (Studio, Lavoro Autonomo, Cure Mediche art.19)
3. Content diff between static files and Notion identifies any unique info not yet in Notion
4. Unique info migrated to Notion pages
5. slugMap.js fixes (prosieguo-amministravo typo, stale targets)
6. Build produces all expected pages with zero broken internal links
7. Old static files in src/pages/ can be safely deleted after redirects are in place

**Technical Notes:**
- ~28 old URLs need redirects (short slugs, typos, renamed permits)
- 3 variant groups need parent pages: Studio (2 children), Lavoro Autonomo (2 children), Gravidanza/Cure art 19 (split into donna + padre)
- Document redirects already work via slugMap.js + documentRedirects.js; permit redirects need equivalent system
- Content preservation: compare static file Q&A against Notion page content, flag unique info for migration
- Lavoro/studio hierarchy must be clear and navigable

---

## Phase 45: Content Validation

**Goal:** Validate all permit and document page content against Notion database columns, enforce Phase 43 content rules, fix violations, add missing info, and flag conflicts for user review.

**Plans:** 3 plans

Plans:
- [ ] 45-01-PLAN.md — Build validation script, cross-reference DB columns vs. page content, generate findings
- [ ] 45-02-PLAN.md — Fix rule violations in Notion, add missing sections, generate VALIDATION-REPORT.md
- [ ] 45-03-PLAN.md — Rebuild site + user spot-check and approval

**Requirements:**
- VALID-01: All document pages reviewed for accuracy
- VALID-02: All permit pages reviewed for accuracy

**Dependencies:** Phases 43, 44, 44.1 (all content populated + URLs resolved first)

**Technical Notes:**
- Two-layer validation: DB columns as source of truth + Phase 43 content rules
- Script-based pre-screening (validate-permits.js) to find issues automatically
- Notion API edits for rule violations and missing sections
- Conflicts logged for user review (never auto-resolved)
- Final rebuild + user spot-check before phase approval

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
*Updated: 2026-02-16 — Phase 44.1 planned*
