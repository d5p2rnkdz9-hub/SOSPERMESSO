# Project State: SOS Permesso

**Last Updated:** 2026-02-18
**Status:** v4.0 — Phase 53 in progress (2/3 tasks of Plan 03 done, at checkpoint)

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.0 FR Translation

## Current Position

**Current Milestone:** v4.0 FR Translation
**Phase:** 53 - FR Page Generation (in progress)
**Plan:** 03 in progress — at checkpoint:human-verify (Tasks 1+2 complete, Task 3 awaiting user verification)
**Status:** Build succeeded. 39 FR permits, 39 FR doc primo/rinnovo, 4 static pages in _site/fr/. Waiting for human verification of FR site in browser.
**Last activity:** 2026-02-18 — Tasks 1+2 of 53-03-PLAN.md complete

```
Progress: [████░░░░░░] 40%  (Plans 01+02+03[partial] in phase 53)
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
- **53-03: fr-static-pages-created** — 4 FR static pages created by copy-then-edit from EN: fr/index.html, fr/src/pages/database.html, fr/src/pages/documenti-questura.html, fr/src/pages/chi-siamo.html

### Carried from v3.2

- Dizionario links need revision (deferred from v3.1)
- Content validation pass (deferred from v3.1)
- 3 unrecognized permits in DB (Tirocinio, Lavoro artistico, Sanatoria) — user to decide

### Blockers/Concerns

- None currently blocking. Awaiting human verification of FR site before Plan 03 can be marked complete.

## Session Continuity

**Last session:** 2026-02-18 22:36 UTC
**Stopped at:** 53-03-PLAN.md Task 3 checkpoint:human-verify — build succeeded, waiting for browser verification
**Resume file:** None

---

*This file is the single source of truth for project state. Update after every significant change.*
