# Phase 7: Header Redesign - Research

**Phase:** 07-header-redesign
**Researcher:** Claude (gsd-phase-researcher)
**Date:** 2026-01-26

## Research Question

"What do I need to know to PLAN Phase 7: Header Redesign well?"

## Executive Summary

Phase 7 addresses critical header design issues identified during the v1.2 milestone audit. The current teal gradient header has three main problems:

1. **Visual clutter** - Teal gradient background adds unnecessary color, contradicting "clean" design goal
2. **Menu misalignment** - Navigation items aligned to top instead of vertically centered, text too small (1.2rem)
3. **Logo blocking breadcrumbs** - Absolute positioned logo (250px height, overflowing slim 60px header) obscures breadcrumb navigation on detail pages

This phase requires a careful balance: maintaining the friendly design while creating a cleaner, more functional header that doesn't interfere with navigation elements like breadcrumbs.

## Current Header Implementation

### Structure & Positioning

**Header container:**
- Height: 60px (slim design from Phase 5)
- Background: `linear-gradient(135deg, #80CBC4 0%, #B2DFDB 100%)` (teal)
- Position: `sticky`, `top: 0`, `z-index: var(--z-sticky)` (1020)
- Shadow: `0 4px 20px rgba(77, 182, 172, 0.3)`

**Logo positioning:**
```css
.logo {
  position: absolute;
  top: 5px;
  left: 0;
  z-index: 100;
}

.logo-image {
  height: 250px;
  width: auto;
  display: block;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
}
```

**Key issue:** Logo is 250px tall but header is only 60px, causing significant overflow. On mobile it's 100px tall. This works aesthetically but blocks breadcrumbs positioned immediately below the header.

**Navigation menu:**
```css
.nav-menu {
  display: flex;
  list-style: none;
  gap: var(--spacing-lg);
  align-items: center;
}

.nav-link {
  color: #1A6B5F;  /* dark teal */
  font-weight: 600;
  font-size: 1.2rem;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
}

.nav-link:hover {
  color: #FFD700;  /* yellow */
  background: rgba(0, 0, 0, 0.05);
}
```

**Key issue:** `align-items: center` should center items, but visual inspection shows items aligned to top. Font size 1.2rem might be too small for touch targets.

### Breadcrumb Implementation

**Found on 63+ document pages:**
```html
<!-- BREADCRUMB -->
<section class="section" style="padding: 1rem 0;">
  <div class="container">
    <div style="font-size: 0.875rem; color: var(--gray-medium);">
      <a href="../../index.html" style="color: var(--taxi-yellow-dark);">Home</a> →
      <a href="database.html" style="color: var(--taxi-yellow-dark);">Database</a> →
      <span>Permesso per studio</span>
    </div>
  </div>
</section>
```

**Key characteristics:**
- Appears immediately after header (as separate section)
- Small font: 0.875rem (14px)
- Gray medium color with yellow-dark links
- 1rem padding (16px vertical)
- Uses arrow (→) separators
- No explicit CSS class, inline styles

**Problem:** Logo overflows into breadcrumb area, making the first 100-200px of breadcrumb hard to read/click.

### Mobile Header (mobile.css + mobile-fix.css)

**Mobile adjustments:**
```css
@media (max-width: 768px) {
  .header {
    padding: 0.75rem 0;
  }

  .logo {
    position: absolute;
    top: 5px;
    left: 10px;
  }

  .logo-image {
    height: 100px;  /* reduced from 250px */
  }

  .menu-toggle {
    display: flex;
    width: 44px;
    height: 44px;
    font-size: 1.5rem;
  }

  .nav-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--white);
    transform: translateX(-100%);
  }

  .nav-menu.active {
    transform: translateX(0);
  }
}
```

**Mobile considerations:**
- Logo text hidden, icon only (44px)
- Hamburger menu slides in from left
- Full-screen overlay menu on white background
- Menu items larger (font-size-lg) in mobile view

## Design System Context

### Color Palette (from main.css)

**Current header colors:**
- Header gradient start: `#80CBC4` (--accent-teal-light)
- Header gradient end: `#B2DFDB` (lighter teal)
- Menu text: `#1A6B5F` (dark teal)
- Menu hover: `#FFD700` (--taxi-yellow)

**Proposed white header colors:**
- Background: `#FFFFFF` (--white) or `#FAFAFA` (--off-white)
- Shadow: Keep existing `0 4px 20px` but adjust color
- Menu text: Could stay dark teal or shift to black for contrast
- Menu hover: Keep yellow for brand consistency

**Border consideration:** Clean white header might need subtle bottom border (1-2px) for definition.

### Typography System

**Current:**
- Menu font: 1.2rem (19.2px) - Poppins 600
- Base font size: 1rem (16px)
- Font size lg: 1.125rem (18px)
- Font size xl: 1.25rem (20px)

**Recommendation for menu:**
- Desktop: 1.25rem or 1.375rem (20-22px) for better readability
- Minimum touch target: 44x44px (already met with padding)

### Spacing System

**Header vertical rhythm:**
- Current header height: 60px
- Logo top offset: 5px
- Breadcrumb section padding: 1rem (16px) vertical

**Issue:** With 250px logo starting at 5px, it extends ~190px below header, covering breadcrumbs at 60px + 16px = 76px from top.

## Prior Phase Context

### Phase 5: Logo Redesign Decisions

**Key decision from STATE.md:**
> "Absolute positioning for logo: Enables slim header with overflowing logo"

This was intentional — the logo was designed to overflow for visual impact. However, it wasn't tested against breadcrumb navigation.

**Logo assets:**
- `logo-full.png` (2.2MB PNG, used on desktop)
- `logo-icon.svg` (938 bytes)
- `sos-text.svg` (1.6KB)

**Current approach:** Single PNG image, absolute positioned, overflowing.

**Alternative approach considered but not used:** Separate icon + text with `.logo-new` class structure exists in CSS but not implemented in HTML.

### Phase 4: Color Palette Context

Header was changed from purple to teal gradient as part of warm palette shift. The audit now questions whether gradient adds clutter vs clean white design.

**Design tension:**
- Warm, friendly design (gradients, colors)
- vs Clean, minimal design (white, space, simplicity)

Phase 7 leans toward "clean" based on audit feedback: "white/clean, not teal gradient - reduce visual clutter"

## Technical Constraints

### 1. Logo File Strategy

**Current:** Single `logo-full.png` (2.2MB) loaded on all pages
- Large file size but cached
- Absolute positioning with overflow

**Options:**
1. Keep PNG, adjust positioning/height to not block breadcrumbs
2. Switch to SVG components (logo-icon.svg + text) for flexibility
3. Hybrid: PNG for homepage, smaller variant for detail pages

### 2. Header Height vs Logo Size

**Constraint:** Logo must be visible but not block content below header.

**Approaches:**
1. **Increase header height** - Makes header taller (e.g., 80-100px), no overflow
2. **Reduce logo size** - Keep slim header, smaller logo (e.g., 60-80px)
3. **Contain logo** - Remove absolute positioning, place inline
4. **Add breadcrumb margin** - Push breadcrumbs down with top margin/padding

**Recommendation:** Option 2 or 3, maintaining slim header aesthetic while fixing overlap.

### 3. Menu Alignment Issue

**Current CSS:**
```css
.nav-menu {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;  /* Should center items */
}
```

**Issue diagnosis:** Need to verify actual HTML structure. Menu should center but audit says items are top-aligned.

**Possible causes:**
1. Parent container height not matching header height
2. Conflicting styles in mobile.css or mobile-fix.css
3. Navbar using `justify-content: space-between` affecting vertical centering

**Fix strategy:**
```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;  /* Ensure this applies */
  height: 100%;         /* Must match header height */
}

.nav-menu {
  display: flex;
  align-items: center;  /* Center items vertically */
  height: 100%;         /* Match parent */
}
```

### 4. Sticky Header Scroll Behavior

JavaScript adds shadow on scroll (app.js lines 160-173):
```javascript
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 100) {
    header.style.boxShadow = 'var(--shadow-md)';
  } else {
    header.style.boxShadow = 'var(--shadow-sm)';
  }
});
```

With white background, shadow becomes more critical for header definition during scroll.

## Files Requiring Changes

### Primary Files

1. **src/styles/components.css** (lines 218-425)
   - `.header` background color (line 219)
   - `.header` shadow (line 220)
   - `.logo` positioning (lines 241-253)
   - `.logo-image` height (lines 264-270)
   - `.nav-menu` alignment (lines 341-348)
   - `.nav-link` font size (lines 350-365)

2. **src/styles/mobile.css** (lines 46-142)
   - `.logo-image` height mobile (line 64)
   - `.logo-icon-img` height (line 77)
   - Menu toggle positioning (lines 121-129)

3. **src/styles/mobile-fix.css** (lines 57-114)
   - Header mobile fixes (lines 61-73)
   - Logo compact sizing (lines 74-86)

### Secondary Files (Potential)

4. **index.html** (line 36-38)
   - Header markup if logo strategy changes

5. **src/pages/*.html** (97+ pages)
   - All use same header structure
   - Logo path references: `../../images/logo-full.png` or `../../images/logo-full.png`

6. **Breadcrumb styling** (inline styles on 63+ pages)
   - Consider extracting to CSS class for consistency
   - May need top margin/padding adjustment

## Design Considerations

### Visual Hierarchy

**Current:**
1. Teal header (colored, prominent)
2. Logo (huge, 250px, visual anchor)
3. Menu (smaller, dark teal text)

**Proposed:**
1. White header (clean, recedes)
2. Logo (appropriately sized, recognizable)
3. Menu (larger, more prominent)

**Trade-off:** Reducing header visual weight shifts focus to content, but logo becomes less impactful.

### Brand Identity

**Lighthouse logo significance:**
- Metaphor: Guiding light through bureaucracy
- Colors: Red/white stripes + yellow (brand colors)
- Style: Friendly, approachable

**Risk:** Making logo too small loses brand impact on detail pages where users spend most time.

**Mitigation:** Keep logo prominent on homepage/database pages, use smaller variant on detail pages with breadcrumbs.

### Accessibility

**Current issues:**
1. Small menu text (1.2rem) on desktop
2. Logo overflow might block screen reader focus order
3. Breadcrumbs hard to read with logo overlap

**Requirements:**
1. Minimum 44x44px touch targets (already met)
2. Sufficient color contrast (4.5:1 for normal text)
3. Logical focus order (header → breadcrumb → content)

**Color contrast check (white header):**
- Dark teal (#1A6B5F) on white: ~6.8:1 ✓
- Black (#1A1A1A) on white: ~14.7:1 ✓
- Yellow hover (#FFD700) on white: ~1.2:1 ✗ (needs background)

## Success Metrics

**Objective measurements:**
1. Header background color: white/off-white (no gradient)
2. Menu font size: ≥1.25rem (20px)
3. Menu vertical alignment: centered within header height
4. Logo height: ≤header height OR positioned to not overlap breadcrumbs
5. Breadcrumb clickability: First link accessible without logo interference

**Subjective measurements:**
1. "Clean" visual appearance (reduced clutter)
2. Menu items "easy to read/click"
3. Logo "doesn't block" breadcrumbs
4. Mobile header "maintains usability"

## Risk Assessment

### High Risk

1. **Logo resize breaking brand identity**
   - Mitigation: Test multiple sizes, get user feedback
   - Fallback: Keep large logo on homepage, smaller on detail pages

2. **White header feeling too sterile/corporate**
   - Mitigation: Add subtle color through logo, menu hover states
   - Fallback: Use off-white (#FAFAFA) with warm shadow

### Medium Risk

3. **Menu text too large disrupting header balance**
   - Mitigation: Test 1.25rem, 1.375rem, 1.5rem options
   - Fallback: Keep 1.2rem, improve spacing/padding

4. **Breadcrumb margin pushing content down too much**
   - Mitigation: Calculate optimal spacing (10-20px likely)
   - Fallback: Reduce logo overflow instead of adding margin

### Low Risk

5. **Color contrast issues with new background**
   - Mitigation: All proposed colors have good contrast
   - Testing: Verify with WebAIM contrast checker

## Open Questions

1. **Logo strategy:**
   - A) Keep single logo-full.png, reduce height to 60-80px?
   - B) Switch to SVG icon (logo-icon.svg) + text for flexibility?
   - C) Different logo size per page type (homepage vs detail)?

2. **Header background:**
   - A) Pure white (#FFFFFF)?
   - B) Off-white (#FAFAFA) for subtle warmth?
   - C) Very light teal gradient for brand continuity?

3. **Menu font size:**
   - Test 1.25rem (20px) vs 1.375rem (22px) vs 1.5rem (24px)

4. **Breadcrumb handling:**
   - A) Add top margin to breadcrumb section?
   - B) Reduce logo to not overflow?
   - C) Move breadcrumb inside header as right element?

5. **Border/shadow:**
   - Keep current shadow?
   - Add 1px bottom border?
   - Both?

## Recommended Approach

### Phase 1: Core Header Changes
1. Change header background to white (#FFFFFF)
2. Adjust shadow for white background (lighter, more subtle)
3. Fix nav-menu vertical centering (ensure height: 100% on navbar)
4. Increase menu font size to 1.375rem (22px)

### Phase 2: Logo Adjustment
5. Reduce logo height to 80px on detail pages (test)
6. Keep logo at 250px on homepage for impact
7. Adjust positioning to prevent breadcrumb overlap

### Phase 3: Polish
8. Add subtle bottom border if header feels disconnected
9. Test menu hover states on white background
10. Verify mobile header still works with changes

### Phase 4: Breadcrumb Enhancement (optional)
11. Extract breadcrumb styles to CSS class
12. Add consistent margin-top if logo still overlaps
13. Improve accessibility with aria-label="breadcrumb"

## Implementation Complexity

**Estimated effort:**
- Header background/menu: LOW (CSS variable changes, alignment fixes)
- Logo resizing: MEDIUM (need to test multiple sizes, possibly different per page type)
- Breadcrumb margin: LOW (simple margin-top addition)
- Mobile testing: MEDIUM (must verify all breakpoints)

**Files touched:** 3-6 CSS files, potentially 97+ HTML files if logo strategy changes significantly

**Testing scope:**
- Desktop: All breakpoints (1920px, 1440px, 1024px)
- Tablet: 768px
- Mobile: 480px, 375px, 360px
- Page types: Homepage, database list, permit detail, document detail

## References

**Files examined:**
- `/index.html` - Root homepage with header
- `/src/pages/index.html` - Nested homepage
- `/src/pages/permesso-studio.html` - Example detail page with breadcrumbs
- `/src/pages/database.html` - List page
- `/src/styles/main.css` - CSS variables and base styles
- `/src/styles/components.css` - Header component styles (lines 218-425)
- `/src/styles/mobile.css` - Mobile responsive styles (lines 46-142)
- `/src/styles/mobile-fix.css` - Critical mobile fixes (lines 57-114)
- `/src/scripts/app.js` - Header scroll behavior (lines 160-173)
- `/.planning/v1.2-MILESTONE-AUDIT.md` - Gap identification
- `/.planning/STATE.md` - Prior phase decisions
- `/.planning/ROADMAP.md` - Phase 7 description

**Context documents:**
- `/claude.md` - Project documentation
- `/.planning/PROJECT.md` - Core value and constraints

---

**Status:** Research complete
**Next step:** Create 07-01-PLAN.md with specific implementation steps
**Key insight:** Header redesign requires balancing clean aesthetics with brand identity; phased approach recommended (background → menu → logo → breadcrumbs)
