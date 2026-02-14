# Phase 43: Populate Blank Permits - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Populate all permit pages that lack Q&A content. Two-step process: (1) backfill existing HTML content into Notion pages where old website pages have richer info than Notion, (2) generate Q&A narrative from database column values for truly blank permits. All ~38 permits in the Notion database should have complete Q&A page blocks when this phase is done.

</domain>

<decisions>
## Implementation Decisions

### Content creation method
- Content is NOT written from scratch — the Notion database already has structured column data for all permits
- **Step 1 (Backfill):** For permits where old HTML pages have richer content than Notion page blocks, paste/transfer that content into Notion as page blocks
- **Step 2 (Generate):** For truly blank permits, transform database column values (Posso lavorare?, Quanto dura?, Doc primo rilascio, etc.) + NOTES column into narrative Q&A blocks
- Content sources: **Columns + NOTES only** — no external research. Strictly use what the Notion database provides
- Write Q&A as Notion page blocks (headings + paragraphs) directly on each permit's page via API
- Review process: Write all permits, build, user spot-checks the generated website pages

### Content depth & tone
- Match the tone of the "Attesa occupazione (art.22)" permit page — conversational, direct "tu" address, simple accessible language
- Researcher should study the existing Attesa occupazione page in Notion (ID: `2f67355e-7f7f-813a-83f3-d5f229f0ba8c`) as the reference model
- Standard Q&A sections: Cos'e, Chi puo chiederlo, Come/dove si chiede, Che diritti mi da, Quanto dura, Rinnovo, Conversione (+ any additional from NOTES)
- Document lists from "documenti in questura" Notion data should become easy checklists

### Duplicate & unknown cleanup
- **Duplicates** (Residenza elettiva x2, Motivi religiosi x2): Merge into one page each, keeping the best/most complete version
- **Unknown entries** (2 blank "New page" rows with no Nome permesso): These exist in the raw database but are hidden by view filters. Build system already skips them (no `tipo` defined). Flag but don't block on them
- Exact count of permits needing content must be freshly verified during research — the old count of 17 is outdated

### Batch strategy
- Process by Macrocategoria (category), not all at once
- **Order:** Protezione first, then remaining categories
- **Checkpoint between batches:** After each category is written to Notion, trigger a build so user can spot-check before moving to next category
- Categories from Notion: protezione, lavoro, cure mediche, motivi familiari, altro

### Claude's Discretion
- Exact Q&A section count per permit (7 standard + extras as NOTES dictate)
- How to handle backfill when HTML and Notion have partial overlap
- Whether to process categories in a specific sub-order after protezione

</decisions>

<specifics>
## Specific Ideas

- "Attesa occupazione (art.22)" is the gold standard page for tone and format — study it carefully
- The Notion database columns map to Q&A sections: `Posso lavorare?` -> "Che diritti mi da?", `Quanto dura?` -> "Quanto dura?", `Doc primo rilascio` -> document checklist, `posso convertire?` -> "Posso convertirlo?", etc.
- The NOTES column ("NOTE - discrepanze normative o tra siti") contains additional context that should inform the narrative
- Old HTML permit pages live in `src/pages/permesso-*.html` and `_site/permesso-*.html` — these may have content not yet in Notion

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 43-populate-blank-permits*
*Context gathered: 2026-02-14*
