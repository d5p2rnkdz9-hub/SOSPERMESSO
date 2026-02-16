# Phase 45: Content Validation - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Review pass on all generated content (permit pages + document pages) for accuracy and completeness. Validate that Notion page content (Q&A blocks) accurately reflects the permit database columns. Add missing info, fix rule violations, flag conflicts. Never delete existing content.

</domain>

<decisions>
## Implementation Decisions

### Validation criteria
- **Source of truth:** Permit database columns are the single source of truth
- **Notion content is vetted:** Treat existing Notion page content as correct unless it conflicts with DB columns
- **Key columns to validate:** Doc primo rilascio, Doc rinnovo, Info extra su doc rilascio/rinnovo, Mod primo rilascio, Mod rinnovo, Quanto dura?, Posso lavorare?
- **Phase 43 content rules checked across ALL pages:** No doc lists in Q&A (link to doc pages instead), bollettino includes 40EUR (never list separately), full URLs for links, "tu" tone
- **Cost validation skipped:** Phase 44 was already verified
- **Scope:** Both permit pages (Q&A content) and document pages — once rebuilt, document Notion pages should be mirrored in the Q&A that populates permit pages

### Review process
- **Process:** Claude reviews Notion page content against DB columns, one permit at a time
- **Missing info:** Claude adds it directly to Notion page blocks (following existing tone/format) AND logs what was added in the report
- **Never delete:** Do not remove any section or info from Notion pages
- **Report location:** `.planning/phases/45-content-validation/VALIDATION-REPORT.md` listing every change per permit
- **Rebuild:** One rebuild at the end after all Notion edits, then batch verify HTML output

### Issue handling
- **Conflicts (DB says X, Q&A says Y):** Log in report and continue — user reviews all conflicts at the end
- **Phase 43 rule violations:** Fix directly (they're clear-cut) and log what was changed
- **Placeholder pages ("Contenuto in arrivo"):** Flag in final report; write "pagina in arrivo" as content
- **Sparse DB data:** Validate whatever columns have data, flag missing columns in report

### Acceptance threshold
- **Phase done when:** User reviews VALIDATION-REPORT.md and explicitly signs off
- **Spot-check:** User will pick a few permits to check visually in the browser before approving
- **Unresolved conflicts:** User decides per conflict (resolve now vs defer)

### Claude's Discretion
- Order of permit processing (no batching by category required)
- Report format and detail level
- Which permits to suggest for spot-checking (based on volume of changes)

</decisions>

<specifics>
## Specific Ideas

- "DO NOT DELETE any section or info; just check the content against Notion DB columns and add anything that is missing"
- "Flag with me any conflicting info before changing"
- "Once rebuilt, the document Notion pages should be mirrored in the Q&A that populate permit pages"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 45-content-validation*
*Context gathered: 2026-02-16*
