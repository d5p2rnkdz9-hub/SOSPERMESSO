# Project State: SOS Permesso

**Last Updated:** 2026-02-18
**Status:** v4.0 — Phase 51 Plan 01 complete, FR translation infrastructure ready

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.0 FR Translation

## Current Position

**Current Milestone:** v4.0 FR Translation
**Phase:** 51 - Translation Infrastructure (plan 01 complete)
**Plan:** 01 of 1 done
**Status:** Phase 51 complete, ready for Phase 52 (FR Notion DB population)
**Last activity:** 2026-02-18 — Completed 51-01-PLAN.md (multi-language translation infrastructure)

```
Progress: [██░░░░░░░░] 25%  (1/4 phases complete)
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

### Carried from v3.2

- Dizionario links need revision (deferred from v3.1)
- Content validation pass (deferred from v3.1)
- 3 unrecognized permits in DB (Tirocinio, Lavoro artistico, Sanatoria) — user to decide

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-02-18
**Stopped at:** Completed 51-01-PLAN.md (translation infrastructure). Next: Phase 52 (run FR translation to populate Notion DB)
**Resume file:** None

---

*This file is the single source of truth for project state. Update after every significant change.*
