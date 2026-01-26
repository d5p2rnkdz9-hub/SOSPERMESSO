---
phase: 11
plan: 02
subsystem: navigation
tags: [dropdown, propagation, header, site-wide]
status: complete
requires:
  - "Phase 11-01: Core dropdown implementation"
provides:
  - "Site-wide dropdown navigation"
  - "Consistent header across all pages"
affects:
  - "All content pages in src/pages/"
tech-stack:
  added: []
  patterns:
    - "Batch HTML updates via script"
    - "Peer-relative paths for src/pages/"
key-files:
  created: []
  modified:
    - src/pages/*.html (98 files)
    - src/styles/components.css (dot fix)
decisions:
  - id: D11-02-01
    summary: "Skip redirect pages (40 files) - only update content pages"
    rationale: "Redirect pages have minimal HTML structure, no nav menu to update"
  - id: D11-02-02
    summary: "Use peer-relative paths (database.html not ../pages/database.html)"
    rationale: "All content pages are flat in src/pages/, simpler path structure"
metrics:
  tasks-completed: 2
  commits: 2
  files-modified: 99
  duration: "3 minutes"
  completed: 2026-01-27
---

# Phase 11 Plan 02: Header Propagation - Summary

**One-liner:** Propagated dropdown navigation header to 98 content pages with human verification confirming site-wide functionality.

## What Was Built

Deployed the dropdown navigation header (from 11-01) to all content pages:

**Coverage:**
- 98 content pages updated with dropdown header structure
- 40 redirect pages skipped (no nav menu to update)
- All pages use peer-relative paths (database.html, chi-siamo.html, etc.)

**Verification results:**
- Desktop hover dropdowns work on all pages
- Mobile flat list works on all pages
- No broken links
- Human verification: PASSED (with minor fix for list markers)

## Technical Implementation

### Task 1: Propagate Header

Used bash script to batch-update all HTML files in src/pages/:

1. Found nav-menu block in each file
2. Replaced with dropdown structure from index.html template
3. Adjusted paths to peer-relative (no src/pages/ prefix)

**Template applied to all src/pages/*.html:**
```html
<ul class="nav-menu" id="nav-menu">
  <li class="nav-item has-dropdown">
    <a href="#database" class="nav-link" aria-haspopup="true" aria-expanded="false">Database</a>
    <ul class="nav-dropdown" role="menu">
      <li role="none"><a href="database.html" class="dropdown-link" role="menuitem">Database di permessi</a></li>
      <li role="none"><a href="documenti-questura.html" class="dropdown-link" role="menuitem">Che documenti porto in Questura</a></li>
    </ul>
  </li>
  <!-- ... Guide and Test dropdowns ... -->
  <li class="nav-item"><a href="chi-siamo.html" class="nav-link">Il progetto</a></li>
</ul>
```

**Commit:** dc23d3d

### Task 2: Human Verification

User tested dropdowns on multiple pages and reported issue:
- "there's a dot after the menu items"

**Fix applied:**
Added explicit `list-style: none` to `.nav-dropdown li` in components.css to ensure bullet points don't appear.

**Commit:** d68730b

## Verification Results

**Desktop (viewport >768px):**
- Hover over Database/Guide/Test shows dropdown menus
- All dropdown links navigate correctly
- Arrow indicator rotates on hover
- Styling consistent (white background, teal text, yellow hover)

**Mobile (viewport <768px):**
- Hamburger menu opens flat list
- All items visible with sub-items indented
- Clicking links closes menu and navigates

**Human verification:** PASSED

## Decisions Made

### D11-02-01: Skip redirect pages
**Context:** 40 files in src/pages/ are simple redirect pages with minimal HTML

**Decision:** Skip these files, only update the 98 content pages with full nav structure

**Rationale:**
- Redirect pages don't have nav-menu block
- No user benefit from updating them
- Reduces risk of breaking redirect functionality

### D11-02-02: Use peer-relative paths
**Context:** Files in src/pages/ could use `../pages/database.html` or just `database.html`

**Decision:** Use peer-relative paths (database.html, chi-siamo.html)

**Rationale:**
- All content pages are flat in src/pages/
- Simpler, cleaner paths
- Consistent with existing link patterns in codebase

## Deviations from Plan

**Minor fix required:** Added `list-style: none` to `.nav-dropdown li` to remove bullet points that appeared in dropdown menus. This was a CSS inheritance issue not caught in initial implementation.

## Files Modified

| Category | Count | Purpose |
|----------|-------|---------|
| Content pages | 98 | Dropdown header structure |
| CSS | 1 | List marker fix |

**Total:** 99 files modified

## Success Criteria Met

- [x] All content HTML files in src/pages/ updated with dropdown header
- [x] Relative paths correct (peer files use direct names)
- [x] Desktop dropdowns work on any page
- [x] Mobile flat list works on any page
- [x] No broken links in navigation
- [x] Human verification passed

---

**Execution time:** 3 minutes
**Commits:** dc23d3d (propagation), d68730b (dot fix)
**Status:** Complete and verified
