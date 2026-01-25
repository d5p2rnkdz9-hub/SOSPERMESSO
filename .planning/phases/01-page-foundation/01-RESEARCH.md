# Phase 1: Page Foundation - Research

**Researched:** 2026-01-25
**Domain:** Static HTML page restructuring with inline badge navigation
**Confidence:** HIGH

## Summary

Phase 1 restructures the documenti-questura page to use the established database.html layout pattern while adding inline clickable badges for "Primo" (first release) and "Rinnovo" (renewal) document types. This is a pure HTML/CSS implementation with no build tools, using the existing design system.

The codebase already has all necessary infrastructure: CSS variables in main.css, category section patterns in database.html, mobile-responsive utilities, and smooth scroll anchor link handling in app.js. The challenge is adapting the compact list pattern to accommodate inline badges while maintaining mobile usability.

**Primary recommendation:** Use the existing `.permit-link` pattern from database.html with added inline `<span>` badge elements styled as compact pills (border-radius, small padding, distinct colors). Mobile-first approach ensures badges remain tappable (minimum 44x44px touch targets) and wrap gracefully on narrow screens.

## Standard Stack

This is a vanilla HTML/CSS/JavaScript static site with no framework or build process.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| HTML5 | Current | Page structure | Semantic elements (`<section>`, `<header>`, `<nav>`) already used throughout |
| CSS3 | Current | Styling with custom properties | Existing design system in main.css with CSS variables |
| Vanilla JS | ES6+ | Interactive features | app.js handles menu toggle, smooth scroll, animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Google Fonts | Current | Inter & Poppins fonts | Already loaded in all pages |
| CSS Grid/Flexbox | Current | Responsive layouts | Grid for page sections, Flexbox for inline elements |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla CSS | CSS-in-JS library | Project explicitly avoids npm/build tools |
| Manual anchor links | SPA router | Adds complexity, breaks server-side navigation |
| Custom badges | Bootstrap/Tailwind | Against project philosophy (no external frameworks) |

**Installation:**
No installation needed. All code is written directly in HTML/CSS files in the `src/` directory.

## Architecture Patterns

### Recommended Project Structure
```
src/pages/
├── documenti-questura.html          # Restructured main page
├── documenti-studio-primo.html      # First release docs (Phase 2)
├── documenti-studio-rinnovo.html    # Renewal docs (Phase 2)
└── [other permit pages...]          # Existing pages remain unchanged
```

### Pattern 1: Category Section Layout (Already Established)
**What:** Notion-style compact list with category headers and color coding
**When to use:** Displaying grouped permit lists (database.html already uses this)
**Example:**
```html
<!-- From database.html -->
<div class="category-section category-purple">
  <h2 class="category-title">STUDIO/LAVORO</h2>
  <ul class="permit-list">
    <li>
      <a href="permesso-studio.html" class="permit-link">
        <span class="icon">📖</span>
        <span class="title">Permesso per studio</span>
      </a>
    </li>
  </ul>
</div>
```

**CSS (already exists in database.html `<style>` block):**
```css
.permit-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.permit-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: background-color 0.15s ease;
  gap: 0.75rem;
}

.category-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 1rem;
  border-bottom: 2px solid;
}
```

### Pattern 2: Inline Badge Navigation (NEW for Phase 1)
**What:** Compact pill-style badges next to permit titles, clickable as navigation links
**When to use:** Showing multiple document types (Primo/Rinnovo) for single permit
**Example:**
```html
<li>
  <div class="permit-link-wrapper">
    <div class="permit-info">
      <span class="icon">📖</span>
      <span class="title">Permesso per studio</span>
    </div>
    <div class="badge-group">
      <a href="documenti-studio-primo.html" class="doc-badge badge-primo">Primo</a>
      <a href="documenti-studio-rinnovo.html" class="doc-badge badge-rinnovo">Rinnovo</a>
    </div>
  </div>
</li>
```

**Recommended CSS (to be added):**
```css
/* Badge component - compact pill style */
.doc-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.badge-primo {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  color: #0D47A1;
  border: 1.5px solid #64B5F6;
}

.badge-rinnovo {
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
  color: #E65100;
  border: 1.5px solid #FFB74D;
}

.doc-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Wrapper to handle flex layout */
.permit-link-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.permit-link-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.permit-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge-group {
  display: flex;
  gap: 0.5rem;
}

/* Mobile: Ensure touch targets, allow wrapping */
@media (max-width: 768px) {
  .permit-link-wrapper {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .badge-group {
    flex-basis: 100%;
    justify-content: flex-start;
  }

  .doc-badge {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
  }
}
```

### Pattern 3: Mobile-First Responsive Badge Layout
**What:** Badges wrap below permit name on small screens, maintaining touch targets
**When to use:** All badge implementations (mobile-first is project standard)
**Implementation notes:**
- Base styles for mobile (320px+)
- Enhance for tablet (768px+)
- Optimize for desktop (1024px+)
- Touch targets minimum 44x44px per [Apple HIG](https://web.dev/articles/accessible-tap-targets) / 48x48px per [Material Design](https://adicator.com)

### Anti-Patterns to Avoid
- **Nested anchor links:** Don't wrap `.permit-link` in `<a>` and also make badges `<a>` (invalid HTML)
- **Tiny touch targets:** Badges must be minimum 44x44px on mobile, not just visually small
- **Category color inconsistency:** Must match database.html's 4 category colors exactly (purple, orange, blue, teal)
- **Breaking existing pages:** Only modify documenti-questura.html; permit detail pages remain unchanged

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth scroll to anchors | Custom scroll animation | app.js lines 133-154 (already implemented) | Handles header offset (80px), smooth behavior, cross-browser |
| Responsive breakpoints | Magic number media queries | CSS variables from main.css | Consistent with existing 768px/480px breakpoints |
| Badge pill styling | From-scratch rounded buttons | Badge pattern from [Flowbite](https://flowbite.com/docs/components/badge/) + existing CSS variables | Proven UX, accessibility, fits design system |
| Mobile menu collapse | Custom JavaScript | app.js lines 9-34 (already implemented) | Already works, handles click outside, keyboard nav |
| Color system | Hardcoded hex values | CSS variables from main.css `:root` | Maintains consistency with existing purple/orange/blue/teal categories |

**Key insight:** The codebase already has smooth scroll, mobile menu, color system, and responsive utilities. Don't reinvent these—leverage what exists and add only the badge component styling.

## Common Pitfalls

### Pitfall 1: Invalid Nested Links
**What goes wrong:** Wrapping entire `.permit-link` in `<a>` tag while badges are also `<a>` creates invalid nested anchors
**Why it happens:** Copying database.html pattern blindly without adapting for badges
**How to avoid:** Change `.permit-link` from `<a>` to `<div class="permit-link-wrapper">`, make only badges clickable
**Warning signs:** Browser console errors, weird click behavior, links not navigating correctly

### Pitfall 2: Mobile Touch Target Failures
**What goes wrong:** Badges look clickable but are too small to tap on mobile (e.g., 30x20px)
**Why it happens:** Desktop-first design thinking, visual size vs. interactive size confusion
**How to avoid:** Use `min-width: 44px; min-height: 44px` on badges with flexbox centering
**Warning signs:** User testing shows frustration, missed taps, accidental clicks on wrong badges

### Pitfall 3: Color Category Mismatch
**What goes wrong:** Using random colors for categories instead of matching database.html
**Why it happens:** Not reviewing existing color scheme before implementation
**How to avoid:**
- Purple (`--accent-purple`): Studio/Lavoro
- Orange (`--accent-orange`): Protezione
- Blue (`--accent-blue`): Cure Mediche
- Teal (`--accent-teal`): Motivi Familiari
**Warning signs:** Visual inconsistency between database.html and documenti-questura.html

### Pitfall 4: Breaking Existing Smooth Scroll
**What goes wrong:** Anchor links to `#documenti-primo` don't scroll smoothly or offset is wrong
**Why it happens:** Not understanding app.js already handles `a[href^="#"]` with 80px header offset
**How to avoid:** Use standard hash anchor format; app.js automatically applies smooth scroll
**Warning signs:** Links jump to wrong position, header covers target section

### Pitfall 5: Badge Wrapping Chaos on Mobile
**What goes wrong:** Badges wrap mid-word, stack awkwardly, or overflow horizontally
**Why it happens:** Using `display: inline` or `float` instead of flexbox with controlled wrapping
**How to avoid:** Use `flex-wrap: wrap` on wrapper, `flex-basis: 100%` on badge-group for clean break
**Warning signs:** Horizontal scroll on mobile, badges cut off, inconsistent spacing

## Code Examples

Verified patterns adapted from existing codebase:

### Complete Permit Row with Badges
```html
<!-- Based on database.html permit-link pattern -->
<li>
  <div class="permit-link-wrapper">
    <div class="permit-info">
      <span class="icon">📖</span>
      <span class="title">Permesso per studio</span>
    </div>
    <div class="badge-group">
      <a href="documenti-studio-primo.html" class="doc-badge badge-primo">Primo</a>
      <a href="documenti-studio-rinnovo.html" class="doc-badge badge-rinnovo">Rinnovo</a>
    </div>
  </div>
</li>
```

### Category Section Structure
```html
<!-- Matches database.html exactly -->
<div class="category-section category-purple">
  <h2 class="category-title">📋 STUDIO/LAVORO</h2>
  <ul class="permit-list">
    <!-- permit rows here -->
  </ul>
</div>
```

### Badge Hover State
```css
/* Matches existing .btn hover pattern from components.css */
.doc-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Active/pressed state */
.doc-badge:active {
  transform: translateY(0) scale(0.98);
}
```

### Mobile-First Badge Sizing
```css
/* Base (mobile-first): larger touch targets */
.doc-badge {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
}

/* Desktop: more compact visual */
@media (min-width: 768px) {
  .doc-badge {
    min-width: auto;
    min-height: auto;
    padding: 0.35rem 0.75rem;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate pages for each permit + doc type | Anchor links within permit pages | Already in permesso-studio.html | Good for SEO, bad for discovery |
| Bootstrap badge classes | Custom CSS with design system variables | Project start (no frameworks) | Maintains lightweight, no dependencies |
| Float-based layouts | Flexbox for inline elements | CSS3 standard (2015+) | Better responsive behavior |
| Fixed pixel breakpoints | CSS custom properties + mobile-first | Project design system | Consistent breakpoints across site |

**Deprecated/outdated:**
- `.badge` with `float: right` (pre-flexbox pattern) - replaced by flexbox `.badge-group`
- Hardcoded color values - replaced by CSS variables (`var(--accent-blue)`)
- Separate mobile.css overrides - now integrated with mobile-first base styles

## Open Questions

Things that couldn't be fully resolved:

1. **Conditional badge display (some permits only have Primo or only Rinnovo)**
   - What we know: Not all permits have both document types
   - What's unclear: Should missing badges be hidden (gap) or show placeholder (disabled state)?
   - Recommendation: Only show badges that exist; use CSS `gap` to handle spacing naturally

2. **Badge state for pages that don't exist yet (Phase 1 links to Phase 2 pages)**
   - What we know: Phase 1 creates links, Phase 2 creates target pages
   - What's unclear: Should badges have visual indicator for "not yet created"?
   - Recommendation: No special treatment; broken links are temporary during development

3. **Exact permit list for documenti-questura (which permits to include)**
   - What we know: database.html has 32 permit types across 4 categories
   - What's unclear: Are all permits included in documenti-questura or subset?
   - Recommendation: Include all permits from database.html to maintain parity; filter later if needed

## Sources

### Primary (HIGH confidence)
- Existing codebase files:
  - `/src/pages/database.html` - Category section pattern, permit-list structure
  - `/src/styles/main.css` - CSS variables, color system, breakpoints
  - `/src/styles/components.css` - Button hover patterns, card styling
  - `/src/scripts/app.js` - Smooth scroll implementation (lines 133-154)
- [W3Schools HTML File Naming](https://www.w3schools.com/html/html5_syntax.asp) - Lowercase, hyphens standard
- [W3Schools CSS Layout](https://www.w3schools.com/css/css_website_layout.asp) - Semantic HTML5 elements
- [MDN Structuring Documents](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents) - Section/article/div usage

### Secondary (MEDIUM confidence)
- [Flowbite Badges](https://flowbite.com/docs/components/badge/) - Modern badge design patterns (verified with Tailwind patterns)
- [W3Schools Badge Tutorial](https://www.w3schools.com/howto/howto_css_badge.asp) - Basic CSS badge implementation
- [CSS-Tricks Hash Links](https://css-tricks.com/hash-tag-links-padding/) - Anchor link offset patterns
- [MDN List Group with Badges](https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/List_group_with_badges) - Flexbox layout for badges in lists
- [Web.dev Accessible Tap Targets](https://web.dev/articles/accessible-tap-targets) - 44x44px minimum touch target guideline

### Tertiary (LOW confidence)
- [Subframe CSS Badge Examples](https://www.subframe.com/tips/css-badge-examples) - 10 badge variations, no specific framework
- [Coding Dude CSS Badges](https://www.coding-dude.com/wp/css/css-badges/) - Badge best practices (general guidance)
- [Adicator Responsive Design 2025](https://www.adicator.com/post/responsive-design-best-practices) - 48x48px touch targets mentioned

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Codebase analysis shows vanilla HTML/CSS/JS, no build tools, explicit in CLAUDE.md
- Architecture: HIGH - Patterns verified in existing database.html, components.css, main.css
- Pitfalls: MEDIUM - Based on common web development mistakes + mobile-first requirements from CLAUDE.md

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - stable vanilla HTML/CSS domain)
