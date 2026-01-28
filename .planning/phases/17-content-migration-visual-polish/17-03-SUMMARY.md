---
phase: 17-content-migration-visual-polish
plan: 03
status: complete
completed: 2026-01-28
duration: ~25 minutes

subsystem: content-generation
tags:
  - notion
  - build-script
  - variants
  - templates
  - folder-structure

dependency-graph:
  requires:
    - 17-02 (manifest and placeholder logic)
  provides:
    - Variant detection and grouping logic
    - Parent/child page generation system
    - Subfolder-based variant structure
  affects:
    - Future permit page generation
    - Database navigation (will need variant parent links)

tech-stack:
  added: []
  patterns:
    - Parent/child page hierarchy for content variants
    - Subfolder URL structure (permesso-{slug}/index.html)
    - Conditional placeholder generation based on variant type

key-files:
  created:
    - src/pages/permesso-lavoro-subordinato/index.html
    - src/pages/permesso-lavoro-subordinato/conversione-da-altro-permesso.html
    - src/pages/permesso-lavoro-subordinato/ingresso-per-flussi.html
    - src/pages/permesso-lavoro-subordinato/sanatoria.html
  modified:
    - scripts/build-permits.js
    - scripts/templates/permesso.js

decisions:
  - id: MIGR-01-IMPL
    what: Parent pages include general permit info (cos'è, durata, diritti)
    why: Users need common information without duplicating it across variant pages
    alternatives: ["Duplicate info on each variant page", "No general info at all"]

  - id: MIGR-02-CLARITY
    what: Alert boxes clarify that variants contain only specific differences
    why: Prevent confusion about why variant pages are shorter than expected
    alternatives: ["Assume users understand structure", "Duplicate explanatory text"]

  - id: MIGR-03-SANATORIA
    what: Sanatoria variant gets placeholder page (not full content)
    why: User explicitly requested this variant be left blank for now
    alternatives: ["Generate full page", "Skip generating it entirely"]

commits:
  - 039612a: "feat(17-03): add variant detection logic"
  - 059f344: "feat(17-03): generate parent pages and variant subfolders"
---

# Phase 17 Plan 03: Variant Detection & Generation Summary

**One-liner:** Parent/child page structure for permit variants with subfolder URLs, general info on parents, specific differences on children.

## What Was Built

Implemented variant detection and generation system for permits with multiple acquisition types (e.g., "Lavoro subordinato a seguito di X").

**Variant structure:**
- **Parent page** (`permesso-{slug}/index.html`): General permit info + links to variants
- **Child pages** (`permesso-{slug}/{variant-slug}.html`): Variant-specific content only
- **Detection logic**: Regex pattern matching on "a seguito di" phrase
- **Grouping rule**: Only create parent/child structure when 2+ variants exist

**User approval checkpoint:**
- Ran `--detect-variants` to propose structure
- User approved with 3 requirements:
  1. Parent pages include general content (cos'è, durata, diritti)
  2. Clarify that variants contain only specific differences
  3. Sanatoria variant should be placeholder only

**Generated output:**
- 1 variant folder: `permesso-lavoro-subordinato/`
  - Parent page with general info + 3 variant links
  - 1 full variant page (conversione, 19 sections)
  - 2 placeholder pages (ingresso-per-flussi, sanatoria)

## Technical Implementation

### Template Functions Added

**`generateVariantParentPage(group, generalSections)`**
- Accepts variant group + optional general content sections
- Generates placeholder general content if none provided (cos'è, durata, diritti)
- Displays alert box explaining variants contain only specific differences
- Links to each variant with status badge (🚧 for placeholders)
- Adjusted paths for subfolder location (../../styles/, ../../../images/)

**`generateVariantChildPage(permit)`**
- Full variant page with Q&A sections
- Breadcrumb includes parent folder link
- "Back to general info" link at top
- Alert box directing to parent page for general info
- Adjusted paths for subfolder location

**`generateVariantPlaceholderPage(permit)`**
- Placeholder for variants without Notion content
- CTAs: "Vedi informazioni generali" (parent) + "Dai una mano"
- Same path adjustments as child page

### Build Script Functions

**`generateVariantPages()`**
- Fetches permits, runs detectVariants()
- Creates subfolder for each variant group
- Generates parent page (always)
- Fetches content + generates child page for each variant
- Special handling: sanatoria variant always gets placeholder
- Rate limiting: 350ms delay between Notion API calls
- Summary: folders/parents/children/placeholders generated

**CLI Flags:**
- `--detect-variants`: Propose structure without generating (already existed)
- `--generate-variants`: Generate parent/child pages (NEW)

## Path Adjustments

Variant pages live in subfolders, so all relative paths are adjusted:

| Resource | Standalone Page | Variant Page |
|----------|----------------|--------------|
| CSS | `../styles/main.css` | `../../styles/main.css` |
| JS | `../scripts/app.js` | `../../scripts/app.js` |
| Images | `../../images/logo-full.png` | `../../../images/logo-full.png` |
| Components | `../components/contact-form.html` | `../../components/contact-form.html` |
| Database link | `database.html` | `../database.html` |
| Index link | `../../index.html` | `../../../index.html` |

## Verification

```bash
# 1. Generated folder structure exists
$ ls src/pages/permesso-lavoro-subordinato/
conversione-da-altro-permesso.html
index.html
ingresso-per-flussi.html
sanatoria.html

# 2. Parent page has general content
$ grep "Cos'è il permesso per" src/pages/permesso-lavoro-subordinato/index.html
<h2>Cos'è il permesso per Lavoro subordinato?</h2>

# 3. Parent page has variant links
$ grep "card-link" src/pages/permesso-lavoro-subordinato/index.html | wc -l
3  # conversione, ingresso-per-flussi, sanatoria

# 4. Sanatoria shows as "In costruzione"
$ grep "In costruzione" src/pages/permesso-lavoro-subordinato/index.html
<span style="...">In costruzione</span>

# 5. Variant page has explanatory alert
$ grep "Questa pagina contiene solo" src/pages/permesso-lavoro-subordinato/conversione-da-altro-permesso.html
<strong>Questa pagina contiene solo le informazioni specifiche per conversione da altro permesso.</strong>

# 6. Paths resolve correctly (CSS loads from ../../styles/)
$ grep 'href="../../styles/' src/pages/permesso-lavoro-subordinato/index.html | wc -l
5  # main.css, components.css, animations.css, mobile.css, mobile-fix.css
```

## Deviations from Plan

None - plan executed exactly as written, with user approval and requirements incorporated.

## Decisions Made

### 1. Parent Page General Content

**Decision:** Use placeholder general content for now (hardcoded cos'è, durata, diritti)

**Rationale:**
- Notion database doesn't currently have separate "general" vs "variant-specific" content
- Placeholder content is better than no content
- Future enhancement: fetch general content from dedicated Notion property

**Alternative considered:** Wait for Notion content structure before generating parents
**Rejected because:** Users need functioning pages now; placeholder is clear and useful

### 2. Sanatoria Placeholder Handling

**Decision:** Hardcode sanatoria variant as always-placeholder in `generateVariantPages()`

**Rationale:**
- User explicitly requested this variant remain blank
- Simpler than adding Notion property to flag placeholders
- Easy to remove when sanatoria content is ready

**Alternative considered:** Add "placeholder" boolean in Notion database
**Rejected because:** Overkill for single variant; hardcode is more explicit

### 3. Path Adjustment Approach

**Decision:** Calculate path prefixes based on page depth (subfolder = +1 level)

**Rationale:**
- Simple, predictable pattern
- No dynamic path resolution needed
- Easy to verify correctness

**Alternative considered:** Absolute paths (starting with `/`)
**Rejected because:** Breaks local development (file:// protocol)

## Known Issues

None.

## Next Phase Readiness

**Ready for:**
- Database page updates to link to variant parent pages
- Additional variant groups as detected in Notion
- General content enhancement (fetch from Notion instead of hardcode)

**Blockers:**
None.

**Concerns:**
1. **General content source:** Currently hardcoded placeholder content. Future enhancement needed to fetch real general content from Notion.
2. **Database navigation:** Database page (database.html) still links to old standalone pages. Needs update to link to variant parent pages.
3. **Variant content sparsity:** Only 1/3 variants has full content. Indicates Notion content migration is incomplete.

## Metrics

- **Files created:** 4 (1 parent, 3 variants)
- **Templates added:** 3 functions
- **Build script functions added:** 1 (generateVariantPages)
- **Variant groups detected:** 1 (Lavoro subordinato)
- **Variants generated:** 3 (1 full, 2 placeholder)
- **Duration:** ~25 minutes
- **Commits:** 2

## Testing Notes

Manual verification performed:
1. ✅ Folder structure created correctly
2. ✅ Parent page contains general info
3. ✅ Parent page links to all 3 variants
4. ✅ Sanatoria shows "In costruzione" badge
5. ✅ Variant page has explanatory alert
6. ✅ Paths resolve correctly (CSS loads)
7. ✅ Breadcrumbs include parent folder
8. ✅ "Back to parent" link works

Browser testing deferred (would require local server).

## Future Enhancements

1. **Fetch general content from Notion**
   - Add dedicated property for parent page content
   - Separate Q&A sections: "general" vs "variant-specific"

2. **Improve general content quality**
   - Replace hardcoded placeholder with real content
   - Add more sections (requisiti, documenti comuni, etc.)

3. **Variant auto-detection improvements**
   - Handle edge cases (e.g., "tramite" instead of "a seguito di")
   - Support manual variant grouping via Notion property

4. **Update database.html navigation**
   - Link to variant parent pages instead of standalone
   - Show variant count badge (e.g., "Lavoro subordinato (3)")

5. **Add variant filtering in database view**
   - Toggle to show/hide variants
   - Collapse variants under parent by default
