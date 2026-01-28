---
phase: 17
plan: 01
phase-name: content-migration-visual-polish
plan-name: triangle-bullet-css

subsystem: frontend-styling
tags: [css, visual-consistency, bullet-styling]

dependency-graph:
  requires: []
  provides: [triangle-bullet-css-rules, consistent-list-styling]
  affects: [17-02-content-migration, 17-03-visual-polish]

tech-stack:
  added: []
  patterns: [css-pseudo-elements, absolute-positioning]

key-files:
  created: []
  modified:
    - src/styles/main.css

decisions:
  - id: BULLET-01
    what: Use blue triangle bullets instead of yellow
    why: Yellow triangles not visible on white card backgrounds
    impact: Better visibility and accessibility

  - id: BULLET-02
    what: Increase triangle size from 0.75rem to 0.85rem
    why: Original size too small and hard to see
    impact: Better visual prominence and readability

metrics:
  duration: 11.6min
  completed: 2026-01-28
---

# Phase 17 Plan 01: Triangle Bullet CSS Summary

**One-liner:** Add consistent blue triangle bullet styling to all card list items using CSS pseudo-elements

## What Was Built

Added CSS rules to `src/styles/main.css` for consistent triangle bullet styling across all `.card ul li` elements:

- Primary bullets use `\25B8` (BLACK RIGHT-POINTING SMALL TRIANGLE) in blue
- Nested bullets use `\25B9` (WHITE RIGHT-POINTING SMALL TRIANGLE) at smaller size
- Positioned using absolute positioning with proper left offset
- Applied globally to all card lists for consistency

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed triangle bullet visibility**

- **Found during:** Task 1, visual verification
- **Issue:** Initial implementation used `--taxi-yellow-dark` color, but yellow triangles were not visible on white card backgrounds
- **Fix:** Changed to `var(--accent-blue)` for better visibility and contrast
- **Files modified:** src/styles/main.css
- **Commit:** 65e5ba7

**2. [Rule 2 - Missing Critical] Increased triangle size**

- **Found during:** Task 1, visual verification
- **Issue:** Triangle font-size of 0.75rem was too small and hard to see
- **Fix:** Increased primary triangle to 0.85rem, nested to 0.75rem
- **Files modified:** src/styles/main.css
- **Commit:** 65e5ba7

## Tasks Completed

| Task | Type | Description | Outcome | Commit |
|------|------|-------------|---------|--------|
| 1 | auto | Add triangle bullet CSS rules | Added `.card ul li::before` rules with triangle unicode | 034acfb |
| - | fix | Fix triangle visibility and size | Changed yellow to blue, increased size | 65e5ba7 |
| 2 | checkpoint:human-verify | Verify visual consistency | User approved visual appearance | - |

## Technical Implementation

**CSS Approach:**
```css
.card ul li::before {
  content: '\25B8';
  position: absolute;
  left: -1.25rem;
  color: var(--accent-blue);
  font-size: 0.85rem;
  line-height: 1.5;
}
```

**Key Techniques:**
- Used `::before` pseudo-element for bullets (keeps HTML clean)
- `list-style: none` on parent `<ul>` to remove default disc bullets
- Absolute positioning for precise triangle placement
- Unicode triangle characters for cross-browser compatibility
- CSS variables for color consistency with design system

## Success Criteria Met

- ✅ VIS-01 SATISFIED: Consistent bullet styling (triangles, not mixed disc/checkmarks)
- ✅ No visual regressions on other pages
- ✅ CSS loads without errors
- ✅ User approved visual appearance

## Known Issues

**Content Issue (Not CSS-related):**
During verification, noticed some permit pages have duplicate question content (e.g., "Che cos'è il permesso di studio?" appears twice). This is a build script content generation issue, not related to CSS bullet styling. Will be addressed in future content migration work.

## Files Modified

### src/styles/main.css
- Added "List inside cards - Triangle bullets" section
- `.card ul li::before` with blue triangle bullet
- `.card ul ul li::before` for nested lists
- Proper spacing and positioning for alignment

## Next Phase Readiness

**Ready for 17-02 (Content Migration):**
- ✅ Triangle bullet CSS provides consistent visual foundation
- ✅ All card lists now have standardized appearance
- ✅ No blocking issues for content work

**Notes for future work:**
- Question duplication in content needs build script fix
- Consider adding hover state for interactive lists if needed
- Triangle bullet pattern can be extended to other components if desired

## Lessons Learned

1. **Color Testing Critical:** Yellow looked good in design system but failed visibility test on white backgrounds. Always test text/icon colors against their actual backgrounds.

2. **Size Matters:** Small decorative elements like bullets need to be sized for visibility, not just aesthetics. 0.85rem proved to be minimum viable size.

3. **Pseudo-Elements for Styling:** Using `::before` for bullets keeps HTML semantic and clean while allowing full CSS control over appearance.

## Time Breakdown

- Planning & CSS implementation: 3min
- Visual testing & fixes (color + size): 5min
- User verification: 2min
- Documentation: 1.6min
- **Total:** 11.6min
