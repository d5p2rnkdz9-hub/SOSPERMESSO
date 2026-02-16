# Phase 44: Costi Section - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a cost information section to document pages (primo rilascio and rinnovo). Cost data already exists in Notion columns under the document database. This phase reads that data and renders it as a new section on each document page. No new Notion fields need creating.

</domain>

<decisions>
## Implementation Decisions

### Cost data source
- Notion already has cost columns under "Doc primo rilascio" and "Doc rinnovo" — specifically marca da bollo (16€) and bollettino postale (varying amounts per permit)
- For Kit permits (detected via existing `method` field), add fixed 30€ kit postale cost as a separate line item
- Fetch cost data in `documents.js` alongside existing document data — check Notion column names during research
- If a permit has no cost data in Notion, hide the Costi section entirely (no fallback message)

### Cost breakdown display
- Itemized breakdown showing each cost line (bollettino, marca da bollo, kit postale if applicable)
- Bold total at the bottom summing all items
- Brief how-to note per item (e.g. "bollettino at the post office", "marca da bollo at the tabaccheria")
- Reminder: 40€ electronic permit cost is ALREADY INCLUDED in the bollettino amount — never list it separately (established Phase 43 rule)

### Section placement
- Position: after document notes, before prassi locali
- Page order: method callout → document checklist → notes → **Costi** → prassi locali
- Add anchor link in page header ("Quanto costa") alongside existing "Prassi locali della tua Questura" link

### Visual presentation
- Card style (`.card`) matching the existing document notes cards
- Centered heading above the card with emoji: "💰 Quanto costa?"
- `bg-off-white` section background for visual separation
- Itemized list inside the card, prominent bold total at bottom

### Primo vs Rinnovo handling
- Costs may differ between primo and rinnovo — check Notion columns for each (they have separate column sets)
- Same section design for both templates (documents-primo.liquid and documents-rinnovo.liquid)
- Kit postale 30€ only appears when the method is Kit (already detected per-template via `doc.method`)

### Claude's Discretion
- Exact Notion column names for cost fields (discover during research)
- CSS styling details for the cost list and total
- How-to text wording for each payment method
- Whether to use an existing CSS file or add minimal styles inline

</decisions>

<specifics>
## Specific Ideas

- Cost items as a clear list with amounts right-aligned or inline
- Total styled prominently (large, bold) so it's immediately scannable
- Kit postale line only conditionally shown based on method — same conditional logic already used for the method callout at top of page

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 44-costi-section*
*Context gathered: 2026-02-16*
