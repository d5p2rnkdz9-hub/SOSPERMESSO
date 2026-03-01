# Requirements: SOS Permesso v4.2

**Defined:** 2026-03-01
**Core Value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## v4.2 Requirements

Requirements for permit page restructure. Each maps to roadmap phases.

### Layout

- [ ] **LAYOUT-01**: Tab badges (Cos'è / Primo / Rinnovo / Prassi locali) become sticky at top of viewport when user scrolls past header
- [ ] **LAYOUT-02**: "Hai altre domande? Scrivici" CTA moves from after Q&A section to bottom of page (before Related links)
- [ ] **LAYOUT-03**: "Ricorda" (entro 60gg) alert moves to before checklist in Rinnovo section
- [ ] **LAYOUT-04**: Prassi locali added as 4th tab badge in header alongside Cos'è / Primo / Rinnovo

### Prassi

- [ ] **PRASSI-01**: Full Prassi locali section replaced with compact collapsible accordion
- [ ] **PRASSI-02**: Accordion shows "Nessuna segnalazione finora" when empty, questura city names when populated
- [ ] **PRASSI-03**: Clicking Prassi locali tab badge scrolls to accordion section

### i18n

- [ ] **I18N-01**: All layout changes applied to EN permit template (permits-en.liquid)
- [ ] **I18N-02**: All layout changes applied to FR permit template (permits-fr.liquid)

## Future Requirements

### Prassi Backend

- **PRAS-01**: submit-prassi.mjs functional in production (env vars + v5 parent field fix)
- **PRAS-02**: Spam protection — honeypot + server-side validation
- **PRAS-03**: Rate limiting on submit-prassi
- **PRAS-04**: Netlify Build Hook + Notion Automation for auto-rebuild

### Voting

- **VOTE-01**: vote-prassi.mjs functional in production
- **VOTE-02**: Server-side rate limiting on vote-prassi

### Tech Debt

- **DEBT-01**: "Segnala errore" button restored on document pages (primo/rinnovo)
- **DEBT-02**: Language switcher integrated in main nav bar

## Out of Scope

| Feature | Reason |
|---------|--------|
| Prassi locali backend (submission, moderation) | Dropped from v4.1, revisit separately |
| Floating side dots navigation | User chose sticky badges for simplicity |
| ES translation | Deferred to future milestone |
| Content validation pass | Separate from structural changes |
| Note editoriali da blocchi Notion | Deferred from v4.1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYOUT-01 | Phase 60 | Pending |
| LAYOUT-02 | Phase 60 | Pending |
| LAYOUT-03 | Phase 60 | Pending |
| LAYOUT-04 | Phase 60 | Pending |
| PRASSI-01 | Phase 60 | Pending |
| PRASSI-02 | Phase 60 | Pending |
| PRASSI-03 | Phase 60 | Pending |
| I18N-01 | Phase 61 | Pending |
| I18N-02 | Phase 61 | Pending |

**Coverage:**
- v4.2 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 — traceability completed after roadmap creation*
