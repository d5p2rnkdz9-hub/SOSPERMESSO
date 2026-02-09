# Roadmap: SOS Permesso v3.1

**Milestone:** v3.1 Notion-11ty Integration
**Created:** 2026-02-07
**Phases:** 39-41 (continues from v3.0 which ended at phase 38)

## Overview

Convert existing Notion build scripts to 11ty data files. After this milestone, Notion content updates flow automatically through the build pipeline.

| Phase | Name | Goal | Requirements |
|-------|------|------|--------------|
| 39 | Document Pages | Document pages generated via 11ty data + templates | DOC-01, DOC-02, DOC-03, DOC-04 |
| 40 | Permit Pages | Permit pages generated via 11ty data + templates | PERM-01, PERM-02, PERM-03, PERM-04 |
| 41 | Build Pipeline | Unified build command, deployment config, cleanup | BUILD-01, BUILD-02, BUILD-03, BUILD-04 |

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

## Phase 40: Permit Pages

**Goal:** Permit pages (Q&A sections) generated via 11ty instead of standalone script.

**Plans:** 2 plans

Plans:
- [ ] 40-01-PLAN.md — Data layer: permits.js data file + getSectionBorderColor filter
- [ ] 40-02-PLAN.md — Template: permits.liquid + old file conflict handling + visual verification

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

## Phase 41: Build Pipeline

**Goal:** Single build command, Netlify deployment with Notion token, cleanup of old scripts.

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
- May need to remove separate `npm run build:documents` script
- Consider build caching if API calls are slow
- Verify .env.example documents required variables

---

## Risk Mitigation

**API rate limiting:** Notion API has rate limits. If build is slow, consider:
- Caching responses during build
- Parallel fetching where possible

**Content hash changes:** Current `build-permits.js` uses content hashing for incremental builds. 11ty rebuild behavior may differ — verify acceptable.

**Template parity:** JS template functions → Liquid templates. Careful testing needed to ensure visual parity.

---
*Roadmap created: 2026-02-07*
