---
phase: 60-it-template-restructure
verified: 2026-03-02T10:04:38Z
status: passed
score: 7/7 must-haves verified (automated checks pass)
gaps: []
human_verification:
  - test: "Sticky tab bar stacks below breadcrumb when scrolling"
    expected: "On scroll, breadcrumb sticks first (top 130px), then tab bar sticks below it (top 200px desktop / 130px mobile). Both always visible simultaneously."
    why_human: "Position-sticky stacking and z-index layering can only be confirmed by scrolling a real rendered page."
  - test: "Tab badge click scrolls correctly without hiding section heading"
    expected: "Clicking Cos'è / Primo rilascio / Rinnovo / Prassi locali scrolls so the section h2 is visible below the sticky bars — not hidden behind them. scrollToSection() measures heights at runtime."
    why_human: "The JS runtime offset calculation (header + breadcrumb + tab bar heights) cannot be validated from static source code — it depends on rendered layout."
  - test: "Prassi accordion expands and collapses"
    expected: "For a permit with prassi entries, clicking a city header expands that city's cards with smooth max-height CSS transition. Clicking again collapses. Chevron rotates on expand."
    why_human: "Accordion toggle requires real browser interaction. The aria-expanded + class toggle is inline JS that needs rendering to verify."
  - test: "Prassi accordion empty state"
    expected: "For a permit with no prassi entries, the accordion shows a single card with '📭 Nessuna segnalazione finora' and 'Sii il primo a condividere' CTA button."
    why_human: "Requires a permit with empty prassiLocali data — cannot determine from template alone which permit will hit the empty branch."
---

# Phase 60: IT Template Restructure — Verification Report

**Phase Goal:** The Italian permit template delivers a reorganized page experience — sticky tab badges, a compact prassi accordion, repositioned alert and CTA.
**Verified:** 2026-03-02T10:04:38Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Tab badges stick to the top of the viewport when user scrolls past the page header | ? HUMAN NEEDED | `.permit-tab-bar { position: sticky; top: 200px; z-index: 99 }` in components.css (lines 204–213). Stacking behavior requires browser. |
| 2 | Prassi locali appears as 4th tab badge alongside Cos'è / Primo / Rinnovo | VERIFIED | `permits.liquid` line 48: `<a href="#prassi-locali" class="tab-badge tab-badge-prassi" onclick="return scrollToSection('prassi-locali')">Prassi locali</a>`. Always rendered (not conditional). |
| 3 | Clicking any tab badge scrolls to the corresponding section without page reload | ? HUMAN NEEDED | `scrollToSection(id)` function at lines 53–66 intercepts click via `onclick="return false"`, uses `window.scrollTo({behavior:'smooth'})`. Requires browser to verify smooth scroll and offset calculation. |
| 4 | Sticky tab bar does not overlap or conflict with the existing sticky breadcrumb bar | ? HUMAN NEEDED | breadcrumb: `z-index: 100; top: 130px`. Tab bar: `z-index: 99; top: 200px`. CSS structure is correct for stacking. Visual confirmation required. |
| 5 | Tab badges remain readable and functional on mobile screens | ? HUMAN NEEDED | Mobile CSS: `@media (max-width: 768px) { .permit-tab-bar { top: 130px } .tab-badge { font-size: 0.85rem; padding: 0.4rem 1rem } }`. Requires mobile render check. |
| 6 | Prassi section renders as compact collapsible accordion, collapsed by default | VERIFIED | `prassi-accordion-body { max-height: 0; overflow: hidden }` in prassi.css line 348. HTML structure in permits.liquid lines 386–430: `<button class="prassi-accordion-header" aria-expanded="false">`. |
| 7 | When permit has no prassi entries, accordion shows "Nessuna segnalazione finora" | VERIFIED | permits.liquid line 422: `<p>Nessuna segnalazione finora</p>` inside `.prassi-accordion-empty` div, inside the `{% else %}` branch. |
| 8 | When permit has prassi entries, accordion shows questura city names as clickable headers | VERIFIED | permits.liquid lines 387–410: `{% for cityGroup in pagePrassi %}` with `<button class="prassi-accordion-header">` containing `prassi-accordion-city` span. |
| 9 | Clicking the Prassi locali tab badge scrolls to the accordion section | VERIFIED | `onclick="return scrollToSection('prassi-locali')"` on tab badge (line 48). Section `id="prassi-locali"` exists at line 379. `scrollToSection` finds element by `getElementById(id)`. |
| 10 | CTA "Hai altre domande? Scrivici" appears after prassi section, before Related links | VERIFIED | DOM order confirmed: prassi section ends at line 430, CTA at lines 484–497, `{% endif %}` at line 499, RELATED at lines 501–520. CTA is inside `{% else %}` branch (non-placeholder only). |
| 11 | CTA does not appear inside the Q&A Cos'è section | VERIFIED | `#cose` section spans lines 94–105. No CTA text in that range. Single occurrence of "Hai altre domande" is at line 490. |
| 12 | "Ricorda: entro 60 giorni" alert appears immediately before Rinnovo document checklist | VERIFIED | DOM order in Rinnovo section: submission callout → (disputed warning conditional) → RICORDA ALERT (line 257) → CHECKLIST comment (line 264) → `<div class="card">` (line 265). |
| 13 | "Ricorda" alert does not appear after the checklist | VERIFIED | Only one instance of "Ricorda" in permits.liquid (line 260). No second instance after the checklist. |

**Score:** 9/9 structural truths VERIFIED; 4/4 behavioral truths require human confirmation.

### Required Artifacts

| Artifact | Expected | Level 1: Exists | Level 2: Substantive | Level 3: Wired | Status |
|----------|----------|-----------------|----------------------|----------------|--------|
| `src/pages/permits.liquid` | Tab bar, accordion, CTA, Ricorda HTML | EXISTS | 521 lines, full implementation | Used by 11ty pagination — generates all permit pages | VERIFIED |
| `src/styles/components.css` | Sticky tab bar CSS with z-index, colors, mobile breakpoints | EXISTS | 1304 lines, full implementation | Linked from `_includes/layouts/base.liquid` line 58 | VERIFIED |
| `src/styles/prassi.css` | Accordion CSS: collapsed-by-default, expand animation, empty state, mobile breakpoints | EXISTS | 531 lines, full implementation | Linked from `_includes/layouts/base.liquid` line 65 | VERIFIED |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `permits.liquid (.permit-tab-bar)` | `components.css (.permit-tab-bar)` | CSS class | WIRED | Class `permit-tab-bar` defined in components.css lines 204–271; referenced in permits.liquid lines 38, 58 |
| `.tab-badge[href='#prassi-locali']` | `section#prassi-locali` | anchor link + scrollToSection JS | WIRED | Badge at line 48 with `onclick="return scrollToSection('prassi-locali')"`. Target `id="prassi-locali"` at line 379. |
| `permits.liquid (accordion HTML)` | `prassi.css (accordion CSS)` | CSS class | WIRED | Classes `prassi-accordion`, `prassi-accordion-header`, `prassi-accordion-body`, `prassi-accordion-open` defined in prassi.css lines 276–383; used in permits.liquid lines 386–430 |
| `CTA block` | `Related links section` | DOM order | WIRED | CTA at lines 484–497, `{% endif %}` at 499, RELATED at 501+. Correct sequence confirmed. |
| `Ricorda alert` | `Rinnovo checklist` | DOM order (alert precedes checklist) | WIRED | RICORDA ALERT comment at line 256 (`margin-bottom: 1rem`); CHECKLIST comment at line 264 — correct before-order confirmed. |
| `scrollToSection()` | All 4 section IDs (`#cose`, `#primo`, `#rinnovo`, `#prassi-locali`) | JS runtime DOM query | WIRED | Function at lines 53–66 uses `document.getElementById(id)` and measures sticky bar heights at runtime. All 4 badges wire to this function via `onclick`. |

### Requirements Coverage

| Requirement ID | Description | Status | Evidence |
|----------------|-------------|--------|----------|
| LAYOUT-01 | Tab badges become sticky at top of viewport on scroll | SATISFIED (struct) | `.permit-tab-bar { position: sticky; top: 200px; z-index: 99 }`. Human confirmation needed for visual. |
| LAYOUT-02 | CTA moves from after Q&A to bottom of page (before Related links) | SATISFIED | CTA at line 484, RELATED at line 501. CTA not in `#cose` section (lines 94–105). |
| LAYOUT-03 | "Ricorda" alert moves to before Rinnovo checklist | SATISFIED | RICORDA ALERT at line 257, CHECKLIST at line 264. Correct order confirmed. |
| LAYOUT-04 | Prassi locali added as 4th tab badge | SATISFIED | `tab-badge-prassi` at line 48 (unconditional, always rendered). Orange color `#FFB74D` in components.css line 246. |
| PRASSI-01 | Full prassi section replaced with compact collapsible accordion | SATISFIED | 9 occurrences of `prassi-accordion*` in permits.liquid (lines 386–430). Replaces prior flat city-group layout. |
| PRASSI-02 | Accordion shows empty state or city names | SATISFIED | Empty: line 422 "Nessuna segnalazione finora". Populated: `{% for cityGroup in pagePrassi %}` with `prassi-accordion-header` at line 389. |
| PRASSI-03 | Clicking Prassi locali tab badge scrolls to accordion section | SATISFIED (struct) | `onclick="return scrollToSection('prassi-locali')"` → `section#prassi-locali`. Human needed for actual scroll behavior. |

**All 7 required requirement IDs from the phase plans are accounted for.**
- LAYOUT-01, LAYOUT-04 (60-01-PLAN.md)
- PRASSI-01, PRASSI-02, PRASSI-03 (60-02-PLAN.md)
- LAYOUT-02, LAYOUT-03 (60-03-PLAN.md)

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| None found | — | — | No TODO/FIXME/placeholder/stub patterns in any of the 3 modified files |

No anti-patterns were found in `permits.liquid`, `components.css`, or `prassi.css`.

**Notable implementation deviation from plan (documented, not a gap):** The 60-03 summary records that `scroll-margin-top` CSS was replaced with a JS `scrollToSection()` runtime measurement function. This is an improvement over the plan. The static CSS approach would have been fragile with two stacked sticky bars. The JS approach measures actual rendered heights at call time, which is more robust. The section IDs no longer carry `scroll-margin-top` in CSS (commented out in components.css line 250: "Scroll offset handled by JS scrollToSection() — measures actual sticky heights at runtime").

**Notable deviation on prassi badge color:** Plan specified teal (`#26A69A`), final implementation uses orange (`#FFB74D` in components.css, `#FF9800` referenced in 60-03 summary). The 60-03 summary documents this as an intentional visual review fix to distinguish Prassi (community content) from the structural navigation tabs. Not a gap.

### Human Verification Required

#### 1. Sticky tab bar stacking

**Test:** Open any permit page (e.g., `/permesso-lavoro-subordinato.html`). Scroll down past the page header.
**Expected:** Breadcrumb bar sticks first (below the site header). As you continue scrolling, the tab bar (Cos'è / Primo rilascio / Rinnovo / Prassi locali) sticks below the breadcrumb — both visible simultaneously. Tab bar does NOT overlap breadcrumb.
**Why human:** `position: sticky` stacking with two elements requires a live browser to confirm layering and `top` offset values work together.

#### 2. Tab badge scroll accuracy

**Test:** On a permit page that has both primo and rinnovo documents, click each tab badge in order.
**Expected:** Each click scrolls so the target section's `h2` heading is visible just below the sticky bars — not hidden behind them. No full page reload. URL hash updates. Scroll is smooth.
**Why human:** The `scrollToSection()` JS function calculates offsets from `getBoundingClientRect()` at runtime. Cannot verify the calculated values from static source.

#### 3. Prassi accordion expand/collapse (populated)

**Test:** Find a permit with prassi entries. Scroll to the Prassi locali section. The accordion should show city names in a collapsed state.
**Expected:** Clicking a city name expands that city's practice cards with a smooth animation. Chevron rotates 90deg. Clicking again collapses. Other cities remain collapsed.
**Why human:** The inline `onclick` toggle (`setAttribute aria-expanded` + `classList.toggle('prassi-accordion-open')`) and CSS `max-height` transition require browser rendering.

#### 4. Prassi accordion empty state (no entries)

**Test:** Find a permit with no prassi entries. Scroll to the Prassi locali section.
**Expected:** Shows a single white card with "📭 Nessuna segnalazione finora" text and "Sii il primo a condividere" button.
**Why human:** Requires a permit that hits the `{% else %}` branch of `{% if pagePrassi %}`. Cannot determine which permits have empty prassi from static template alone.

### Gaps Summary

No structural gaps found. All 7 requirement IDs are satisfied by verified code paths. The 4 items in Human Verification are behavior-level checks that cannot be confirmed from static analysis — the code structure correctly implements the intended behavior, but final confirmation requires a running browser.

---

_Verified: 2026-03-02T10:04:38Z_
_Verifier: Claude (gsd-verifier)_
