# Requirements: SOS Permesso

**Defined:** 2026-02-04
**Core Value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## v3.0 Requirements

Requirements for 11ty Migration milestone. Structural migration only — same content, same URLs, maintainable architecture.

### Setup

- [ ] **SETUP-01**: 11ty v3.x installed and configured with Liquid templates
- [ ] **SETUP-02**: Passthrough copy configured for CSS, JS, and image assets
- [ ] **SETUP-03**: All 469 existing URLs preserved (no broken links)
- [ ] **SETUP-04**: Build completes without errors

### Components

- [ ] **COMP-01**: Base layout template contains HTML structure (doctype, head, body)
- [ ] **COMP-02**: Header extracted as reusable include
- [ ] **COMP-03**: Footer extracted as reusable include
- [ ] **COMP-04**: Navigation (desktop + mobile) extracted as reusable include
- [ ] **COMP-05**: Language switcher extracted as reusable include

### Pages

- [ ] **PAGE-01**: All IT pages (~260) converted to use shared layouts
- [ ] **PAGE-02**: All EN pages (~209) converted to use shared layouts
- [ ] **PAGE-03**: Front matter contains page metadata (title, lang, layout)
- [ ] **PAGE-04**: Page content preserved exactly (no content changes)

### Multilingual

- [ ] **I18N-01**: IT pages output to root directory (/)
- [ ] **I18N-02**: EN pages output to /en/ directory
- [ ] **I18N-03**: HTML lang attribute correct for each language

### Deployment

- [ ] **DEPLOY-01**: netlify.toml configured for 11ty build
- [ ] **DEPLOY-02**: Production deploy successful on Netlify
- [ ] **DEPLOY-03**: Build completes in under 60 seconds

## v3.1 Requirements (Deferred)

Features deferred from v3.0 — can add after migration stable.

### Enhanced Templates

- **TMPL-01**: Permit page-specific template with Q&A structure
- **TMPL-02**: Document page-specific template with checklist
- **TMPL-03**: Guide page-specific template

### Data Architecture

- **DATA-01**: Navigation structure as JSON data file
- **DATA-02**: Collections for page grouping (permits, documents, guides)
- **DATA-03**: Notion integration migrated to 11ty data files

### Enhanced i18n

- **I18N-04**: Directory data files for automatic lang config
- **I18N-05**: i18n plugin integration
- **I18N-06**: Locale-aware URL filter in templates

## Out of Scope

| Feature | Reason |
|---------|--------|
| Content changes | Structural migration only — content stays as-is |
| Notion integration rewrite | Keep existing build scripts for now, migrate in v3.1 |
| New languages (FR, ES, ZH) | Infrastructure exists, translations deferred |
| Page-specific templates | Keep single layout, specialize in v3.1 |
| Visual regression testing | Manual QA sufficient for structural migration |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | 35 | Pending |
| SETUP-02 | 35 | Pending |
| SETUP-03 | 35 | Pending |
| SETUP-04 | 35 | Pending |
| COMP-01 | 36 | Pending |
| COMP-02 | 36 | Pending |
| COMP-03 | 36 | Pending |
| COMP-04 | 36 | Pending |
| COMP-05 | 36 | Pending |
| PAGE-01 | 37 | Pending |
| PAGE-02 | 37 | Pending |
| PAGE-03 | 37 | Pending |
| PAGE-04 | 37 | Pending |
| I18N-01 | 37 | Pending |
| I18N-02 | 37 | Pending |
| I18N-03 | 37 | Pending |
| DEPLOY-01 | 38 | Pending |
| DEPLOY-02 | 38 | Pending |
| DEPLOY-03 | 38 | Pending |

**Coverage:**
- v3.0 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-02-04*
*Last updated: 2026-02-04 — Initial definition*
