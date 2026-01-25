# Phase 2: Document Templates - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Create reusable document page templates (primo rilascio and rinnovo) that pull content from the Notion database at build time. Two templates that can generate 46 pages (23 permits × 2 types).

**Notion Database:** `collection://1ad7355e-7f7f-80bc-b445-000b881c6c80`
- `Doc primo rilascio` field → 52 document options
- `Doc rinnovo` field → 31 document options
- `Mod primo rilascio` / `Mod rinnovo` → submission method (KIT, personalmente, etc.)

</domain>

<decisions>
## Implementation Decisions

### Data Integration
- **Build-time generation** — Node.js script fetches from Notion API at deploy time
- Notion API key stored as Netlify environment variable (secure)
- Static HTML pages generated, no client-side API calls
- Rebuild triggered when Notion data changes

### Page Content
- **Documents checklist only** — no duration, work rights, travel info (that's on permit info pages)
- **Submission method shown prominently** at top with visual callout:
  - 📮 "Invia tramite KIT alle Poste (non devi andare in Questura)"
  - 🏛️ "Porta i documenti in Questura (non puoi usare il KIT postale)"
- **Negative clarification included** to prevent common confusion
- **Prominent link to permit info page** — "Vuoi sapere di più su questo permesso?" button
- **Bollettini** — link to separate explanation page (not inline)

### Document List Organization
- **Priority-based ordering** — most important documents first
- **Color coding by certainty:**
  - Standard color → definitely required
  - Yellow highlight → disputed/may vary by Questura, with note "potrebbe dipendere dalla Questura"
- **Checklist items link to dizionario** — each document name that matches a dizionario.html entry becomes a hyperlink to that term (e.g., "Certificato idoneità alloggiativa" → `dizionario.html#idoneita-alloggiativa`). Build script should match document names against dizionario terms and generate links automatically.

### Interactivity
- **Checkboxes with localStorage** — users can check off documents, progress persists across sessions
- **Print-friendly CSS** — `@media print` styles for clean printout

### Visual Design
- **Use existing design system** — same CSS, card styles, colors as permit pages
- **Compact and clear** — focused on checklist, minimal visual clutter
- **Color accent differentiation:**
  - Primo rilascio pages → blue accent (matches Phase 1 badges)
  - Rinnovo pages → orange accent (matches Phase 1 badges)
- **Quick switch link** — "Vedi anche: Rinnovo →" (or Primo) link near title

### Claude's Discretion
- Build script architecture and file organization
- Exact checkbox implementation (CSS/JS approach)
- Print stylesheet details
- Loading/error handling during build

</decisions>

<specifics>
## Specific Ideas

- Submission method callout should include negative clarification ("non devi andare in Questura") to address common user confusion
- Dizionario links use anchor IDs: `dizionario.html#idoneita-alloggiativa`
- Target user: high school education level — maximize clarity and intuitive interaction
- Disputed documents (yellow) communicate "this might depend on your specific Questura"

</specifics>

<deferred>
## Deferred Ideas

- **Notion TODO database integration** — connect to Notion task database for workflow management
- **Document certainty field in Notion** — add field to track which documents are "definite" vs "disputed" per permit
- **Bollettini explanation page** — dedicated page explaining payment requirements
- **Anchor IDs for dizionario.html** — add `id` attributes to dictionary terms for deep linking

</deferred>

---

*Phase: 02-document-templates*
*Context gathered: 2026-01-25*
