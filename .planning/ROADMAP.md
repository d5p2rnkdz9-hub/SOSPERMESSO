# Roadmap: SOS Permesso

**Current Milestone:** v2.0 Multilingual + Tests
**Started:** 2026-01-31

---

## v2.0 Multilingual + Tests

> **Goal:** English-speaking users can access the full site with quality translations, and all users get a proprietary test system replacing Typeform.

### Active Phase

**Phase 20: Batch Translation Pipeline** — Translate all 208 pages IT → EN with glossary enforcement

**Plans:** 3 plans in 3 waves

Plans:
- [ ] 20-01-PLAN.md — Translation infrastructure (script skeleton, manifest, glossary integration)
- [ ] 20-02-PLAN.md — HTML segmentation and link transformation
- [ ] 20-03-PLAN.md — Anthropic Batch API integration and full translation

### Upcoming Phases

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 20 | Batch Translation Pipeline | Translate 208 pages IT → EN with AI + glossary | ◆ Active |
| 21 | Human Review & Corrections | Volunteers review all translated pages | ○ Queued |
| 22 | Language Switching Integration | IT ↔ EN switching, hreflang, EN sitemap | ○ Queued |
| 23 | Test Foundation | quiz.js engine + test-avere in Italian | ○ Queued |
| 24 | Test UX Polish | Progress indicator, iOS fixes, calming design | ○ Queued |
| 25 | Test Multilingual | English support for test-avere | ○ Queued |
| 26 | Remaining Quizzes | test-convertire + test-rinnovare (IT + EN) | ○ Queued |
| 27 | Test Integration | Update nav, remove Typeform links | ○ Queued |

### Deferred

| Phase | Name | Reason |
|-------|------|--------|
| 19 | Translator Review Interface | Can review manually; build if volunteer scale requires |

---

## Phase Details

### Phase 20: Batch Translation Pipeline

**Goal:** All 208 pages translated using AI with glossary enforcement

**Deliverables:**
- Node.js script to batch translate pages
- Glossary term replacement post-processing
- Structural preservation (HTML tags, links, attributes)
- Automatic path updates (IT links → EN links)
- Translation manifest tracking completed pages

**Success Criteria:**
1. Running `npm run translate:en` generates all EN pages
2. All pages pass verification script with no errors
3. Internal links point to `/en/` versions
4. `lang="en"` attribute set on all pages

**POC Assets (reuse):**
- 4 sample pages in `en/src/pages/`
- `scripts/verify-translation.js`
- `scripts/translation-glossary.json` (35+ terms)

---

### Phase 21: Human Review & Corrections

**Goal:** All translations reviewed and corrected by volunteer translators

**Deliverables:**
- Prioritized review queue (high-traffic pages first)
- Corrections applied manually or via simple workflow
- Final verification pass
- Sign-off checklist per page category

**Success Criteria:**
1. 100% of permit pages reviewed
2. 100% of document pages reviewed
3. All glossary terms used consistently
4. Legal/technical accuracy verified

---

### Phase 22: Language Switching Integration

**Goal:** Users can switch between IT and EN versions seamlessly

**Deliverables:**
- Language switcher points to correct EN pages
- EN pages link back to IT equivalents
- hreflang tags for SEO
- EN sitemap.xml
- 404 fallback handling

**Success Criteria:**
1. Clicking EN flag on any IT page goes to EN equivalent
2. Clicking IT flag on any EN page goes to IT equivalent
3. Google can discover EN pages via sitemap
4. Missing EN pages show graceful fallback

---

### Phase 23: Test Foundation

**Goal:** Core quiz engine working with one test in Italian

**Deliverables:**
- quiz.js engine (state machine, navigation, rendering)
- JSON schema for quiz definitions
- test-avere.html page shell
- test-avere-it.json content
- Result display with links to permit pages

**Success Criteria:**
1. User can complete test-avere quiz flow
2. Branching logic works correctly
3. Results link to appropriate permit pages
4. Back button navigation works

---

### Phase 24: Test UX Polish

**Goal:** Quiz UX optimized for stressed/anxious users

**Deliverables:**
- Progress indicator (step counter)
- 16px minimum font on all inputs (iOS zoom fix)
- Calming error states
- "Start Over" button
- Contextual help tooltips

**Success Criteria:**
1. Quiz works on iOS Safari without zoom issues
2. Error messages are friendly, not harsh
3. User always knows their progress
4. Can restart quiz at any point

---

### Phase 25: Test Multilingual

**Goal:** English support for test-avere

**Deliverables:**
- test-avere-en.json
- Language-aware JSON loading in quiz.js
- Integration with existing language switcher
- Language fallback (missing → Italian)

**Success Criteria:**
1. EN users see quiz in English
2. IT users see quiz in Italian
3. Language switch works mid-quiz
4. Results link to correct language pages

---

### Phase 26: Remaining Quizzes

**Goal:** Complete all 3 tests in both languages

**Deliverables:**
- test-convertire-it.json + test-convertire-en.json
- test-rinnovare-it.json + test-rinnovare-en.json
- test-convertire.html + test-rinnovare.html
- Result mappings to permit pages

**Success Criteria:**
1. All 3 quizzes work in Italian
2. All 3 quizzes work in English
3. Results link to correct permit pages
4. Consistent UX across all quizzes

---

### Phase 27: Test Integration

**Goal:** Quizzes integrated into main site, Typeform removed

**Deliverables:**
- Updated index.html test section with internal links
- Updated nav dropdown across all pages
- Updated sitemap.xml with test pages
- Removed Typeform references
- Updated content-it.json and content-en.json

**Success Criteria:**
1. Homepage links to internal tests
2. Nav dropdown shows internal test links
3. Typeform links completely removed
4. Sitemap includes test pages

---

## Previous Milestones

### v1.9 SEO Foundations (Shipped 2026-01-31)
> See `.planning/milestones/v1.9-ROADMAP.md`

### v1.7 Database Content Reviewed (Shipped 2026-01-30)
> See `.planning/milestones/v1.7-ROADMAP.md`

### v1.6 Document Deduplication (Shipped 2026-01-28)
> See `.planning/milestones/v1.6-ROADMAP.md`

### v1.5 Footer + Collabora (Shipped 2026-01-28)
> See `.planning/milestones/v1.5-ROADMAP.md`

### v1.4 Error + Dropdowns (Shipped 2026-01-27)
> See `.planning/milestones/v1.4-ROADMAP.md`

### v1.2 Visual Refresh (Shipped 2026-01-26)
> See `.planning/milestones/v1.2-ROADMAP.md`

### v1.1 Documenti Questura (Shipped 2026-01-25)
> See `.planning/milestones/v1.1-ROADMAP.md`

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-3 | v1.1 | 4/4 | Complete | 2026-01-25 |
| 4-9 | v1.2 | 7/7 | Complete | 2026-01-26 |
| 10-11 | v1.4 | 4/4 | Complete | 2026-01-27 |
| 12-14 | v1.5 | 4/4 | Complete | 2026-01-28 |
| 15 | v1.6 | 2/2 | Complete | 2026-01-28 |
| 16-17 | v1.7 | 5/5 | Complete | 2026-01-30 |
| 18 | v1.9 | 1/1 | Complete | 2026-01-31 |
| 20 | v2.0 | 0/3 | Active | — |

---

*Last updated: 2026-02-01 — Phase 20 planned (3 plans)*
