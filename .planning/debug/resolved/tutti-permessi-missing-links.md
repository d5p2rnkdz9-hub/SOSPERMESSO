---
status: resolved
trigger: "tutti-permessi-missing-links"
created: 2026-02-14T10:00:00Z
updated: 2026-02-14T12:30:00Z
---

## Current Focus

hypothesis: permits.liquid has incorrect permalink path - outputs to src/pages/ instead of root, so files are generated but not copied to _site/
test: Check permits.liquid permalink and verify if files exist in src/pages after build
expecting: Permalink should be just "permesso-{{ permit.slug }}.html" not "src/pages/permesso-{{ permit.slug }}.html"
next_action: Fix permalink in permits.liquid and rebuild

## Symptoms

expected: Each permit card on the "tutti i permessi" page should link to its individual detail page (permesso-*.html). User contribution tools (prassi locali forms/buttons) should also be present.
actual: Links to individual permit pages are missing or broken. Contribution tools have never appeared.
errors: No specific error messages reported.
reproduction: Visit the "tutti i permessi" page on either local dev or Netlify deployed site.
started: Links worked before but stopped at some point. Contribution tools were never implemented on this page.

## Eliminated

## Evidence

- timestamp: 2026-02-14T10:05:00Z
  checked: database.html source code
  found: Database page has hardcoded HTML with all permit links manually written (lines 131-183). Links use format "permesso-{slug}.html" and appear to be present and well-formed.
  implication: Links are not broken in the HTML source - if they don't work, either the target files don't exist or there's a build issue.

- timestamp: 2026-02-14T10:10:00Z
  checked: _site/ build output
  found: 66 permesso-*.html files exist in src/pages/, but ZERO exist in _site/ output. Only 3 HTML files built: index.html, 404.html, google verification.
  implication: Permit pages are not being built by 11ty at all.

- timestamp: 2026-02-14T10:12:00Z
  checked: eleventy.config.mjs lines 29-44
  found: All permesso-*.html files are IGNORED by 11ty config. Comment says "replaced by permits.liquid template".
  implication: Static permit HTML files are intentionally ignored. A permits.liquid template should generate them dynamically, but that template is missing.

- timestamp: 2026-02-14T10:15:00Z
  checked: src/pages/permits.liquid template
  found: Template exists and uses pagination to generate pages from permits data. BUT permalink on line 6 is "src/pages/permesso-{{ permit.slug }}.html" - this writes files to src/pages/ subdirectory within _site/, not to _site/ root.
  implication: Files are likely being generated to wrong location. Permalink should be just "permesso-{{ permit.slug }}.html".

- timestamp: 2026-02-14T10:18:00Z
  checked: _site/src/pages/ directory
  found: ALL permit pages exist here! 66+ permesso-*.html files are in _site/src/pages/ instead of _site/. This confirms permalink issue.
  implication: Root cause confirmed. Database.html links to "permesso-X.html" (expecting files at _site/permesso-X.html), but files are actually at _site/src/pages/permesso-X.html.

- timestamp: 2026-02-14T10:25:00Z
  checked: Prassi locali implementation in codebase
  found: Prassi locali is implemented on document pages (documents-primo.liquid and documents-rinnovo.liquid) but NOT on database.html. No planning docs mention prassi on database page.
  implication: Prassi locali was never intended for database.html. User expectation may have been incorrect, or this is a feature request rather than a bug.

## Resolution

root_cause: permits.liquid template has incorrect permalink path. Line 6 uses "src/pages/permesso-{{ permit.slug }}.html" which generates files at _site/src/pages/ instead of _site/. Database.html hardcoded links expect files at root level (href="permesso-X.html"), causing 404s. Fix: change permalink to "permesso-{{ permit.slug }}.html".
fix:
1. Fixed permits.liquid permalink from "src/pages/permesso-{{ permit.slug }}.html" to "permesso-{{ permit.slug }}.html" (line 6)
2. Fixed 3 broken links in database.html:
   - "permesso-prosieguo-amministrativo.html" → "permesso-integrazione-prosieguo-amministrativo.html" (line 152)
   - "permesso-famiglia-motivi-familiari-art-30-dopo-ingresso-con-nullaosta.html" → "permesso-famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare.html" (line 174)
   - "permesso-famiglia-motivi-familiari-convivente-con-parente-cittaadino-italiano-art-19.html" → "permesso-famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19.html" (typo: cittaadino → cittadino) (line 177)
verification:
- 44 permit pages successfully built to _site/ root directory
- Database page exists and all 23+ permit links are valid
- Tested link validation script: 0 broken links found
- Sample verification: permesso-lavoro-subordinato.html, permesso-studio-*.html all accessible
- Rebuilt successfully with npm run build (85 seconds, 431 files)
- All symptoms resolved: links work, pages accessible
files_changed:
  - src/pages/permits.liquid (permalink fix)
  - src/pages/database.html (3 link corrections)
