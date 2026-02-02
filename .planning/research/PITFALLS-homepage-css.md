# Pitfalls Research: Homepage CSS Redesign

**Domain:** CSS redesign on multi-page static site
**Researched:** 2026-02-02
**Project Context:** SOS Permesso - 260+ HTML pages with duplicated headers/footers

---

## Critical Pitfalls

Mistakes that cause rewrites, major regressions, or significant user impact.

---

### 1. Inconsistent Header/Footer Propagation

**Risk:** Changes to header/footer CSS work on homepage but break on subpages due to different path contexts, existing overrides, or missed pages.

**Warning signs:**
- Testing only on homepage before deployment
- CSS selectors that assume specific DOM structure
- Different relative paths in subpages (`../styles/` vs `src/styles/`)

**Prevention:**
- Create a test matrix of page types (homepage, permit pages, document pages, redirect pages, EN pages)
- Test CSS changes on at least one page from each category before committing
- Use CSS custom properties (variables) for colors/spacing - already in place in `main.css`
- Maintain a visual regression testing baseline with BackstopJS or Percy

**Phase to address:** Phase 1 - Establish testing infrastructure before any visual changes

**Confidence:** HIGH (verified with project structure showing 260+ pages across multiple categories)

---

### 2. CSS Specificity Wars with Legacy Selectors

**Risk:** New CSS rules conflict with existing selectors, leading to escalating specificity (`!important` chains) that become unmaintainable.

**Warning signs:**
- Needing `!important` to override existing styles
- Selectors becoming deeply nested (`.header .nav .dropdown .link`)
- New styles working in isolation (CodePen) but failing in production

**Prevention:**
- Audit existing selectors before adding new ones using browser DevTools
- Use a temporary `overrides.css` file for high-specificity combat code during transition
- Prefer class-based selectors over element chains
- Use `:where()` for zero-specificity resets when needed
- Consider CSS Layers (`@layer`) for safer cascade control (well-supported in 2025+)

**Phase to address:** Phase 1 - Audit existing CSS architecture before introducing new styles

**Confidence:** HIGH (documented pattern in CSS refactoring literature)

---

### 3. Color Contrast Failures After Palette Change

**Risk:** New white/black/yellow palette fails WCAG contrast requirements, especially for users with visual impairments (79.1% of homepages fail contrast per WebAIM Million 2025).

**Warning signs:**
- Yellow text on white backgrounds (fails contrast)
- Gray text (#757575) on light backgrounds (borderline 4.5:1)
- Links relying solely on color (no underline)
- Information conveyed only through color

**Prevention:**
- Test all color combinations with WebAIM Contrast Checker before implementation
- Black on yellow = OK (9.29:1 contrast ratio with common yellows)
- Yellow on white = FAIL (must avoid or darken yellow significantly)
- Maintain existing teal link color (#1A6B5F) which has good contrast
- Ensure links have underlines, not just color differentiation

**Phase to address:** Phase 2 - Color system design, validate all combinations upfront

**Confidence:** HIGH (WCAG standards are authoritative, current site already uses accessible patterns)

---

### 4. Visual Regression Across 260+ Pages

**Risk:** CSS changes cause unintended visual breakage on pages that aren't manually tested.

**Warning signs:**
- "It works on my machine" syndrome
- Testing only a handful of representative pages
- Discovering broken layouts in production

**Prevention:**
- Implement visual regression testing (BackstopJS free, Percy for CI/CD)
- Create baseline screenshots before redesign
- Run visual diff after every CSS change
- Test at multiple viewport sizes (320px, 768px, 1024px, 1440px)
- Version baseline images alongside code

**Phase to address:** Phase 1 - Set up before making visual changes

**Confidence:** HIGH (industry standard practice for CSS changes at scale)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded user experience.

---

### 5. Font Loading Performance Issues (FOUT/FOIT)

**Risk:** Introducing new display typography causes layout shift (CLS) and flash of unstyled/invisible text.

**Warning signs:**
- Large font file downloads (>100KB per weight)
- Multiple font weights loaded but not all used
- No `font-display` property set
- Text "jumping" when fonts load

**Prevention:**
- Use `font-display: swap` for body text (FOUT preferred over invisible text)
- Use `font-display: optional` for display fonts if layout shift is critical
- Preload critical fonts: `<link rel="preload" href="font.woff2" as="font" crossorigin>`
- Subset fonts to only needed characters (latin, special Italian characters)
- Use WOFF2 format (30% smaller than TTF)
- Consider self-hosting over Google Fonts for caching control
- Match fallback font metrics to reduce layout shift (use `size-adjust`)

**Phase to address:** Phase 3 - Typography implementation

**Confidence:** HIGH (Core Web Vitals impact is well-documented)

---

### 6. Mobile Breakpoint Regressions

**Risk:** Desktop-focused redesign breaks existing mobile-first responsive patterns.

**Warning signs:**
- Testing primarily on desktop
- Adding desktop-specific styles without mobile fallbacks
- Touch targets smaller than 44x44px (WCAG) or 24x24px (WCAG 2.2 minimum)
- Horizontal scroll appearing on mobile

**Prevention:**
- Maintain mobile-first approach: base styles for mobile, enhance for desktop
- Test on real devices (iOS Safari, Chrome Mobile) not just browser DevTools
- Verify touch targets remain at least 44x44px
- Check `overflow-x: hidden` doesn't hide content unintentionally
- Test landscape orientation separately (existing `mobile.css` has landscape rules)

**Phase to address:** Every phase - continuous mobile testing

**Confidence:** HIGH (project already has mobile-first architecture, must preserve it)

---

### 7. CSS Variable Migration Gotchas

**Risk:** Changing CSS variable values breaks dependent calculations or creates invalid fallback chains.

**Warning signs:**
- Variables used in `calc()` expressions suddenly invalid
- Fallback values not tested
- Case sensitivity issues (`--Taxi-Yellow` vs `--taxi-yellow`)
- Variables used in media queries (won't work)

**Prevention:**
- CSS variables are case-sensitive - maintain existing naming conventions
- Test fallback values: `var(--new-color, var(--old-color, #fallback))`
- Document which variables are "breaking" changes vs "additive" changes
- Don't change variable names, only values (when possible)
- Remember: fallbacks don't fix browser compatibility, only undefined variables

**Phase to address:** Phase 2 - Color system changes

**Confidence:** HIGH (MDN documentation is authoritative)

---

### 8. Sticky/Fixed Header Z-Index Conflicts

**Risk:** New header/footer styling conflicts with existing z-index layers (dropdowns, modals, breadcrumb bar).

**Warning signs:**
- Dropdowns appearing behind content
- Modal backdrop not covering header
- Sticky breadcrumb conflicts with sticky header

**Prevention:**
- Project already has z-index system in `main.css`:
  - `--z-dropdown: 1000`
  - `--z-sticky: 1020`
  - `--z-fixed: 1030`
  - `--z-modal: 1040`
- Use these variables, don't create new z-index values
- Test modal interactions with new header
- Verify sticky breadcrumb (v1.10) still works correctly

**Phase to address:** Phase 4 - Header implementation

**Confidence:** HIGH (project-specific, verified in main.css)

---

## Minor Pitfalls

Mistakes that cause annoyance but are recoverable.

---

### 9. Animation/Motion Accessibility

**Risk:** New animations cause discomfort for users with vestibular disorders.

**Warning signs:**
- Large-scale movements or parallax effects
- Animations that can't be disabled
- No respect for `prefers-reduced-motion`

**Prevention:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
- Already have animation system in `animations.css` - extend it, don't replace
- Test with system-level reduced motion enabled

**Phase to address:** Phase 5 - Animation refinements

**Confidence:** HIGH (WCAG 2.1 requirement)

---

### 10. Print Stylesheet Regression

**Risk:** New screen styles break existing print functionality for document pages.

**Warning signs:**
- Print preview shows incorrect layouts
- Document checklists don't print correctly
- Headers/footers appearing in print output

**Prevention:**
- Test print preview for document pages before and after changes
- Keep `@media print` rules isolated
- Project has print styles in `document-page.css` - preserve them

**Phase to address:** Phase 6 - QA and testing

**Confidence:** MEDIUM (documented in CLAUDE.md, but need to verify current state)

---

### 11. Browser Cache Serving Stale CSS

**Risk:** Users see broken layouts because their browser cached old CSS files.

**Warning signs:**
- "Works on my machine" but broken for users
- Issues resolve after hard refresh
- Inconsistent reports from different users

**Prevention:**
- Use cache-busting query strings: `main.css?v=2.0`
- Or rename files for major changes: `main-v2.css`
- Set appropriate `Cache-Control` headers
- Document cache invalidation in deployment process

**Phase to address:** Phase 7 - Deployment

**Confidence:** MEDIUM (standard web practice, no project-specific verification)

---

## Performance Considerations

### CSS File Size Growth

**Risk:** Adding new styles without removing old ones bloats CSS, slowing page loads.

**Prevention:**
- Audit unused CSS with PurgeCSS or Chrome DevTools Coverage
- Remove deprecated styles when adding replacements
- Current CSS files are well-organized - maintain separation:
  - `main.css` - core design system
  - `components.css` - reusable components
  - `mobile.css` / `mobile-fix.css` - responsive overrides
  - `animations.css` - motion
  - `document-page.css` - page-specific

### Render-Blocking CSS

**Risk:** Multiple CSS files block initial render.

**Prevention:**
- Keep critical path CSS minimal
- Consider inlining critical CSS for homepage
- Use `media` attributes for non-critical stylesheets

---

## Accessibility Concerns

### Focus State Visibility

**Risk:** Redesign removes or obscures keyboard focus indicators.

**Prevention:**
- Never set `outline: none` without visible alternative
- Test full page navigation with keyboard only
- Ensure focus states meet 3:1 contrast ratio (WCAG 2.1)

### Reduced Motion

**Risk:** New animations ignore user preferences.

**Prevention:**
- Wrap all new animations with `prefers-reduced-motion` media query
- Test with macOS/Windows "reduce motion" setting enabled

### Target Size Compliance

**Risk:** New design reduces touch/click target sizes below 24x24px minimum (WCAG 2.2).

**Prevention:**
- Audit all interactive elements
- Maintain minimum 44x44px for comfortable mobile use
- Exception: inline links within text paragraphs

---

## Mobile-Specific Pitfalls

### Landscape Mode Breaking

**Risk:** Header redesign breaks on landscape mobile (already handled in current `mobile.css`).

**Prevention:**
- Test specifically at 667px height (iPhone landscape)
- Verify lighthouse logo scaling (current: 260px -> 220px -> 180px)

### iOS Safari Quirks

**Risk:** New CSS features work in Chrome but fail in Safari.

**Prevention:**
- Test on real iOS devices
- Use Autoprefixer for vendor prefixes
- Verify 100vh handling (iOS Safari viewport bug)
- Check backdrop-filter support for any blur effects

### Text Input Zoom

**Risk:** Input fields under 16px font-size trigger iOS zoom.

**Prevention:**
- Maintain 16px minimum for form inputs (already in place per CLAUDE.md)

---

## Phase-Specific Warning Matrix

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| 1. Setup | Visual regression baseline missing | Implement BackstopJS before any changes |
| 2. Colors | Contrast failures, variable naming | Test all combinations, preserve naming |
| 3. Typography | Font loading performance | Preload, WOFF2, font-display: swap |
| 4. Header | Z-index conflicts, mobile breakage | Use existing z-index system, test mobile first |
| 5. Footer | Inconsistent propagation | Test on multiple page types |
| 6. Hero | Animation accessibility | Respect prefers-reduced-motion |
| 7. QA | Missed regressions | Full visual regression suite |
| 8. Deploy | Cache invalidation | Version CSS files |

---

## Sources

### CSS Refactoring & Specificity
- [Smashing Magazine: Refactoring CSS Part 1](https://www.smashingmagazine.com/2021/07/refactoring-css-introduction-part1/)
- [Smashing Magazine: Refactoring CSS Part 2](https://www.smashingmagazine.com/2021/08/refactoring-css-strategy-regression-testing-maintenance-part2/)
- [CSS Wizardry: Refactoring CSS](https://csswizardry.com/2016/08/refactoring-css-the-three-i-s/)
- [Pixel Free Studio: CSS Specificity Wars](https://blog.pixelfreestudio.com/the-hidden-dangers-of-css-specificity-wars/)

### Visual Regression Testing
- [Diffy: CSS Regression Testing](https://diffy.website/css-regression-testing)
- [BrowserStack: Visual Regression Testing Tools](https://www.browserstack.com/guide/visual-regression-testing-open-source)

### Accessibility & Contrast
- [WebAIM: Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [WebAIM: Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN: Color Contrast](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast)
- [AllAccessible: Color Contrast WCAG Guide 2025](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025)

### CSS Variables
- [MDN: Using CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties)
- [Pixel Free Studio: CSS Variables Pitfalls](https://blog.pixelfreestudio.com/css-variables-gone-wrong-pitfalls-to-watch-out-for/)
- [Matthias Ott: CSS Custom Properties Fail Without Fallback](https://matthiasott.com/notes/css-custom-properties-fail-without-fallback)

### Font Performance
- [DebugBear: Ultimate Guide to Font Performance](https://www.debugbear.com/blog/website-font-performance)
- [Talent500: FOIT vs FOUT Strategies](https://talent500.com/blog/optimizing-fonts-foit-fout-font-display-strategies/)
- [Jono Alderson: You're Loading Fonts Wrong](https://www.jonoalderson.com/performance/youre-loading-fonts-wrong/)

### Header/Footer Design
- [Common Ninja: Header Footer Design Mistakes](https://www.commoninja.com/blog/avoid-mistakes-header-footer-design)
- [GTech: Header Footer SEO Mistakes](https://www.gtechme.com/insights/header-footer-seo-design-mistakes/)
- [Brainiac Media: Website Redesign Mistakes 2025](https://www.brainiacmedia.net/blogs/website-redesign-mistakes-to-avoid-2025/)

### Modern CSS Features
- [Frontend Masters: Modern CSS 2025](https://frontendmasters.com/blog/what-you-need-to-know-about-modern-css-2025-edition/)
- [MDN: CSS and JavaScript Accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/CSS_and_JavaScript)

---

*Confidence Level: HIGH for pitfalls 1-8, MEDIUM for pitfalls 9-11*
*Last updated: 2026-02-02*
