---
phase: 61-language-template-propagation
verified: 2026-03-02T17:00:00Z
status: gaps_found
score: 3/6 must-haves verified
gaps:
  - truth: "A FR permit page has a sticky tab bar with 4 badges (Qu'est-ce que c'est / Premier Titre / Renouvellement / Pratiques locales) that fixes to top on scroll"
    status: verified
    reason: "FR template has permit-tab-bar div outside header, 4 badges with correct French labels, scrollToSection JS"
    artifacts:
      - path: "fr/src/pages/permits-fr.liquid"
        issue: null
    missing: []
  - truth: "A FR permit page: clicking any tab badge smooth-scrolls to the correct section, accounting for sticky header height"
    status: verified
    reason: "scrollToSection JS function present with measured header/breadcrumb/tabbar offsets"
    artifacts:
      - path: "fr/src/pages/permits-fr.liquid"
        issue: null
    missing: []
  - truth: "A FR permit page: the CTA appears at page bottom (after prassi accordion, before Related links), not inline after Q&A"
    status: verified
    reason: "Contactez-nous CTA at line 492, prassi-locali section at line 379, related at line 501 — correct order"
    artifacts:
      - path: "fr/src/pages/permits-fr.liquid"
        issue: null
    missing: []
  - truth: "An EN permit page has a sticky tab bar with 4 badges (What is it / First Issue / Renewal / Local practices) that fixes to top on scroll"
    status: failed
    reason: "EN template has tab badges INSIDE the page header (old structure), no permit-tab-bar sticky div, only 3 badges (no Local practices), no scrollToSection JS"
    artifacts:
      - path: "en/src/pages/permits-en.liquid"
        issue: "Tab badges at line 63 inside page-header section. No permit-tab-bar div. No scrollToSection function."
    missing:
      - "Extract permit-tab-badges from inside page header section"
      - "Add sticky permit-tab-bar div outside and after the page header section"
      - "Add 4th badge 'Local practices' linking to #prassi-locali"
      - "Add scrollToSection JS function measuring header/breadcrumb/tabbar heights"
  - truth: "An EN permit page: the CTA 'Do you have more questions?' appears at page bottom (after prassi accordion, before Related links)"
    status: failed
    reason: "EN CTA is at line 111 inside the id=cose Q&A section, not at page bottom"
    artifacts:
      - path: "en/src/pages/permits-en.liquid"
        issue: "<!-- CTA --> block at line 111, inside <section id='cose'>, before the primo/rinnovo sections"
    missing:
      - "Remove CTA div from inside Q&A section (after the sections loop)"
      - "Add CTA section at page bottom after prassi accordion"
  - truth: "An EN permit page: the 'Remember: within 60 days' alert appears before the rinnovo checklist"
    status: failed
    reason: "Remember alert is at line 330, AFTER the rinnovo checklist at line 282 — wrong order"
    artifacts:
      - path: "en/src/pages/permits-en.liquid"
        issue: "Remember alert at line 330 is after the doc-checklist div at line 282"
    missing:
      - "Move Remember alert to before the <!-- CHECKLIST --> comment in the rinnovo section"
      - "Adjust margin style from margin-top: 0.75rem to margin-bottom: 1rem"
  - truth: "An EN permit page: the prassi accordion section renders with city names when populated, or 'No reports yet' when empty"
    status: failed
    reason: "EN template has no prassi accordion section at all — no id=prassi-locali section, no prassi-accordion markup, no prassi.js include"
    artifacts:
      - path: "en/src/pages/permits-en.liquid"
        issue: "File has no prassi-locali section, no prassi-accordion, no prassiLocali data binding, no prassi.js"
    missing:
      - "Add full prassi accordion section after rinnovo section with English strings"
      - "Add prassi.js script include after checklist persistence script"
      - "Empty state text: 'No reports yet' (or equivalent)"
      - "Vote labels in English: 'I confirm:' / 'I do not confirm:'"
  - truth: "All visible text strings are in English in the EN template — no Italian leaks"
    status: failed
    reason: "extraStyles block still in frontmatter (pre-Phase-60 holdover). Tab badge labels are English but no 4th badge. Structural issues block this from being verified."
    artifacts:
      - path: "en/src/pages/permits-en.liquid"
        issue: "extraStyles frontmatter block at line 12-39 (should be removed — CSS is in shared stylesheet)"
    missing:
      - "Remove extraStyles frontmatter block"
---

# Phase 61: Language Template Propagation Verification Report

**Phase Goal:** Every change from Phase 60 is mirrored in the EN and FR permit templates so all three languages have an identical page structure.
**Verified:** 2026-03-02T17:00:00Z
**Status:** GAPS FOUND
**Re-verification:** No — initial verification

## Goal Achievement

The phase goal requires BOTH EN and FR templates to mirror the IT permit template structure. FR (Plan 61-02) was completed correctly. EN (Plan 61-01) was marked complete in the ROADMAP but the actual file `en/src/pages/permits-en.liquid` contains NONE of the Phase 60 structural changes. There is no 61-01 PLAN or SUMMARY file in the phase directory, and no git commit touching `en/src/pages/permits-en.liquid` after Phase 60. I18N-01 is effectively unimplemented.

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | FR sticky tab bar with 4 French badges | VERIFIED | permit-tab-bar div at line 38, 4 badges with FR labels, `{% unless isPlaceholder %}` wrapper |
| 2 | FR tab badge scrolls to correct section with JS offset | VERIFIED | scrollToSection function present at lines 53-66, measures header/breadcrumb/tabbar heights |
| 3 | FR CTA at page bottom after prassi | VERIFIED | Contactez-nous at line 492 > prassi-locali at line 379 > related at line 501 |
| 4 | FR Rappel alert before rinnovo checklist | VERIFIED | Rappel at line 260 < rinnovo checklist at line 274 |
| 5 | FR prassi accordion with French strings | VERIFIED | Full accordion section at lines 378-430, French labels, empty state "Aucun signalement pour le moment" |
| 6 | FR: no Italian text leaks | VERIFIED | No "Cos'è", "Primo rilascio", "Scrivici", "Nessuna segnalazione", "Confermo:" found |
| 7 | EN sticky tab bar with 4 English badges | FAILED | Tab badges are INSIDE page-header section (line 63), no permit-tab-bar div, only 3 badges, no scrollToSection |
| 8 | EN tab badge scrolls to correct section with JS offset | FAILED | No scrollToSection function in EN template |
| 9 | EN CTA at page bottom after prassi | FAILED | CTA at line 111 inside id=cose Q&A section, not at bottom |
| 10 | EN Remember alert before rinnovo checklist | FAILED | Remember alert at line 330, AFTER rinnovo checklist at line 282 |
| 11 | EN prassi accordion section present | FAILED | No id=prassi-locali section, no prassi-accordion, no prassi.js in EN template |
| 12 | EN: no structural holdovers (extraStyles removed) | FAILED | extraStyles frontmatter block at lines 12-39 still present |

**Score:** 6/12 truths verified (FR: 6/6, EN: 0/6)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `fr/src/pages/permits-fr.liquid` | FR permit template with all Phase 60 structural changes | VERIFIED | 521 lines, all 6 structural changes applied, French strings throughout |
| `en/src/pages/permits-en.liquid` | EN permit template with all Phase 60 structural changes | STUB | 465 lines, pre-Phase-60 structure intact — none of the 6 changes applied |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `fr/src/pages/permits-fr.liquid` | scrollToSection JS | inline script | WIRED | Function at lines 52-67 with measured offsets |
| `fr/src/pages/permits-fr.liquid` | prassiLocali data | `prassiLocali[permit.slug]` | WIRED | At line 384 |
| `fr/src/pages/permits-fr.liquid` | prassi-accordion | prassiLocali conditional | WIRED | Full accordion at lines 378-430 |
| `en/src/pages/permits-en.liquid` | scrollToSection JS | inline script | NOT WIRED | Function does not exist in EN template |
| `en/src/pages/permits-en.liquid` | prassiLocali data | `prassiLocali[permit.slug]` | NOT WIRED | No prassi data binding in EN template |
| `en/src/pages/permits-en.liquid` | prassi-accordion | prassiLocali conditional | NOT WIRED | No accordion markup in EN template |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| I18N-01 (EN permit template updated) | BLOCKED | `en/src/pages/permits-en.liquid` was never updated — all 6 Phase 60 structural changes are missing |
| I18N-02 (FR permit template updated) | SATISFIED | `fr/src/pages/permits-fr.liquid` fully updated with all changes |

### Anti-Patterns Found

| File | Issue | Severity | Impact |
|------|-------|----------|--------|
| `en/src/pages/permits-en.liquid` L12-39 | `extraStyles` frontmatter block with inline tab-badge CSS | Blocker | Inconsistency with IT/FR pattern; CSS should be in shared stylesheet |
| `en/src/pages/permits-en.liquid` L63 | Tab badges inside page header (not sticky tab bar) | Blocker | EN tabs do not fix to top on scroll — core Phase 60 layout change missing |
| `en/src/pages/permits-en.liquid` L111 | CTA inline inside Q&A section | Blocker | CTA in wrong position — Phase 60 repositioning not applied |
| `en/src/pages/permits-en.liquid` L330 | Remember alert AFTER rinnovo checklist | Blocker | Wrong order — Phase 60 alert repositioning not applied |
| `en/src/pages/permits-en.liquid` | No prassi accordion section | Blocker | Entire prassi accordion feature missing from EN |
| `en/src/pages/permits-en.liquid` | No prassi.js script include | Blocker | Prassi modal/voting JS not loaded on EN pages |

### Human Verification Required

None for automated structural checks. All failing items are verifiable programmatically.

### Gaps Summary

The phase goal — "every change from Phase 60 is mirrored in EN and FR" — is only half achieved.

**FR (Plan 61-02): COMPLETE.** `fr/src/pages/permits-fr.liquid` has all 6 Phase 60 structural changes correctly applied: sticky tab bar outside header, scrollToSection JS with measured offsets, 4 tab badges in French, CTA at page bottom, Rappel alert before checklist, full prassi accordion, prassi.js included, extraStyles removed.

**EN (Plan 61-01): NOT DONE.** `en/src/pages/permits-en.liquid` was never modified with Phase 60 changes. The ROADMAP and SUMMARY both claim 61-01 completed on 2026-03-02, but:
- No 61-01 PLAN.md or SUMMARY.md file exists in the phase directory
- No git commit touches `en/src/pages/permits-en.liquid` since Phase 60
- The EN template retains the pre-Phase-60 structure: 3 tab badges inside page header, CTA inside Q&A, Remember alert after checklist, no prassi section
- The `extraStyles` frontmatter block (tab-badge CSS inline) remains, contradicting the "CSS is shared" pattern established in Phase 60

The 6 specific changes needed for EN are: (1) extract tab badges into sticky permit-tab-bar outside header, (2) add scrollToSection JS, (3) add 4th "Local practices" badge, (4) remove CTA from Q&A section and place at bottom, (5) move Remember alert to before rinnovo checklist, (6) add prassi accordion section with English strings + prassi.js script. Also remove extraStyles from frontmatter.

---

_Verified: 2026-03-02T17:00:00Z_
_Verifier: Claude (gsd-verifier)_
