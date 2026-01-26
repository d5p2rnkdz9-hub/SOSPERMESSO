# Requirements: SOS Permesso

**Defined:** 2026-01-25
**Core Value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## v1.2 Requirements

Requirements for visual refresh. Each maps to roadmap phases.

### Text

- [x] **TEXT-01**: Hero displays "Facile" instead of "Amichevole"

### Color Palette

- [x] **COLOR-01**: Header uses teal gradient instead of purple
- [x] **COLOR-02**: Section backgrounds use warm palette (no purple)
- [x] **COLOR-03**: CSS variables updated for consistent warm palette
- [x] **COLOR-04**: Accent colors coordinated (coral, teal, warm orange)

### Logo/Mascot

- [x] **LOGO-01**: Header displays simple lighthouse icon + "SOS Permesso" text
- [x] **LOGO-02**: Lighthouse icon retains red/white stripe colors
- [x] **LOGO-03**: Icon blends visually with teal header gradient
- [x] **LOGO-04**: Logo scales properly and stays compact on mobile

### Homepage Structure

- [x] **STRUCT-01**: "I nostri database" section contains Database permessi + Documenti Questura
- [x] **STRUCT-02**: "Le nostre guide" section contains Protezione, Ricongiungimento, Dizionario
- [x] **STRUCT-03**: "Aiuto legale" section links prominently to existing page
- [x] **STRUCT-04**: Section order: Tests → Database → Guide → Aiuto legale → Link utili

### Mobile

- [x] **MOBILE-01**: Database section displays compactly on mobile
- [x] **MOBILE-02**: All sections maintain good spacing and readability on small screens

## Future Requirements

Deferred to future release.

### Translations

- **LANG-01**: English translation of all content
- **LANG-02**: French translation of all content
- **LANG-03**: Spanish translation of all content
- **LANG-04**: Chinese translation of all content

### Content

- **CONTENT-01**: Fix dizionario partial matching (technical debt from v1.1)

## Out of Scope

Explicitly excluded.

| Feature | Reason |
|---------|--------|
| Hero lighthouse animation | Removing in favor of cleaner design |
| Purple color scheme | Replacing with warm palette |
| Complex AI-generated logo | Replacing with simple icon + text |
| Backend functionality | Static site approach maintained |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEXT-01 | Phase 4 | Complete |
| COLOR-01 | Phase 4 | Complete |
| COLOR-02 | Phase 4 | Complete |
| COLOR-03 | Phase 4 | Complete |
| COLOR-04 | Phase 4 | Complete |
| LOGO-01 | Phase 5 | Complete |
| LOGO-02 | Phase 5 | Complete |
| LOGO-03 | Phase 5 | Complete |
| LOGO-04 | Phase 5 | Complete |
| STRUCT-01 | Phase 6 | Complete |
| STRUCT-02 | Phase 6 | Complete |
| STRUCT-03 | Phase 6 | Complete |
| STRUCT-04 | Phase 6 | Complete |
| MOBILE-01 | Phase 6 | Complete |
| MOBILE-02 | Phase 6 | Complete |

**Coverage:**
- v1.2 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-25*
*Last updated: 2026-01-26 after Phase 6 completion*
