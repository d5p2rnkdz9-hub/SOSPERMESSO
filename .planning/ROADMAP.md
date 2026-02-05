# Roadmap: SOS Permesso

**Current Milestone:** v3.0 11ty Migration
**Started:** 2026-02-04

---

## v3.0 11ty Migration

> **Goal:** Migrate from pure HTML to 11ty SSG for maintainable architecture without changing content or URLs. Extract shared components into reusable templates.

### Phases

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 35 | Setup | Install 11ty, configure passthrough, validate URLs | **Complete** |
| 36 | Components | Extract header, footer, nav, language switcher | **Complete** |
| 37 | Pages | Convert all IT/EN pages to use layouts | **Not started** |
| 38 | Deployment | Configure Netlify, deploy to production | **Not started** |

---

## Phase Details (v3.0)

### Phase 35: Setup

**Goal:** 11ty v3.x installed and configured with Liquid templates, all URLs preserved.

**Dependencies:** Phase 34 (RTL Infrastructure)

**Requirements:**
- SETUP-01: 11ty v3.x installed and configured with Liquid templates
- SETUP-02: Passthrough copy configured for CSS, JS, and image assets
- SETUP-03: All ~412 existing URLs preserved (no broken links)
- SETUP-04: Build completes without errors

**Success Criteria:**
1. Developer can run `npm run build` and 11ty generates site to `_site/` directory
2. All static assets (CSS, JS, images) copy to output without modification
3. Build completes without errors or warnings
4. All ~412 existing URLs accessible at same paths (no 404s)

**Plans:** 1 plan

Plans:
- [x] 35-01-PLAN.md — Install 11ty, configure passthrough copy, create directory data files for URL preservation

---

### Phase 36: Components

**Goal:** Shared HTML components extracted as reusable includes.

**Dependencies:** Phase 35

**Requirements:**
- COMP-01: Base layout template contains HTML structure (doctype, head, body)
- COMP-02: Header extracted as reusable include
- COMP-03: Footer extracted as reusable include
- COMP-04: Navigation (desktop + mobile) extracted as reusable include
- COMP-05: Language switcher extracted as reusable include

**Success Criteria:**
1. Base layout template renders complete HTML document structure (doctype through closing body tag)
2. Header displays correctly with logo, navigation, and language switcher on all pages
3. Footer displays correctly with same content and styling on all pages
4. Navigation works identically to current implementation (desktop dropdowns, mobile hamburger)
5. Language switcher shows IT/EN toggle with same behavior as current implementation

**Plans:** 2 plans

Plans:
- [x] 36-01-PLAN.md — Create data files (site, nav, footer) and base layout template
- [x] 36-02-PLAN.md — Extract component includes (header, nav, footer, language-switcher)

---

### Phase 37: Pages

**Goal:** All ~410 pages converted to use shared layouts with multilingual output.

**Dependencies:** Phase 36

**Requirements:**
- PAGE-01: All IT pages (~207) converted to use shared layouts
- PAGE-02: All EN pages (~205) converted to use shared layouts
- PAGE-03: Front matter contains page metadata (title, lang, layout)
- PAGE-04: Page content preserved exactly (no content changes)
- I18N-01: IT pages output to root directory (/)
- I18N-02: EN pages output to /en/ directory
- I18N-03: HTML lang attribute correct for each language

**Success Criteria:**
1. All IT pages (~207) render with shared header/footer, content unchanged
2. All EN pages (~205) render with shared header/footer, content unchanged
3. Each page has correct metadata in front matter (title, lang, layout)
4. IT pages output to root directory (e.g., `/permesso-studio.html`)
5. EN pages output to `/en/` directory (e.g., `/en/permesso-studio.html`)
6. HTML lang attribute matches page language (lang="it" for IT, lang="en" for EN)
7. Visual regression check shows no styling differences from current site

**Plans:** 4 plans

Plans:
- [ ] 37-01-PLAN.md — Create migration script, migrate root pages, verify foundation
- [ ] 37-02-PLAN.md — Migrate all IT pages (204 pages in src/pages/)
- [ ] 37-03-PLAN.md — Migrate all EN pages (204 pages in en/src/pages/)
- [ ] 37-04-PLAN.md — Final verification checkpoint for all requirements

---

### Phase 38: Deployment

**Goal:** Site deployed to production on Netlify with fast builds.

**Dependencies:** Phase 37

**Requirements:**
- DEPLOY-01: netlify.toml configured for 11ty build
- DEPLOY-02: Production deploy successful on Netlify
- DEPLOY-03: Build completes in under 60 seconds

**Success Criteria:**
1. Netlify build command configured in netlify.toml
2. Production deploy completes successfully with no errors
3. Build completes in under 60 seconds
4. All ~412 pages accessible on production domain
5. Notion build scripts continue to work (no integration broken)

**Plans:** TBD

Plans:
- [ ] 38-01: [To be planned]

---

## Coverage Validation (v3.0)

| Requirement | Phase | Description |
|-------------|-------|-------------|
| SETUP-01 | 35 | 11ty v3.x with Liquid templates |
| SETUP-02 | 35 | Passthrough copy for assets |
| SETUP-03 | 35 | All ~412 URLs preserved |
| SETUP-04 | 35 | Build completes without errors |
| COMP-01 | 36 | Base layout template |
| COMP-02 | 36 | Header as include |
| COMP-03 | 36 | Footer as include |
| COMP-04 | 36 | Navigation as include |
| COMP-05 | 36 | Language switcher as include |
| PAGE-01 | 37 | IT pages converted (~207) |
| PAGE-02 | 37 | EN pages converted (~205) |
| PAGE-03 | 37 | Front matter metadata |
| PAGE-04 | 37 | Content preserved exactly |
| I18N-01 | 37 | IT output to root |
| I18N-02 | 37 | EN output to /en/ |
| I18N-03 | 37 | Correct lang attributes |
| DEPLOY-01 | 38 | netlify.toml configured |
| DEPLOY-02 | 38 | Production deploy successful |
| DEPLOY-03 | 38 | Build under 60 seconds |

**Mapped:** 19/19 requirements
**Orphaned:** 0

---

## v2.2 Language Infrastructure (Gap Closure)

> **Goal:** Scalable translation workflow with Notion-based change detection + CSS foundations for RTL (Arabic) and CJK (Chinese) languages.

### Phases

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 32 | Translation Workflow | Notion change detection, page hashing, translation memory, sitemaps | **Complete** |
| 33 | RTL Infrastructure | CSS logical properties, direction support, Arabic fonts | **Complete** |
| 34 | CJK Infrastructure | Chinese fonts, typography rules, word-break | **Complete** |
| 34.1 | CSS Integration Fix | Link rtl.css/cjk.css to HTML, activate RTL/CJK infrastructure | **Complete** |

---

## Phase Details (v2.2)

### Phase 32: Translation Workflow

**Goal:** Build system detects Notion changes and only rebuilds/re-translates affected pages.

**Dependencies:** None (first phase of v2.2)

**Requirements:**
- TRANS-01: Notion-based change detection using hybrid approach (timestamp + hash)
- TRANS-02: Page-level content hashing before HTML generation
- TRANS-03: Translation memory stored as JSON files
- TRANS-04: Build script skips unchanged pages
- SEO-01: EN sitemap generated
- SEO-02: Sitemap index architecture with hreflang tags

**Success Criteria:**
1. Edit a page in Notion, run build → only that page rebuilds (verify via console output)
2. Run build again without Notion changes → zero pages rebuild (hashes match)
3. `sitemap-index.xml` exists and links to `sitemap-it.xml`, `sitemap-en.xml`
4. Each language sitemap includes hreflang alternates for all supported languages

**Verification commands:**
```bash
# Test 1: Change detection
node scripts/build-permits.js --verbose  # Should show which pages rebuilt

# Test 2: No changes = no rebuilds
node scripts/build-permits.js --verbose  # Should show "0 pages changed"

# Test 3: Sitemap structure
cat sitemap-index.xml  # Verify links to language sitemaps
grep -c "hreflang" sitemap-en.xml  # Should show hreflang entries
```

---

### Phase 33: RTL Infrastructure

**Goal:** CSS supports right-to-left languages (Arabic, Hebrew) with correct layout mirroring.

**Dependencies:** Phase 32 (translation workflow must exist)

**Requirements:**
- RTL-01: CSS uses logical properties (inline-start/end instead of left/right)
- RTL-02: `[lang="ar"]` selector applies `direction: rtl`
- RTL-03: Navigation, icons, arrows mirror correctly in RTL mode
- RTL-04: Arabic font stack defined

**Plans:** 1 plan

Plans:
- [x] 33-01-PLAN.md — Convert CSS to logical properties, create rtl.css with Arabic support

**Success Criteria:**
1. Add `lang="ar"` to any page → text aligns right, layout mirrors
2. Navigation flows right-to-left
3. Margins/paddings use logical properties (no hardcoded left/right)
4. Arabic text renders with appropriate font

**Verification method:**
```bash
# Create test page
cp src/pages/chi-siamo.html src/pages/test-rtl.html
# Edit to add lang="ar" to <html> tag
# Open in browser, verify layout mirrors
```

---

### Phase 34: CJK Infrastructure

**Goal:** CSS supports Chinese/Japanese/Korean with correct typography and fonts.

**Dependencies:** Phase 32 (translation workflow must exist)

**Requirements:**
- CJK-01: Chinese font stack defined (`PingFang SC`, `Microsoft YaHei`, `Noto Sans SC`)
- CJK-02: `[lang="zh"]` disables italics (use `font-style: normal`)
- CJK-03: Line-height adjusted for CJK characters
- CJK-04: Word-break rules for Chinese (no spaces between words)

**Plans:** 1 plan

Plans:
- [x] 34-01-PLAN.md — Create cjk.css with font stacks, line-height, italic overrides, word-break rules

**Success Criteria:**
1. Add `lang="zh"` to any page → Chinese fonts load
2. No italic text appears (CJK doesn't use italics)
3. Long Chinese text wraps correctly without breaking mid-character
4. Line spacing looks appropriate for dense character sets

**Verification method:**
```bash
# Create test page with Chinese content
cp src/pages/chi-siamo.html src/pages/test-cjk.html
# Edit to add lang="zh" and sample Chinese text
# Open in browser, verify fonts and typography
```

---

### Phase 34.1: CSS Integration Fix

**Goal:** Link RTL and CJK CSS files to all HTML pages so the infrastructure actually works.

**Dependencies:** Phase 34 (CJK Infrastructure)

**Gap Closure:** Closes gaps from v2.2 milestone audit

**Requirements:**
- Integration: rtl.css linked in all HTML pages
- Integration: cjk.css linked in all HTML pages
- Flow: RTL Layout Application works end-to-end
- Flow: CJK Typography Application works end-to-end

**Note:** Research confirmed that components.css lines 529, 530, 555 already use logical properties (text-align: start, padding-inline-end, margin-inline-start). No CSS conversions needed.

**Success Criteria:**
1. All HTML pages include `<link rel="stylesheet" href="...rtl.css">`
2. All HTML pages include `<link rel="stylesheet" href="...cjk.css">`
3. Adding `lang="ar" dir="rtl"` to any page causes RTL layout to apply
4. Adding `lang="zh"` to any page causes CJK typography to apply

**Plans:** 1 plan

Plans:
- [x] 34.1-01-PLAN.md — Create add-css-links.js script, link CSS to all 410 HTML pages

---

## v2.1 Homepage CSS Redesign (Shipped)

> **Goal:** Transform the homepage into a modern "startup SaaS" aesthetic with split hero layout, display typography, and cleaner white/black/yellow palette. Scope limited to homepage; header/footer changes propagate via shared CSS.

### Active Phase

**v2.1 Complete** — Homepage CSS redesign shipped

### Phases

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 28 | Foundation | Visual regression baseline, font loading, CSS variables | **Complete** |
| 29 | Hero Section | Split hero layout, wave divider, display heading, dark CTA | **Complete** |
| 30 | Header/Footer | Minimal header redesign, updated footer styling | Deferred to v3.0 |
| 31 | Polish | Hover effects, scroll fade-ins, mobile testing | Deferred to v3.0 |

---

## Previous Milestones

### v2.0 Multilingual + Tests (Paused)
> **Status:** Phase 20 complete (all 209 pages translated). Remaining phases (21-27) moved to v3.0.

| Phase | Name | Status |
|-------|------|--------|
| 20 | Batch Translation Pipeline | Complete |
| 21-27 | Human Review, Tests, Integration | Deferred to v3.0 |

### v1.10 UI Polish (Shipped 2026-02-01)
> Sticky breadcrumb, document notes from Notion, test card titles

### v1.9 SEO Foundations (Shipped 2026-01-31)
> robots.txt, sitemap.xml, automated generation

### v1.7 Database Content (Shipped 2026-01-30)
> 67 permit pages from Notion, Q&A template, variant structure

### v1.6 Document Deduplication (Shipped 2026-01-28)
> CTA buttons linking permits to documents

### v1.5 Footer + Collabora (Shipped 2026-01-28)
> Yellow footer, Collabora dropdown

### v1.4 Error + Dropdowns (Shipped 2026-01-27)
> Error reporting button, dropdown navigation

### v1.2 Visual Refresh (Shipped 2026-01-26)
> Warm color palette, PNG lighthouse logo, white header

### v1.1 Documenti Questura (Shipped 2026-01-25)
> 63 document pages, interactive checklists, Notion integration

---

## Progress

| Phase | Milestone | Status | Completed |
|-------|-----------|--------|-----------|
| 1-3 | v1.1 | Complete | 2026-01-25 |
| 4-9 | v1.2 | Complete | 2026-01-26 |
| 10-11 | v1.4 | Complete | 2026-01-27 |
| 12-14 | v1.5 | Complete | 2026-01-28 |
| 15 | v1.6 | Complete | 2026-01-28 |
| 16-17 | v1.7 | Complete | 2026-01-30 |
| 18 | v1.9 | Complete | 2026-01-31 |
| 20 | v2.0 | Complete | 2026-02-02 |
| 28-29 | v2.1 | Complete | 2026-02-03 |
| 32 | v2.2 | Complete | 2026-02-04 |
| 33 | v2.2 | Complete | 2026-02-04 |
| 34 | v2.2 | Complete | 2026-02-04 |
| 34.1 | v2.2 | Complete | 2026-02-04 |
| 35 | v3.0 | Complete | 2026-02-04 |
| 36 | v3.0 | Complete | 2026-02-05 |
| 37 | v3.0 | Not started | — |
| 38 | v3.0 | Not started | — |

---

*Last updated: 2026-02-05 — Phase 37 planned (4 plans)*
