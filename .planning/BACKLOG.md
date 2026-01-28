# Backlog: SOS Permesso

**Last Updated:** 2026-01-28
**Source:** Consolidated from PROJECT.md, REQUIREMENTS.md, STATE.md, and phase notes

## Planned Milestones

### v1.6 Document Deduplication
**Priority:** Next
**Goal:** Remove duplicate document information between permit detail pages and documenti-questura database pages.

| ID | Requirement | Notes |
|----|-------------|-------|
| DEDUP-01 | Remove "Che documenti porto in Questura" sections from permit pages | 7 permit detail pages affected |
| DEDUP-02 | Link permit pages directly to corresponding documenti-questura pages | Single source of truth |

### v1.7 Desktop Header Alignment
**Priority:** After v1.6
**Goal:** Fix desktop header alignment - language switcher appears slightly below menu items.

| ID | Requirement | Notes |
|----|-------------|-------|
| ALIGN-01 | Fix desktop header alignment (language switcher baseline) | CSS investigation needed |

---

## Future Requirements (Unscheduled)

### Navigation & Anchors

| ID | Requirement | Notes |
|----|-------------|-------|
| NAV-ANCHOR-01 | Fix page anchor functioning - links don't scroll to precise section | Affects internal page links |
| NAV-LANG-01 | Investigate moving language toggle into main navigation menu | UX improvement |

### Dictionary Improvements

| ID | Requirement | Notes |
|----|-------------|-------|
| DICT-01 | Break dictionary entries into individual blocks for direct hyperlinking | Enables linking to specific terms |

### Visual Consistency

| ID | Requirement | Notes |
|----|-------------|-------|
| VISUAL-01 | Review "documenti questura" text display - capitalization and spacing | Typography cleanup |
| VISUAL-02 | Ensure consistent spacing and indentation of bullet points | Cross-page consistency |

---

## Technical Debt

| Issue | Location | Notes |
|-------|----------|-------|
| Dizionario links incomplete | Document pages | Partial matching works but coverage incomplete |
| Language switcher dropdown broken | Header | Layout issue on dropdown |

---

## Deferred Ideas (Low Priority)

| Idea | Source | Notes |
|------|--------|-------|
| Notion TODO database integration | Phase 02 notes | Connect to Notion task database for workflow management |
| CSS optimization | Codebase concerns | Concatenate CSS files, tree-shaking, critical vs deferred split |

---

*This file consolidates all future work. Update when items are completed or new items are added.*
