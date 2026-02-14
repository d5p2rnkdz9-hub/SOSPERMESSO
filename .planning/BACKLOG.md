# Backlog: SOS Permesso

**Source of Truth:** [Notion "CHI FA COSA"](https://www.notion.so/2cd7355e7f7f80538130e9c246190699)

All tasks, bugs, and feature requests are tracked in Notion.

---

## Quick Reference

### Milestone Planning
1. Search Notion for "To Do" tasks by priority
2. Group related tasks into milestone scope
3. Run `/gsd:new-milestone` to formalize

### Task Properties (Notion)
- **Status:** To Do → In Progress → Done
- **Priorita:** Alta, Media, Bassa
- **Chi lo fa:** Assignee name

### Related Files
- `.planning/PROJECT.md` — Architecture, shipped features, constraints, current milestone
- `.planning/TODO-permits.md` — Permits needing Notion content (auto-generated)

---

## Shipped Milestones

| Version | Name | Shipped |
|---------|------|---------|
| v1.1–v1.10 | Foundation, documents, design, navigation | 2026-01 |
| v2.0 | English translation (411 pages) | 2026-02 |
| v2.2 | Content hashing, translation memory, sitemaps | 2026-02 |
| v3.0 | 11ty migration (shared layouts, Netlify) | 2026-02-05 |

## Current Milestone: v3.1

See `.planning/PROJECT.md` for full phase breakdown.

**Order:**
1. Prassi locali MVP (Phase 40) — crowdsourced questura notes
2. Permit pages → 11ty (Phase 41)
3. Old build script cleanup (Phase 42)
4. Populate blank permits in Notion (Phase 43) — 17 permits
5. Costi section (Phase 44)
6. Content validation (Phase 45)
7. Dizionario link revision (Phase 46)

## Next Milestone: v3.2 Translation Batch

**Prerequisite:** v3.1 content phases complete (permits populated + validated)

**Scope:**
- Batch translation of new/changed content (IT → EN + future languages)
- Uses translation memory infrastructure (v2.2)
- FR, ES, ZH translations (infrastructure exists from v2.2 RTL/CJK phases)

---

*Last synced: 2026-02-07*
