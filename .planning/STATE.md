# Project State: SOS Permesso

**Last Updated:** 2026-02-18
**Status:** v4.0 — Phase 53 planned (3 plans in 2 waves), copy-then-edit approach

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.0 FR Translation

## Current Position

**Current Milestone:** v4.0 FR Translation
**Phase:** 53 - FR Page Generation (in progress)
**Plan:** 2 of 3 done (Plan 01 + Plan 02 complete — Wave 1 done)
**Status:** Wave 1 complete. Plan 03 (SEO/sitemap) ready to execute as Wave 2.
**Last activity:** 2026-02-18 — Completed 53-02-PLAN.md (FR infrastructure wiring)

```
Progress: [████░░░░░░] 50%  (2/4 phases complete)
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
- **53-02: fr-check-order** — FR condition checked before EN in Liquid if-elsif chains (header, switcher); without this, FR falls through to IT else branch

### Carried from v3.2

- Dizionario links need revision (deferred from v3.1)
- Content validation pass (deferred from v3.1)
- 3 unrecognized permits in DB (Tirocinio, Lavoro artistico, Sanatoria) — user to decide

### Blockers/Concerns

- Pre-existing `DuplicatePermalinkOutputError` in `en/src/pages/permits-en.liquid` causes 11ty build to fail after FR data fetch. Caused by untracked EN static HTML files conflicting with liquid pagination template. Should be investigated before Phase 53 deployment.

## Session Continuity

**Last session:** 2026-02-18 22:32 UTC
**Stopped at:** Completed 53-02-PLAN.md. Wave 1 (Plans 01+02) done. Wave 2 (Plan 03 SEO/sitemap) ready.
**Resume file:** None

---

*This file is the single source of truth for project state. Update after every significant change.*
