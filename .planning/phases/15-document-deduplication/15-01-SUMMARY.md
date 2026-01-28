---
phase: 15-document-deduplication
plan: 01
subsystem: content-structure
completed: 2026-01-28
duration: 62 seconds
tags: [html, cta-pattern, deduplication, template]

requires:
  - v1.1 document pages (documenti-studio-*.html)

provides:
  - CTA button pattern for permit pages
  - Template permit page (permesso-studio.html)

affects:
  - 15-02 (will propagate this pattern to 21 permit pages)

tech-stack:
  added: []
  patterns:
    - "CTA button section between page header and content"
    - "Primary/secondary button pairing for document links"

key-files:
  created: []
  modified:
    - src/pages/permesso-studio.html

decisions:
  - id: cta-placement
    what: "CTA buttons placed immediately after page header, before content sections"
    why: "High visibility, clear call-to-action before user reads detailed content"
    alternatives: ["End of page", "Floating sidebar"]

  - id: button-hierarchy
    what: "Primary button for primo rilascio, secondary for rinnovo"
    why: "Primo rilascio is typically the first action users need"

  - id: section-removal
    what: "Removed both Documenti - Primo Rilascio and Documenti - Rinnovo card sections"
    why: "Eliminate duplication, centralize document info in dedicated pages"
---

# Phase 15 Plan 01: CTA Pattern Template

**One-liner:** Established CTA button pattern in permesso-studio.html linking to dedicated document pages, removing inline document sections

## What Was Built

Created the template CTA button pattern for permit pages:

1. **CTA Button Section** - Added after page header with:
   - Flexbox layout with gap and center alignment
   - Primary button: "Documenti per il primo rilascio" → documenti-studio-primo.html
   - Secondary button: "Documenti per il rinnovo" → documenti-studio-rinnovo.html
   - Mobile-responsive with flex-wrap

2. **Document Section Removal** - Removed duplicate content:
   - Deleted "📄 Documenti - Primo Rilascio" card (27 lines)
   - Deleted "🔄 Documenti - Rinnovo" card (21 lines)
   - Preserved all other content sections

3. **Template Validation** - Verified links work:
   - documenti-studio-primo.html redirects to documenti-studio-art-39-primo.html
   - documenti-studio-rinnovo.html redirects to documenti-studio-art-39-rinnovo.html
   - Target pages exist with full document content

## CTA Button Pattern (For Plan 02 Propagation)

### Exact HTML Structure

```html
  <!-- DOCUMENT CTA -->
  <section class="section" style="padding: 1.5rem 0;">
    <div class="container" style="max-width: 900px;">
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
        <a href="documenti-{permit-slug}-primo.html" class="btn btn-primary btn-lg">
          Documenti per il primo rilascio
        </a>
        <a href="documenti-{permit-slug}-rinnovo.html" class="btn btn-secondary btn-lg">
          Documenti per il rinnovo
        </a>
      </div>
    </div>
  </section>
```

### Placement Rules

- **Insert after:** `</section>` closing the PAGE HEADER section
- **Insert before:** `<!-- CONTENT -->` comment
- **Line reference:** In permesso-studio.html, inserted after line 113

### Button Classes

- **Primary button:** `btn btn-primary btn-lg` (yellow gradient)
- **Secondary button:** `btn btn-secondary btn-lg` (red gradient)
- Both use existing CSS from components.css

## Document Section Removal Patterns

### Pattern 1: Primo Rilascio Card

**Header patterns to match:**
- `<h2>📄 Documenti - Primo Rilascio</h2>`
- Variations may include: "Documenti per il primo rilascio", "Documenti - Primo Permesso"

**Structure:**
```html
      <!-- Documenti Primo Rilascio -->
      <div class="card" style="margin-bottom: 2rem;">
        <h2>📄 Documenti - Primo Rilascio</h2>
        ...
      </div>
```

### Pattern 2: Rinnovo Card

**Header patterns to match:**
- `<h2>🔄 Documenti - Rinnovo</h2>`
- Variations may include: "Documenti per il rinnovo"

**Structure:**
```html
      <!-- Documenti Rinnovo -->
      <div class="card" style="margin-bottom: 2rem;">
        <h2>🔄 Documenti - Rinnovo</h2>
        ...
      </div>
```

### Removal Strategy

1. **Identify boundaries:** Look for `<!-- Documenti` comment or `<div class="card">` with document h2
2. **Match closing tag:** Find corresponding `</div>` that closes the card
3. **Preserve surrounding content:** Do NOT remove adjacent cards (Requisiti, Lavoro, etc.)
4. **Clean whitespace:** Keep consistent spacing between remaining cards

## Edge Cases Discovered

### 1. Redirect Pages

- Document pages like `documenti-studio-primo.html` are redirect stubs
- They redirect to full pages like `documenti-studio-art-39-primo.html`
- This allows for simpler, more readable URLs in CTA buttons
- Pattern works: user clicks button → redirect stub → full document page

### 2. Content Card Preservation

Cards to **KEEP** (do not remove):
- 📝 Cos'è
- ⏱️ Durata
- ✅ Requisiti
- 💼 Si può lavorare?
- 🔀 Conversione
- 💰 Costi
- 💡 Aspetti pratici (if present)
- ❓ CTA alert ("Scrivici" button)

Only remove cards with headers containing "Documenti" + "Primo Rilascio" or "Rinnovo"

### 3. Permit-Specific Variations

Some permits may have:
- Only primo rilascio (no rinnovo option)
- Different document category names
- Additional document sections (e.g., "Conversione documenti")

**For Plan 02:** Manual verification needed for permits with special cases

## Deviations from Plan

None - plan executed exactly as written.

## Files Changed

**Modified:**
- `src/pages/permesso-studio.html` (commit 3c082b7)
  - Added CTA button section (14 lines)
  - Removed primo rilascio card section (27 lines)
  - Removed rinnovo card section (21 lines)
  - Net change: -36 lines (cleaner, more maintainable)

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1-2 | 3c082b7 | feat(15-01): add CTA buttons and remove inline document sections |

## Verification Results

### CTA Button Display ✓

- Section visible after page header
- Two buttons displayed side-by-side (desktop) or stacked (mobile)
- Proper spacing with flex gap
- Centered alignment

### Link Functionality ✓

- `documenti-studio-primo.html` exists and redirects correctly
- `documenti-studio-rinnovo.html` exists and redirects correctly
- Final destination pages contain full document content
- No 404 errors

### Content Integrity ✓

- All non-document cards preserved
- No orphaned HTML elements
- Page structure maintained
- Related links section intact
- Footer intact

## Next Phase Readiness

**For 15-02 (Propagation to 21 Permit Pages):**

✅ **Ready to proceed** with:
1. Exact CTA HTML pattern documented above
2. Document section removal patterns identified
3. Edge cases catalogued
4. Template validated in permesso-studio.html

**Considerations for propagation:**
1. **Permit slug mapping:** Need to map each permit to its document page slugs
   - Example: permesso-lavoro-subordinato.html → documenti-lavoro-subordinato-primo.html
2. **Document page existence:** Verify document pages exist before adding CTA
3. **Special cases:** Some permits may not have both primo/rinnovo (e.g., asylum may only have primo)
4. **Button text:** Confirm text is same across all permits or needs localization

**No blockers identified.**

## Performance Impact

- **Page size reduction:** ~48 lines removed per permit page
- **User experience:** Clearer navigation, less scrolling, dedicated document pages
- **Maintainability:** Document info now in 1 place instead of duplicated across 21+ pages
- **SEO:** Each document type now has dedicated URL (better for search indexing)

## Lessons Learned

1. **Redirect stubs work well:** Simple redirect pages allow for clean URLs without complex routing
2. **CTA placement matters:** Putting buttons early (after header) ensures users see them before scrolling
3. **Visual hierarchy:** Primary/secondary button distinction helps guide user action
4. **Template-first approach:** Establishing pattern in one page first makes propagation clearer

## Testing Notes

Verified in permesso-studio.html:
- ✓ CTA section displays correctly
- ✓ Buttons have proper styling (gradient, hover effects)
- ✓ Links navigate to correct pages
- ✓ Redirects work to final document pages
- ✓ No console errors
- ✓ Mobile responsive (buttons stack on narrow screens)

Ready for propagation to remaining 20 permit pages.
