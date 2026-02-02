# Architecture Research: Homepage CSS Redesign

**Project:** SOS Permesso Homepage Redesign
**Researched:** 2026-02-02
**Scope:** CSS restructuring for homepage hero, header, and footer changes

## Executive Summary

The homepage CSS redesign can be accomplished by modifying existing CSS files rather than creating new ones. The project's CSS variable system makes color changes straightforward, and the established Node.js script patterns provide reliable header/footer propagation across 416 HTML files. Recommend: CSS-first approach (no HTML changes where possible), with scripted propagation if HTML structure changes are required.

## Current CSS Structure

The project uses a well-organized CSS architecture with variables and modular files:

```
src/styles/
  main.css         # CSS variables (:root), resets, typography, layout utilities
  components.css   # Header, footer, cards, buttons, navigation, hero
  animations.css   # Keyframe animations
  mobile.css       # Mobile breakpoints and responsive adjustments
  mobile-fix.css   # Critical mobile fixes (load order matters)
```

**Key observation:** The CSS already uses CSS variables extensively in `:root`, making color changes straightforward. The current palette includes:
- Primary: `--taxi-yellow` family (7 shades)
- Accent: teal, coral, orange, purple, pink, blue, green
- Neutrals: black, grays, white

**File load order in HTML:**
```html
<link rel="stylesheet" href="../styles/main.css">
<link rel="stylesheet" href="../styles/components.css">
<link rel="stylesheet" href="../styles/animations.css">
<link rel="stylesheet" href="../styles/mobile.css">
<link rel="stylesheet" href="../styles/mobile-fix.css">
```

## Page Count and Propagation Scope

| Location | Count | Notes |
|----------|-------|-------|
| `/index.html` | 1 | Homepage (root) |
| `/src/pages/*.html` | 206 | Italian pages |
| `/en/index.html` | 1 | English homepage |
| `/en/src/pages/*.html` | ~208 | English pages |
| **Total** | ~416 | Need header/footer propagation |

## CSS File Strategy

### Recommendation: Modify Existing Files

**Do NOT create new CSS files.** The current structure is sufficient:

1. **Color changes:** Update `:root` variables in `main.css`
   - Shift from teal/coral to white/black/yellow
   - All existing components automatically inherit

2. **Header redesign:** Update `.header`, `.navbar`, `.nav-*` classes in `components.css`
   - Current header: white background, teal accents, 180px logo
   - New header: cleaner, more minimal

3. **Footer redesign:** Update `.footer`, `.footer-*` classes in `components.css`
   - Current: yellow background, centered links
   - New: updated style

4. **Homepage hero:** Update `.hero-new`, `.hero-*` classes in `components.css`
   - Current: yellow gradient background, floating decorations
   - New: new layout, typography

5. **Mobile adjustments:** Update `mobile.css` and `mobile-fix.css` as needed

**Rationale:** Creating new files would:
- Require updating all 416 HTML files to add new `<link>` tags
- Risk specificity conflicts
- Increase maintenance burden

Modifying existing files means CSS changes propagate automatically.

## Change Order (Dependency Analysis)

### Phase 1: CSS Variables (Foundation)

**Change first:** `:root` variables in `main.css`

```css
/* Current */
--taxi-yellow: #FFD700;
--accent-teal: #26A69A;
--accent-coral: #FF7F7F;

/* New (example - adjust to actual design) */
--primary: #FFD700;      /* Keep yellow as primary */
--background: #FFFFFF;   /* White backgrounds */
--text: #1A1A1A;         /* Black text */
```

**Why first:** Variables are used throughout all CSS files. Changing them first ensures downstream component changes use the correct palette.

**Risk:** LOW - CSS variables are isolated in `:root`, changes are atomic.

### Phase 2: Header CSS (Critical Path)

**Change second:** Header styles in `components.css`

Affected selectors:
- `.header`
- `.navbar`
- `.logo`, `.logo-image`
- `.nav-wrapper`, `.nav-menu`, `.nav-link`
- `.nav-dropdown`, `.dropdown-link`
- `.language-switcher`, `.language-button`, `.language-dropdown`
- `.menu-toggle`

**Why second:** Header appears on ALL pages. CSS changes here propagate immediately via the shared stylesheet.

**Note:** The header HTML structure is duplicated in each page (no templating). CSS-only changes require no HTML updates. If HTML structure changes, see Propagation Strategy below.

### Phase 3: Footer CSS

**Change third:** Footer styles in `components.css`

Affected selectors:
- `.footer`
- `.footer-content`
- `.footer-project-link`
- `.footer-separator`
- `.footer-copyright`

**Why third:** Lower visual priority than header. Same propagation advantage.

### Phase 4: Homepage Hero

**Change fourth:** Hero styles in `components.css`

Affected selectors:
- `.hero-new`
- `.hero-content`
- `.hero-main-title`, `.highlight-text`
- `.hero-subtitle`
- `.hero-cta-row`
- `.btn-hero`
- `.hero-decorations`, `.decoration`

**Why fourth:** Only affects homepage. Can be developed in isolation without risk to other pages.

### Phase 5: Mobile Adjustments

**Change last:** Mobile CSS in `mobile.css` and `mobile-fix.css`

**Why last:** Mobile styles override desktop styles via media queries. Adjust only after desktop designs are finalized.

## Header/Footer HTML Propagation Strategy

### If CSS-Only Changes: No Propagation Needed

CSS changes to `.header` and `.footer` classes automatically apply to all pages because they share the same stylesheets.

### If HTML Structure Changes: Use Node.js Scripts

The project has established infrastructure for bulk HTML updates:

**Existing scripts in `/scripts/`:**
- `fix-header-structure.js` - Restructures header HTML across all pages
- `fix-all-footers.js` - Updates footer HTML with new template
- `remove-contact-footer.js` - Removes elements from footers
- `update-emojis.js` - Updates emoji content

**Pattern for HTML propagation:**

```javascript
// Typical structure from fix-all-footers.js
const FOOTER_PATTERN = /<footer class="footer">[\s\S]*?<\/footer>/;
const NEW_FOOTER = `<footer class="footer">...</footer>`;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(FOOTER_PATTERN, NEW_FOOTER);
  fs.writeFileSync(filePath, content, 'utf8');
}
```

**Recommended approach for header HTML changes:**

1. Create `scripts/update-header-design.js` based on existing `fix-header-structure.js`
2. Define regex pattern matching current header structure
3. Define new header HTML template
4. Process both `/src/pages/` (IT) and `/en/src/pages/` (EN)
5. Handle root `index.html` and `en/index.html` separately (different relative paths)

**Estimated effort:** 1-2 hours to write script, 5 seconds to execute on all 416 files.

### Propagation Checklist

When making HTML changes to header/footer:

- [ ] IT pages: `/src/pages/*.html` (~206 files)
- [ ] EN pages: `/en/src/pages/*.html` (~208 files)
- [ ] IT homepage: `/index.html` (different CSS paths: `src/styles/...`)
- [ ] EN homepage: `/en/index.html` (different CSS paths: `../src/styles/...`)
- [ ] Subdirectory pages: Check for nested folders (e.g., `/src/pages/permesso-*/`)

## Suggested Phase Structure for Roadmap

Based on dependencies and risk management:

### Phase A: Design Specification (Pre-CSS)
- Define exact color values for new palette
- Create header/footer mockups
- Create hero section mockup
- Identify if HTML changes are needed or CSS-only

### Phase B: Foundation CSS
- Update `:root` variables in `main.css`
- Test on homepage only
- Verify no regressions on inner pages

### Phase C: Header Redesign
**If CSS-only:**
- Update header styles in `components.css`
- Update mobile header in `mobile.css`/`mobile-fix.css`
- Test on multiple page types

**If HTML changes needed:**
- Create `scripts/update-header-v2.js`
- Run on IT pages first, verify
- Run on EN pages, verify
- Update root index files manually

### Phase D: Footer Redesign
**If CSS-only:**
- Update footer styles in `components.css`

**If HTML changes needed:**
- Extend or modify `scripts/fix-all-footers.js`
- Run propagation

### Phase E: Homepage Hero
- Update hero styles in `components.css`
- Update `index.html` hero section HTML if needed
- Update `en/index.html` to match

### Phase F: Mobile Polish
- Final mobile adjustments
- Cross-device testing

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| CSS variables | LOW | Atomic changes, easy rollback |
| Header CSS | MEDIUM | Test on multiple page types before commit |
| Footer CSS | LOW | Simple component, isolated |
| Header HTML propagation | MEDIUM | Use existing script patterns, backup first |
| Footer HTML propagation | LOW | Proven script exists |
| Homepage hero | LOW | Isolated to 2 files |

## Technical Considerations

### CSS Specificity

Current mobile CSS uses `!important` extensively in `mobile-fix.css`. When modifying styles, be aware:

```css
/* mobile-fix.css has many !important rules */
.logo-image {
  height: 100px !important;
}
```

**Recommendation:** Maintain `!important` in mobile overrides to ensure they continue to win specificity battles.

### Load Order

The load order (main -> components -> animations -> mobile -> mobile-fix) is intentional. Each file can override the previous. Do not change this order.

### Browser Support

Current CSS uses:
- CSS Grid
- CSS Flexbox
- CSS Custom Properties (variables)
- Modern selectors

All have excellent browser support. No concerns for redesign.

## Key Decisions for Roadmap

| Question | Recommendation |
|----------|----------------|
| New CSS file or modify existing? | Modify existing - avoids 416 HTML updates |
| Header: CSS-only or HTML changes? | Prefer CSS-only; use script if HTML needed |
| Footer: CSS-only or HTML changes? | Prefer CSS-only; script exists if needed |
| Build order? | Variables -> Header -> Footer -> Hero -> Mobile |
| Test strategy? | Homepage first, then sample inner pages |

## Sources

This research is based entirely on reading the existing codebase:

- `/src/styles/main.css` - CSS variables and base styles
- `/src/styles/components.css` - Header, footer, card, button styles
- `/src/styles/mobile.css` - Mobile responsive styles
- `/src/styles/mobile-fix.css` - Critical mobile overrides
- `/index.html` - Homepage structure
- `/src/pages/database.html` - Sample inner page structure
- `/scripts/fix-all-footers.js` - Existing propagation script pattern
- `/scripts/fix-header-structure.js` - Existing header update script
- `/.planning/PROJECT.md` - Project architecture context

No external web research was needed - the existing codebase provides all necessary architectural context.
