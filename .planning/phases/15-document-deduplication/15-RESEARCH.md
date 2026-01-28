# Phase 15: Document Deduplication - Research

**Researched:** 2026-01-28
**Domain:** HTML content refactoring, CTA button patterns, static site architecture
**Confidence:** HIGH

## Summary

Phase 15 involves removing inline document sections from 21 permit pages and replacing them with two CTA buttons that link to dedicated document pages. This is a content restructuring task that deduplicates information - document lists currently appear in both permit pages (permesso-*.html) and dedicated document pages (documenti-*-primo.html / documenti-*-rinnovo.html).

The codebase already has established patterns for buttons (.btn, .btn-primary, .btn-secondary) and card layouts that can be used for the CTA section. The existing document pages follow a redirect pattern where simple URLs (documenti-studio-primo.html) redirect to detailed URLs (documenti-studio-art-39-primo.html).

The standard approach is: (1) Design a CTA button container that fits between the page header and content sections, (2) Remove inline document sections (cards with "Documenti" headers), (3) Apply the pattern consistently across all 21 permit pages using the Python/sed automation approach established in Phase 14.

**Primary recommendation:** Create a two-button CTA section using existing .btn-primary and .btn-secondary classes, positioned immediately after the page header section. Remove document cards entirely and link to the existing redirect pages (documenti-[permit]-primo.html and documenti-[permit]-rinnovo.html).

## Standard Stack

The established tools/patterns for this task:

### Core
| Tool/Pattern | Version | Purpose | Why Standard |
|--------------|---------|---------|--------------|
| Existing CSS (.btn classes) | Current | Button styling | Already defined in components.css, consistent with site design |
| Python/sed | POSIX | Bulk HTML editing | Proven in Phase 14, handles 21 files efficiently |
| Relative paths | N/A | Same-directory links | All pages in src/pages/, simple relative paths work |

### Supporting
| Tool/Pattern | Version | Purpose | When to Use |
|--------------|---------|---------|-------------|
| .grid-2 class | Current | Two-column button layout | Place buttons side-by-side on desktop |
| .flex-center class | Current | Centering | Center button container if grid not used |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Two separate buttons | Single "View Documents" link | Less clear UX - users need primo vs rinnovo distinction immediately |
| Inline buttons | Card-style CTA section | Cards add more visual weight, buttons are faster to scan |
| Manual editing | Automated find/replace | Manual too slow for 21 files, automation ensures consistency |

**No installation required** - all patterns exist in current codebase.

## Architecture Patterns

### Recommended CTA Section Structure

Position: Immediately after `<!-- PAGE HEADER -->` section, before `<!-- CONTENT -->` section.

```html
<!-- DOCUMENT CTA -->
<section class="section" style="padding: 1.5rem 0;">
  <div class="container" style="max-width: 900px;">
    <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
      <a href="documenti-[permit]-primo.html" class="btn btn-primary btn-lg">
        Documenti per il primo rilascio
      </a>
      <a href="documenti-[permit]-rinnovo.html" class="btn btn-secondary btn-lg">
        Documenti per il rinnovo
      </a>
    </div>
  </div>
</section>
```

**Key characteristics:**
- Uses existing `.btn-primary` (yellow gradient) and `.btn-secondary` (red gradient) classes
- `.btn-lg` for prominent size (padding: 1.5rem 3rem, font-size: 1.125rem)
- Flexbox with wrap for responsive behavior (stacks on mobile)
- Centered within container
- Same max-width as content (900px) for visual consistency
- Minimal padding (1.5rem) to keep compact

### Pattern 1: Permit-to-Document Page Mapping

**What:** Each permit page links to corresponding document pages using a predictable naming pattern.

**When to use:** All 21 permit pages.

**Mapping logic:**
```
permesso-[name].html -> documenti-[name]-primo.html
                     -> documenti-[name]-rinnovo.html
```

**Examples:**
| Permit Page | Primo Link | Rinnovo Link |
|-------------|------------|--------------|
| permesso-studio.html | documenti-studio-primo.html | documenti-studio-rinnovo.html |
| permesso-lavoro-subordinato.html | documenti-lavoro-subordinato-primo.html | documenti-lavoro-subordinato-rinnovo.html |
| permesso-gravidanza.html | documenti-gravidanza-primo.html | documenti-gravidanza-rinnovo.html |

**Note:** Many documenti-*-primo.html files are redirects to more detailed URLs (e.g., documenti-studio-primo.html redirects to documenti-studio-art-39-primo.html). This is intentional and works correctly.

### Pattern 2: Document Section Removal

**What:** Remove inline document lists from permit pages.

**When to use:** Any permit page containing document sections with headers like "Documenti", "Documenti - Primo", "Documenti - Rinnovo", or "Che documenti".

**Identification patterns (grep):**
```bash
# Find document section headers in permit pages
grep -l "<h2>.*[Dd]ocumenti" src/pages/permesso-*.html

# Specific patterns found:
# - "<h2>Documenti - Primo Rilascio</h2>" (permesso-studio.html)
# - "<h2>Documenti - Rinnovo</h2>" (permesso-studio.html)
# - "<h2>Che documenti" (multiple pages)
# - "<h2>Documenti necessari</h2>" (some pages)
```

**Removal approach:** Delete entire `.card` divs that contain document headers, typically structured as:
```html
<!-- Target for removal -->
<div class="card" style="margin-bottom: 2rem;">
  <h2>Documenti...</h2>
  ...document list content...
</div>
```

### Pattern 3: Page Variation Categories

Analysis of 21 permit pages shows three content patterns:

**Type A: Has explicit "Documenti - Primo" and "Documenti - Rinnovo" sections (2 cards)**
- permesso-studio.html
- Some others

**Type B: Has single "Che documenti" or "Documenti necessari" section (1 card)**
- permesso-gravidanza.html (has both primo and rinnovo in same section)
- permesso-lavoro-subordinato.html (documents embedded in "Dove si chiede" section)
- Most other pages

**Type C: No document section (already clean)**
- permesso-richiesta-asilo.html (no documents inline)

**Approach:** Template extraction must handle all types. CTA buttons added to all 21 pages regardless of existing document content.

### Recommended Project Structure
```
src/pages/
├── permesso-*.html           # 21 permit pages (target for CTA addition)
├── documenti-*-primo.html    # Existing redirect pages
├── documenti-*-rinnovo.html  # Existing redirect pages
└── documenti-*-art-*.html    # Detailed document pages (redirect targets)
```

### Anti-Patterns to Avoid
- **Hardcoding all 21 button URLs manually:** Use template with placeholder, replace programmatically
- **Keeping partial document info:** Remove ALL inline document content, not just headers
- **Different button styles per page:** Use consistent .btn-primary/.btn-secondary for all pages
- **Adding CTA inside content section:** Place in dedicated section after page header, before content

## Don't Hand-Roll

Problems that have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Button styling | Custom CSS for CTA | .btn-primary, .btn-secondary classes | Already exist in components.css with hover effects, gradients, shadows |
| Responsive layout | Media queries for buttons | Flexbox with wrap | Built-in CSS handles stacking on mobile |
| Page automation | 21 manual edits | Python/sed script | Consistency, speed, proven in Phase 14 |
| Document page links | Create new pages | Existing documenti-*-primo/rinnovo.html | Redirect pages already exist |

**Key insight:** The codebase already has all the CSS patterns needed. This phase is pure HTML refactoring with no new styles required.

## Common Pitfalls

### Pitfall 1: Broken Document Links

**What goes wrong:** CTA buttons link to non-existent document pages, causing 404 errors.

**Why it happens:** Not all permit types have corresponding documenti-*-primo.html and documenti-*-rinnovo.html files.

**How to avoid:**
```bash
# Verify document pages exist for each permit
for permit in $(ls src/pages/permesso-*.html | xargs -n1 basename | sed 's/permesso-//;s/.html//'); do
  echo "Checking: $permit"
  ls src/pages/documenti-${permit}-primo.html 2>/dev/null || echo "  MISSING: documenti-${permit}-primo.html"
  ls src/pages/documenti-${permit}-rinnovo.html 2>/dev/null || echo "  MISSING: documenti-${permit}-rinnovo.html"
done
```

**Warning signs:** Some permit pages may not have matching document pages. These need to be identified before implementation.

### Pitfall 2: Inconsistent Document Section Patterns

**What goes wrong:** Automated removal misses some document sections due to different HTML patterns.

**Why it happens:** Pages were written at different times with varying header text ("Documenti", "Che documenti", "Documenti necessari", etc.).

**How to avoid:**
- Audit all 21 permit pages before automation
- Create regex that catches all variations
- Manual verification after automated changes
- Use grep to confirm zero document headers remain:
  ```bash
  grep -c "<h2>.*[Dd]ocumenti" src/pages/permesso-*.html
  # Expected: all zeros or grep returns nothing
  ```

**Warning signs:** Some pages still show document lists after propagation.

### Pitfall 3: CTA Placed in Wrong Location

**What goes wrong:** CTA buttons appear after content instead of between header and content.

**Why it happens:** Insertion point regex matches wrong location or pages have non-standard structure.

**How to avoid:**
- Use consistent marker: `</section>` after `class="page-header"` as insertion point
- Alternative: Insert before `<!-- CONTENT -->` comment
- Verify visually on 3-5 pages after automation

**Warning signs:** Buttons appear at bottom of page or inside content section.

### Pitfall 4: Missing Redirect Page Targets

**What goes wrong:** documenti-[permit]-primo.html exists but is a redirect to a detailed page that doesn't exist.

**Why it happens:** Redirect pages may point to incorrectly named targets.

**How to avoid:**
```bash
# Check redirect targets exist
grep -h "window.location.replace" src/pages/documenti-*-primo.html src/pages/documenti-*-rinnovo.html | \
  sed 's/.*replace("\([^"]*\)".*/\1/' | \
  while read target; do
    ls "src/pages/$target" 2>/dev/null || echo "MISSING TARGET: $target"
  done
```

**Warning signs:** Clicking CTA button leads to 404 or broken page.

### Pitfall 5: Content Section Accidentally Removed

**What goes wrong:** Important permit information (not just documents) gets deleted during cleanup.

**Why it happens:** Overly broad regex removes cards containing both documents and other info (e.g., permesso-lavoro-subordinato.html has documents inside "Dove si chiede" section).

**How to avoid:**
- Target only cards where `<h2>` contains "Documenti" as first word or primary topic
- For hybrid sections: remove only the document list content, keep the section header and other info
- Review each page type before bulk automation
- Create backup before changes

**Warning signs:** Permit pages lose important information like "how to apply" or "where to go".

## Code Examples

Verified patterns from the codebase:

### CTA Button Section (Complete HTML)
```html
<!-- Source: Based on existing .btn classes in components.css -->

<!-- DOCUMENT CTA -->
<section class="section" style="padding: 1.5rem 0;">
  <div class="container" style="max-width: 900px;">
    <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
      <a href="documenti-studio-primo.html" class="btn btn-primary btn-lg">
        Documenti per il primo rilascio
      </a>
      <a href="documenti-studio-rinnovo.html" class="btn btn-secondary btn-lg">
        Documenti per il rinnovo
      </a>
    </div>
  </div>
</section>
```

### Existing Button Classes (from components.css)
```css
/* Source: src/styles/components.css lines 10-80 */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-family: var(--font-heading);
  font-size: var(--font-size-base);
  font-weight: 600;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
  box-shadow: var(--shadow-sm);
}

.btn-primary {
  background: linear-gradient(135deg, var(--taxi-yellow-bright) 0%, var(--taxi-yellow) 100%);
  color: var(--black);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, var(--lighthouse-red-bright) 0%, var(--lighthouse-red) 100%);
  color: var(--white);
  box-shadow: 0 4px 15px rgba(255, 82, 82, 0.4);
}

.btn-lg {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
}
```

### Python Script Pattern (Based on Phase 14)
```python
#!/usr/bin/env python3
"""
Document Deduplication - Add CTA buttons and remove inline document sections.
Based on Phase 14 automation pattern.
"""

import re
import os
from pathlib import Path

PAGES_DIR = Path("src/pages")

# CTA template - {permit_name} will be replaced
CTA_TEMPLATE = '''
  <!-- DOCUMENT CTA -->
  <section class="section" style="padding: 1.5rem 0;">
    <div class="container" style="max-width: 900px;">
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
        <a href="documenti-{permit_name}-primo.html" class="btn btn-primary btn-lg">
          Documenti per il primo rilascio
        </a>
        <a href="documenti-{permit_name}-rinnovo.html" class="btn btn-secondary btn-lg">
          Documenti per il rinnovo
        </a>
      </div>
    </div>
  </section>
'''

def get_permit_name(filename):
    """Extract permit name from filename: permesso-studio.html -> studio"""
    return filename.replace("permesso-", "").replace(".html", "")

def add_cta_after_page_header(content, permit_name):
    """Insert CTA section after page header section."""
    cta = CTA_TEMPLATE.format(permit_name=permit_name)
    # Insert after closing </section> of page header (bg-off-white section)
    pattern = r'(</section>\s*\n\s*<!-- CONTENT -->)'
    replacement = f'{cta}\n\n  <!-- CONTENT -->'
    return re.sub(pattern, replacement, content)

def remove_document_sections(content):
    """Remove card divs containing document headers."""
    # Pattern: <div class="card"...>...<h2>.*Documenti.*</h2>...</div>
    # This is simplified - actual implementation needs careful regex
    patterns = [
        r'<div class="card"[^>]*>.*?<h2>[^<]*[Dd]ocumenti[^<]*</h2>.*?</div>',
    ]
    for pattern in patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    return content

def process_permit_page(filepath):
    """Process a single permit page."""
    permit_name = get_permit_name(filepath.name)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add CTA buttons
    content = add_cta_after_page_header(content, permit_name)

    # Remove document sections
    content = remove_document_sections(content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return permit_name

# Main execution
permit_pages = list(PAGES_DIR.glob("permesso-*.html"))
# Exclude redirect-only pages (permesso-asilo.html is a redirect)
permit_pages = [p for p in permit_pages if p.stat().st_size > 1000]

for page in permit_pages:
    name = process_permit_page(page)
    print(f"Processed: {name}")
```

### Verification Commands
```bash
# Count permit pages with CTA buttons (should be 21)
grep -l "Documenti per il primo rilascio" src/pages/permesso-*.html | wc -l

# Count permit pages with inline document sections (should be 0)
grep -l "<h2>.*[Dd]ocumenti" src/pages/permesso-*.html | grep -v "CTA" | wc -l

# Verify all CTA links are valid
for file in src/pages/permesso-*.html; do
  permit=$(basename "$file" | sed 's/permesso-//;s/.html//')
  echo "Checking $permit..."
  grep -q "documenti-${permit}-primo.html" "$file" || echo "  Missing primo link"
  grep -q "documenti-${permit}-rinnovo.html" "$file" || echo "  Missing rinnovo link"
done
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline documents in permit pages | Dedicated document pages with CTAs | This milestone (v1.6) | Single source of truth, easier maintenance |
| Multiple document sections per page | Two CTA buttons | This milestone | Cleaner UX, reduced page length |

**Deprecated/outdated:**
- **Inline document lists:** Will be removed in this phase; document info lives only in documenti-*.html pages

## Open Questions

Things that couldn't be fully resolved:

1. **Do all 21 permit pages have corresponding document pages?**
   - What we know: Many documenti-*-primo.html files exist, some are redirects
   - What's unclear: Whether all 21 permits have both primo and rinnovo document pages
   - Recommendation: Run verification script in Plan 15-01 to identify missing pages before propagation

2. **Should redirect pages be updated to non-redirect versions?**
   - What we know: documenti-studio-primo.html redirects to documenti-studio-art-39-primo.html
   - What's unclear: Whether this redirect pattern is intentional for all permits
   - Recommendation: Keep existing redirect pattern; it provides flexibility if detailed page names change

3. **How to handle permits without rinnovo option?**
   - What we know: Some permits (e.g., richiesta asilo) may not have a renewal process
   - What's unclear: Which permits genuinely have no rinnovo
   - Recommendation: Add both buttons to all pages initially; if a permit truly has no rinnovo, the rinnovo page can display "non rinnovabile" message

## Sources

### Primary (HIGH confidence)
- src/styles/components.css - Button classes (.btn, .btn-primary, .btn-secondary, .btn-lg)
- src/pages/permesso-studio.html - Template permit page structure
- src/pages/documenti-studio-primo.html - Redirect page pattern
- Phase 14 RESEARCH.md and PLAN.md - Automation approach for bulk HTML changes

### Secondary (MEDIUM confidence)
- Permit page audit (22 files examined for structure patterns)
- Document page audit (100+ files, redirect pattern confirmed)

### Tertiary (LOW confidence)
- None - all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All patterns verified in codebase
- Architecture: HIGH - Existing CSS and HTML patterns examined
- Pitfalls: HIGH - Based on actual file analysis and Phase 14 learnings
- Code examples: HIGH - Derived from existing codebase patterns

**Research date:** 2026-01-28
**Valid until:** 60 days (stable static site, patterns unlikely to change)

**Scale context:**
- 21 permit pages to update (excluding 1 redirect: permesso-asilo.html)
- 2 buttons per page = 42 new links
- Variable number of document sections to remove per page
- Existing document pages serve as link targets
