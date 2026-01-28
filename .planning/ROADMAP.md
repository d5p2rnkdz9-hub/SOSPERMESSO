# Roadmap: SOS Permesso

**Current Milestone:** v1.7 Database Content Reviewed
**Phases:** 16-17 (continues from v1.6)

---

## v1.7 Database Content Reviewed

### Phase 16: Permit Build System

**Goal:** Create build infrastructure to generate permit pages from Notion database content.

**Requirements:** BUILD-01, BUILD-02, BUILD-03, TMPL-01, TMPL-02, TMPL-03

**Success Criteria:**
1. Build script fetches all permits from Notion database
2. Script parses Q&A format (heading_3, bold paragraphs, inline bold)
3. Standard template renders sections in correct order
4. Empty permits logged to `.planning/TODO-permits.md`
5. At least one permit page successfully generated as proof of concept

**Plans:**
- 16-01: Create permit build script with Notion fetching and Q&A parsing
- 16-02: Create permit page HTML template with standard sections

---

### Phase 17: Content Migration & Visual Polish

**Goal:** Generate all permit pages, migrate costs, ensure visual consistency.

**Requirements:** MIGR-01, MIGR-02, MIGR-03, VIS-01, VIS-02, VIS-03

**Success Criteria:**
1. All 29+ permits with Notion content have generated pages
2. Separate pages exist for permit variants (e.g., Lavoro subordinato types)
3. "Costi" content moved to documenti-*-primo.html pages
4. No permit pages contain "Costi" section
5. Consistent bullet styling (no mixed bullets + checkmarks)
6. Proper list indentation and spacing throughout

**Plans:**
- 17-01: Run build for all permits, create TODO list for empty ones
- 17-02: Migrate costs to document pages and update permit template
- 17-03: Visual consistency audit and CSS fixes

---

## Previous Milestones

### v1.6 Document Deduplication (Shipped 2026-01-28)
→ See `.planning/milestones/v1.6-ROADMAP.md`

### v1.5 Footer + Collabora (Shipped 2026-01-28)
→ See `.planning/milestones/v1.5-ROADMAP.md`

### v1.4 Error + Dropdowns (Shipped 2026-01-27)
→ See `.planning/milestones/v1.4-ROADMAP.md`

### v1.2 Visual Refresh (Shipped 2026-01-26)
→ See `.planning/milestones/v1.2-ROADMAP.md`

### v1.1 Documenti Questura (Shipped 2026-01-25)
→ See `.planning/milestones/v1.1-ROADMAP.md`

---

*Last updated: 2026-01-28*
