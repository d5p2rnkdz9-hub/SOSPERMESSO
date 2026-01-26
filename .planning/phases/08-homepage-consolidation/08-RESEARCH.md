# Phase 8: Homepage Consolidation - Research

**Researched:** 2026-01-26
**Domain:** HTML content synchronization and navigation path consistency
**Confidence:** HIGH

## Summary

This phase addresses a critical dual homepage architecture issue identified during the v1.2 milestone audit. The site currently has two separate `index.html` files: the root `/index.html` (468 lines, Phase 6 applied) and `/src/pages/index.html` (254 lines, outdated). This content divergence creates an inconsistent user experience where direct site visits see the updated homepage, while internal navigation from pages like `chi-siamo.html` leads to an outdated version missing key sections.

The research confirms that this is a straightforward content synchronization task requiring:
1. Copying Phase 6 structural changes from root to nested homepage
2. Adjusting relative paths for the nested context (removing `src/pages/` prefixes)
3. Fixing navigation links that point to the wrong homepage
4. Auditing and standardizing navigation patterns across all pages

**Primary recommendation:** Sync content from `/index.html` (source of truth) to `/src/pages/index.html`, adjusting relative paths, then audit all navigation links for consistency.

## Standard Stack

This is a content synchronization task, not a technical implementation. No external libraries or tools are required.

### Core
| Tool | Purpose | Why Standard |
|------|---------|--------------|
| Manual HTML editing | Content sync and path adjustment | Direct file manipulation with careful diff checking |
| Git diff | Verify changes before commit | Standard verification approach |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| grep/search | Find navigation link patterns | Audit navigation paths across all pages |
| Visual comparison | Verify sections match | Ensure no content loss during sync |

## Architecture Patterns

### Pattern 1: Content Synchronization with Path Adjustment

**What:** Copy content sections from source file to target file while adjusting relative paths

**When to use:** When maintaining duplicate files in different directory contexts

**Example:**
```html
<!-- Source: /index.html -->
<a href="src/pages/database.html" class="card card-link">

<!-- Target: /src/pages/index.html -->
<a href="database.html" class="card card-link">
```

**Key insight:** All `src/pages/` path prefixes must be removed in the nested homepage since it's already inside that directory.

### Pattern 2: Section-by-Section Replacement

**What:** Replace entire sections wholesale rather than line-by-line edits

**When to use:** When source and target have fundamentally different section structures

**Sections to sync (in order):**
1. Tests section (lines 186-216 in root) → Keep structure, adjust paths
2. **ADD** Database section (lines 218-240 in root) → This is entirely missing
3. Guides section (lines 242-269 in root) → Reduce from 5 cards to 3, adjust paths
4. **ADD** Aiuto legale section (lines 271-288 in root) → This is entirely missing
5. Link utili section (lines 290-311 in root) → Reduce from 3 cards to 2, adjust paths
6. CTA section (lines 313-326 in root) → Already present, may need minor adjustments

### Pattern 3: Navigation Path Consistency

**What:** Establish single standard for navigation paths based on file location

**Current state analysis:**

| From Page | Context | Pattern Used |
|-----------|---------|--------------|
| `/index.html` | Root | `href="src/pages/X.html"` |
| `/src/pages/*.html` | Most pages | `href="../../index.html"` (to root) |
| `/src/pages/chi-siamo.html` | Problem page | `href="index.html"` (points to nested, broken) |
| `/src/pages/index.html` | Nested homepage | `href="database.html"` (relative, correct for context) |

**Decision required:** Where should internal navigation lead?
- Option A: All navigation points to root `/index.html` (require `../../index.html` from chi-siamo)
- Option B: All navigation points to nested `/src/pages/index.html` (requires syncing content first)

**Recommendation:** Option A - Root as single source of truth, chi-siamo should use `../../index.html`

### Anti-Patterns to Avoid

- **Partial sync:** Syncing some sections but not others → Creates even worse inconsistency
- **Path blindness:** Copying paths without adjustment → Links break in nested context
- **Forgetting CSS:** Root has inline gradient styles per section, nested doesn't → Visual inconsistency
- **Comment removal:** Root has helpful HTML comments like `<!-- Test Card 1 -->`, nested doesn't → Keep these for maintainability

## Don't Hand-Roll

This is pure content work. No custom solutions needed.

## Common Pitfalls

### Pitfall 1: Path Prefix Confusion
**What goes wrong:** Copying `href="src/pages/database.html"` directly to nested index.html breaks links
**Why it happens:** Forgetting that nested file is already inside `src/pages/` directory
**How to avoid:**
- Create a mental map: root needs `src/pages/`, nested doesn't
- Test every link after sync (click through to verify)
**Warning signs:** 404 errors when clicking cards from nested homepage

### Pitfall 2: Missing Content Sections
**What goes wrong:** Forgetting to add entirely new sections (Database, Aiuto legale)
**Why it happens:** Focus on modifying existing sections instead of checking what's new
**How to avoid:**
- Use Phase 6 commit (c936601) as blueprint for what was added
- Compare section count: root has 6 main sections, nested has 3
**Warning signs:** Section count doesn't match after sync

### Pitfall 3: CSS Inline Style Loss
**What goes wrong:** Root uses inline gradient styles per section, nested uses CSS classes
**Why it happens:** Root evolved from older architecture with specific color coding
**How to avoid:**
- Copy entire `<section>` tags including `style="..."` attributes
- Pay special attention to:
  - Tests: `background: linear-gradient(135deg, #E8F5E9 0%, #FFF9E6 100%);` + `color: var(--accent-green);`
  - Database: `background: linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%);` + `color: var(--accent-teal);`
  - Guides: `background: linear-gradient(135deg, #FFF9E6 0%, #FFE0B2 100%);` + `color: var(--accent-orange);`
  - Aiuto legale: `background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);` + `color: var(--lighthouse-red);`
  - Link utili: `background: linear-gradient(135deg, #FFF3E0 0%, #FFE0E6 100%);` + `color: var(--accent-orange);`
**Warning signs:** Sections appear with generic background instead of colorful gradients

### Pitfall 4: Navigation Link Inconsistency
**What goes wrong:** Some pages use `href="index.html"`, others use `href="../../index.html"`
**Why it happens:** Organic growth without navigation standards
**How to avoid:**
- Establish rule: from `/src/pages/*.html`, homepage is always `../../index.html`
- Special case: nested homepage links to itself should use `#home` anchor
**Warning signs:** Clicking "Home" from different pages leads to different homepages

### Pitfall 5: Modal/Component References
**What goes wrong:** Contact form modal loading might differ between homepages
**Why it happens:** Root uses modal (`openContactModal()`), nested uses direct typeform link
**How to avoid:**
- Check CTA section differences
- Root: `<button onclick="openContactModal()">` + contact-form-container div
- Nested: `<a href="https://sospermesso.typeform.com/contatti">`
- Decision: Keep root approach (more integrated UX) and copy to nested
**Warning signs:** Contact button behavior differs between homepages

## Code Examples

Verified patterns from existing files:

### Section Header Gradient Pattern (from root index.html)
```html
<!-- Tests Section -->
<section class="section" id="test" style="background: linear-gradient(135deg, #E8F5E9 0%, #FFF9E6 100%);">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title" style="color: var(--accent-green);">I NOSTRI TEST 🎯</h2>
      <p class="section-subtitle">Scopri se puoi ottenere, convertire o rinnovare il tuo permesso di soggiorno</p>
    </div>
    <!-- cards -->
  </div>
</section>

<!-- Database Section (NEW in Phase 6) -->
<section class="section" style="background: linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%);">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title" style="color: var(--accent-teal);">I NOSTRI DATABASE 📚</h2>
      <p class="section-subtitle">Trova rapidamente tutte le informazioni sui permessi</p>
    </div>
    <div class="grid grid-2">
      <!-- 2 cards only -->
    </div>
  </div>
</section>
```

### Path Adjustment Pattern
```html
<!-- ROOT /index.html context -->
<a href="src/pages/database.html" class="card card-link">
<a href="src/pages/documenti-questura.html" class="card card-link">
<a href="src/pages/protezione-internazionale.html" class="card card-link">

<!-- NESTED /src/pages/index.html context -->
<a href="database.html" class="card card-link">
<a href="documenti-questura.html" class="card card-link">
<a href="protezione-internazionale.html" class="card card-link">
```

### Contact Modal Integration Pattern (from root)
```html
<!-- CTA Section -->
<section class="section">
  <div class="container text-center">
    <div class="alert alert-info" style="max-width: 600px; margin: 0 auto;">
      <span class="alert-icon">💡</span>
      <div>
        Non hai trovato la risposta che cercavi?
        <button onclick="openContactModal()" class="btn btn-primary btn-sm" style="margin-left: 0;">
          Scrivici
        </button>
      </div>
    </div>
  </div>
</section>

<!-- Contact Form Modal -->
<div id="contact-form-container"></div>

<!-- Script to load modal -->
<script>
  // Load contact form component
  fetch('src/components/contact-form.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('contact-form-container').innerHTML = html;
    })
    .catch(err => console.error('Error loading contact form:', err));
</script>
```

Nested needs path adjustment:
```html
<!-- NESTED version needs different path -->
<script>
  fetch('../components/contact-form.html')  // <-- Note: ../ not src/
    .then(response => response.text())
    .then(html => {
      document.getElementById('contact-form-container').innerHTML = html;
    })
    .catch(err => console.error('Error loading contact form:', err));
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single homepage | Dual homepage (root + nested) | Unknown (organic growth) | Content divergence, navigation confusion |
| Manual navigation management | Still manual | N/A | Opportunity for future DRY approach |
| Generic section backgrounds | Gradient-coded sections | Phase 4/6 (Jan 2026) | Better visual hierarchy |
| Integrated Aiuto legale in Link utili | Standalone prominent section | Phase 6 (Jan 26, 2026) | Better feature visibility |

**Deprecated/outdated:**
- **Old homepage structure:** Tests → Guides (5 cards) → Link utili (3 cards) → CTA
  - Why: Didn't separate databases from guides, buried legal help
  - What replaced: Tests → Database (2) → Guides (3) → Aiuto legale (1 prominent) → Link utili (2) → CTA
  - Impact: Must sync this new structure to nested homepage

## Open Questions

### 1. Should nested homepage exist at all?

**What we know:**
- Most pages use `../../index.html` to link to root homepage
- Only chi-siamo.html uses `index.html` (pointing to nested)
- Root is clearly the "canonical" homepage (more complete, receives updates first)

**What's unclear:**
- Why does nested homepage exist? Historical reasons? Future multilingual architecture?
- Should we consolidate to single homepage and delete nested?

**Recommendation:**
- **Short term (this phase):** Sync content to maintain dual architecture
- **Future consideration:** Audit if nested homepage serves a purpose; if not, deprecate it and redirect all navigation to root
- **For now:** Assume dual architecture is intentional until user clarifies

### 2. Navigation standardization scope

**What we know:**
- Most pages correctly use `../../index.html` from src/pages/ context
- chi-siamo.html is the known broken case

**What's unclear:**
- Are there other pages with navigation inconsistencies?
- Should we audit ALL ~100 pages or just spot-check critical paths?

**Recommendation:**
- **Minimum:** Fix chi-siamo.html navigation (GAP-NAV-02)
- **Ideal:** Grep all src/pages/*.html for `href="index.html"` (not ../../) and fix any other instances
- **Out of scope:** Full navigation audit (save for future maintenance phase)

### 3. Contact form modal vs direct link

**What we know:**
- Root uses `openContactModal()` with component loading
- Nested uses direct typeform link

**What's unclear:**
- Is the modal feature fully functional? (contact-form.html component exists)
- User preference: integrated modal or external typeform?

**Recommendation:**
- Match root behavior (use modal) for consistency
- Both homepages should have identical CTA section
- If modal is broken, fall back to direct link in both places

## Sources

### Primary (HIGH confidence)
- `/index.html` (root homepage) - 468 lines, Phase 6 applied
- `/src/pages/index.html` (nested homepage) - 254 lines, outdated
- `.planning/v1.2-MILESTONE-AUDIT.md` - Gap identification
- `.planning/phases/06-homepage-structure/` - Phase 6 intent
- Git commit c936601 - Phase 6 implementation details
- `.planning/phases/07-header-redesign/07-01-SUMMARY.md` - Phase 7 context

### Secondary (MEDIUM confidence)
- `/src/pages/chi-siamo.html` - Navigation issue example
- Sample permit detail pages - Navigation pattern analysis

## Metadata

**Confidence breakdown:**
- Standard stack: N/A - content work, no stack
- Architecture: HIGH - clear analysis of dual homepage structure and paths
- Pitfalls: HIGH - verified via file comparison and diff analysis

**Research date:** 2026-01-26
**Valid until:** 60 days (structure is stable, unlikely to change)

## Phase 6 Reference: What Changed

From git commit c936601 (feat(06-01): reorganize homepage sections):

**New sections added:**
1. "I NOSTRI DATABASE" section
   - Position: After Tests, before Guides
   - Grid: grid-2 (not grid-3)
   - Cards: Database permessi, Documenti Questura
   - Background: `linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)`
   - Title color: `var(--accent-teal)`

2. "AIUTO LEGALE" standalone section
   - Position: After Guides, before Link utili
   - Special class: `.aiuto-legale-section` and `.aiuto-legale-card`
   - Single large card with prominent button
   - Background: `linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)`
   - Title color: `var(--lighthouse-red)`

**Modified sections:**
1. "LE NOSTRE GUIDE"
   - Reduced from 5 cards to 3 cards
   - Removed: Database permessi, Documenti Questura (moved to Database section)
   - Kept: Protezione internazionale, Ricongiungimento familiare, Dizionario
   - Background changed: teal → orange gradient
   - Background: `linear-gradient(135deg, #FFF9E6 0%, #FFE0B2 100%)`
   - Title color: `var(--accent-orange)`

2. "LINK UTILI"
   - Reduced from grid-3 to grid-2
   - Reduced from 3 cards to 2 cards
   - Removed: Aiuto legale (moved to standalone section)
   - Kept: Kit postale, Controlla permesso

**Section order:**
- Old: Tests → Guides → Link utili → CTA
- New: Tests → **Database** → Guides → **Aiuto legale** → Link utili → CTA

**Visual changes:**
- All sections have inline gradient backgrounds (not CSS classes)
- Each section has color-coded title matching gradient theme
- Card grids vary: Tests (3), Database (2), Guides (3), Aiuto legale (1), Link utili (2)
