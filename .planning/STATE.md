# Project State: SOS Permesso

**Last Updated:** 2026-02-19
**Status:** v4.0 — Phase 53.1 all plans complete, awaiting verification

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.0 FR Translation — Tech Debt phase plans done, needs verification + phase completion

## Current Position

**Current Milestone:** v4.0 FR Translation
**Phase:** 53.1 - Tech Debt (all 5 plans executed)
**Plan:** 5 of 5 complete (all plans have SUMMARY.md)
**Status:** All plans executed. Needs: verification → ROADMAP/STATE update → REQUIREMENTS update → phase completion commit.
**Last activity:** 2026-02-19 — All 5 plans complete + orchestrator corrections committed (9a0cb17)

```
Progress: [██████████] 5/5 plans complete in phase 53.1
```

## Accumulated Context

### Decisions

- **v4.0-scope: FR-only** — FR first; ES in v4.1 if FR pipeline works well (revised from both-languages)
- **v4.0-approach: same-pipeline** — Reuse EN translation pipeline (translate script + Notion DBs + 11ty templates)
- **v4.0-switcher: dropdown-for-now** — 3-language dropdown (IT/EN/FR), moving to menu bar is tech debt
- **v4.0-translation: claude-api** — Same Claude API translation as EN
- **v4.0-phases: 4-phases** — Translation infra → Notion DB → Page generation → SEO (depth: quick)
- **51-01: glossary-keys** — Keep existing 'terms' key for EN backward compat; FR uses separate 'termsFr' key (not 'termsEn')
- **51-01: index-per-lang** — Translation index files are language-specific (translation-index-en.json, translation-index-fr.json) to prevent cross-language data corruption
- **51-01: migration-on-write** — Old translation-index.json migrates to translation-index-en.json on first real (non-dry-run) execution
- **52-01: fr-db-id=b7955daa** — FR Notion DB ID b7955daa-3da7-4a0c-ac9d-0bbe4ba7d70e hardcoded in _data/permitsFr.js and _data/documentsFr.js (not env var)
- **52-01: same-parent** — FR database created under same Notion parent page as EN (30b7355e-7f7f-8184-975d-fb18ca69875c)
- **53-01: copy-then-edit** — FR templates are exact structural copies of EN templates with targeted en->fr substitutions (no structural divergence)
- **53-01: en-permit-blocker-fixed** — EN permesso-* DuplicatePermalinkOutputError fixed by adding safety net block inside existing EN try block in eleventy.config.mjs
- **53-03: fr-page-counts** — 39 FR permits (matches EN; 4 permits filtered at Notion DB level, not a gap)
- **53.1-01: external-link-pattern** — Footer links with `external: true` use raw href + target=_blank (no url filter); pattern established for future external footer links
- **53.1-01: contact-modal-removed** — Dead contact-form-container div + fetch script removed from all permit templates; Typeform is the sole contact CTA
- **53.1-05: dizionario-lang-aware** — linkToDizionario filter accepts optional lang param; IT uses relative dizionario.html, EN/FR use absolute /dizionario.html; IT dizionario is single source of truth
- **53.1-05: dizionario-null-safe** — Internal formatNotesContent() call linkToDizionario(bullet) passes no lang; null-safe guard defaults to 'it' — no modification needed to internal calls
- **53.1-02: listing-coverage** — IT has 41 permits (incl. tirocinio/artistico); EN/FR have 39 each — consistent with Notion DB filtering; lavoro-autonomo-conversione was pre-existing gap in all 3 documenti-questura pages
- **53.1-04: sitemap-data-driven** — Sitemaps use Liquid for-loops over permits/documentsX data arrays (not collection API) because pagination templates use eleventyExcludeFromCollections: true, excluding generated pages from collections
- **53.1-04: pages.11tydata-bypass** — Added bypass in pages.11tydata.js: if front matter permalink ends in .xml, return it unchanged (prevents overriding sitemap permalinks). NOTE: original !.endsWith('.html') check broke static pages; corrected to .endsWith('.xml') only
- **53.1-03: lang-switcher-in-nav** — Language switcher is now a nav dropdown (not standalone); only IT/EN/FR; flag emojis added; mobile uses horizontal pills with CSS order: -1

### Carried from v3.2

- Content validation pass (deferred from v3.1) — dizionario links now working across IT/EN/FR
- 3 unrecognized permits in DB (Tirocinio, Lavoro artistico, Sanatoria) — user to decide

### Blockers/Concerns

- None.

## Session Continuity

**Last session:** 2026-02-19
**Stopped at:** All 5 plans executed + orchestrator corrections committed. Phase 53.1 needs verification + completion workflow.
**Resume with:** `/gsd:execute-phase 53.1` — will detect all SUMMARYs exist, skip execution, proceed to verification → phase completion
**Resume file:** None

---

*This file is the single source of truth for project state. Update after every significant change.*
