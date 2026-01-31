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
- `.planning/PROJECT.md` — Architecture, shipped features, constraints
- `.planning/TODO-permits.md` — Permits needing Notion content (auto-generated)

---

## Future Milestones (Backburner)

### v2.0 Multilingual Support (English)

**Priority:** High — crucial for non-Italian users
**Status:** POC completed, awaiting activation
**Roadmap:** `.planning/milestones/v2.0-LANGUAGES-ROADMAP.md`

**Scope:**
- Translator review interface (web-based, user-friendly)
- Batch translation pipeline (AI + glossary enforcement)
- Human review & corrections workflow
- Language switching integration

**POC Assets (2026-01-31):**
- 4 sample translated pages in `en/src/pages/`
- Verification script: `scripts/verify-translation.js`
- Comparison tool: `scripts/compare-translations.html`
- Glossary: `scripts/translation-glossary.json`

**Activate with:** `/gsd:new-milestone` when ready to prioritize

---

*Last synced: 2026-01-31*
