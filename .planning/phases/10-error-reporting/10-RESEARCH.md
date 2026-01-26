# Phase 10: Error Reporting - Research

**Researched:** 2026-01-26
**Domain:** Static HTML site enhancement, Typeform integration, CSS UI components
**Confidence:** HIGH

## Summary

This phase implements an error reporting button on content pages that redirects users to a Typeform with pre-filled page context. The technical investigation reveals a pure static HTML site (138 pages, 128 content pages) with no runtime templating system, requiring careful approach to propagating changes across files.

**Key Findings:**
- Typeform URL parameters use simple anchor-based syntax: `https://form.typeform.com/to/FORM_ID#field_name=value`
- The site has 128 content pages (permit pages, document pages, carta pages) that need the button
- A Node.js build script exists (`scripts/build-documents.js`) that generates document pages from templates
- CSS design system is well-established with CSS variables for colors and spacing
- Breadcrumb positioning provides clear reference point for button placement

**Primary recommendation:** Add button via template modification for generated pages, manual sed script for existing pages, with CSS component following established design patterns (teal color scheme, subtle presentation).

## Standard Stack

### Core Technologies (Already in Use)
| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| Pure HTML/CSS/JS | HTML5 | Static site structure | Project requirement, no framework |
| CSS Variables | CSS3 | Design system | Maintainable theming |
| Typeform | Current | External form service | Already integrated for contact forms |

### Supporting Tools
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Node.js | Any | Build script execution | Generating document pages from templates |
| sed | Unix standard | Bulk HTML editing | One-time changes to existing files |
| find + exec | Unix standard | File operations | Applying changes to multiple files |

### No Installation Required
All necessary tools already exist in the project or are Unix standard utilities.

## Architecture Patterns

### Current Project Structure
```
src/
├── pages/               # 138 HTML files
│   ├── permesso-*.html        # ~7 permit info pages
│   ├── documenti-*-primo.html # Document requirement pages (first-time)
│   ├── documenti-*-rinnovo.html # Document requirement pages (renewal)
│   ├── carta-*.html           # Special permit card pages
│   ├── database.html          # Database landing (NOT a content page)
│   ├── chi-siamo.html         # About page (NOT a content page)
│   └── ...
├── styles/
│   ├── main.css              # CSS variables system
│   ├── components.css        # Component styles
│   └── ...
└── scripts/
    ├── build-documents.js    # Generates documenti-* pages
    └── templates/
        ├── primo.js          # Template for primo rilascio pages
        └── rinnovo.js        # Template for rinnovo pages
```

### Pattern 1: Template-Based Generation (RECOMMENDED for new pages)

**What:** Node.js script generates HTML pages from templates using data from Notion
**When to use:** Any future document pages (already being generated)
**Where to modify:** `scripts/templates/primo.js` and `scripts/templates/rinnovo.js`

**Example structure from templates:**
```javascript
// scripts/templates/primo.js
function generatePrimoPage(data) {
  return `<!DOCTYPE html>
<html lang="it">
  <!-- HEADER -->
  <!-- BREADCRUMB -->
  <!-- PAGE HEADER -->
  <!-- CONTENT -->
    <div class="container" style="max-width: 900px;">
      <!-- INSERT ERROR BUTTON HERE -->
      <!-- Content cards -->
    </div>
  <!-- FOOTER -->
</html>`;
}
```

### Pattern 2: Bulk HTML Modification (REQUIRED for existing pages)

**What:** Use Unix tools to add button HTML to existing static files
**When to use:** Existing permit pages and non-generated document pages
**Implementation:**

```bash
# Target: All content pages (permit-*, documenti-*, carta-*)
# Location: After breadcrumb section, before page header
# Method: sed with backup, applied via find + exec

find src/pages -type f \
  \( -name "permesso-*.html" \
  -o -name "documenti-*.html" \
  -o -name "carta-*.html" \) \
  -exec sed -i.bak \
  's|<!-- BREADCRUMB -->|<!-- BREADCRUMB --><!-- ERROR BUTTON INSERTED -->|' {} +
```

### Pattern 3: Button Positioning Strategy

**HTML Structure:**
```html
<!-- BREADCRUMB -->
<section class="section" style="padding: 1rem 0;">
  <div class="container">
    <div style="font-size: 0.875rem; color: var(--gray-medium);">
      <a href="../../index.html">Home</a> → <span>Page</span>
    </div>
    <!-- ERROR BUTTON POSITIONED HERE -->
    <a href="https://form.typeform.com/to/FORM_ID#page_url={CURRENT_URL}"
       class="error-report-btn"
       target="_blank"
       rel="noopener noreferrer">
      🚨 Segnala errore
    </a>
  </div>
</section>
```

**CSS Positioning:**
```css
/* Position relative to breadcrumb container */
.section {
  position: relative;
}

.error-report-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  /* Styling follows below */
}
```

### Anti-Patterns to Avoid

- **DON'T use JavaScript to get window.location**: Typeform can't receive dynamic data this way; use static template variables instead
- **DON'T make button intrusive**: Must not block breadcrumbs or content
- **DON'T use float: right with position: absolute**: Absolute positioning removes element from flow, making float ineffective
- **DON'T edit database.html, chi-siamo.html, or other non-content pages**: Button only belongs on content pages with factual information

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form submission handling | Custom PHP/backend | Typeform with URL params | Already integrated, no server required |
| Bulk HTML editing | Manual copy-paste | sed + find | 128 files, error-prone manually |
| URL encoding | Custom JavaScript | Browser native encoding | `encodeURIComponent()` built-in |
| Page URL detection | Custom script | Template variable | Build script knows page name |
| Design system | New button styles | Existing CSS variables | Consistency with --accent-teal |

**Key insight:** Static site means no runtime templating. Use build-time templating (Node.js) for generated pages, one-time script for existing pages.

## Typeform URL Parameters

### Official Syntax (HIGH Confidence)

**Source:** [Typeform URL Parameters Documentation](https://www.typeform.com/developers/create/url-parameters/)

**Format:**
```
https://form.typeform.com/to/FORM_ID#param_name=value&another_param=value
```

**Key Rules:**
1. Use **anchor (`#`)** not query string (`?`)
2. Parameter names use **lowercase** and **underscores** (e.g., `page_url`, `error_type`)
3. Values must be **URL-encoded** (spaces as `%20`, special chars encoded)
4. Parameters must be **declared in Typeform** form settings first

**Example for this project:**
```
https://form.typeform.com/to/ERROR_FORM_ID#page_url=https%3A%2F%2Fsospermesso.it%2Fsrc%2Fpages%2Fpermesso-studio.html
```

### Implementation Pattern

**Step 1: User creates Typeform with hidden field**
- Field name in Typeform: `page_url` (must match URL parameter exactly)
- Field type: Hidden field (formerly called URL parameter)

**Step 2: Generate URL for each page**
```html
<!-- For permesso-studio.html -->
<a href="https://form.typeform.com/to/FORM_ID#page_url=https://sospermesso.it/src/pages/permesso-studio.html">
  Segnala errore
</a>
```

**Step 3: Typeform receives data**
- `page_url` field auto-populated with: `https://sospermesso.it/src/pages/permesso-studio.html`
- User sees form, fills error type and description
- Submission includes page context automatically

### Limitations
- Hidden fields are **pre-filled only** (user can't change them)
- Values are **visible in URL** (don't use for sensitive data)
- Parameter names must **exactly match** Typeform field names

## Button Design Patterns

### Visual Design (Following Existing System)

**Color Scheme:**
```css
.error-report-btn {
  /* Use teal from existing system */
  color: #1A6B5F; /* --accent-teal from header nav links */
  background: transparent;
  border: 1px solid #26A69A;

  /* Subtle, non-intrusive */
  font-size: 0.875rem; /* Same as breadcrumb */
  padding: 0.5rem 1rem;
  border-radius: 9999px; /* var(--radius-full) */

  /* Hover state */
  transition: all 0.25s ease-in-out;
}

.error-report-btn:hover {
  background: rgba(38, 166, 154, 0.1);
  border-color: #1A6B5F;
  transform: translateY(-2px);
}
```

**Typography:**
- Font size: `0.875rem` (14px) - matches breadcrumb, not competing with content
- Font weight: 500 or 600 (medium emphasis)
- Icon: 🚨 emoji provides visual recognition without icon library

**Positioning Strategy:**
```css
/* Breadcrumb section becomes positioning context */
.section {
  position: relative;
}

/* Button positioned top-right of breadcrumb container */
.error-report-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10; /* Above breadcrumb, below header */
}

/* Mobile responsive */
@media (max-width: 768px) {
  .error-report-btn {
    position: static; /* Fall back to normal flow */
    display: block;
    margin-top: 0.75rem;
    text-align: center;
  }
}
```

### UX Best Practices

**Source:** [Error Message UX Best Practices](https://www.nngroup.com/articles/errors-forms-design-guidelines/)

**Non-Intrusive Principles:**
1. **Subtle visual weight**: Small size, outline style (not solid background)
2. **Clear placement**: Consistent location (top-right) without blocking content
3. **Accessible**: `target="_blank"` with `rel="noopener noreferrer"` for security
4. **Mobile-friendly**: Shifts to normal flow on small screens (no overlap)

**Accessibility:**
```html
<a href="..."
   class="error-report-btn"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="Segnala un errore in questa pagina">
  🚨 Segnala errore
</a>
```

## Common Pitfalls

### Pitfall 1: Wrong Typeform URL Syntax

**What goes wrong:** Using query string `?page_url=...` instead of anchor `#page_url=...`
**Why it happens:** Query strings are more common in web development
**How to avoid:** Always use `#` for Typeform parameters, verified in official documentation
**Warning signs:** Typeform form doesn't pre-fill the hidden field

### Pitfall 2: Editing Non-Content Pages

**What goes wrong:** Adding button to database.html, chi-siamo.html, aiuto-legale.html
**Why it happens:** Overly broad file pattern matching (e.g., `*.html` instead of `permesso-*.html`)
**How to avoid:** Explicitly target only content pages:
```bash
# GOOD
find . -name "permesso-*.html" -o -name "documenti-*.html"

# BAD
find . -name "*.html"
```
**Warning signs:** Button appears on navigation/landing pages

### Pitfall 3: Breaking Existing Layout

**What goes wrong:** Button overlaps breadcrumbs or page header on mobile
**Why it happens:** Absolute positioning without responsive breakpoint
**How to avoid:** Use `@media` query to shift to normal flow on mobile:
```css
@media (max-width: 768px) {
  .error-report-btn {
    position: static;
    display: block;
    margin-top: 0.75rem;
  }
}
```
**Warning signs:** Breadcrumb text hidden behind button on iPhone

### Pitfall 4: Forgetting URL Encoding

**What goes wrong:** Special characters in URL break Typeform link
**Why it happens:** Page URLs contain slashes, query strings, or special characters
**How to avoid:** Template generation should encode URLs:
```javascript
const pageUrl = `https://sospermesso.it/src/pages/${filename}`;
const encodedUrl = encodeURIComponent(pageUrl);
const typeformUrl = `https://form.typeform.com/to/FORM_ID#page_url=${encodedUrl}`;
```
**Warning signs:** Typeform shows 404 or doesn't load

### Pitfall 5: Sed Script Without Backup

**What goes wrong:** Bulk edit corrupts files with no recovery option
**Why it happens:** Using `sed -i` without `.bak` extension
**How to avoid:** Always create backup: `sed -i.bak 's/old/new/'`
**Warning signs:** Git diff shows unexpected changes, syntax errors in HTML

### Pitfall 6: Not Testing Mobile Layout

**What goes wrong:** Button looks good on desktop but breaks mobile navigation
**Why it happens:** Only testing on desktop browser, not responsive mode
**How to avoid:** Test with Chrome DevTools mobile emulation (iPhone SE, iPad)
**Warning signs:** Mobile users report navigation issues

## Code Examples

### Complete Button HTML (Template Integration)

**Source:** Generated from existing design system patterns

```html
<!-- BREADCRUMB -->
<section class="section" style="padding: 1rem 0;">
  <div class="container" style="position: relative;">

    <!-- Existing breadcrumb -->
    <div style="font-size: 0.875rem; color: var(--gray-medium);">
      <a href="../../index.html" style="color: var(--taxi-yellow-dark);">Home</a> →
      <a href="database.html" style="color: var(--taxi-yellow-dark);">Database</a> →
      <span>Permesso per studio</span>
    </div>

    <!-- NEW: Error report button -->
    <a href="https://form.typeform.com/to/FORM_ID#page_url=https%3A%2F%2Fsospermesso.it%2Fsrc%2Fpages%2Fpermesso-studio.html"
       class="error-report-btn"
       target="_blank"
       rel="noopener noreferrer"
       aria-label="Segnala un errore in questa pagina">
      🚨 Segnala errore
    </a>

  </div>
</section>
```

### Complete Button CSS (components.css)

**Source:** Following existing CSS patterns in components.css

```css
/* ===============================================
   ERROR REPORT BUTTON
   =============================================== */

.error-report-btn {
  /* Positioning */
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;

  /* Visual style - subtle teal outline */
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;

  /* Colors - matching header nav links */
  color: #1A6B5F; /* Teal text */
  background: transparent;
  border: 1px solid #26A69A; /* Teal border */
  border-radius: var(--radius-full);

  /* Typography */
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  line-height: 1;

  /* Transitions */
  transition: all var(--transition-base);
}

.error-report-btn:hover {
  color: #1A6B5F;
  background: rgba(38, 166, 154, 0.1);
  border-color: #1A6B5F;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(26, 107, 95, 0.15);
}

.error-report-btn:active {
  transform: translateY(0);
}

/* Mobile responsive - shift to normal flow */
@media (max-width: 768px) {
  .error-report-btn {
    position: static;
    display: block;
    width: fit-content;
    margin: 0.75rem auto 0;
    text-align: center;
  }
}

/* Landscape mobile - keep absolute but adjust spacing */
@media (max-width: 768px) and (orientation: landscape) {
  .error-report-btn {
    position: absolute;
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
}
```

### Template Modification (primo.js example)

**Source:** Adaptation of existing build script pattern

```javascript
// scripts/templates/primo.js
const { encodeURIComponent } = require('url');

function generatePrimoPage(data, filename) {
  const pageUrl = `https://sospermesso.it/src/pages/${filename}`;
  const encodedPageUrl = encodeURIComponent(pageUrl);
  const typeformUrl = `https://form.typeform.com/to/FORM_ID#page_url=${encodedPageUrl}`;

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <!-- head content -->
</head>
<body>
  <!-- HEADER -->
  <header class="header">
    <!-- header content -->
  </header>

  <!-- BREADCRUMB -->
  <section class="section" style="padding: 1rem 0;">
    <div class="container" style="position: relative;">
      <div style="font-size: 0.875rem; color: var(--gray-medium);">
        <a href="../../index.html" style="color: var(--taxi-yellow-dark);">Home</a> →
        <a href="database.html" style="color: var(--taxi-yellow-dark);">Database</a> →
        <span>${data.title}</span>
      </div>

      <!-- ERROR BUTTON -->
      <a href="${typeformUrl}"
         class="error-report-btn"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Segnala un errore in questa pagina">
        🚨 Segnala errore
      </a>
    </div>
  </section>

  <!-- Rest of page -->
</body>
</html>`;
}

module.exports = { generatePrimoPage };
```

### Bulk Edit Script (One-Time Use)

**Source:** Standard sed pattern for HTML bulk editing

```bash
#!/bin/bash
# add-error-buttons.sh
# Adds error report button to existing content pages

TYPEFORM_ID="FORM_ID_HERE"
BASE_URL="https://sospermesso.it/src/pages"

# Find all content pages
find src/pages -type f \
  \( -name "permesso-*.html" \
  -o -name "carta-*.html" \) \
  ! -name "database.html" \
  ! -name "chi-siamo.html" \
  -exec sh -c '
    filename=$(basename "$1")
    encoded_url=$(printf "%s" "'"$BASE_URL"'/$filename" | sed "s/:/%3A/g; s|/|%2F|g; s/\./%2E/g")
    button_html="<a href=\"https://form.typeform.com/to/'"$TYPEFORM_ID"'#page_url=$encoded_url\" class=\"error-report-btn\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Segnala un errore in questa pagina\">🚨 Segnala errore</a>"

    # Insert button after breadcrumb div, before closing </div>
    sed -i.bak "/<div style=\"font-size: 0.875rem; color: var(--gray-medium);\">/,/<\/div>/ {
      /<\/div>/ a\\
      \\
      $button_html
    }" "$1"

    echo "✓ Added button to $filename"
  ' _ {} \;

echo ""
echo "Done! Backup files created with .bak extension"
echo "Test the changes, then remove backups with: find src/pages -name '*.bak' -delete"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual email for errors | Embedded feedback forms | ~2020 | Structured data collection |
| Query string params (`?field=value`) | Anchor params (`#field=value`) for Typeform | 2019 | Typeform-specific syntax |
| Fixed positioning for buttons | Absolute within relative parent | Ongoing | Better responsive behavior |
| Manual HTML editing for bulk changes | Sed + find scripts | Always available | 100x faster for 128 files |

**Current in 2026:**
- Typeform URL parameters (formerly "Hidden Fields") is the standard terminology
- Static site generators recommended for sites >50 pages, but not required
- CSS variables for design systems is standard practice
- Mobile-first responsive design is expected

**Deprecated/outdated:**
- Typeform "Hidden Fields" terminology (now "URL Parameters")
- Using `float: right` for positioning (prefer absolute/relative)
- Server-side form processing for simple feedback (Typeform/Formspree sufficient)

## Open Questions

### Question 1: What is the actual Typeform form ID?

**What we know:** User needs to create Typeform with:
- Hidden field named `page_url`
- Error type dropdown field (5 categories, user defines)
- Description text field

**What's unclear:** The actual form ID to use in URLs

**Recommendation:**
- Template/script should accept `FORM_ID` as variable
- User provides ID after creating Typeform
- Search & replace `FORM_ID` with actual ID before running script

### Question 2: Should documenti-* pages get the button?

**What we know:**
- 128 content pages total
- Most are `documenti-*-primo.html` and `documenti-*-rinnovo.html`
- These are generated by build script
- Requirements say "permit pages, document pages, guide pages"

**What's unclear:** Are document requirement pages considered "content pages"?

**Recommendation:**
- YES, include documenti-* pages
- These contain factual information that can have errors
- User wants comprehensive error reporting
- Add to templates (primo.js, rinnovo.js)

### Question 3: Should button be inside or outside breadcrumb div?

**What we know:**
- Breadcrumb section has `<div class="container">`
- Inside that is `<div style="font-size: 0.875rem">` with breadcrumb links
- Container needs `position: relative` for button positioning

**What's unclear:** Best semantic HTML structure

**Recommendation:**
- Add `style="position: relative;"` to container div
- Place button as sibling to breadcrumb div (both inside container)
- This keeps breadcrumb semantics clean while enabling positioning

## Sources

### Primary (HIGH confidence)
- [Typeform URL Parameters Documentation](https://www.typeform.com/developers/create/url-parameters/) - Official syntax and implementation
- SOS Permesso codebase analysis - Actual file structure and design patterns
- [CSS Position Properties - W3Schools](https://www.w3schools.com/css/css_positioning.asp) - Position absolute/relative

### Secondary (MEDIUM confidence)
- [Error Message UX Best Practices - Nielsen Norman Group](https://www.nngroup.com/articles/errors-forms-design-guidelines/) - Non-intrusive design principles
- [Replace Text in Multiple Files - Red Hat](https://www.redhat.com/sysadmin/edit-text-bash-command) - Sed bulk editing techniques
- [Absolute Positioning Inside Relative - CSS-Tricks](https://css-tricks.com/absolute-positioning-inside-relative-positioning/) - Parent-child positioning pattern

### Tertiary (LOW confidence - general reference)
- [Static Site Generators 2026 - Kinsta](https://kinsta.com/blog/static-site-generator/) - Alternative approaches context
- WebSearch results on button design and color schemes - General UX patterns

## Metadata

**Confidence breakdown:**
- Typeform syntax: HIGH - Verified with official documentation
- Button positioning: HIGH - Standard CSS pattern, verified with existing codebase
- Bulk editing approach: HIGH - Standard Unix tools, verified approach
- Design patterns: HIGH - Extracted from existing CSS system
- Mobile responsiveness: MEDIUM - Pattern is standard but needs testing on actual devices

**Research date:** 2026-01-26
**Valid until:** 90 days (stable technologies - HTML/CSS/Typeform basics don't change rapidly)

**Scope covered:**
- ✅ Typeform URL parameter syntax
- ✅ Page identification (128 content pages vs 10 non-content pages)
- ✅ Existing CSS design system
- ✅ Build script architecture
- ✅ Bulk editing strategies
- ✅ Button positioning patterns
- ✅ Responsive design considerations
- ✅ Common pitfalls and anti-patterns

**Key unknowns (planner should address):**
- Actual Typeform form ID (user creates)
- Exact error type categories (user defines in Typeform)
- Whether to process generated pages first or bulk-edit existing pages first
- Testing strategy for 128 pages
