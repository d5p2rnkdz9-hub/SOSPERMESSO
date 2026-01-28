# Milestone Summary: v1.7 & v1.8

**Created:** 2026-01-28
**Purpose:** Consolidated reference for upcoming milestones

---

## v1.7 Database Content Reviewed

**Goal:** Generate permit pages from Notion database with standardized Q&A template.

### Phases

| Phase | Name | Focus |
|-------|------|-------|
| 16 | Permit Build System | Notion → HTML generation infrastructure |
| 17 | Content Migration & Visual Polish | Generate all pages, visual consistency |

### Template Structure (7 standard sections + extras)

| # | Section | Content |
|---|---------|---------|
| 1 | Cos'è questo permesso? | What the permit is |
| 2 | Chi può chiederlo? | Eligibility criteria |
| 3 | Come/dove si chiede? | Application process and location |
| 4 | Che diritti mi dà? | Rights granted (includes "posso lavorare") |
| 5 | Quanto dura? | Duration/validity |
| 6 | Quando scade posso rinnovarlo? | Renewal information |
| 7 | Posso convertirlo in un altro permesso? | Conversion options |
| + | Additional Q&A | Permit-specific questions from Notion |

**Note:** Costi (costs) skipped — deferred to v1.8

### Requirements

**Build System (Phase 16):**
- BUILD-01: Fetch permit content from Notion database
- BUILD-02: Generate `permesso-*.html` pages
- BUILD-03: Track empty permits in `.planning/TODO-permits.md`
- TMPL-01: Standard template with 7 sections
- TMPL-02: Support additional Q&A subsections
- TMPL-03: Parse Notion Q&A format (heading_3, bold paragraphs, inline bold)

**Migration & Visual (Phase 17):**
- MIGR-01: Generate separate pages for permit variants
- VIS-01: Consistent bullet styling (no mixed bullets + checkmarks)
- VIS-02: Proper list indentation/spacing
- VIS-03: Uniform card/section styling

### Notion Database

- **Database ID:** `1ad7355e-7f7f-8088-a065-e814c92e2cfd`
- **Total permits:** 44
- **With content:** 29
- **Without content:** 13 (+2 Untitled)

### Content Format in Notion

Three Q&A styles detected (build script handles all):
1. `heading_3` for questions (e.g., Studio)
2. Bold paragraph + dividers (e.g., Protezione speciale)
3. Inline bold at paragraph start (e.g., Richiesta Asilo)

### Success Criteria

1. Build script fetches all permits from Notion
2. Script parses all Q&A format variations
3. Standard template renders sections in correct order
4. Empty permits logged to TODO file
5. All 29+ permits with content have generated pages
6. Separate pages for permit variants (e.g., 3 Lavoro subordinato types)
7. Consistent visual styling throughout

---

## v1.8 Homepage Cleanup + Content Validation + Costi

**Goal:** Clean up homepage, establish peer review workflow, add costs to document pages.

### Requirements

**Homepage Cleanup:**
- HOME-01: Remove subtitles under homepage sections
- HOME-02: Rename "Aiuto legale" → "Aiuto legale gratis"
- HOME-03: Badge header: "Trova assistenza legale gratuita vicino a te"
- HOME-04: Remove red button from Aiuto legale section

**Content Validation:**
- VALID-01: Peer review workflow for content accuracy

**Costi (deferred from v1.7):**
- COST-01: Add Costi section to documenti-questura pages
- Restructure document pages to include permit costs

---

## v1.9 Desktop Header Alignment

**Goal:** Fix desktop header alignment - language switcher baseline.

- ALIGN-01: Fix language switcher appearing below menu items

---

## Reference: Existing Build System

The documenti-questura build system (`scripts/build-documents.js`) provides a pattern:

```
scripts/
├── build-documents.js    # Main build script
├── notion-client.js      # Notion API client
├── slug-map.json         # URL aliases
└── templates/
    ├── primo.js          # First release template
    └── rinnovo.js        # Renewal template
```

v1.7 will create a parallel system for permit pages:

```
scripts/
├── build-permits.js      # NEW: Permit build script
├── notion-client.js      # Shared (may need updates)
└── templates/
    └── permesso.js       # NEW: Permit page template
```

---

*Last updated: 2026-01-28*
