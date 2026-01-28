# Roadmap: SOS Permesso v1.6

## Overview

This milestone removes duplicate document sections from permit pages and replaces them with CTA buttons linking to the dedicated documenti-questura pages. Single source of truth for document requirements.

## Milestones

- v1.1 Documenti Questura (Phases 1-3) - Shipped 2026-01-25
- v1.2 Visual Refresh (Phases 4-9) - Shipped 2026-01-26
- v1.3 Header/Nav Fix (Phase 10) - Shipped 2026-01-26
- v1.4 Error + Dropdowns (Phase 11) - Shipped 2026-01-27
- v1.5 Footer + Collabora (Phases 12-14) - Shipped 2026-01-28
- **v1.6 Document Deduplication (Phase 15)** - Current

## Phases

**Phase Numbering:**
- Continues from v1.5 (Phase 14)
- Phase 15 covers v1.6 scope

- [ ] **Phase 15: Document Deduplication** - Remove doc sections, add CTA buttons

## Phase Details

### Phase 15: Document Deduplication
**Goal**: Every permit page has two CTA buttons (primo/rinnovo) instead of inline document sections
**Depends on**: Nothing (first phase of v1.6)
**Requirements**: DEDUP-01, DEDUP-02, CTA-01, CTA-02, CTA-03, CTA-04, COV-01
**Success Criteria** (what must be TRUE):
  1. No permit page contains inline document lists (sections with "Documenti" header removed)
  2. Every permit page displays two buttons after the page header section
  3. "Documenti per il primo rilascio" button links to correct documenti-[permit]-primo.html
  4. "Documenti per il rinnovo" button links to correct documenti-[permit]-rinnovo.html
  5. All 21 permit pages updated consistently
  6. Buttons follow existing site styling (cards or btn classes)
**Plans**: 2 plans

Plans:
- [ ] 15-01-PLAN.md — Design CTA button pattern, update permesso-studio.html as template
- [ ] 15-02-PLAN.md — Propagate pattern to remaining 20 permit pages

## Progress

**Execution Order:** 15

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 15. Document Deduplication | v1.6 | 0/2 | Pending | — |

---
*Roadmap created: 2026-01-28*
*Continues from v1.5 (Phase 14)*
