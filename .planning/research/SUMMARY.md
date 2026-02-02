# Project Research Summary

**Project:** SOS Permesso - Homepage CSS Redesign (v2.1)
**Domain:** Static-site visual redesign (CSS-focused)
**Researched:** 2026-02-02
**Confidence:** HIGH

## Executive Summary

The homepage CSS redesign can achieve a modern "startup SaaS" aesthetic using pure CSS techniques already well-supported across browsers. The existing codebase provides excellent infrastructure: a comprehensive CSS variables system in `main.css`, established Node.js scripts for HTML propagation, and a modular CSS architecture. The recommended approach is to **modify existing CSS files** (not create new ones) to avoid updating 416 HTML pages with new link tags. Key changes include adding fluid typography with `clamp()`, implementing a CSS Grid split-hero layout, introducing a display serif font (Playfair Display) for the hero headline only, and shifting backgrounds from gradients to white.

The primary risk is **visual regression across 260+ pages** when CSS changes propagate automatically via shared stylesheets. Pages have different DOM contexts (root vs subpages, IT vs EN), and header/footer changes could break unpredictably. Mitigation requires establishing a visual regression testing baseline before any changes and testing on a matrix of page types (homepage, permit pages, document pages, EN pages) for every CSS commit.

The audience context is critical: users are stressed immigrants navigating Italian bureaucracy. Design choices must prioritize calm over cleverness. White backgrounds reduce cognitive load, subtle hover states provide feedback without startling users, and all animations must respect `prefers-reduced-motion`. The current design has good foundations here; the redesign should preserve these accessibility patterns while simplifying the visual language.

## Key Findings

### Recommended Stack

Pure CSS approach with no new dependencies. All recommended techniques have 95%+ browser support.

**Core technologies:**
- **CSS `clamp()`:** Fluid typography scaling from mobile (2.5rem) to desktop (4.5rem) without breakpoint jumps. Always combine `vw` with `rem` (e.g., `5vw + 1rem`) to ensure browser zoom accessibility.
- **CSS Grid:** Split hero layout (text left, illustration right). Simple 2-column grid that collapses to single column on mobile.
- **SVG inline waves:** Organic wave section dividers using inline SVG with CSS custom properties for colors. Better scaling than `clip-path`.
- **Playfair Display (Google Fonts):** Display serif for hero h1 only, 700/800 weights. All other headings remain Poppins for site consistency.
- **Existing CSS variables:** Extend `:root` system in `main.css` rather than creating new files.

**Avoid:** CSS frameworks (Tailwind/Bootstrap would require rewriting 416 pages), animation libraries (CSS transitions sufficient), glassmorphism (Safari blur support concerns), parallax (causes motion sickness).

### Expected Features

**Must have (table stakes):**
- Clean white background with generous whitespace
- Bold display typography for hero h1
- Split hero layout (text left, visual right)
- Single dark rounded CTA button
- CSS-only hover interactions (transform + box-shadow, 0.2-0.3s)
- Mobile-first responsive layout
- Accessible color contrast (black on yellow: 9.29:1 OK, yellow on white: FAIL)

**Should have (differentiators):**
- Organic wave/blob accent shape (single SVG)
- Feature badge row (icon + short label) for quick scanning
- Subtle scroll-triggered fade-ins (defer if time-constrained)
- Trust signals ("Aggiornato 2025", "Gratuito")
- Focus-visible states matching hover styles

**Defer (v2+):**
- Custom illustration replacement (requires design work)
- Glassmorphism effects (browser support concerns)
- Scroll-triggered animations (requires IntersectionObserver JS)
- Content decisions for feature badges

### Architecture Approach

Modify existing CSS files in place. The project's CSS architecture is well-organized and already uses variables extensively. Creating new CSS files would require updating link tags in 416 HTML files.

**Major components:**
1. **`main.css`** - Update `:root` variables (colors, spacing, fluid typography), this propagates everywhere automatically
2. **`components.css`** - Update `.header`, `.footer`, `.hero-*` selectors for visual changes
3. **`mobile.css` / `mobile-fix.css`** - Adjust mobile breakpoints after desktop designs finalize
4. **Node.js scripts** - Use existing propagation pattern (`fix-all-footers.js`, `fix-header-structure.js`) only if HTML structure changes are needed

**Key insight:** CSS-only changes propagate immediately via shared stylesheets. HTML changes require running propagation scripts on 416 files (IT pages, EN pages, both homepages with different relative paths).

### Critical Pitfalls

1. **Visual regression across 260+ pages** - CSS changes auto-propagate and can break pages not manually tested. **Prevention:** Implement BackstopJS visual regression testing before any changes; test on matrix of page types.

2. **Color contrast failures** - Yellow on white fails WCAG. **Prevention:** Test all color combinations with WebAIM Contrast Checker. Use yellow as accent/background only, never as text on light backgrounds.

3. **CSS specificity wars** - New selectors conflict with existing ones, leading to `!important` chains. **Prevention:** Audit existing selectors in DevTools first; preserve existing naming; use `:where()` for zero-specificity when needed.

4. **Font loading layout shift (CLS)** - New display font causes text "jumping". **Prevention:** Use `font-display: swap`, preload font, match fallback font metrics with `size-adjust`.

5. **Mobile breakpoint regressions** - Desktop-focused changes break mobile-first patterns. **Prevention:** Test on real devices (especially iOS Safari), verify touch targets remain 44x44px, test landscape orientation.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Testing Infrastructure
**Rationale:** Research unanimously identifies visual regression as the critical risk. Must establish baselines before any visual changes.
**Delivers:** BackstopJS configuration, baseline screenshots for homepage + sample inner pages
**Addresses:** Pitfall #1 (visual regression), Pitfall #4 (mobile breakpoint regression)
**Avoids:** "Works on homepage, breaks everywhere else" syndrome

### Phase 2: Foundation CSS (Variables)
**Rationale:** CSS variables cascade to all dependent styles. Changing them first ensures downstream components use correct palette.
**Delivers:** Updated `:root` in `main.css` (fluid typography, extended spacing, any new color aliases)
**Uses:** `clamp()` fluid typography, existing variable naming conventions
**Avoids:** Pitfall #7 (CSS variable migration gotchas) by preserving existing variable names

### Phase 3: Header CSS
**Rationale:** Header appears on all 416 pages. Must be stable before hero work.
**Delivers:** Updated header styling (cleaner, more minimal)
**Implements:** CSS-only changes to `.header`, `.navbar`, `.nav-*` selectors
**Avoids:** Pitfall #8 (z-index conflicts) by using existing z-index system

### Phase 4: Footer CSS
**Rationale:** Lower visual priority than header. Same propagation benefit.
**Delivers:** Updated footer styling
**Implements:** CSS-only changes to `.footer-*` selectors

### Phase 5: Homepage Hero
**Rationale:** Isolated to 2 files (`index.html`, `en/index.html`). Can iterate without risk to other pages.
**Delivers:** Split hero layout, display typography, wave divider, dark CTA button
**Uses:** CSS Grid, Playfair Display font, inline SVG wave
**Addresses:** All "must have" features from FEATURES.md

### Phase 6: Mobile Polish
**Rationale:** Mobile styles override desktop via media queries. Finalize only after desktop is complete.
**Delivers:** Verified mobile experience across breakpoints
**Avoids:** Pitfall #6 (mobile breakpoint regressions), iOS Safari quirks

### Phase 7: QA and Deployment
**Rationale:** Final visual regression pass, cache invalidation
**Delivers:** Version-tagged CSS files, validated visual consistency
**Addresses:** Pitfall #11 (browser cache serving stale CSS)

### Phase Ordering Rationale

- **Testing first:** Research shows 79.1% of homepages fail contrast accessibility. Visual regression testing catches regressions before they ship.
- **Variables before components:** CSS variables cascade. Changing them after component work could break everything.
- **Header before hero:** Header affects all pages; hero affects 2. Stabilize global components first.
- **Mobile last:** Mobile CSS contains `!important` overrides. Changes depend on final desktop styles.

### Research Flags

**Phases with well-documented patterns (skip research-phase):**
- **Phase 2 (Foundation CSS):** `clamp()` and CSS variables are thoroughly documented (MDN, Smashing Magazine)
- **Phase 5 (Homepage Hero):** CSS Grid hero layouts have extensive tutorials and examples

**Phases needing careful attention but not additional research:**
- **Phase 3 (Header CSS):** May need HTML changes if CSS-only insufficient. Propagation scripts exist but need verification.
- **Phase 6 (Mobile Polish):** iOS Safari has quirks (100vh bug, backdrop-filter). Test on real devices, not just DevTools.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Pure CSS, all techniques have 95%+ browser support, verified on MDN |
| Features | HIGH | Multiple authoritative SaaS design sources agree on patterns |
| Architecture | HIGH | Based entirely on reading existing codebase; no external dependencies |
| Pitfalls | HIGH | Verified against project structure (260+ pages, existing CSS patterns) |

**Overall confidence:** HIGH

### Gaps to Address

- **Visual regression tool setup:** Research recommends BackstopJS but does not provide specific configuration. May need trial setup in Phase 1.
- **Font loading performance:** Exact `font-display` and preload strategy needs testing with real font files.
- **HTML changes for header/footer:** Research assumes CSS-only is sufficient. If HTML structure changes are needed, existing scripts provide pattern but may need updates.

## Sources

### Primary (HIGH confidence)
- **MDN Web Docs** - `clamp()`, CSS Grid, CSS Custom Properties, `prefers-reduced-motion`
- **Project codebase** - `/src/styles/main.css`, `/src/styles/components.css`, `/scripts/*.js`
- **Smashing Magazine** - Fluid typography with clamp(), CSS refactoring strategies
- **WebAIM** - Contrast checker, WCAG requirements

### Secondary (MEDIUM confidence)
- **web.dev** - Baseline fluid typography, Core Web Vitals
- **Josh W. Comeau** - CSS transitions, animation best practices
- **Modern CSS (moderncss.dev)** - Hero layouts with CSS Grid
- **DebugBear** - Font performance optimization

### Tertiary (supporting context)
- **SaaS design trend articles** - Webflow, Superside, SaaSFrame (design patterns, not technical specs)
- **UX anxiety research** - UXmatters, Halo Lab (design principles for stressed users)

---
*Research completed: 2026-02-02*
*Ready for roadmap: yes*
