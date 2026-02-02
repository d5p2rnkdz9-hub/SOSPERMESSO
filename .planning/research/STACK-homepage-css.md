# Stack Research: Homepage CSS Redesign

**Project:** SOS Permesso Homepage Redesign
**Researched:** 2026-02-02
**Focus:** CSS techniques for modern "startup SaaS" aesthetic
**Confidence:** HIGH (techniques are well-documented, current standards)

---

## Executive Summary

The target aesthetic (clean white, bold typography, split hero, organic waves) is achievable with pure CSS using techniques already well-supported in modern browsers. The existing CSS variables system in `main.css` provides excellent infrastructure to build upon. Key changes: add fluid typography with `clamp()`, introduce a display font for headings, and use CSS Grid for the split hero layout.

**No new dependencies needed.** All techniques use vanilla CSS.

---

## Recommended Techniques

### 1. Fluid Typography with `clamp()`

**Why:** Creates smooth scaling between viewport sizes without breakpoint jumps. The reference design uses bold, oversized headings that need to scale gracefully from mobile to desktop.

**Implementation:**

```css
:root {
  /* Display heading - scales from 2.5rem (mobile) to 4.5rem (desktop) */
  --font-size-display: clamp(2.5rem, 5vw + 1rem, 4.5rem);

  /* Large heading - scales from 2rem to 3.5rem */
  --font-size-hero: clamp(2rem, 4vw + 0.75rem, 3.5rem);

  /* Body text - subtle scaling */
  --font-size-body: clamp(1rem, 0.5vw + 0.875rem, 1.125rem);
}

.hero-title {
  font-size: var(--font-size-display);
  line-height: 1.1; /* Tighter for display text */
}
```

**Critical accessibility note:** Always combine `vw` with `rem` in the preferred value. Pure `vw` units do not respond to browser zoom, failing WCAG requirements. The formula `Xvw + Yrem` ensures text scales with both viewport AND user zoom settings.

**Source:** [Smashing Magazine - Modern Fluid Typography](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/), [web.dev - Baseline fluid type](https://web.dev/articles/baseline-in-action-fluid-type)

---

### 2. CSS Grid Split Hero Layout

**Why:** The reference shows text-left/illustration-right layout. CSS Grid handles this cleanly with built-in alignment and responsive collapse.

**Implementation:**

```css
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  align-items: center;
  min-height: 80vh;
  padding: var(--spacing-xxl) 0;
}

.hero-content {
  /* Text side */
}

.hero-illustration {
  /* Image/SVG side */
  display: flex;
  justify-content: center;
}

/* Mobile: stack vertically */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    text-align: center;
  }

  .hero-illustration {
    order: -1; /* Image first on mobile, optional */
  }
}
```

**Alternative for asymmetric splits:**
```css
.hero {
  grid-template-columns: 55% 45%; /* More space for text */
}
```

**Source:** [Modern CSS - Website Heroes with Grid](https://moderncss.dev/3-popular-website-heroes-created-with-css-grid-layout/), [MDN - Common layouts using grids](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Realizing_common_layouts_using_grids)

---

### 3. Organic Wave Section Divider

**Why:** The reference has a yellow/orange wave at the bottom. This is best done with inline SVG for performance and flexibility.

**Implementation (SVG approach - recommended):**

```html
<div class="wave-divider">
  <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
    <path fill="var(--taxi-yellow)" d="M0,64 C480,150 960,0 1440,64 L1440,120 L0,120 Z"/>
  </svg>
</div>
```

```css
.wave-divider {
  width: 100%;
  overflow: hidden;
  line-height: 0; /* Remove inline SVG gap */
}

.wave-divider svg {
  width: 100%;
  height: auto;
  min-height: 60px;
  display: block;
}
```

**Why SVG over clip-path:**
- SVG scales perfectly at any width
- Path can use CSS custom properties for color
- No jagged edges at extreme widths
- Better browser support than complex `clip-path`

**Tool for generating waves:** [Wave Generator](https://www.wavegenerator.app/) or [CSS Wave Generator](https://www.terrific.tools/code/css-wave-generator) - generate the path, extract the `d` attribute.

**Source:** [LogRocket - Wavy background with CSS and SVG](https://blog.logrocket.com/create-wavy-background-using-css-svg/)

---

### 4. Whitespace System Enhancement

**Why:** The reference design has significantly more breathing room than the current site. Generous whitespace conveys "premium" and "modern."

**Implementation - extend existing spacing system:**

```css
:root {
  /* Existing system - keep these */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-xxl: 4rem;

  /* NEW: Hero-specific generous spacing */
  --spacing-hero: clamp(4rem, 8vw, 8rem);

  /* NEW: Section breathing room */
  --spacing-section: clamp(5rem, 10vw, 10rem);
}

.hero {
  padding: var(--spacing-hero) 0;
}

.section-generous {
  padding: var(--spacing-section) 0;
}
```

**Rationale:** Fluid spacing using `clamp()` ensures mobile doesn't waste space while desktop gets premium breathing room.

---

### 5. Minimal Badge/Chip Components

**Why:** The reference shows small feature badges (icon + label). Simple pill-shaped elements.

**Implementation:**

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--gray-light);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.badge-icon {
  font-size: 1.25em;
}
```

```html
<span class="badge">
  <span class="badge-icon">icon</span>
  Label text
</span>
```

---

### 6. Dark CTA Button

**Why:** The reference shows a simple dark rounded button, contrasting with the current yellow gradient buttons.

**Implementation - add variant to existing system:**

```css
.btn-dark {
  background: var(--black);
  color: var(--white);
  padding: 1rem 2rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform var(--transition-fast),
              box-shadow var(--transition-fast);
}

.btn-dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
```

**Integrate with existing button system** - keep `.btn-primary` (yellow) for secondary actions, use `.btn-dark` for primary hero CTA.

---

## Typography

### Recommended Font Strategy

**Current state:** Inter (body) + Poppins (headings) - both sans-serif.

**Recommendation:** Keep Inter for body text, add a display serif for hero headings only.

### Display Font Options (Google Fonts)

| Font | Character | Best For | Pairing Notes |
|------|-----------|----------|---------------|
| **Playfair Display** | Elegant, high contrast | Fashion, editorial feel | Classic choice, works beautifully with Inter |
| **Lora** | Warm, readable | Friendly, approachable | Brushed curves complement Inter's geometric precision |
| **Crimson Text** | Traditional, bookish | Credibility, trust | Adds gravitas without stuffiness |

**Recommendation:** Use **Playfair Display** for the hero headline only. It provides the "bold display" aesthetic from the reference while being free and performant.

**Implementation:**

```html
<!-- Add to Google Fonts link -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap" rel="preload" as="style">
```

```css
:root {
  --font-display: 'Playfair Display', Georgia, serif;
  /* Keep existing */
  --font-heading: 'Poppins', var(--font-primary);
  --font-primary: 'Inter', sans-serif;
}

.hero-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--font-size-display);
  line-height: 1.1;
}
```

**Scope limitation:** Use display serif ONLY for the hero title. All other headings remain Poppins to maintain consistency across the 260+ pages.

**Source:** [WPlook - Best Serif Fonts 2025](https://wplook.com/serif-fonts/), [Typewolf - Inter pairings](https://www.typewolf.com/inter), [TBH Creative - Google Fonts 2025](https://www.tbhcreative.com/blog/new-google-fonts-typefaces-2025/)

---

## Animations

### Principles for Modern Subtle Animations

1. **Duration:** 150-300ms for interactions, never over 500ms
2. **Properties:** Only animate `transform` and `opacity` (GPU-accelerated)
3. **Easing:** Use `ease-out` for entrances, `ease-in` for exits
4. **Purpose:** Every animation must serve function, not decoration

### Recommended Microinteractions

**Button hover (existing pattern, keep it):**
```css
.btn:hover {
  transform: translateY(-2px);
}
```

**Card hover (simplify from current):**
```css
.card {
  transition: transform var(--transition-fast),
              box-shadow var(--transition-fast);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

**Fade-in on scroll (optional, use sparingly):**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-on-scroll {
  animation: fadeInUp 0.6s ease-out forwards;
}
```

### Performance Best Practices

```css
/* Pre-promote interactive elements */
.btn,
.card {
  will-change: transform;
}

/* Remove will-change when not needed */
.section:not(:hover) .card {
  will-change: auto;
}
```

### Accessibility: Reduced Motion

**Always include this:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Source:** [CopyElement - Microinteractions 2025](https://blog.copyelement.com/microinteractions-2025-elevating-ux-with-subtle-animations/), [Josh Comeau - CSS Transitions](https://www.joshwcomeau.com/animation/css-transitions/)

---

## Integration with Existing System

### What to Keep

The current `main.css` has excellent foundations:

| Feature | Current State | Action |
|---------|---------------|--------|
| CSS variables system | Well-organized | **KEEP**, extend |
| Color palette | Comprehensive | **KEEP**, add new homepage colors |
| Spacing system | Good | **EXTEND** with hero/section sizes |
| Typography scale | Fixed sizes | **REPLACE** with fluid clamp() |
| Grid utilities | Basic responsive | **EXTEND** for hero layout |
| Button styles | Gradient-heavy | **ADD** dark variant |

### What to Change

1. **Typography sizing:** Replace fixed `--font-size-*` with `clamp()` versions
2. **Add homepage-specific file:** Create `homepage.css` for hero-specific styles
3. **Simplify card hovers:** Reduce the rainbow gradient border, use simpler shadows

### Recommended File Structure

```
src/styles/
  main.css          # Base system (modify typography section)
  components.css    # Keep as-is
  homepage.css      # NEW: Hero, wave, badges specific to homepage
  animations.css    # Keep as-is
  mobile.css        # Keep as-is
```

---

## Avoid

### Do NOT Add

| Anti-Pattern | Why Avoid |
|--------------|-----------|
| **CSS frameworks (Tailwind, Bootstrap)** | Overkill for existing vanilla CSS codebase. Would require rewriting all 260+ pages. |
| **CSS-in-JS** | No JavaScript framework to benefit from it |
| **Complex animation libraries (GSAP, Anime.js)** | Simple CSS transitions are sufficient for this aesthetic |
| **New color model (OKLCH, LCH)** | Safari support still spotty. Stick with existing hex/rgba. |
| **Scroll-driven animations API** | Still experimental, not needed for this design |
| **Container queries** | Useful but not required for homepage redesign |

### Do NOT Over-Engineer

| Temptation | Better Approach |
|------------|-----------------|
| Variable fonts for weight animation | Just load 2 weights of Playfair (700, 800) |
| CSS Houdini custom properties | Standard CSS custom properties work fine |
| Multiple wave layers with parallax | Single SVG wave is cleaner and faster |
| Glassmorphism/blur effects | Clean white is faster and more accessible |

### Performance Warnings

- **Avoid animating `box-shadow` directly** - Use pseudo-elements with `opacity` instead
- **Avoid `filter: blur()` on large elements** - Expensive to render
- **Avoid `width`/`height` transitions** - Causes layout thrash; use `transform: scale()` instead

---

## Color Palette Update

The reference design uses:
- **Primary background:** Pure white (#FFFFFF)
- **Text:** Near-black (#1A1A1A - you already have this)
- **Accent:** Yellow/Orange for wave and highlights
- **Illustration:** Colorful but the page itself is restrained

**Recommendation:** Keep existing palette but USE it differently:

```css
/* Homepage-specific overrides */
.homepage .hero {
  background: var(--white);
}

.homepage .wave-divider path {
  fill: var(--taxi-yellow);
}

.homepage .btn-dark {
  background: var(--black);
}
```

Current palette is perfect. Just apply more white backgrounds and reduce gradient usage on homepage.

---

## Browser Support

All recommended techniques have excellent support:

| Technique | Chrome | Firefox | Safari | Edge |
|-----------|--------|---------|--------|------|
| `clamp()` | 79+ | 75+ | 13.1+ | 79+ |
| CSS Grid | 57+ | 52+ | 10.1+ | 16+ |
| CSS Custom Properties | 49+ | 31+ | 9.1+ | 15+ |
| `prefers-reduced-motion` | 74+ | 63+ | 10.1+ | 79+ |

**Global support:** 95%+ for all techniques. No polyfills needed.

---

## Implementation Checklist

1. [ ] Add Playfair Display to font imports (700, 800 weights)
2. [ ] Create fluid typography variables with `clamp()`
3. [ ] Build hero section with CSS Grid (two-column split)
4. [ ] Add SVG wave divider component
5. [ ] Create `.btn-dark` variant
6. [ ] Add badge component styles
7. [ ] Extend spacing system with `--spacing-hero` and `--spacing-section`
8. [ ] Add `prefers-reduced-motion` media query
9. [ ] Create `homepage.css` file for homepage-specific styles

---

## Sources

### Typography
- [Smashing Magazine - Modern Fluid Typography Using CSS Clamp](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)
- [web.dev - Responsive and fluid typography with Baseline CSS features](https://web.dev/articles/baseline-in-action-fluid-type)
- [MDN - clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp)
- [WPlook - 10 Best Google Serif Fonts Used in 2025](https://wplook.com/serif-fonts/)
- [Typewolf - Inter Font Combinations](https://www.typewolf.com/inter)
- [Pimp my Type - Font Pairings for Inter](https://pimpmytype.com/inter-pairings/)

### Layout
- [Modern CSS - 3 Popular Website Heroes Created With CSS Grid Layout](https://moderncss.dev/3-popular-website-heroes-created-with-css-grid-layout/)
- [MDN - Realizing common layouts using grids](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Realizing_common_layouts_using_grids)
- [Matthew James Taylor - 2 Column Layouts](https://matthewjamestaylor.com/2-column-layouts)

### Waves & Shapes
- [LogRocket - How to create a wavy background using CSS and SVG](https://blog.logrocket.com/create-wavy-background-using-css-svg/)
- [Wave Generator App](https://www.wavegenerator.app/)
- [terrific.tools - CSS Wave Generator](https://www.terrific.tools/code/css-wave-generator)

### Animations
- [Josh W. Comeau - An Interactive Guide to CSS Transitions](https://www.joshwcomeau.com/animation/css-transitions/)
- [CopyElement - Microinteractions 2025: Elevating UX with Subtle Animations](https://blog.copyelement.com/microinteractions-2025-elevating-ux-with-subtle-animations/)
- [618media - Hover Effects in CSS for User Engagement 2025](https://618media.com/en/blog/hover-effects-in-css-for-user-engagement/)

### SaaS Design Trends
- [Eloqwnt - 2025 SaaS Web Design Trends](https://www.eloqwnt.com/blog/2025-saas-web-design-trends-a-roundup-of-whats-next)
- [Superside - SaaS Web Design Examples](https://www.superside.com/blog/saas-web-design)
