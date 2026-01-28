# Requirements: v1.7 Database Content Reviewed

**Version:** 1.7
**Created:** 2026-01-28
**Status:** Active

## v1.7 Requirements

### Build System

- [ ] **BUILD-01**: Create build script that fetches permit content from Notion database
- [ ] **BUILD-02**: Generate `permesso-*.html` pages from Notion content
- [ ] **BUILD-03**: Track empty Notion permits in TODO list (`.planning/TODO-permits.md`)

### Template Standardization

- [ ] **TMPL-01**: Standard template with sections: Cos'è, Durata, Chi può chiedere, Come si chiede, Che diritti mi dà, Si può lavorare?, Conversione, Costi (last)
- [ ] **TMPL-02**: Support additional Q&A subsections for permit-specific content
- [ ] **TMPL-03**: Parse Notion Q&A format (heading_3, bold paragraphs, inline bold)

### Content Migration

- [ ] **MIGR-01**: Generate separate pages for all permit variants (e.g., 3 types of Lavoro subordinato)
- [ ] **MIGR-02**: Move "Costi" section content to corresponding documenti-*-primo.html pages
- [ ] **MIGR-03**: Remove "Costi" from permit page template (costs live in document pages)

### Visual Consistency

- [ ] **VIS-01**: Consistent bullet point styling (no mixed bullets + checkmarks)
- [ ] **VIS-02**: Proper indentation and spacing for lists
- [ ] **VIS-03**: Uniform card/section styling across all generated pages

## Future Requirements (v1.8+)

### Homepage Cleanup (moved from v1.7)
- Remove subtitles under each section on homepage
- Rename "Aiuto legale" → "Aiuto legale gratis"
- Change badge header to "Trova assistenza legale gratuita vicino a te"
- Remove red button from Aiuto legale section

### Content Validation
- Peer review workflow for accuracy checking
- Desktop header alignment fix

## Out of Scope

- Rewriting Notion content (that's v1.8 validation)
- New permit types not in Notion database
- Translations (content is Italian only)

## Requirement Traceability

| REQ-ID | Phase | Plan | Status |
|--------|-------|------|--------|
| BUILD-01 | 16 | TBD | Pending |
| BUILD-02 | 16 | TBD | Pending |
| BUILD-03 | 16 | TBD | Pending |
| TMPL-01 | 16 | TBD | Pending |
| TMPL-02 | 16 | TBD | Pending |
| TMPL-03 | 16 | TBD | Pending |
| MIGR-01 | 17 | TBD | Pending |
| MIGR-02 | 17 | TBD | Pending |
| MIGR-03 | 17 | TBD | Pending |
| VIS-01 | 17 | TBD | Pending |
| VIS-02 | 17 | TBD | Pending |
| VIS-03 | 17 | TBD | Pending |

---
*Last updated: 2026-01-28*
