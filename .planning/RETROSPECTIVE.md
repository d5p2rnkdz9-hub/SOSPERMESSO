# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v4.2 — Page Restructure

**Shipped:** 2026-03-02
**Phases:** 2 | **Plans:** 5 | **Sessions:** 2

### What Was Built
- Sticky tab bar with 4 section badges on all permit pages (IT/EN/FR)
- Compact prassi accordion replacing full-width section (CSS-only, collapsed by default)
- CTA relocated to page bottom, Ricorda alert repositioned before checklist
- scrollToSection JS with measured sticky heights for precise scroll offset
- Identical page structure propagated across all 3 language templates

### What Worked
- Phase 60 (IT template) was clean and fast — 3 plans, clear requirements, no blockers
- CSS-only accordion pattern (aria-expanded + max-height) avoided adding new JS dependencies
- Using the IT template as canonical reference made FR/EN propagation straightforward
- Verification caught that EN template was never actually updated (61-01 was falsely marked complete)

### What Was Inefficient
- Plan 61-01 (EN template) was marked complete in the roadmap but never executed — gap closure plan 61-03 was needed to fix this
- The false completion could have been caught earlier with stricter SUMMARY.md verification before marking plans done
- Two separate sessions needed for what should have been a single pass (plan + execute EN in one go)

### Patterns Established
- Language template propagation: IT is canonical, copy structure to EN/FR with translated strings
- All 3 language permit templates must have identical structure (only text differs)
- scrollToSection JS (measuring actual sticky heights) preferred over CSS scroll-margin-top
- extraStyles frontmatter blocks should be removed when CSS is in shared stylesheet

### Key Lessons
1. Always verify SUMMARY.md exists before marking a plan complete in the roadmap — the plan checker's verification step is not optional
2. Gap closure works well: verification → targeted plan → re-verify cycle closes issues cleanly
3. Template propagation is mechanical — could be a single plan per language rather than needing research

### Cost Observations
- Model mix: ~30% opus (orchestration), ~70% sonnet (execution, verification)
- Sessions: 2
- Notable: Sonnet handled template propagation effectively; no opus needed for execution agents

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v4.2 | 2 | 2 | Gap closure cycle validated; false completion detected and fixed |

### Top Lessons (Verified Across Milestones)

1. Verification before marking complete prevents false progress claims
2. Template propagation across languages is mechanical and benefits from a canonical reference
