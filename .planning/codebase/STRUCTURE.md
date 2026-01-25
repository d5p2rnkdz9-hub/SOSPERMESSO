# Codebase Structure

**Analysis Date:** 2026-01-25

## Directory Layout

```
Sito_Nuovo/
├── index.html                  # Home page / landing page
├── src/                        # Main source directory
│   ├── components/             # Reusable HTML components (loaded via fetch)
│   │   ├── contact-form.html   # Contact modal form component
│   │   ├── lighthouse.html     # Lighthouse hero animation (not currently used)
│   │   └── paperwork-illustration.html # Cartoon SVG illustrations (not used)
│   ├── data/                   # Content data (JSON files for multilingual support)
│   │   ├── content-it.json     # Italian content structure
│   │   └── content-en.json     # English content structure (incomplete)
│   ├── pages/                  # Individual page files
│   │   ├── index.html          # Home/landing page alternative
│   │   ├── database.html       # Database of permit types (categorized listing)
│   │   ├── chi-siamo.html      # About us page
│   │   ├── permesso-*.html     # Permit detail pages (17+ variations)
│   │   ├── documenti-questura.html # Required documents guide
│   │   ├── protezione-internazionale.html # International protection guide
│   │   ├── ricongiungimento-familiare.html # Family reunification guide
│   │   ├── dizionario.html     # Bureaucratic terms glossary
│   │   ├── kit-postale.html    # Postal kit/forms download
│   │   ├── controlla-permesso.html # Permit status checker
│   │   ├── aiuto-legale.html   # Free legal help locator
│   │   ├── privacy-policy.html # Privacy policy
│   │   └── [other utility pages]
│   ├── scripts/                # JavaScript files
│   │   ├── app.js              # Main application logic (navigation, language, animations)
│   │   └── mobile.js           # Mobile-specific functionality (touch, swipe, performance)
│   └── styles/                 # CSS stylesheets (loaded in cascade order)
│       ├── main.css            # Base styles, CSS variables, typography, layout
│       ├── components.css      # Component-specific styles (cards, buttons, forms, modals)
│       ├── animations.css      # Keyframe animations and transition utilities
│       ├── mobile.css          # Tablet/mobile breakpoints and responsive adjustments
│       └── mobile-fix.css      # Critical mobile fixes (overflow, viewport height)
├── images/                     # Image assets (logo, favicon, SVGs)
├── public/                     # Public assets (static files)
├── translations/               # Translation-related files
├── .claude/                    # Claude AI configuration
├── .planning/                  # Planning documents directory (where codebase docs go)
│   └── codebase/               # Codebase analysis documents
│       ├── ARCHITECTURE.md     # Architecture and patterns
│       └── STRUCTURE.md        # This file
├── build/                      # Build-related files
├── claude.md                   # Project documentation
├── README.md                   # Project README
└── .gitignore                  # Git ignore rules
```

## Directory Purposes

**Root Level (`/`):**
- Purpose: Home page entry point and project configuration
- Key files: `index.html` (main landing page), `claude.md` (detailed project doc), `.gitignore`

**`src/components/`:**
- Purpose: Reusable HTML components injected dynamically via fetch
- Contains: HTML fragments with embedded CSS and JS, designed to be inserted into pages
- Key files: `contact-form.html` (actively used), `lighthouse.html` (ready but not displayed), `paperwork-illustration.html` (ready but not displayed)

**`src/data/`:**
- Purpose: Multilingual content stored as JSON for future dynamic page generation
- Contains: Structured content objects with meta, header, hero, tests, guides sections
- Key files: `content-it.json` (complete), `content-en.json` (partial)
- Status: Currently loaded but not actively used; pages use inline HTML instead

**`src/pages/`:**
- Purpose: Individual page templates for routes/sections
- Contains: Self-contained HTML files with full HTML structure (head, body, scripts)
- Key structure:
  - Home/database pages link to root `index.html`
  - Permit detail pages link to each other via breadcrumbs
  - All pages include identical CSS and JS includes
  - All pages have responsive header with navigation and language switcher

**`src/scripts/`:**
- Purpose: JavaScript application logic
- Contains: Event handlers, DOM manipulation, state management
- Key files: `app.js` (navigation, language switching, animations), `mobile.js` (touch interactions, mobile optimizations)

**`src/styles/`:**
- Purpose: CSS design system and responsive styling
- Contains: CSS variables (colors, spacing, shadows), component classes, media queries
- Load order matters: main.css → components.css → animations.css → mobile.css → mobile-fix.css
- Key feature: CSS variables in `:root` for theme customization

**`images/`:**
- Purpose: Static image assets
- Contains: Logo.png, Favicon.svg, any decorative SVGs or PNGs

## Key File Locations

**Entry Points:**
- `index.html`: Root home page entry point (main landing)
- `src/pages/index.html`: Alternative home page reference
- `src/pages/database.html`: Permit type listing and discovery entry point

**Configuration:**
- `src/styles/main.css`: CSS variables, color palette, typography, spacing system
- `.claude/settings.json`: Claude AI tool configuration
- `claude.md`: Project documentation (design philosophy, color palette, features)

**Core Logic:**
- `src/scripts/app.js`: Navigation toggle, language switching, scroll animations, card interactions
- `src/scripts/mobile.js`: Swipe gestures, viewport height fixes, haptic feedback, performance monitoring

**Page Templates:**
- `src/pages/permesso-studio.html`: Template pattern for permit detail pages
- `src/pages/database.html`: Template pattern for listing/categorized pages
- `src/pages/chi-siamo.html`: Template pattern for informational pages

**Testing/External Integration:**
- Form integration: Multiple Typeform embeds for quizzes (links in HTML)
- Contact form: `src/components/contact-form.html` (currently simulates backend with setTimeout)

## Naming Conventions

**Files:**
- Page files: `kebab-case.html` (e.g., `permesso-studio.html`, `chi-siamo.html`)
- Component files: `kebab-case.html` (e.g., `contact-form.html`)
- CSS files: `kebab-case.css` (e.g., `main.css`, `mobile-fix.css`)
- Script files: `kebab-case.js` (e.g., `app.js`, `mobile.js`)
- Data files: `content-{lang}.json` (e.g., `content-it.json`)

**Directories:**
- Lowercase, plural for collections: `components/`, `pages/`, `styles/`, `scripts/`, `data/`
- Plural denotes "folder contains multiple items of this type"

**CSS Classes:**
- BEM-inspired: `.card`, `.card-yellow`, `.btn`, `.btn-primary`, `.alert`, `.alert-warning`
- Utility classes: `.container`, `.section`, `.text-center`, `.mt-lg`
- State classes: `.active`, `.keyboard-navigation`
- Modifier classes use single hyphen: `.btn-primary` (not `.btn--primary`)

**HTML IDs:**
- Used for: Specific elements targeted by JavaScript (one ID per element maximum)
- Pattern: `#menu-toggle`, `#nav-menu`, `#contact-modal`, `#language-dropdown`
- Convention: Relate to function not content (e.g., `#menu-toggle` not `#navbar`)

**JavaScript Variables & Functions:**
- Global functions: `openContactModal()`, `trackEvent()`, `loadContent()`, `debounce()`
- Class names: `SwipeDetector`, `CardCarousel` (PascalCase)
- Regular variables: `currentLanguage`, `menuToggle`, `navWrapper` (camelCase)
- Constants: `languageConfig` (camelCase, object configuration)

## Where to Add New Code

**New Permit Detail Page:**
- Primary code: Create `src/pages/permesso-{name}.html` following `src/pages/permesso-studio.html` structure
- Include: Same header/footer markup, breadcrumb, page header, content cards, contact CTA, footer
- CSS: No new CSS needed; use existing `.card`, `.alert`, `.section` classes and inline `style` attributes for specific colors
- Link: Add entry to `src/pages/database.html` in appropriate category section
- Translations: Add JSON entry to `src/data/content-it.json` and `src/data/content-en.json` (optional, pages use inline HTML)

**New Guide/Informational Page:**
- Primary code: Create `src/pages/{page-name}.html`
- Template: Follow `src/pages/chi-siamo.html` or `src/pages/protezione-internazionale.html` pattern
- Header/Footer: Include standard header with navigation + language switcher + footer
- CSS: Use existing component classes; minimal inline styles for layout adjustments
- Link: Add to navigation menu in `index.html` and other pages as appropriate

**New Component (Dynamic Module):**
- Implementation: Create `src/components/{component-name}.html`
- Structure: Self-contained HTML fragment with embedded styles (inside `<style>` tag) and scripts (inside `<script>` tag)
- Loading: Add fetch call in target page (example in `index.html` line 437-442):
  ```javascript
  fetch('src/components/contact-form.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('container-id').innerHTML = html;
    });
  ```
- JavaScript: Component should register event listeners on `DOMContentLoaded` or immediately on insertion

**New Utility Functions:**
- Shared helpers: Add to `src/scripts/app.js` if cross-page usage
- Mobile-specific: Add to `src/scripts/mobile.js` (swipe, touch, viewport utilities)
- Pattern: Export via `module.exports` at end of file for future modularization

**New CSS Components:**
- Base styles: Add color/spacing definitions to `src/styles/main.css` (CSS variables)
- Component styles: Add to `src/styles/components.css` if used across pages
- Animations: Add keyframes to `src/styles/animations.css`
- Mobile adjustments: Add breakpoints to `src/styles/mobile.css` (desktop-first breakpoints)
- Critical mobile fixes: Add to `src/styles/mobile-fix.css` if viewport/overflow related

**New Data/Content:**
- JSON structure: Add to `src/data/content-{lang}.json` following existing structure
- Usage: Not currently implemented in rendering; currently data is embedded in HTML
- Future: Pages can be refactored to load content dynamically from JSON via `loadContent()` function in app.js

## Special Directories

**`.claude/`:**
- Purpose: Claude AI assistant configuration and tools
- Contains: `settings.json`, `settings.local.json`, hook scripts, GSD templates
- Generated: Yes (by Claude tools)
- Committed: Yes (configuration files tracked in git)

**`.planning/codebase/`:**
- Purpose: Codebase analysis documents for team reference
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, STACK.md, INTEGRATIONS.md
- Generated: Yes (written by analysis tools)
- Committed: Yes (planning documents tracked)

**`build/`:**
- Purpose: Build output directory (if needed for future bundling)
- Status: Minimal, currently not active
- Committed: Yes

**`NOTION_WEBSITE/`:**
- Purpose: Backup/export of Notion database pages (reference material)
- Contains: HTML exports of permit pages from Notion
- Generated: Yes (exported from Notion)
- Committed: Yes (for reference, not active source)

---

*Structure analysis: 2026-01-25*
