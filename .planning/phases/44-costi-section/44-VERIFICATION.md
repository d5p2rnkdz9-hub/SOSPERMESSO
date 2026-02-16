---
phase: 44-costi-section
verified: 2026-02-16T10:30:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
---

# Phase 44: Costi Section Verification Report

**Phase Goal:** Add itemized cost breakdown section to document pages (primo rilascio and rinnovo), sourced from Notion cost columns.

**Verified:** 2026-02-16T10:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Document pages with cost data show an itemized cost breakdown between notes and prassi locali | ✓ VERIFIED | 35/65 primo pages and 28/65 rinnovo pages render cost section with bollettino, marca da bollo, and conditional kit postale items. Section appears after document notes (line 181) and before prassi locali (line 200) in built HTML. |
| 2 | Document pages without cost data in Notion show no costi section at all | ✓ VERIFIED | 30/65 primo pages and 37/65 rinnovo pages correctly hide cost section when no cost data exists. No "Quanto costa" anchor link or cost section HTML present. Verified: documenti-acquisto-cittadinanza-o-stato-di-apolide-primo.html has NO cost elements. |
| 3 | Kit permits show an additional 30 EUR kit postale line item | ✓ VERIFIED | documenti-lavoro-subordinato-a-seguito-di-ingresso-per-flussi-primo.html shows 3 items: bollettino (70.46€), marca da bollo (16€), kit postale (30€). Conditional rendering based on `methodLower contains 'kit'` (template lines 192-198). |
| 4 | The bold total at the bottom sums all cost items correctly | ✓ VERIFIED | Kit page total: 116.46€ (70.46 + 16 + 30). Questura page total: 96.46€ (80.46 + 16). Rinnovo page total: 46€ (16 + 30). Liquid `plus:` filter correctly sums all applicable costs (template lines 203-208). |
| 5 | A Quanto costa anchor link appears in the page header alongside the existing Prassi locali link | ✓ VERIFIED | Anchor link present in page header (line 76: `<a href="#quanto-costa" class="costi-anchor-link">`) on all pages with cost data. Correctly hidden on pages without costs. Links to `#quanto-costa` section ID. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `_data/documents.js` | Cost fields extracted from Notion | ✓ VERIFIED | 162 lines. `extractCost()` helper (lines 32-41) parses amounts from multi_select document names using regex. Extracts `costBollettinoPrimo`, `costMarcaBolloPrimo`, `costBollettinoRinnovo`, `costMarcaBolloRinnovo` (lines 128-131). Adds to primo/rinnovo arrays (lines 138-139, 147-148). |
| `src/pages/documents-primo.liquid` | Costi section HTML with "Quanto costa" | ✓ VERIFIED | 330 lines. Anchor link (lines 85-89). Cost section (lines 173-214) with conditional rendering, itemized list, and total calculation. Correct placement after notes, before prassi. |
| `src/pages/documents-rinnovo.liquid` | Costi section HTML with "Quanto costa" | ✓ VERIFIED | 373 lines. Identical cost section structure (lines 216-257). Works correctly with rinnovo cost data (verified: only marca da bollo 16€ + kit 30€ = 46€ total). |
| `src/styles/document-page.css` | Cost list and total styling with "costi-" classes | ✓ VERIFIED | 580 lines. Costi section styles (lines 256-338): `.costi-anchor-link`, `.costi-list`, `.costi-item`, `.costi-label`, `.costi-note`, `.costi-amount`, `.costi-total`, `.costi-total-label`, `.costi-total-amount`. Mobile responsive (lines 383-386) and print support (line 550). |

**All artifacts:** EXISTS ✓, SUBSTANTIVE ✓, WIRED ✓

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `_data/documents.js` | Notion API | `extractCost(documents, keyword)` parsing multi_select values | WIRED | `extractCost(primoDocuments, 'bollettino')` and `extractCost(primoDocuments, 'marca da bollo')` parse amounts from Notion "Doc primo rilascio" multi_select field. Regex pattern `(\d+[\.,]?\d*)\s*€` extracts first number (handles "70.46 o 80.46" cases). Lines 128-131. |
| `documents-primo.liquid` | `_data/documents.js` | `doc.costBollettino` and `doc.costMarcaBollo` | WIRED | Template conditionally renders section when `doc.costBollettino or doc.costMarcaBollo` (line 173). Displays amounts in `<span class="costi-amount">€ {{ doc.costBollettino }}</span>` (lines 180-189). Sums in total calculation (lines 204-205). |
| `documents-rinnovo.liquid` | `_data/documents.js` | `doc.costBollettino` and `doc.costMarcaBollo` | WIRED | Same conditional rendering and display pattern (lines 216-257). Verified with rinnovo cost data (16€ marca da bollo only). |

**All key links:** WIRED ✓

### Requirements Coverage

| Requirement | Status | Supporting Truths |
|-------------|--------|-------------------|
| COSTI-01: Cost data sourced from Notion database properties | ✓ SATISFIED | Truth 1, 2 — `extractCost()` parses from existing "Doc primo rilascio" and "Doc rinnovo" multi_select values |
| COSTI-02: Costi section rendered on document pages (primo and rinnovo) | ✓ SATISFIED | Truth 1, 3, 4, 5 — Section renders on 35 primo + 28 rinnovo pages with itemized breakdown, total, and anchor link |

**All requirements:** SATISFIED ✓

### Anti-Patterns Found

None. No TODO comments, placeholders, or stub patterns found in modified files.

### Human Verification Required

None. All verification completed programmatically by inspecting built HTML output.

---

## Verification Summary

**Phase 44 goal achieved.** All 5 must-haves verified in built output:

1. ✓ **Itemized cost breakdown** — 35 primo and 28 rinnovo pages show bollettino, marca da bollo, and conditional kit postale
2. ✓ **Conditional rendering** — 30 primo and 37 rinnovo pages correctly hide section when no cost data
3. ✓ **Kit postale logic** — 30€ line item appears only on pages with Kit method
4. ✓ **Correct total calculation** — Liquid `plus:` filter sums all applicable costs (verified: 116.46€, 96.46€, 46€ examples)
5. ✓ **Anchor link in header** — "Quanto costa" link present on pages with costs, absent on pages without

**Data flow:** Notion multi_select → `extractCost()` regex parser → `costBollettino`/`costMarcaBollo` fields → Liquid template conditional rendering → Built HTML with itemized list and bold total.

**Section placement:** Correct order verified in built HTML — document notes (if present), then costi, then prassi locali.

**No gaps found.** Phase complete.

---

_Verified: 2026-02-16T10:30:00Z_
_Verifier: Claude (gsd-verifier)_
