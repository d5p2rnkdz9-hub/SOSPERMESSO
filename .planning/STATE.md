# Project State: SOS Permesso

**Last Updated:** 2026-02-18
**Status:** v4.0 — Phase 53 in progress (1 of 3 plans done)

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.0 FR Translation

## Current Position

**Current Milestone:** v4.0 FR Translation
**Phase:** 53 - FR Page Generation (in progress)
**Plan:** 1 of 3 done (Plan 01 complete — Wave 1 partial)
**Status:** Plan 01 complete. Plan 02 (FR static pages + infrastructure wiring) can run in parallel as Wave 1. Plan 03 (SEO/sitemap) depends on both.
**Last activity:** 2026-02-18 — Completed 53-01-PLAN.md (FR pagination pipeline + EN permesso-* blocker fix)

```
Progress: [███░░░░░░░] 33%  (1/3 plans in phase 53 complete)
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

### Carried from v3.2

- Dizionario links need revision (deferred from v3.1)
- Content validation pass (deferred from v3.1)
- 3 unrecognized permits in DB (Tirocinio, Lavoro artistico, Sanatoria) — user to decide

### Blockers/Concerns

- None currently blocking. The EN permesso-* DuplicatePermalinkOutputError was fixed in Plan 01 (commit d51288e).

## Session Continuity

**Last session:** 2026-02-18 22:32 UTC
**Stopped at:** Completed 53-01-PLAN.md (FR pagination pipeline). Plan 02 ready to execute.
**Resume file:** None

---

*This file is the single source of truth for project state. Update after every significant change.*
