# Phase 42: Build Pipeline - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Unify the build command, add Notion webhook rebuild triggers, clean up obsolete scripts, configure Netlify deployment, and generate a content audit list for downstream cleanup phases. Does NOT include actually fixing Notion content or restructuring the database.

</domain>

<decisions>
## Implementation Decisions

### Webhook rebuild triggers
- Notion webhook triggers Netlify rebuild for content databases only (Documenti Questura + Database permessi)
- Prassi Locali has its own webhook already — excluded from rebuild trigger
- 30-minute debounce window: rebuild triggers 30 min after last Notion edit (user makes batch edits)
- Manual "rebuild now" trigger also available (Netlify deploy hook URL)

### Old script cleanup
- Verify `scripts/templates/helpers.js` cross-references before removing anything — 11ty config may import filters from it
- Remove replaced-by-11ty scripts: `build-documents.js`, `build-permits.js`, `templates/` dir, `notion-client.js`, `manifest.json`, `slug-map.json`
- Keep translation scripts: `translate-batch.js`, `translation-memory.js`, `translation-glossary.json`, etc.
- Keep `build-sitemap.js` (still used)
- One-time migration scripts: Claude decides what's safe to remove

### Build command
- Claude decides whether `npm run build` should become just `npx @11ty/eleventy` or keep two steps
- Update `package.json` scripts to remove `build:docs` if no longer needed
- Ensure `npm run build` still works end-to-end on Netlify

### Build configuration
- Check whether NOTION_API_KEY is already set in Netlify — add if not
- Claude decides whether `.env.example` is worth creating
- No rate limit concerns currently — build works fine
- Build time measurement not needed — already under target

### Content audit list
- Generate an audit of Notion database entries that need cleanup
- Flag + suggest fixes for: missing capitalization, overly synthetic text, unclear wording
- Scope: all user-facing fields (document names, permit names, notes — whatever appears on pages)
- Output: a list file (in .planning/) that Phase 43/45 can act on
- Actual Notion edits and database restructuring deferred to Phase 43 (Populate Blank Permits) and Phase 45 (Content Validation)

### Claude's Discretion
- Cleanup aggressiveness for one-time migration scripts
- Build command structure (single step vs two steps)
- `.env.example` creation
- Debounce implementation approach (Netlify Function state, external service, etc.)

</decisions>

<specifics>
## Specific Ideas

- User wants Notion database to mirror website structure as closely as possible — parent/child disambiguation for permits like Studio (lavoro subordinato/autonomo/flussi) should be flagged in audit
- Checklist document names from Notion multi_select values are sometimes too synthetic — flag these
- Audit should cover both the "Documenti Questura" DB and the "Database permessi" DB

</specifics>

<deferred>
## Deferred Ideas

- Actually fixing Notion content based on audit — Phase 43 (Populate Blank Permits) or Phase 45 (Content Validation)
- Database structure disambiguation (parent pages, variant cleanup) — Phase 45 (Content Validation)
- Auto-format safeguards in templates as fallback — not decided, could be added later

</deferred>

---

*Phase: 42-build-pipeline*
*Context gathered: 2026-02-14*
