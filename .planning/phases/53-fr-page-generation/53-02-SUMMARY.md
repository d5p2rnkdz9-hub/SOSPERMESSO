---
phase: 53
plan: 02
subsystem: multilingual-infrastructure
tags: [fr, language-switcher, hreflang, navigation, footer, app.js, liquid-templates]

dependency-graph:
  requires:
    - "53-01 (FR page generation templates — creates /fr/ pages that these nav/footer links point to)"
  provides:
    - "FR navigation structure in nav.js"
    - "FR footer links in footer.js"
    - "FR logo link in header.liquid"
    - "FR current language display in language-switcher.liquid"
    - "FR path detection and navigation in app.js"
    - "3-language hreflang tags in base.liquid"
    - "FR hreflang alternates in EN document templates"
  affects:
    - "53-03 (SEO/sitemap phase — FR hreflang now emitted on all pages)"

tech-stack:
  added: []
  patterns:
    - "if-elsif-else Liquid chain for multi-language conditions (fr check must come before en)"
    - "isCurrentlyFrench/isCurrentlyEnglish path detection in client-side JS"
    - "3-language hreflang block with urlPrefix slice for language detection"

key-files:
  created: []
  modified:
    - "_data/nav.js"
    - "_data/footer.js"
    - "_includes/components/header.liquid"
    - "_includes/components/language-switcher.liquid"
    - "src/scripts/app.js"
    - "_includes/layouts/base.liquid"
    - "en/src/pages/documents-primo-en.liquid"
    - "en/src/pages/documents-rinnovo-en.liquid"

decisions:
  - key: "fr-check-order"
    choice: "FR condition checked before EN in if-elsif chains"
    rationale: "Without fr check first, Liquid falls through to else clause (IT) for FR pages"

metrics:
  duration: "1m"
  completed: "2026-02-18"
---

# Phase 53 Plan 02: FR Infrastructure Wiring Summary

**One-liner:** FR wired as first-class language into nav, footer, header logo, language switcher display, app.js path routing, and 3-language hreflang tags across all page templates.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add FR entries to nav.js and footer.js | 059afa3 | _data/nav.js, _data/footer.js |
| 2 | Update header, switcher, app.js, base.liquid, EN doc templates | 2082906 | 6 files |

## What Was Built

### Task 1: nav.js and footer.js FR data
- `_data/nav.js`: Added `fr` key with 4 dropdowns — "Base de données" (with "Tous les permis"), "Guides" (with "Protection internationale", "Regroupement familial", "Dictionnaire"), "Test" (3 Typeform links with French labels), "Collaborer" (3 Typeform links). All internal paths use `/fr/` prefix.
- `_data/footer.js`: Added `fr` key with 3 links — "Le Projet" (`/fr/il-progetto.html`), "Qui sommes-nous" (`/fr/chi-siamo.html`), "Confidentialité" (`/fr/privacy-policy.html`).

### Task 2: Infrastructure files (6 files)
- `_includes/components/header.liquid`: Logo `<a>` href now uses `{% if lang == 'fr' %}/fr/{% elsif lang == 'en' %}/en/{% else %}/%{% endif %}` — FR check is first to avoid falling through to IT.
- `_includes/components/language-switcher.liquid`: Current language display updated to 3-branch chain; shows "FR 🇫🇷" when `lang == 'fr'`.
- `src/scripts/app.js`:
  - Uncommented FR path detection in `detectLanguage()` (`/fr/` prefix check)
  - Updated alert guard: `selectedLang !== 'it' && selectedLang !== 'en' && selectedLang !== 'fr'` (FR allowed without alert)
  - Replaced 2-language path switching block with 3-language block: handles switching TO fr (from it or en), TO en (from it or fr), TO it (from en or fr), using `isCurrentlyFrench` variable
- `_includes/layouts/base.liquid`: hreflang block now uses `urlPrefix` (slice 0,4) to detect `/en/` or `/fr/` prefix and emits all 3 language alternates + x-default.
- `en/src/pages/documents-primo-en.liquid`: Added `<link rel="alternate" hreflang="fr" href=".../fr/documenti-{{ doc.slug }}-primo.html">`.
- `en/src/pages/documents-rinnovo-en.liquid`: Added `<link rel="alternate" hreflang="fr" href=".../fr/documenti-{{ doc.slug }}-rinnovo.html">`.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Liquid if-chain order | FR checked before EN | Liquid evaluates conditions in order; FR must come before EN to avoid falling to else (IT) |
| app.js guard update | Allow IT, EN, FR; show alert for ES/ZH | FR is now a published language; alert only fires for unimplemented languages |
| hreflang variable name | Renamed `isEnglish` to `urlPrefix` | More descriptive for multi-language detection logic |

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Check

- [x] nav.js has `fr` key with 4 dropdown sections using French labels and `/fr/` paths
- [x] footer.js has `fr` key with 3 links using French labels and `/fr/` paths
- [x] header.liquid logo links to `/fr/` when `lang == 'fr'`
- [x] language-switcher.liquid displays `FR` flag when `lang == 'fr'`
- [x] app.js detects FR path, allows FR selection without alert, navigates correctly between IT/EN/FR
- [x] base.liquid emits `hreflang="fr"` alongside `hreflang="it"` and `hreflang="en"`
- [x] EN document templates (primo and rinnovo) include `hreflang="fr"` alternate

## Next Phase Readiness

Plan 53-03 (SEO + sitemap) can proceed. FR hreflang is now emitted on all pages that use `base.liquid`. The FR pages generated by 53-01 will be cross-referenced by `sitemap-fr.xml` in 53-03.

No blockers introduced by this plan.
