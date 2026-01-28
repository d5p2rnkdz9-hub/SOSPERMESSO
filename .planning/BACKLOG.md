# Backlog: SOS Permesso

**Last Updated:** 2026-01-28
**Source:** Consolidated from PROJECT.md, REQUIREMENTS.md, STATE.md, and phase notes

## Planned Milestones

### v1.7 Database Content Reviewed (Active)
**Priority:** Current
**Goal:** Generate permit pages from Notion database with standardized Q&A template.

| ID | Requirement | Notes |
|----|-------------|-------|
| BUILD-01 | Build script fetches permit content from Notion | Like documenti-questura system |
| BUILD-02 | Generate `permesso-*.html` from Notion | Replaces manual HTML |
| BUILD-03 | Track empty permits in TODO list | `.planning/TODO-permits.md` |
| TMPL-01 | Standard sections: 1. Cos'è? 2. Chi può chiederlo? 3. Come/dove si chiede? 4. Che diritti mi dà? 5. Quanto dura? 6. Posso rinnovarlo? 7. Posso convertirlo? + Additional Q&A | 7 fixed + extras (no Costi) |
| TMPL-02 | Support additional Q&A subsections | Permit-specific content |
| TMPL-03 | Parse Notion Q&A format | heading_3, bold paragraphs, inline bold |
| MIGR-01 | Separate pages for permit variants | e.g., 3 types of Lavoro subordinato |
| VIS-01 | Consistent bullet styling | No mixed bullets + checkmarks |
| VIS-02 | Proper list indentation/spacing | Visual polish |
| VIS-03 | Uniform card/section styling | Across all generated pages |

### v1.8 Homepage Cleanup + Content Validation
**Priority:** After v1.7
**Goal:** Clean up homepage sections and establish peer review workflow for content accuracy.

| ID | Requirement | Notes |
|----|-------------|-------|
| HOME-01 | Remove subtitles under homepage sections | Cleaner look |
| HOME-02 | Rename "Aiuto legale" → "Aiuto legale gratis" | Clearer messaging |
| HOME-03 | Badge header: "Trova assistenza legale gratuita vicino a te" | More descriptive |
| HOME-04 | Remove red button from Aiuto legale section | UI cleanup |
| VALID-01 | Peer review workflow for content accuracy | Process TBD |
| COST-01 | Add Costi section to documenti-questura pages | Restructure document pages to include costs |

### v1.9 Desktop Header Alignment
**Priority:** After v1.8
**Goal:** Fix desktop header alignment - language switcher appears slightly below menu items.

| ID | Requirement | Notes |
|----|-------------|-------|
| ALIGN-01 | Fix language switcher baseline | CSS investigation needed |

---

## Future Requirements (Unscheduled)

### Navigation & Anchors

| ID | Requirement | Notes |
|----|-------------|-------|
| NAV-ANCHOR-01 | Fix page anchor functioning | Links don't scroll to precise section |
| NAV-LANG-01 | Move language toggle into main navigation | UX improvement |

### Dictionary Improvements

| ID | Requirement | Notes |
|----|-------------|-------|
| DICT-01 | Break dictionary entries into individual blocks | Enable direct hyperlinking |

### Visual Consistency

| ID | Requirement | Notes |
|----|-------------|-------|
| VISUAL-01 | Review "documenti questura" text display | Capitalization and spacing |
| VISUAL-02 | Consistent spacing/indentation of bullet points | Cross-page consistency |

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
| Notion TODO database integration | Phase 02 notes | Connect to Notion task database |
| CSS optimization | Codebase concerns | Concatenate, tree-shake, critical vs deferred |

---

*This file consolidates all future work. Update when items are completed or new items are added.*
