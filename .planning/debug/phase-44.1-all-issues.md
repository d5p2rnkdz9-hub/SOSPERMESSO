---
status: diagnosed
trigger: "Investigate all Phase 44.1 issues thoroughly but carefully. Do NOT make any changes — investigation only. Report findings."
created: 2026-02-17T00:00:00Z
updated: 2026-02-17T18:30:00Z
---

## Current Focus

hypothesis: CONFIRMED — Four distinct root causes found across all investigated areas
test: Complete read of all relevant source files, _site structure analysis, build pipeline trace
expecting: N/A — all root causes confirmed with evidence
next_action: Report findings (investigation complete, no fixes applied)

## Symptoms

expected:
1. database.html links to permit pages should work (not 404)
2. Each Notion DB permit = exactly one HTML page (flat, no parent/child)
3. Redirects should point to valid targets
4. No duplicate or conflicting files in the codebase

actual:
1. All links from database.html to permit pages are broken/404
2. Variant parent/child system exists (manualVariantGroups, detectVariants, isVariantParent/isVariantChild)
3. Some redirects point to parent page slugs that may not exist
4. User suspects duplicate files or conflicting file issues

errors: Links from database.html 404. Has been happening for several builds.
reproduction: Build the site and check database.html links.
started: A few builds ago; variant system added in recent phases

## Eliminated

- hypothesis: "documents.js returning empty arrays causes missing IT pages"
  evidence: permits.js also uses Notion and DOES generate 77 permit pages in _site — so Notion was available
  timestamp: 2026-02-17

- hypothesis: "database.html has no output in _site because it's ignored"
  evidence: No ignore rule covers database.html; the deeper cause is that _site/src/pages/ simply doesn't appear in current _site build (possibly stale/incomplete build artifact)
  timestamp: 2026-02-17

- hypothesis: "redirect targets are all broken"
  evidence: All 31 permit redirect targets currently exist in _site root — no broken redirect targets in current build
  timestamp: 2026-02-17

## Evidence

- timestamp: 2026-02-17
  checked: src/pages/database.html frontmatter and link contents
  found: database.html has NO explicit permalink; uses directory-data "{{ page.filePathStem }}.html"; links use RELATIVE paths like "permesso-lavoro-subordinato.html" (no directory prefix)
  implication: database.html outputs to _site/src/pages/database.html; relative links from /src/pages/ resolve to /src/pages/permesso-*.html (wrong, permits are at root)

- timestamp: 2026-02-17
  checked: _site directory structure
  found: _site/src/pages/ does NOT exist; _site/en/src/pages/ has 204 HTML files; _site root has 77 permesso-*.html files; database.html is ONLY in _site/en/src/pages/database.html (not IT)
  implication: IT static pages from src/pages/ are entirely missing from the current _site (may be stale build artifact or partial build)

- timestamp: 2026-02-17
  checked: src/pages/permits.liquid permalink and link patterns
  found: permalink: "permesso-{{ permit.slug }}.html" (root level, no prefix); internal links use: "../../index.html" (Home), "database.html" (relative), "documenti-*.html" (relative), "dizionario.html" (relative); Segnala errore URL hardcodes /src/pages/ path
  implication: permits.liquid was designed for pages at /src/pages/ depth (2 levels); now that permits are at ROOT (0 levels), ALL relative internal links resolve incorrectly

- timestamp: 2026-02-17
  checked: _site/permesso-studio-dopo-ingresso-con-visto.html output
  found: title/description meta tags contain literal "{{ permit.tipo }}" unrendered text; breadcrumb has "../../index.html" (broken from root), "database.html" (broken - is at /src/pages/), "permesso-studio.html" (parent page link); Segnala errore URL contains "/src/pages/permesso-studio-dopo-ingresso-con-visto.html" (wrong path)
  implication: Confirmed path depth mismatch causes ALL internal links to fail; also confirms {{ permit.tipo }} in frontmatter is NOT rendered (11ty does not process Liquid in YAML frontmatter)

- timestamp: 2026-02-17
  checked: _data/permits.js manualVariantGroups and detectVariants
  found: manualVariantGroups defines 4 groups with these parent slugs: "studio", "lavoro-autonomo", "lavoro-subordinato", "cure-mediche-art-19". Creates SYNTHETIC parent pages in the output. Children get isVariantChild=true and parentSlug set. detectVariants() also auto-detects "X a seguito di Y" patterns.
  implication: 4 synthetic parent pages exist in _site that don't correspond to Notion records; each child variant page has a "Back to parent" link

- timestamp: 2026-02-17
  checked: _data/permitSlugMap.js redirect targets vs parent page slugs
  found: 2 redirects target "cure-mediche-art-19" (a PARENT page): "donna-in-stato-di-gravidanza-e-padre-del-bambino" and "cure-mediche-per-donna-in-stato-di-gravidanza-e-padre-del-bambino-art-19". No redirects target "studio", "lavoro-autonomo", or "lavoro-subordinato" parent slugs.
  implication: If variant parent pages are removed, these 2 specific redirects would break

- timestamp: 2026-02-17
  checked: en/src/pages/ contents
  found: 66 static permesso-*.html files; NO liquid template equivalents in en/; pages.11tydata.json with same "{{ page.filePathStem }}.html" permalink
  implication: EN permit pages are old static translations; they output to _site/en/src/pages/permesso-*.html; they include old slugs (e.g., permesso-studio.html which may reference pre-variant structure)

- timestamp: 2026-02-17
  checked: src/pages/documents-primo.liquid permalink and links
  found: permalink: "src/pages/documenti-{{ doc.slug }}-primo.html" (includes src/pages/ prefix); internal links use "../../index.html", "database.html", "documenti-questura.html" (all relative, designed for /src/pages/ depth)
  implication: Document pages ARE at /src/pages/ depth so their relative links are correct — but document pages are ALSO missing from current _site (same issue as IT static pages)

- timestamp: 2026-02-17
  checked: nav.js link structure
  found: IT nav uses /src/pages/database.html, /src/pages/documenti-questura.html, /src/pages/dizionario.html (all absolute paths with /src/pages/ prefix)
  implication: Nav links are correct for pages at /src/pages/ depth; permit pages at root would display this nav correctly but clicking any nav link leads to /src/pages/ URLs

- timestamp: 2026-02-17
  checked: All 25 permit page targets linked from database.html vs _site root
  found: ALL 25 target pages exist in _site root (e.g., permesso-lavoro-subordinato.html, permesso-studio-dopo-ingresso-con-visto.html, etc.)
  implication: The target pages themselves exist; the issue is the RELATIVE path from database.html's /src/pages/ location

- timestamp: 2026-02-17
  checked: permits.liquid Segnala errore URL template
  found: "https://form.typeform.com/to/FsqvzdXI#page_url=https%3A%2F%2Fsospermesso.it%2Fsrc%2Fpages%2Fpermesso-{{ permit.slug }}.html" — hardcodes /src/pages/ in URL
  implication: Error reporting URL sends wrong page URL; permits are at /permesso-*.html not /src/pages/permesso-*.html

- timestamp: 2026-02-17
  checked: eleventyComputed.js
  found: Overrides permalink for HTML files: "return `${data.page.filePathStem}.html`" — applies to all HTML files, returns the same as directory data for src/pages/ files
  implication: No conflict with directory data; both set same permalink value; eleventyComputed doesn't affect .liquid files (returns data.permalink for non-HTML)

- timestamp: 2026-02-17
  checked: _data/slugMap.js (document redirect map)
  found: 19 entries; "gravidanza" maps to "donna-in-stato-di-gravidanza-e-padre-del-bambino" (a document page slug that may not exist after flattening); "studio" maps to "studio-art-39", "lavoro-subordinato" maps to "lavoro-subordinato-a-seguito-di-ingresso-per-flussi" (document page slugs)
  implication: Document redirect targets reference document page canonical slugs that depend on Notion data structure; after variant system removal, document slugs may change

## Resolution

root_cause: FOUR distinct root causes identified:

**ROOT CAUSE 1 — Path Depth Mismatch in permits.liquid (PRIMARY CAUSE OF 404s)**
permits.liquid has permalink: "permesso-{{ permit.slug }}.html" → pages output at _site ROOT (/permesso-*.html)
BUT the template body uses relative paths designed for /src/pages/ depth:
- "../../index.html" (Home breadcrumb): from root, goes 2 levels ABOVE root → broken
- "database.html" (breadcrumb, related section): from root → /database.html (doesn't exist, it's at /src/pages/)
- "documenti-*.html" (CTA buttons): from root → /documenti-*.html (wrong, they're at /src/pages/)
- "dizionario.html" (related section): from root → /dizionario.html (wrong, it's at /src/pages/)
- Segnala errore URL hardcodes "/src/pages/permesso-{{ permit.slug }}.html" (wrong, permits are at root)
Additionally: permit.tipo in frontmatter uses "{{ permit.tipo }}" which DOES NOT render in 11ty YAML frontmatter — all title/description meta tags contain literal "{{ permit.tipo }}" text.

**ROOT CAUSE 2 — Variant Parent/Child System (manualVariantGroups + detectVariants in _data/permits.js)**
The variant system in _data/permits.js (lines 426-751) creates:
- manualVariantGroups: 4 groups with synthetic parent pages ("Studio", "Lavoro autonomo", "Lavoro subordinato", "Cure mediche (art. 19)")
- detectVariants(): auto-detects "X a seguito di Y" pattern for additional groups
- Each group produces one synthetic parent page (not from Notion) + marks children as isVariantChild
- permits.liquid renders parent pages (isVariantParent=true) with variant selection UI
- permits.liquid renders child pages (isVariantChild=true) with "Back to parent" link
- User explicitly wants this system REMOVED; each Notion record should be exactly one flat page
- To remove: delete manualVariantGroups const + detectVariants function + all variant processing logic (lines 661-755) + template branches in permits.liquid (isVariantParent, isVariantChild conditions)

**ROOT CAUSE 3 — Two Redirects Target Parent Page Slugs (will break if variant system removed)**
In _data/permitSlugMap.js:
- "donna-in-stato-di-gravidanza-e-padre-del-bambino" → "cure-mediche-art-19" (PARENT slug)
- "cure-mediche-per-donna-in-stato-di-gravidanza-e-padre-del-bambino-art-19" → "cure-mediche-art-19" (PARENT slug)
When parent pages are removed, these 2 redirect pages will 404.
Fix: redirect them to "cure-mediche-art-19-donna-in-stato-di-gravidanza" (one of the children) or remove them.

**ROOT CAUSE 4 — en/src/pages/ Has 66 Stale Static Permit Files (integrity issue)**
en/src/pages/ contains 66 old static English translations of permit pages.
These are NOT dynamically generated; they're old translations copied before the Notion-driven system.
They output to _site/en/src/pages/permesso-*.html.
They may reference old slugs/structure inconsistent with current IT permit pages from permits.liquid.
No ignore rule in eleventy.config.mjs covers them (unlike the IT static files that were deleted).
The phase 44.1-03 cleanup deleted IT static files but NOT EN static files.

**SECONDARY FINDING — _site/src/pages/ Missing from Current Build**
The current _site has NO /src/pages/ directory (IT static pages like database.html are not in _site).
EN equivalent pages ARE in _site/en/src/pages/.
Most likely: _site is either from a partial build, or 11ty successfully generates _site/src/pages/ but something cleans it out. Cannot fully determine without running a fresh build. The _site also has a later timestamp (18:11) for passthrough-copied src/ assets from a dev server session.

fix: (not applied — investigation only)
verification: (not applied — investigation only)
files_changed: []
