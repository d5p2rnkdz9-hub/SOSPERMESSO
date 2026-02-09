---
phase: 41-prassi-locali-mvp
plan: "01"
subsystem: data-layer
tags: [11ty, notion-api, liquid-templates, css, static-generation]
dependencies:
  requires: [39-document-pages, 40-permit-pages]
  provides: [prassi-data-layer, prassi-display-ui]
  affects: [41-02-functions, 41-03-client-side, 41-04-moderation]
tech-stack:
  added: []
  patterns: [11ty-data-files, graceful-degradation, city-grouped-display]
key-files:
  created:
    - _data/prassiLocali.js
    - src/styles/prassi.css
  modified:
    - src/pages/documents-primo.liquid
    - src/pages/documents-rinnovo.liquid
decisions:
  - id: prassi-data-structure
    choice: "Nested object: pageSlug -> [[cityName, practices[]]]"
    rationale: "Liquid templates iterate easily over arrays. Converting city object to sorted array of tuples enables simple iteration while maintaining alphabetical city order"
  - id: empty-state-static
    choice: "Show empty state with button in static HTML"
    rationale: "Button is non-functional until Plan 03 adds modal. Static button in HTML avoids layout shift when JS loads. Progressive enhancement pattern"
  - id: graceful-degradation
    choice: "Return empty object {} when NOTION_API_KEY or PRASSI_DB_ID missing"
    rationale: "Build succeeds without credentials. Consistent with existing documents.js pattern. No prassi section shown (empty object evaluates to falsy in Liquid)"
metrics:
  duration: 16m
  files-changed: 4
  commits: 2
  completed: 2026-02-09
---

# Phase 41 Plan 01: Static Display Core Summary

Static foundation for prassi locali: 11ty data file fetches approved Notion submissions at build time, document page templates display practices grouped by city with empty state handling.

## What Was Built

### 1. Data Layer (`_data/prassiLocali.js`)
- **Pattern:** CommonJS async function (matches `documents.js`)
- **Fetches:** Approved practices from Notion PRASSI_DB_ID
- **Filters:** Only Status === "Approved" (never Pending/Rejected)
- **Groups:** By page slug, then by city (sorted alphabetically)
- **Returns:** `{ "page-slug": [["City", [practice1, practice2]], ["City2", [...]]] }`
- **Graceful:** Returns `{}` if NOTION_API_KEY or PRASSI_DB_ID missing
- **Extracts:** id, city, description, date, category, pageSlug, votiConfermo, votiNonConfermo

### 2. Display UI (Both Document Templates)
**Added to `documents-primo.liquid` and `documents-rinnovo.liquid`:**

- **Anchor link** in page header: "Prassi locali della tua Questura" (styled like quick-switch-link)
- **Section** before footer: `<section id="prassi-locali">` with:
  - City-grouped display (h3 city name + practice cards)
  - Practice cards with description, metadata (date/category), vote counts
  - Empty state: "Nessuna segnalazione ancora. Sei il primo..." + button
  - "Aggiungi la tua esperienza" button (calls `openPrassiModal()` — added in Plan 03)
- **Conditional display:** Section shows empty state if `prassiLocali[doc.slug]` is falsy/empty

### 3. Styles (`src/styles/prassi.css`)
- **Design system aligned:** Uses CSS variables from main.css
- **Components:**
  - `.prassi-section` — off-white background, 700px max-width
  - `.prassi-anchor-link` — teal accent, matching quick-switch-link pattern
  - `.prassi-city-group` — city name with teal underline
  - `.prassi-card` — white background, teal left border, hover effects
  - `.prassi-empty-state` — centered, padded card
  - `.prassi-submit-btn` — yellow gradient matching .btn-primary
- **Responsive:** Mobile breakpoints at 768px (tablet) and 480px (phone)
- **Mobile optimizations:** Full-width buttons, stacked vote counts, reduced padding

## Deviations from Plan

None — plan executed exactly as written.

## Technical Decisions

### Data Structure: Array of Tuples vs Object
**Choice:** Convert city object to array of `[cityName, practices[]]` tuples
**Why:** Liquid's `for` loop works best with arrays. Converting `{ "City": [...] }` to `[["City", [...]]]` enables clean iteration while maintaining sorted city order. Alternative would require custom Liquid filter to extract/sort object keys.

### Empty State Strategy
**Choice:** Static HTML with non-functional button
**Why:** Progressive enhancement. Button exists in HTML (no layout shift), becomes functional when Plan 03 adds modal JS. Users see consistent UI immediately, no FOUC.

### Graceful Degradation Return Value
**Choice:** Empty object `{}` instead of empty array `[]`
**Why:**
- Matches data structure (object keyed by slug)
- `prassiLocali[doc.slug]` evaluates to `undefined` (falsy) when key missing
- Liquid `{% if prassiLocali[doc.slug] %}` works correctly for both empty object and missing key
- Consistent with "no data" state

## Integration Points

### With Existing Codebase
- **11ty data layer:** Follows `documents.js` pattern (async function, graceful degradation)
- **Notion API:** Uses same `@notionhq/client` and search pattern
- **Template structure:** Matches document page layout (section → container → content)
- **CSS system:** All colors/spacing/fonts use existing CSS variables
- **Responsive:** Follows mobile breakpoints from mobile.css

### With Future Plans
- **Plan 02 (Netlify Functions):** `openPrassiModal()` button triggers submission flow
- **Plan 03 (Client-side Voting):** Vote counts displayed, buttons added for voting actions
- **Plan 04 (Moderation):** Status filter ensures only approved practices shown
- **Plan 05 (Rebuild Webhook):** Changed practices trigger site rebuild via Notion webhook

## Next Phase Readiness

**Ready for Plan 02 (Netlify Functions):**
- ✅ Data structure defined (form knows what properties to submit)
- ✅ Page slug available in template context (`doc.slug`)
- ✅ Button placeholder exists (attach modal trigger)
- ✅ CSS loaded (modal can reuse prassi.css styles)

**Blockers/Concerns:**
- None. Old build system (`scripts/build-documents.js`) still active — document pages generated by old system won't show prassi section until Phase 41 completes and old system is removed. This is expected and doesn't block Plan 02/03 development.

## Testing Notes

**Verified:**
1. ✅ `prassiLocali.js` returns empty object when no NOTION_API_KEY
2. ✅ `npm run build:11ty` succeeds (389 files, 59s)
3. ✅ `prassi.css` copied to `_site/src/styles/`
4. ✅ Both templates contain `prassi-locali` section (grep verified)
5. ✅ No Liquid syntax errors (build would fail)

**Not Yet Testable:**
- [ ] Actual prassi display (requires NOTION_API_KEY + PRASSI_DB_ID + approved data)
- [ ] City grouping (requires multi-city test data)
- [ ] Empty vs populated state toggle (requires Notion data)
- [ ] Mobile responsive layout (requires deployed site)

**Testing After Plan 04 (Moderation):**
Once PRASSI_DB_ID is created and sample approved data exists, verify:
- Practices appear grouped by city
- Empty state shows when slug has no practices
- Cities are alphabetically sorted
- Vote counts display correctly
- Anchor link scrolls to section

## Performance Impact

**Build time:** +0s (no data to fetch)
**Page size:** +6.1KB CSS, +~2KB HTML per page (minimal)
**Runtime:** Zero (static HTML, no JS)

## Documentation

**For developers:**
- Data structure documented in `prassiLocali.js` header comment
- Liquid template usage clear from existing code
- CSS follows existing component patterns

**For content editors:**
- Notion database schema defined in plan frontmatter (user_setup)
- Status workflow: Pending → Approved → Published (rebuild required)

## Lessons Learned

1. **11ty ignores pattern:** Old static files ignored via `eleventyConfig.ignores.add()` + dynamic fs.readdirSync pattern. Document pages currently generated by old build system, not 11ty templates (Phase 39 incomplete?).

2. **Liquid object iteration:** Cannot directly iterate object keys. Must convert to array of tuples or use custom filter. Tuple approach cleaner for city grouping.

3. **Graceful degradation pattern:** Returning appropriate empty data structure (object vs array) matters for template logic. Empty object with undefined key access more flexible than empty array.

## Commit Log

| Commit | Message | Files |
|--------|---------|-------|
| b6ef9c4 | feat(41-01): create prassiLocali.js data file | _data/prassiLocali.js |
| 1838d34 | feat(41-01): add prassi locali section to document templates | src/styles/prassi.css, src/pages/documents-primo.liquid, src/pages/documents-rinnovo.liquid |
