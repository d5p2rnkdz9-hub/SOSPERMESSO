# Phase 17: Content Migration & Visual Polish - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Generate all permit pages from Notion database and ensure visual consistency across the site. This includes handling permit variants, empty content states, and list styling. Build infrastructure exists from Phase 16 — this phase extends it for full coverage and polish.

</domain>

<decisions>
## Implementation Decisions

### Permit Variants Handling
- Parent + child page structure for permits with variants
- Parent page: brief intro + links to variant pages only (no duplicate content)
- URL structure: subfolder-based (e.g., `lavoro-subordinato/stagionale.html`)
- Auto-detect variants from Notion database
- **Validate variant list with user before generating** — don't auto-generate without approval

### List Styling
- Section headers use emojis:
  - ❓ Cos'è
  - ⏱️ Durata
  - ✅ Requisiti
  - 📄 Documenti
  - 🛠️ Lavoro
  - 🔄 Conversione
  - 💰 Costi
  - 💡 Aspetti pratici
- List items use triangles (▸) as bullets — consistent throughout, no checkmarks
- No mixed bullet styles within or across pages

### Empty Content Strategy
- Generate placeholder pages for permits without Notion content
- Placeholder message: "Stiamo ancora lavorando per completare le informazioni su questo permesso di soggiorno" + CTA to "Dai una mano" form
- Placeholder pages appear in database navigation (users see all permits exist)
- Notion is source of truth — overwrite existing pages when regenerating

### Build Process Behavior
- Change detection using Notion `last_edited_time` timestamps
- Only rebuild pages where Notion content is newer than local file
- Continue on errors — log failures but process remaining pages
- Summary at end showing pages generated/skipped/failed

### Claude's Discretion
- Exact manifest file format for timestamp tracking
- Logging verbosity and format
- Error message wording
- Template file organization

</decisions>

<specifics>
## Specific Ideas

- Variant validation step: script outputs proposed parent/child structure, user confirms before generating
- CTA on placeholder pages links to existing "Dai una mano" Typeform

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-content-migration-visual-polish*
*Context gathered: 2026-01-28*
