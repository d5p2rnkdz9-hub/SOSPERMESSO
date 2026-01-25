---
phase: 03-complete-coverage
verified: 2026-01-25T20:28:27Z
status: gaps_found
score: 2/3 must-haves verified
gaps:
  - truth: "User clicks any [Rinnovo] badge on documenti-questura and lands on a working document page"
    status: failed
    reason: "2 rinnovo badges lead to 404s (missing canonical pages from Notion data)"
    artifacts:
      - path: "src/pages/documenti-ue-lungo-periodo-rinnovo.html"
        issue: "Missing - redirect page not generated because canonical file doesn't exist"
      - path: "src/pages/documenti-carta-di-soggiorno-psuelp-art-9-rinnovo.html"
        issue: "Missing - canonical rinnovo page doesn't exist in Notion data"
      - path: "src/pages/documenti-minori-stranieri-affidati-rinnovo.html"
        issue: "Missing - redirect page not generated because canonical file doesn't exist"
      - path: "src/pages/documenti-affidamento-a-familiari-entro-il-quarto-grado-rinnovo.html"
        issue: "Missing - canonical rinnovo page doesn't exist in Notion data"
    missing:
      - "Notion database entry for 'Carta di soggiorno (PsUeLP art. 9)' rinnovo documents"
      - "Notion database entry for 'Affidamento a familiari entro il quarto grado' rinnovo documents"
      - "Redirect pages for ue-lungo-periodo and minori-stranieri-affidati rinnovo (will auto-generate once canonical exists)"
---

# Phase 3: Complete Coverage Verification Report

**Phase Goal:** All 23 permit types have working primo and rinnovo document pages (no 404s when clicking badges).

**Verified:** 2026-01-25T20:28:27Z

**Status:** gaps_found

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User clicks any [Primo] badge on documenti-questura and lands on a working document page | ✓ VERIFIED | All 23 primo badges link to existing pages (either direct or redirect). Checked programmatically: 0 missing primo files. |
| 2 | User clicks any [Rinnovo] badge on documenti-questura and lands on a working document page | ✗ FAILED | 21/23 rinnovo badges work. 2 badges lead to 404s: `documenti-ue-lungo-periodo-rinnovo.html` and `documenti-minori-stranieri-affidati-rinnovo.html`. Root cause: canonical rinnovo pages missing from Notion data. |
| 3 | All 23 permits from database.html are represented with working links | ✓ VERIFIED | All 23 permits present in documenti-questura.html with clickable badges. Primo links all work (23/23). Rinnovo links partially work (21/23). |

**Score:** 2/3 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `scripts/slug-map.json` | Mapping of display slugs to canonical slugs | ✓ VERIFIED | EXISTS (28 lines), valid JSON, 19 mappings, includes notes for edge cases (typo, one-to-many). Validated programmatically: 0 orphan mappings. |
| `scripts/build-documents.js` | Redirect page generation function | ✓ VERIFIED | EXISTS (substantive), contains `generateRedirectPage()` and `generateAliasPages()` functions. Functions are exported and called in main(). |
| `src/pages/documenti-studio-primo.html` | Redirect page example | ✓ VERIFIED | EXISTS (13 lines), contains meta http-equiv refresh to `documenti-studio-art-39-primo.html`, canonical link present, JavaScript fallback present. |
| `src/pages/documenti-ue-lungo-periodo-rinnovo.html` | Redirect for UE lungo periodo rinnovo | ✗ MISSING | File does not exist. Redirect not generated because canonical target `documenti-carta-di-soggiorno-psuelp-art-9-rinnovo.html` doesn't exist. |
| `src/pages/documenti-minori-stranieri-affidati-rinnovo.html` | Redirect for minori stranieri affidati rinnovo | ✗ MISSING | File does not exist. Redirect not generated because canonical target `documenti-affidamento-a-familiari-entro-il-quarto-grado-rinnovo.html` doesn't exist. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| Badge hrefs (documenti-questura.html) | Redirect pages (display slugs) | User click | ✓ WIRED (44/46) | 23 primo badges all link to existing pages. 21 rinnovo badges link to existing pages. 2 rinnovo badges link to non-existent pages. |
| Redirect pages | Canonical pages | Meta refresh (0s) | ✓ WIRED | Spot checked: `documenti-studio-primo.html` → `documenti-studio-art-39-primo.html`. Meta refresh tag present, canonical link present, JavaScript fallback present. |
| documenti-ue-lungo-periodo-rinnovo.html | documenti-carta-di-soggiorno-psuelp-art-9-rinnovo.html | Meta refresh | ✗ NOT_WIRED | Source redirect page doesn't exist. Target canonical page doesn't exist. |
| documenti-minori-stranieri-affidati-rinnovo.html | documenti-affidamento-a-familiari-entro-il-quarto-grado-rinnovo.html | Meta refresh | ✗ NOT_WIRED | Source redirect page doesn't exist. Target canonical page doesn't exist. |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| DOC-03: Each permit gets 2 document pages (primo + rinnovo) — 46 pages total | ✗ BLOCKED | 2 canonical rinnovo pages missing from Notion data (carta-di-soggiorno-psuelp-art-9, affidamento-a-familiari-entro-il-quarto-grado) |
| COV-01: All 23 permits from database.html represented in documenti-questura | ✓ SATISFIED | All 23 permits present in documenti-questura.html with badges |
| COV-02: Permits organized in same 4 categories as database.html | ✓ SATISFIED | Both pages have identical category structure: STUDIO/LAVORO (5), PROTEZIONE (7), CURE MEDICHE (3), MOTIVI FAMILIARI (8) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | - | - | - | No TODO/FIXME/placeholder patterns found in generated document pages |

**Anti-pattern scan:** Checked all `documenti-*.html` files for stub patterns (TODO, FIXME, placeholder, "Not implemented"). No matches found.

### Human Verification Required

#### 1. Visual Redirect Experience

**Test:** Click on [Primo] badge for "Permesso per studio" on documenti-questura.html

**Expected:** Instant redirect to documenti-studio-art-39-primo.html with no visible delay or flash

**Why human:** Meta refresh timing and visual smoothness can't be verified programmatically

#### 2. Breadcrumb Navigation

**Test:** On any document page, click breadcrumb "Documenti Questura" and verify return to documenti-questura.html

**Expected:** Return to documenti-questura.html with no broken navigation

**Why human:** Navigation flow verification requires browser interaction

#### 3. Category Organization Visual Match

**Test:** Open database.html and documenti-questura.html side-by-side, compare category sections

**Expected:** Same 4 categories with same permits in each (visual confirmation of data match)

**Why human:** Visual layout comparison easier for human than parsing HTML

#### 4. Mobile Badge Usability

**Test:** Open documenti-questura.html on mobile device, attempt to click [Primo] and [Rinnovo] badges

**Expected:** Badges are touch-friendly (44x44px minimum), don't require zooming, activate on first tap

**Why human:** Touch target usability best verified on actual mobile device

### Gaps Summary

**2 rinnovo pages missing due to gaps in Notion source data.**

The phase 3 implementation is structurally complete:
- ✓ Slug mapping configuration created (19 mappings)
- ✓ Redirect page generation function implemented
- ✓ Build script generates redirect pages for all mapped slugs
- ✓ All 23 primo badges work (100% coverage)
- ✓ 21/23 rinnovo badges work (91% coverage)

The 2 missing rinnovo pages are NOT a failure of phase 3 implementation. The build system correctly detected that canonical rinnovo pages don't exist for these permits and skipped redirect generation (as designed). The root cause is missing Notion database entries.

**Missing canonical pages:**
1. `documenti-carta-di-soggiorno-psuelp-art-9-rinnovo.html` (UE lungo periodo renewal)
2. `documenti-affidamento-a-familiari-entro-il-quarto-grado-rinnovo.html` (minori stranieri affidati renewal)

**Impact:**
- Users clicking [Rinnovo] for "Permesso UE per soggiornanti di lungo periodo" get 404
- Users clicking [Rinnovo] for "Permesso per minori stranieri affidati" get 404

**Remediation:**
Phase 3's build infrastructure will automatically fix this once the missing Notion entries are added:
1. Add rinnovo documents to Notion database for these 2 permits
2. Re-run `node scripts/build-documents.js`
3. Redirect pages will auto-generate and link to new canonical pages

---

_Verified: 2026-01-25T20:28:27Z_
_Verifier: Claude (gsd-verifier)_
