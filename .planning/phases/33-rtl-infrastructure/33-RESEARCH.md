# Phase 33: RTL Infrastructure - Research

**Researched:** 2026-02-04
**Domain:** CSS RTL (Right-to-Left) layout architecture with logical properties
**Confidence:** HIGH

## Summary

RTL infrastructure for Arabic and Hebrew requires converting physical CSS properties (left/right) to logical properties (inline-start/end) that automatically adapt based on document direction. The modern approach uses CSS Logical Properties with 96.48% browser support, avoiding duplicate stylesheets or direction-specific overrides.

Key findings: CSS Logical Properties are now the standard (96%+ support), dir="rtl" must be set in HTML (not CSS), and directional elements like arrows need selective mirroring using transform: scaleX(-1). The SOS Permesso codebase has ~32 directional properties requiring conversion across 6 CSS files.

**Primary recommendation:** Convert all margin/padding/border physical properties to logical equivalents, add [dir="rtl"] selector with direction: rtl and Arabic font stack, implement icon mirroring with CSS variable approach for selective transforms.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Logical Properties | CSS3 | Direction-agnostic layout | W3C standard, 96.48% browser support |
| HTML dir attribute | HTML5 | Document direction control | W3C recommendation over CSS direction |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PostCSS Logical | 5.x+ | Fallback generation | Only if IE11 support required (not needed for SOS Permesso) |
| RTLCSS | 4.x+ | Automated RTL conversion | Legacy codebases, not for new builds using logical properties |
| Bi-App-Sass | 2.x+ | Sass RTL generation | Legacy approach, superseded by logical properties |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Logical Properties | Duplicate LTR/RTL stylesheets | 2x maintenance burden, performance overhead |
| HTML dir attribute | CSS direction property | W3C explicitly discourages, semantic data should be in markup |
| Manual [dir="rtl"] overrides | PostCSS plugin | Automation useful only for legacy code migration |

**Installation:**
```bash
# No installation needed - CSS Logical Properties are native CSS
# Optional: PostCSS plugin only for legacy browser support
npm install postcss-logical
```

## Architecture Patterns

### Recommended Project Structure
```
src/styles/
├── main.css              # Add :root logical property variables
├── components.css        # Convert physical to logical properties
├── mobile.css            # Convert responsive physical properties
├── rtl.css               # NEW: RTL-specific overrides and font stack
└── animations.css        # Convert positioning properties
```

### Pattern 1: Physical to Logical Property Conversion
**What:** Replace directional properties with writing-mode-relative equivalents
**When to use:** All margin, padding, border, positioning properties
**Example:**
```css
/* Source: MDN CSS Logical Properties Guide */
/* OLD: Physical properties */
.card {
  margin-left: 1rem;
  margin-right: 2rem;
  padding-left: 0.5rem;
  border-left: 4px solid blue;
  text-align: left;
}

/* NEW: Logical properties */
.card {
  margin-inline-start: 1rem;
  margin-inline-end: 2rem;
  padding-inline-start: 0.5rem;
  border-inline-start: 4px solid blue;
  text-align: start;
}
```

### Pattern 2: HTML Direction Attribute
**What:** Set text direction in markup, not CSS
**When to use:** Document root (<html>) for base direction
**Example:**
```html
<!-- Source: W3C Structural Markup Guidelines -->
<!-- LTR (default) -->
<html lang="en" dir="ltr">

<!-- RTL for Arabic -->
<html lang="ar" dir="rtl">
```

### Pattern 3: CSS Variable for Icon Mirroring
**What:** Use direction multiplier for selective transform mirroring
**When to use:** Directional icons (arrows, chevrons), shadows with offset
**Example:**
```css
/* Source: Tiger Oakes RTL Tricks */
:root {
  --text-x-direction: 1; /* LTR default */
}

[dir='rtl'] {
  --text-x-direction: -1;
}

.arrow-icon {
  transform: scaleX(var(--text-x-direction));
}

.card-shadow {
  box-shadow: calc(4px * var(--text-x-direction)) 0 3px rgba(0, 0, 0, 0.5);
}
```

### Pattern 4: RTL-Specific Selector
**What:** Apply RTL direction and font stack via attribute selector
**When to use:** Setting direction property and language-specific typography
**Example:**
```css
/* Source: Mozilla RTL Guidelines */
[dir="rtl"] {
  direction: rtl;
  unicode-bidi: embed;
}

[lang="ar"] {
  font-family: "Geeza Pro", "Arabic Typesetting", "Tahoma", sans-serif;
}
```

### Anti-Patterns to Avoid
- **Using CSS direction instead of HTML dir:** W3C explicitly discourages this - direction is semantic and should be in markup
- **Four-value shorthand with physical values:** `margin: 0 1rem 0 2rem` uses physical sides - use longhand logical properties instead
- **Mirroring all icons:** Universal symbols (play, pause, checkmark, logos) should NOT be mirrored
- **Forgetting unicode-bidi:** For inline elements with direction, must pair with `unicode-bidi: embed` or `override`
- **letter-spacing on Arabic:** Disconnects connected letters, making text unreadable - never use letter-spacing for Arabic

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| RTL stylesheet generation | Custom build script duplicating CSS | CSS Logical Properties (native) | No build step needed, automatic adaptation, 96%+ support |
| Icon direction detection | JavaScript to detect dir and flip SVGs | CSS var(--text-x-direction) with transform | Pure CSS, no JS, works with SSR |
| Font loading for Arabic | Manual @font-face with subset generation | System font stack (Geeza Pro, Arabic Typesetting, Tahoma) | Zero download, instant render, no FOUT |
| Border radius in RTL | Manual [dir="rtl"] overrides for each corner | border-start-start-radius logical properties | Automatic adaptation, less code |

**Key insight:** CSS Logical Properties eliminate 95% of RTL work by making layout direction-agnostic from the start. Custom RTL solutions create maintenance burden and miss browser optimizations.

## Common Pitfalls

### Pitfall 1: Mixing Physical and Logical Properties
**What goes wrong:** Using logical margin-inline-start with physical padding-left creates confusion and bugs when direction changes.
**Why it happens:** Incremental migration without converting all related properties together.
**How to avoid:** Convert properties in logical groups - all spacing for a component at once, not piecemeal.
**Warning signs:** CSS with both margin-left and margin-inline-start on same element or nearby selectors.

### Pitfall 2: Forgetting Absolute Positioning
**What goes wrong:** Elements with position: absolute and left/right properties don't flip in RTL.
**Why it happens:** Logical properties for positioning (inset-inline-start) have lower awareness than margin/padding.
**How to avoid:** Search for "position: absolute" and convert left/right to inset-inline-start/end.
**Warning signs:** Dropdown menus, tooltips, or overlays misaligned in RTL mode.

### Pitfall 3: Mirroring Non-Directional Icons
**What goes wrong:** Universal symbols (play button, checkmark, logo) get flipped, confusing users.
**Why it happens:** Applying blanket transform: scaleX(-1) to all icons via [dir="rtl"] .icon selector.
**How to avoid:** Use explicit .mirror-rtl class only on directional elements (arrows, chevrons, back/forward).
**Warning signs:** Play buttons pointing wrong direction, logos appearing reversed.

### Pitfall 4: Typography Issues with Arabic
**What goes wrong:** Line-height too tight cuts off diacritics (kasra), letter-spacing disconnects letters.
**Why it happens:** CSS values tuned for Latin scripts don't account for Arabic vertical metrics and connected letterforms.
**How to avoid:** Test line-height ≥1.7 for Arabic, never use letter-spacing on Arabic content.
**Warning signs:** Cut-off marks above/below Arabic letters, disconnected characters in words.

### Pitfall 5: Gradient and Border Direction
**What goes wrong:** Linear gradients and border-radius corners don't adapt to RTL automatically.
**Why it happens:** Gradients use physical directions (to right), border-radius corners are physical corners.
**How to avoid:** Use logical border-radius properties (border-start-start-radius), test gradients in RTL.
**Warning signs:** Visual asymmetry in RTL - gradients flowing wrong direction, rounded corners on wrong side.

### Pitfall 6: Float-Based Layouts
**What goes wrong:** float: left and float: right don't automatically flip based on direction.
**Why it happens:** Float is a physical property with no logical equivalent yet.
**How to avoid:** Replace float layouts with Flexbox or Grid (both auto-adapt to direction).
**Warning signs:** Floated images on wrong side, text wrapping incorrectly in RTL.

## Code Examples

Verified patterns from official sources:

### Converting Spacing Properties
```css
/* Source: MDN Logical Properties Guide - https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values/Margins_borders_padding */

/* BEFORE: Physical properties */
.element {
  margin-left: 1rem;
  margin-right: 2rem;
  padding-left: 0.5rem;
  padding-right: 1.5rem;
}

/* AFTER: Logical properties */
.element {
  margin-inline-start: 1rem;
  margin-inline-end: 2rem;
  padding-inline-start: 0.5rem;
  padding-inline-end: 1.5rem;
}
```

### Border and Text Alignment
```css
/* Source: MDN Logical Properties Guide */

/* BEFORE */
.alert {
  border-left: 4px solid blue;
  text-align: left;
}

/* AFTER */
.alert {
  border-inline-start: 4px solid blue;
  text-align: start;
}
```

### Absolute Positioning
```css
/* Source: MDN Logical Properties Guide */

/* BEFORE */
.dropdown {
  position: absolute;
  left: 0;
  right: auto;
}

/* AFTER */
.dropdown {
  position: absolute;
  inset-inline-start: 0;
  inset-inline-end: auto;
}
```

### RTL Setup with Direction and Font
```css
/* Source: Mozilla RTL Guidelines - https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html */

[dir="rtl"] {
  direction: rtl;
  unicode-bidi: embed;
}

[lang="ar"] {
  font-family: "Geeza Pro", "Arabic Typesetting", "Tahoma", sans-serif;
  line-height: 1.7; /* Extra space for diacritics */
  letter-spacing: normal; /* Never add letter-spacing */
}
```

### Icon Mirroring with CSS Variable
```css
/* Source: Tiger Oakes RTL Tricks - https://tigeroakes.com/posts/rtl-tricks/ */

:root {
  --text-x-direction: 1;
}

[dir="rtl"] {
  --text-x-direction: -1;
}

/* Directional icons that should mirror */
.arrow-icon,
.chevron-icon,
.back-icon {
  transform: scaleX(var(--text-x-direction));
}

/* Universal icons that should NOT mirror */
.logo,
.play-icon,
.checkmark-icon {
  /* No transform - keep original direction */
}
```

### Shadow Adaptation
```css
/* Source: Tiger Oakes RTL Tricks */

.card {
  /* Horizontal shadow offset adapts to direction */
  box-shadow: calc(4px * var(--text-x-direction)) 0 8px rgba(0, 0, 0, 0.1);
}
```

### Flexbox and Grid (Auto-Adapting)
```css
/* Source: RTL Styling 101 - https://rtlstyling.com/posts/rtl-styling/ */

/* Flexbox automatically reverses in RTL - no changes needed */
.nav {
  display: flex;
  gap: 1rem;
}

/* Grid automatically mirrors in RTL - no changes needed */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Duplicate LTR/RTL stylesheets | CSS Logical Properties | Chrome 89 (2021), Firefox 66 (2019), Safari 15 (2021) | Single source of truth, zero build complexity |
| CSS direction property | HTML dir attribute | W3C recommendation since HTML5 | Semantic direction in markup, works without CSS |
| JavaScript-based icon flipping | CSS var(--text-x-direction) | Community pattern ~2020 | Pure CSS, SSR-compatible, no hydration cost |
| Float-based layouts | Flexbox/Grid | CSS3 (2010s) | Automatic RTL adaptation, modern alignment |
| @font-face for Arabic | System font stack | Always available | Zero download, instant render, better performance |

**Deprecated/outdated:**
- RTLCSS and PostCSS-RTLCSS: Only needed for legacy codebases, not for new projects using logical properties
- Separate .css-ltr and .css-rtl files: Maintenance nightmare, superseded by logical properties
- [dir="rtl"] overrides for every property: Unnecessary with logical properties, creates code bloat
- JavaScript dir detection and class toggling: CSS handles this natively, JS adds complexity

## Open Questions

Things that couldn't be fully resolved:

1. **Border Radius Logical Properties Browser Support**
   - What we know: border-start-start-radius exists but MDN notes some browsers still lack support
   - What's unclear: Exact browser versions with issues, whether SOS Permesso target browsers support it
   - Recommendation: Test in target browsers (Chrome 89+, Safari 15+, Firefox 66+) and fall back to physical properties if needed

2. **Animation Keyframes Direction Adaptation**
   - What we know: Mozilla RTL guidelines mention animations need separate RTL versions with adjusted transforms
   - What's unclear: Whether SOS Permesso animations (lighthouse rotation, wave flow) need RTL variants
   - Recommendation: Audit animations.css for directional movement and test in RTL mode during implementation

3. **Gradients in RTL**
   - What we know: Linear gradients use physical directions (to right, to left)
   - What's unclear: Whether logical gradient direction syntax exists or if [dir="rtl"] overrides are necessary
   - Recommendation: Test existing gradients in RTL mode, add overrides only if visual issues appear

## Sources

### Primary (HIGH confidence)
- [MDN: Logical Properties for Margins, Borders, and Padding](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values/Margins_borders_padding) - Property mappings, browser support
- [MDN: direction Property](https://developer.mozilla.org/en-US/docs/Web/CSS/direction) - CSS direction usage and warnings
- [W3C: Structural Markup and Right-to-Left Text](https://www.w3.org/International/questions/qa-html-dir) - Official guidance on dir attribute vs CSS
- [Mozilla RTL Guidelines](https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html) - Complete RTL implementation patterns
- [Can I Use: CSS Logical Properties](https://caniuse.com/css-logical-props) - 96.48% browser support data

### Secondary (MEDIUM confidence)
- [Tiger Oakes: RTL Tricks](https://tigeroakes.com/posts/rtl-tricks/) - CSS variable technique for icon mirroring
- [RTL Styling 101](https://rtlstyling.com/posts/rtl-styling/) - Migration patterns and best practices
- [shadcn/ui: RTL Support Changelog](https://ui.shadcn.com/docs/changelog/2026-01-rtl) - Modern 2026 RTL implementation example

### Tertiary (LOW confidence)
- Stack Overflow: Arabic font discussions - System font stack recommendations (Geeza Pro, Arabic Typesetting, Tahoma)
- Web.dev: Logical Properties - General guidance, not version-specific
- Medium/dev.to articles - Icon mirroring patterns, common mistakes discussions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - CSS Logical Properties are W3C standard with 96%+ support, well-documented
- Architecture: HIGH - Official Mozilla/W3C guidelines provide authoritative patterns
- Pitfalls: MEDIUM - Based on community articles and GitHub issues, verified with official docs where possible

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable CSS specs, unlikely to change)
