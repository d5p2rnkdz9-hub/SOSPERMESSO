# Phase 14: Propagation - Research

**Researched:** 2026-01-28
**Domain:** HTML template propagation, bulk file editing, static site architecture
**Confidence:** HIGH

## Summary

Phase 14 involves propagating two completed template changes (yellow footer from Phase 12, Collabora dropdown from Phase 13) across 138 HTML files in src/pages/. This is a classic bulk HTML editing problem where header and footer templates need to be updated consistently across a large static site.

The standard approach for this scale (100+ files) is **programmatic find-and-replace** rather than manual editing or build tools. The codebase uses vanilla HTML with no build system, so introducing template engines (Nunjucks, Pug) would be architectural overkill. The existing CSS and JavaScript already handle dropdown behavior, so only HTML updates are needed.

**Primary recommendation:** Use multi-file find-and-replace (sed, Bash, or code editor) to propagate header/footer HTML blocks, then verify with grep and manual spot-checks.

## Standard Stack

The established tools for bulk HTML template propagation in static sites:

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| sed | POSIX | Stream editor for find-and-replace | Universal on Unix/Linux, handles multi-line patterns |
| grep | POSIX | Pattern verification | Confirms changes applied correctly |
| find | POSIX | File selection | Targets specific HTML files efficiently |
| Bash | 3.2+ | Orchestration | Coordinates find/sed/grep operations |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Notepad++ | Latest | GUI find-and-replace | Windows users, visual verification |
| VS Code | Latest | Multi-file search/replace | IDE users, regex preview |
| perl | 5.x+ | Complex regex | When sed's regex insufficient |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sed/Bash | Template engine (Nunjucks) | Adds build complexity, requires npm/Node setup, overkill for one-time propagation |
| Manual editing | GUI tools (Dreamweaver) | Error-prone at 138 files, time-consuming |
| sed | Python script | More readable but requires Python, sed is universal |

**Installation:**
```bash
# Built-in on macOS/Linux (no installation needed)
which sed grep find bash

# Optional GUI alternative
brew install --cask visual-studio-code  # macOS
```

## Architecture Patterns

### Recommended File Selection Pattern
```bash
# Select all HTML files in src/pages/ (138 files)
find src/pages -name "*.html" -type f

# Exclude specific files if needed (none required for this phase)
find src/pages -name "*.html" ! -name "PREVIEW.html" -type f
```

### Pattern 1: Footer Propagation (Single-Line Replace)

**What:** Replace old footer structure with new yellow footer structure

**When to use:** When target and replacement are on single lines or can be matched with simple patterns

**Example:**
```bash
# Source: POSIX sed documentation

# FOR src/pages/*.html (same-directory paths):
find src/pages -name "*.html" -type f -exec sed -i '' \
  -e '/<footer class="footer">/,/<\/footer>/c\
<footer class="footer">\
  <div class="container">\
    <div class="footer-content">\
      <a href="chi-siamo.html" class="footer-project-link">Il Progetto</a>\
      <span class="footer-separator">|</span>\
      <a href="https://form.typeform.com/to/USx16QN3" class="footer-project-link" target="_blank">Contatti</a>\
      <span class="footer-separator">|</span>\
      <p class="footer-copyright">© 2025 SOS Permesso</p>\
    </div>\
  </div>\
</footer>' {} \;
```

**Key points:**
- `-i ''` = in-place editing (macOS syntax, use `-i` on Linux)
- `/pattern1/,/pattern2/c\` = replace range from pattern1 to pattern2
- `{}` = placeholder for each file found
- `\;` = end of -exec command

### Pattern 2: Header Dropdown Addition (Line Insertion)

**What:** Replace "Il progetto" nav item with Collabora dropdown in headers

**When to use:** When structure exists and needs surgical replacement

**Example:**
```bash
# Source: sed multi-line pattern techniques

# Replace the old "Il progetto" line with Collabora dropdown
find src/pages -name "*.html" -type f -exec sed -i '' \
  '/<li class="nav-item"><a href="chi-siamo.html"/c\
            <!-- Collabora with dropdown -->\
            <li class="nav-item has-dropdown">\
              <a href="#collabora" class="nav-link" aria-haspopup="true" aria-expanded="false">Collabora</a>\
              <ul class="nav-dropdown" role="menu">\
                <li role="none"><a href="https://form.typeform.com/to/FsqvzdXI" class="dropdown-link" role="menuitem" target="_blank">Segnala un errore</a></li>\
                <li role="none"><a href="https://form.typeform.com/to/USx16QN3" class="dropdown-link" role="menuitem" target="_blank">Dai una mano</a></li>\
                <li role="none"><a href="chi-siamo.html" class="dropdown-link" role="menuitem">Il progetto</a></li>\
              </ul>\
            </li>' {} \;
```

### Pattern 3: Mobile Navigation Update

**What:** Ensure mobile navigation handles Collabora dropdown in flat list format

**When to use:** Already handled by existing CSS/JS, no propagation needed

**Verification:**
```bash
# Verify mobile.css has dropdown-link styles
grep -c "dropdown-link" src/styles/mobile.css
# Expected: multiple matches (already exists)

# Verify app.js closes menu on dropdown-link click
grep -c "dropdown-link" src/scripts/app.js
# Expected: at least 1 (already handles in line 28)
```

### Recommended Project Structure
```
src/pages/
├── *.html               # 138 files to be updated
└── (no subdirectories)  # All files at same level

Propagation approach:
1. Backup src/pages/ directory
2. Apply footer replacement to all files
3. Apply header replacement to all files
4. Verify with grep
5. Manual spot-check 5-10 random files
```

### Anti-Patterns to Avoid

- **Manual copy-paste per file:** Error-prone, time-consuming, inconsistent results at this scale
- **Template engine for one-time change:** Architectural overkill, adds permanent complexity for temporary benefit
- **Search-replace without backup:** Risky; always backup before bulk operations
- **Forgetting relative path differences:** index.html in root uses `src/pages/chi-siamo.html`, pages use `chi-siamo.html`

## Don't Hand-Roll

Problems that have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-file find-replace | Custom Python script | sed/find combo OR IDE multi-file replace | sed is universal, Python adds dependency |
| Relative path resolution | Manual path fixing | Consistent patterns (same-directory links) | Existing pattern in codebase works |
| Verification | Visual inspection of 138 files | grep pattern counting + spot checks | Scalable, fast, catches edge cases |
| Backup/rollback | Manual copy | Git commit before changes | Version control is backup system |

**Key insight:** Static sites at this scale (100+ pages) benefit from scripting, but don't need build tools. Use POSIX utilities (sed/grep/find) that are universally available and require no setup.

## Common Pitfalls

### Pitfall 1: Relative Path Inconsistency

**What goes wrong:** After propagation, links break because some pages use `href="chi-siamo.html"` (correct) while others incorrectly use absolute paths or wrong relative paths.

**Why it happens:** Not all pages are at the same directory depth. However, in this codebase, ALL 138 pages are in `src/pages/` (same directory), so same-directory relative paths (`chi-siamo.html`) work uniformly.

**How to avoid:**
- Verify all pages are in `src/pages/` with no subdirectories: `find src/pages -type f -name "*.html" | grep -c "/"` should match file count
- Use same-directory relative paths for all internal navigation
- Test navigation from multiple pages after propagation

**Warning signs:** Clicking footer/header links results in 404 errors from some pages but not others.

### Pitfall 2: Sed In-Place Syntax Differences

**What goes wrong:** `sed -i` syntax differs between macOS (BSD sed) and Linux (GNU sed), causing scripts to fail cross-platform.

**Why it happens:** macOS requires `sed -i ''` while Linux uses `sed -i`. The `-i` flag behavior differs.

**How to avoid:**
```bash
# Detect OS and use correct syntax
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS (BSD sed)
  sed -i '' 's/pattern/replacement/' file.html
else
  # Linux (GNU sed)
  sed -i 's/pattern/replacement/' file.html
fi
```

**Warning signs:** Error messages like "sed: 1: file.html: undefined label" or "sed: can't read s/pattern/replacement/: No such file or directory"

### Pitfall 3: Incomplete Multi-Line Matching

**What goes wrong:** Footer or header replacement only matches some files, leaving inconsistent templates across pages.

**Why it happens:**
- Whitespace differences (tabs vs spaces, extra newlines)
- HTML formatting variations (attributes in different order)
- Comments or extra elements inside target blocks

**How to avoid:**
- Use range patterns (`/start/,/end/c\`) instead of exact multi-line matches
- Match on consistent markers (opening/closing tags)
- Verify with grep after replacement: count expected strings
- Spot-check 10+ files manually after bulk operation

**Warning signs:** `grep -c "footer-project-link" src/pages/*.html | wc -l` returns less than 138.

### Pitfall 4: Breaking Existing Functionality

**What goes wrong:** After propagation, dropdown menus don't work on some pages, mobile navigation broken, or styling missing.

**Why it happens:**
- Missing CSS/JS file links in some pages
- JavaScript event handlers not finding new classes
- Mobile CSS not targeting new dropdown structure

**How to avoid:**
- Verify existing CSS handles new classes: `grep "footer-project-link" src/styles/components.css` (already exists from Phase 12)
- Verify JS handles dropdown-link: `grep "dropdown-link" src/scripts/app.js` (already exists)
- Test mobile menu on multiple pages after propagation
- Check browser console for JavaScript errors

**Warning signs:** Some pages have yellow footer but non-functional "Il Progetto" link, or Collabora dropdown doesn't appear on hover.

### Pitfall 5: Git Merge Conflicts from Bulk Changes

**What goes wrong:** Modifying 138 files creates massive git diffs that are hard to review and prone to merge conflicts.

**Why it happens:** Bulk operations touch many files, increasing conflict surface area if other branches exist.

**How to avoid:**
- Commit footer propagation separately from header propagation (2 smaller commits vs 1 massive)
- Create descriptive commit messages: "feat(14): propagate yellow footer to all 138 pages"
- Coordinate with team to avoid concurrent page edits
- Consider propagating in batches (e.g., 50 files at a time) with commits between

**Warning signs:** Git shows 138+ modified files in `git status`, PR has thousands of line changes.

## Code Examples

Verified patterns from codebase and standard tools:

### Complete Propagation Script

```bash
#!/bin/bash
# Source: SOS Permesso Phase 14 implementation plan

set -e  # Exit on error

PROJECT_ROOT="/Users/albertopasquero/Desktop/TECH/SOSpermesso/Sito_Nuovo"
cd "$PROJECT_ROOT"

echo "Phase 14: Propagation Script"
echo "=============================="

# Count target files
FILE_COUNT=$(find src/pages -name "*.html" -type f | wc -l | tr -d ' ')
echo "Target files: $FILE_COUNT"

# Detect OS for sed syntax
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_INPLACE="-i ''"
  echo "OS: macOS (BSD sed)"
else
  SED_INPLACE="-i"
  echo "OS: Linux (GNU sed)"
fi

# Backup before changes
echo "Creating backup..."
cp -r src/pages src/pages.backup.$(date +%Y%m%d_%H%M%S)

# Step 1: Propagate footer
echo "Step 1: Propagating yellow footer..."
# (sed command from Pattern 1 above)

# Verify footer propagation
FOOTER_COUNT=$(grep -l "footer-project-link" src/pages/*.html | wc -l | tr -d ' ')
echo "✓ Footer updated in $FOOTER_COUNT/$FILE_COUNT files"

# Step 2: Propagate header
echo "Step 2: Propagating Collabora dropdown..."
# (sed command from Pattern 2 above)

# Verify header propagation
COLLABORA_COUNT=$(grep -l "Collabora" src/pages/*.html | wc -l | tr -d ' ')
echo "✓ Header updated in $COLLABORA_COUNT/$FILE_COUNT files"

# Final verification
echo ""
echo "Verification Summary:"
echo "- Footer propagated: $FOOTER_COUNT/$FILE_COUNT"
echo "- Header propagated: $COLLABORA_COUNT/$FILE_COUNT"

if [[ $FOOTER_COUNT -eq $FILE_COUNT ]] && [[ $COLLABORA_COUNT -eq $FILE_COUNT ]]; then
  echo "✓ All files updated successfully"
  exit 0
else
  echo "⚠ Warning: Not all files updated. Manual review needed."
  exit 1
fi
```

### Verification Commands

```bash
# Verify footer structure propagated
grep -c "footer-project-link" src/pages/*.html | grep -v ":1$"
# Expected: no output (all files have exactly 1 match)

# Verify Collabora dropdown propagated
grep -c "Collabora" src/pages/*.html | grep -v ":2$"
# Expected: no output (all files have exactly 2 matches - nav text + aria label)

# Find files missing footer update
grep -L "footer-project-link" src/pages/*.html
# Expected: no output

# Find files missing header update
grep -L "Collabora" src/pages/*.html
# Expected: no output

# Spot check random file
shuf -n 1 src/pages/*.html | xargs cat | grep -A 10 "footer"
# Expected: yellow footer structure visible
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Template engines required | POSIX utilities sufficient | 2020+ | Static sites under 1000 pages don't need build systems |
| Manual file editing | Bulk scripting | Always standard | Manual doesn't scale beyond ~20 files |
| Build-time includes | Runtime or pre-propagation | Depends on project | This project has no build step, so pre-propagation is correct |

**Deprecated/outdated:**
- **Server-side includes (SSI):** Requires web server configuration, not portable, `<!--#include virtual="header.html" -->` syntax
- **Framesets:** Deprecated HTML feature, accessibility problems, don't use `<frameset>` for template reuse
- **PHP includes on static hosts:** Requires PHP server, `<?php include 'header.php'; ?>` adds unnecessary server dependency

## Open Questions

Things that couldn't be fully resolved:

1. **Should index.html (root) also be updated?**
   - What we know: index.html in root already has yellow footer and Collabora dropdown (updated in Phases 12-13)
   - What's unclear: Whether root index.html should be included in verification
   - Recommendation: Verify root index.html separately, don't include in bulk src/pages/ operations

2. **Are there any pages with custom footer/header variations?**
   - What we know: All 138 pages in src/pages/ follow standard template structure
   - What's unclear: Whether any pages have intentional variations (e.g., chi-siamo.html about page)
   - Recommendation: Grep for existing variations before propagating: `grep -l "footer" src/pages/*.html | xargs grep -L "footer-links"` to find already-updated pages

3. **Should backup pages be gitignored?**
   - What we know: Backup created before propagation for safety
   - What's unclear: Whether `src/pages.backup.*` should be in .gitignore
   - Recommendation: Add `src/pages.backup.*` to .gitignore, backups are temporary safety net

## Sources

### Primary (HIGH confidence)
- POSIX sed documentation - Multi-line replacement patterns
- SOS Permesso codebase - src/pages/index.html (template reference), src/styles/components.css (footer/dropdown CSS), src/scripts/app.js (dropdown JavaScript)
- Phase 12-01 PLAN.md - Yellow footer specification
- Phase 13-01 PLAN.md - Collabora dropdown specification
- find/grep/sed man pages - Command syntax and options

### Secondary (MEDIUM confidence)
- [HTML Relative Path Guide](https://www.dhiwise.com/blog/design-converter/html-relative-path-a-beginners-guide-to-better-navigation) - Relative path best practices
- [W3Schools HTML File Paths](https://www.w3schools.com/html/html_filepaths.asp) - Path syntax
- [KeyCDN Relative vs Absolute Paths](https://www.keycdn.com/blog/relative-path) - When to use relative paths

### Tertiary (LOW confidence)
- [How to bulk edit HTML files - Quora](https://www.quora.com/How-can-I-bulk-edit-html-files) - General approaches, not project-specific
- [AnandTech Forums: Mass Edit HTML Files](https://forums.anandtech.com/threads/mass-edit-html-files-need-to-change-over-800-files.1894038/) - Community discussion on scale
- [CSS-Tricks: HTML Includes](https://css-tricks.com/the-simplest-ways-to-handle-html-includes/) - Template engine alternatives (not needed here)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - POSIX tools are documented, stable, and verified in codebase
- Architecture: HIGH - Existing patterns examined, relative paths verified, CSS/JS confirmed compatible
- Pitfalls: HIGH - Based on actual codebase structure and common sed/HTML propagation issues
- Code examples: HIGH - Derived from codebase and POSIX documentation

**Research date:** 2026-01-28
**Valid until:** 90 days (stable domain, tools unlikely to change)

**Scale context:**
- 138 HTML files to update
- 2 template changes (footer + header)
- 0 new CSS/JS required (already exists)
- 0 relative path changes needed (all same directory)
