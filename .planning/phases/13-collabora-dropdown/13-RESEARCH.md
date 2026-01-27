# Phase 13: Collabora Dropdown - Research

**Researched:** 2026-01-27
**Domain:** Navigation dropdown implementation (building on Phase 11 patterns)
**Confidence:** HIGH

## Summary

Phase 13 is a straightforward application of existing patterns from Phase 11 (dropdown navigation). The codebase already has a fully functional dropdown system with CSS :hover + :focus-within for desktop and flat lists for mobile. This phase replaces the existing "Il progetto" nav item (a simple link) with a "Collabora" dropdown containing three items, and cleans up a broken Typeform URL.

The primary challenge is scope control: changes need to be propagated to 97+ HTML files that all have the same header structure. Additionally, the cleanup requirement (CLEAN-01) targets a broken URL that primarily exists in documentation/planning files rather than live code.

**Primary recommendation:** Convert "Il progetto" nav item to "Collabora" dropdown using the exact same pattern as existing "Database", "Guide", and "Test" dropdowns. No new CSS or JavaScript needed - reuse existing `.has-dropdown`, `.nav-dropdown`, and `.dropdown-link` classes.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Pure CSS | CSS3 | Dropdown mechanics | Already implemented in components.css (lines 563-639) |
| HTML5 | - | Semantic markup | Existing pattern with ARIA attributes in place |
| Existing app.js | - | ARIA state management | Already handles dropdown aria-expanded updates |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Existing mobile.css | - | Mobile flat list | Already converts dropdowns to flat lists (lines 143-176) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Reusing existing pattern | Build new component | No benefit; existing pattern is proven and consistent |

**Installation:**
```bash
# No installation required - all patterns already exist in codebase
```

## Architecture Patterns

### Recommended Project Structure
No structural changes needed. Existing files to modify:

```
src/
├── pages/
│   └── *.html (97+ files)  # All need header nav updated
├── styles/
│   └── components.css       # No changes needed - styles exist
└── scripts/
    └── app.js               # No changes needed - ARIA handling exists
```

### Pattern 1: Dropdown Navigation Item (Existing Pattern)
**What:** Convert simple nav-item to has-dropdown with nested ul
**When to use:** When a nav item needs to expand to show sub-links
**Example:**
```html
<!-- BEFORE: Simple link (current "Il progetto") -->
<li class="nav-item"><a href="chi-siamo.html" class="nav-link">Il progetto</a></li>

<!-- AFTER: Collabora dropdown (following existing pattern) -->
<li class="nav-item has-dropdown">
  <a href="#collabora" class="nav-link" aria-haspopup="true" aria-expanded="false">Collabora</a>
  <ul class="nav-dropdown" role="menu">
    <li role="none"><a href="https://form.typeform.com/to/FsqvzdXI" class="dropdown-link" role="menuitem" target="_blank">Segnala un errore</a></li>
    <li role="none"><a href="https://form.typeform.com/to/USx16QN3" class="dropdown-link" role="menuitem" target="_blank">Dai una mano</a></li>
    <li role="none"><a href="chi-siamo.html" class="dropdown-link" role="menuitem">Il progetto</a></li>
  </ul>
</li>
```
**Source:** Existing codebase pattern from src/pages/index.html lines 46-74

### Pattern 2: Dropdown Trigger (Non-Navigating)
**What:** Parent link serves as dropdown trigger only, not a navigation target
**When to use:** When the parent item is purely a category label
**Example:**
```html
<!-- href="#collabora" is an anchor that doesn't exist -->
<!-- This makes the link non-functional as navigation -->
<!-- Alternative: href="javascript:void(0)" or role="button" -->
<a href="#collabora" class="nav-link" aria-haspopup="true" aria-expanded="false">Collabora</a>
```
**Note:** The existing "Database", "Guide", and "Test" dropdowns use `href="#database"`, `href="#guide"`, `href="#test"` respectively - anchors that don't exist on most pages, making them effectively non-navigating.

### Pattern 3: External Links in Dropdown
**What:** Typeform links open in new tab
**When to use:** External URLs that should not leave the current page
**Example:**
```html
<li role="none">
  <a href="https://form.typeform.com/to/FsqvzdXI"
     class="dropdown-link"
     role="menuitem"
     target="_blank">Segnala un errore</a>
</li>
```
**Note:** Existing Test dropdown already uses `target="_blank"` for Typeform links (lines 68-69 in index.html)

### Anti-Patterns to Avoid
- **Adding new CSS classes:** Use existing `.has-dropdown`, `.nav-dropdown`, `.dropdown-link` - no new styles needed
- **Custom JavaScript for this dropdown:** The existing ARIA management in app.js handles all `.has-dropdown` elements automatically
- **Changing mobile behavior:** Mobile flat list already handles all dropdowns via CSS (mobile.css lines 143-176)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown styles | New CSS classes | Existing `.nav-dropdown`, `.dropdown-link` | Consistency with Database/Guide/Test dropdowns |
| Hover behavior | New JavaScript | Existing CSS :hover + :focus-within | Already works in components.css |
| ARIA states | New handlers | Existing app.js initDropdownAria() | Function already selects all `.has-dropdown` elements |
| Mobile behavior | New CSS rules | Existing mobile.css rules | Flat list conversion already handles all dropdowns |

**Key insight:** This phase requires ZERO new CSS or JavaScript. The only work is HTML changes across all page files.

## Common Pitfalls

### Pitfall 1: Forgetting ARIA Attributes
**What goes wrong:** Dropdown works visually but fails accessibility
**Why it happens:** Copy-pasting without including aria-haspopup and aria-expanded
**How to avoid:** Copy exact pattern from existing dropdowns including all attributes
**Warning signs:** Screen reader testing shows dropdown not announced properly

### Pitfall 2: Missing target="_blank" on External Links
**What goes wrong:** User navigates away from site when clicking Typeform links
**Why it happens:** Forgetting to add target="_blank" for external URLs
**How to avoid:** Match existing Test dropdown pattern (lines 68-69 of index.html)
**Warning signs:** Clicking "Segnala un errore" or "Dai una mano" leaves the site

### Pitfall 3: Incomplete Propagation
**What goes wrong:** Some pages have old "Il progetto" link, some have new "Collabora" dropdown
**Why it happens:** 97+ files need updating; easy to miss some
**How to avoid:** Use grep to verify no "Il progetto" nav-link remains after changes
**Warning signs:** Users see inconsistent navigation across different pages

### Pitfall 4: Broken URL Cleanup Incomplete
**What goes wrong:** sospermesso.typeform.com/contatti URL still appears in codebase
**Why it happens:** URL exists in documentation/planning files, not just source code
**How to avoid:**
- Check src/pages/*.html (main source)
- Check .planning/*.md files (documentation)
- Check claude.md (project docs)
- Note: RTF files in copy.rtfd folders can be deleted (backup artifacts)
**Warning signs:** Grep still finds the broken URL

### Pitfall 5: Order of Dropdown Items
**What goes wrong:** Items appear in wrong order, confusing users
**Why it happens:** Incorrect order in HTML
**How to avoid:** Follow requirement order:
  1. "Segnala un errore" (error reporting - most actionable)
  2. "Dai una mano" (contribute)
  3. "Il progetto" (about - least urgent)
**Warning signs:** Items don't match REQUIREMENTS.md specification

## Code Examples

### Complete Collabora Dropdown HTML
```html
<!-- Collabora dropdown - replaces "Il progetto" simple link -->
<li class="nav-item has-dropdown">
  <a href="#collabora" class="nav-link" aria-haspopup="true" aria-expanded="false">Collabora</a>
  <ul class="nav-dropdown" role="menu">
    <li role="none"><a href="https://form.typeform.com/to/FsqvzdXI" class="dropdown-link" role="menuitem" target="_blank">Segnala un errore</a></li>
    <li role="none"><a href="https://form.typeform.com/to/USx16QN3" class="dropdown-link" role="menuitem" target="_blank">Dai una mano</a></li>
    <li role="none"><a href="chi-siamo.html" class="dropdown-link" role="menuitem">Il progetto</a></li>
  </ul>
</li>
```
**Source:** Pattern from existing Database dropdown (index.html lines 46-52)

### Verification Commands
```bash
# Verify no "Il progetto" nav-link remains (should return 0 matches in src/pages)
grep -r "Il progetto.*nav-link\|nav-link.*Il progetto" src/pages/

# Verify Collabora dropdown exists in all pages
grep -r "Collabora" src/pages/ | wc -l
# Should match total page count (97+)

# Verify broken URL removed from source
grep -r "sospermesso.typeform.com/contatti" src/
# Should return only the RTF backup file (can be deleted)

# Verify new Typeform URLs present
grep -r "form.typeform.com/to/FsqvzdXI" src/pages/ | wc -l
grep -r "form.typeform.com/to/USx16QN3" src/pages/ | wc -l
# Both should match total page count
```

### Mobile Appearance (Automatic via Existing CSS)
On mobile (<=768px), the Collabora dropdown will automatically appear as:
```
Collabora (nav-link, no arrow)
  -> Segnala un errore
  -> Dai una mano
  -> Il progetto
```
This is handled by existing mobile.css (lines 143-176) which:
- Sets `.nav-dropdown { position: static; opacity: 1; visibility: visible; }`
- Adds arrow prefix via `.dropdown-link::before { content: '\2192 '; }`
- Indents sub-items via `.dropdown-link { padding-left: 2rem; }`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| "Il progetto" direct link | "Collabora" dropdown | This phase | More discoverable error reporting and contribution options |
| sospermesso.typeform.com/contatti | form.typeform.com/to/* URLs | This phase | Working Typeform links with proper URL format |

**Deprecated/outdated:**
- **sospermesso.typeform.com/contatti**: This URL format is broken/invalid. New Typeform URLs use format `form.typeform.com/to/[form_id]`

## Open Questions

None. This phase is well-defined with:
1. Clear requirements (NAV-01 through NAV-05, CLEAN-01)
2. Existing implementation patterns to follow
3. Specific URLs provided for Typeform links
4. Clear success criteria

## Sources

### Primary (HIGH confidence)
- Existing codebase: src/pages/index.html (lines 46-74 - existing dropdown patterns)
- Existing codebase: src/styles/components.css (lines 563-639 - dropdown styles)
- Existing codebase: src/styles/mobile.css (lines 143-176 - mobile flat list)
- Existing codebase: src/scripts/app.js (lines 36-81 - ARIA management)
- Phase 11 Research: .planning/phases/11-dropdown-navigation/11-RESEARCH.md

### Secondary (MEDIUM confidence)
- REQUIREMENTS.md: NAV-01 through NAV-05, CLEAN-01 specifications
- ROADMAP.md: Phase 13 success criteria

### Tertiary (LOW confidence)
- None needed - this phase uses only existing patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All patterns already exist in codebase, no new technology
- Architecture: HIGH - Direct application of Phase 11 implementation
- Pitfalls: HIGH - Straightforward scope, main risk is incomplete propagation

**Research date:** 2026-01-27
**Valid until:** 2026-07-27 (6 months - stable patterns, changes only affect content not structure)

**Key implementation notes:**
1. No CSS changes needed
2. No JavaScript changes needed
3. HTML-only changes across 97+ files
4. Use exact pattern from existing Database/Guide/Test dropdowns
5. Typeform links: FsqvzdXI (error), USx16QN3 (contribute)
6. Keep "Il progetto" as dropdown item linking to chi-siamo.html
7. Cleanup CLEAN-01: broken URL primarily in docs, one RTF backup file in src

**Files requiring changes:**
- All files in src/pages/*.html (97+ files) - header nav update
- claude.md - update broken Typeform URL reference
- .planning/codebase/INTEGRATIONS.md - update Typeform URL documentation
- Optionally delete: src/pages/carta-soggiorno-familiare-italiano-dinamico copy.rtfd/ (backup artifact)
