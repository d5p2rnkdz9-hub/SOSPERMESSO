# Phase 4: Color Palette - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace purple color scheme with warm, welcoming teal-based palette on main UI elements while maintaining visual clarity. This covers header, hero section, section backgrounds, and CSS variables. Small decorative elements (floating illustrations) can retain existing colors.

</domain>

<decisions>
## Implementation Decisions

### Teal Shade Selection
- Header gradient: **Bright teal** (#4DB6AC → #80CBC4)
- Lighter, more playful/friendly feeling
- White text and logo remain visible against this background

### Button Behavior
- **Keep yellow buttons** as primary action color
- Only the hero CTA button changes to teal gradient (matching header)
- Primary buttons throughout site stay yellow gradient

### Card Styling
- **Keep current rainbow gradient border** on hover
- The rainbow gradient (yellow → orange → pink → purple → blue) stays as-is
- It's a playful detail that doesn't dominate the UI

### Purple Removal Scope
- Main UI elements: header, buttons, section backgrounds → no purple
- Small decorative elements (floating SVG illustrations): can keep purple strokes
- The paper stack decoration (#AB47BC stroke) stays as-is

### Section Backgrounds
- Tests section: Keep green→yellow gradient (already warm)
- Guide section: Change blue→purple to **teal→mint**
- Link utili section: Keep orange→peach tones

### Hero Section Updates
- Highlight word changes from "Amichevole" to "Facile" (per TEXT-01)
- Highlight word color: Teal (#26A69A or similar) instead of purple
- Hero CTA button: Teal gradient matching header
- Floating decorations: Make slightly bigger, float a bit more (subtle animation change)

### Claude's Discretion
- Exact hex values for teal gradient fine-tuning
- Section title underline gradient colors
- Alert box accent colors (if any use purple)
- Mobile menu dropdown background color

</decisions>

<specifics>
## Specific Ideas

- "Bright teal" preference — lighter and more playful, not dark/corporate
- Decorations should be "slightly bigger, float a bit more" — subtle enhancement
- Rainbow card border is valued as a "playful detail"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-color-palette*
*Context gathered: 2026-01-25*
