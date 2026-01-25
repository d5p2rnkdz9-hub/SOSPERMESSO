# Architecture

**Analysis Date:** 2026-01-25

## Pattern Overview

**Overall:** Multi-page static website with component-based architecture and progressive enhancement.

**Key Characteristics:**
- Server-less, client-side rendered HTML pages (no backend required for static content)
- Component-based UI architecture (reusable HTML + CSS + JS modules)
- Progressive enhancement: core features work without JavaScript, enhanced with animations and interactions
- Responsive mobile-first design with layered CSS for different viewport sizes
- Multilingual support via JSON content files and localStorage language preference
- Typeform integration for external quizzes and contact collection

## Layers

**Presentation Layer:**
- Purpose: Render HTML markup and handle visual presentation
- Location: `src/pages/` and `src/components/` (HTML files)
- Contains: Semantic HTML structures for pages, cards, forms, and UI components
- Depends on: CSS layer for styling, JavaScript for interaction
- Used by: All page types access this layer

**Styling Layer:**
- Purpose: Define design system, colors, spacing, animations, and responsive behavior
- Location: `src/styles/` (CSS files)
  - `main.css`: CSS variables, base typography, layout utilities
  - `components.css`: Card, button, form, header, footer, modal component styles
  - `animations.css`: Keyframe animations and transition definitions
  - `mobile.css`: Tablet/mobile breakpoints and adjustments
  - `mobile-fix.css`: Critical mobile viewport and overflow fixes
- Contains: Color palette, spacing tokens, typography scales, reusable component classes
- Depends on: Google Fonts (Inter, Poppins)
- Used by: All pages include all CSS files in correct cascade order

**Application Logic Layer:**
- Purpose: Handle client interactions, state management, and dynamic behavior
- Location: `src/scripts/`
  - `app.js`: Main navigation, language switching, scroll animations, card interactions, analytics
  - `mobile.js`: Touch gestures, swipe detection, mobile-specific optimizations, haptic feedback
- Contains: Event listeners, DOM manipulation, localStorage usage, utility functions
- Depends on: DOM (queries and manipulation), browser APIs (Intersection Observer, localStorage)
- Used by: All pages load both scripts

**Content Layer:**
- Purpose: Manage multilingual content data
- Location: `src/data/`
  - `content-it.json`: Italian content structure (used for future dynamic rendering)
  - `content-en.json`: English content structure (incomplete)
- Contains: JSON objects with meta, header, hero, tests, guides, links data
- Depends on: Fetch API for loading
- Used by: Currently loaded but not actively used (pages use inline HTML); ready for future migration

**Component Layer:**
- Purpose: Modular, reusable UI pieces injected dynamically
- Location: `src/components/`
  - `contact-form.html`: Contact modal with validation and form state handling
  - `lighthouse.html`: Hero animation SVG component (not currently used)
  - `paperwork-illustration.html`: Cartoon SVG illustrations (not currently used)
- Contains: Self-contained HTML fragments with internal styles and event handlers
- Depends on: Fetch API for dynamic loading
- Used by: index.html loads contact-form.html via fetch

## Data Flow

**Page Load Flow:**

1. Browser requests HTML file (e.g., `index.html` or `src/pages/database.html`)
2. HTML parser loads and executes CSS (cascade: main → components → animations → mobile → mobile-fix)
3. HTML parser registers script tags for `app.js` and `mobile.js`
4. JavaScript executes:
   - DOM queries for navigation, language switcher, cards
   - Event listener registration for clicks, scrolls, touches
   - localStorage language preference retrieval
   - IntersectionObserver setup for scroll animations
5. Async component loading via fetch:
   - `src/components/contact-form.html` loaded and injected into DOM
6. User interactions trigger:
   - Navigation menu toggle via click
   - Language selection → localStorage update → page reload with lang param
   - Smooth scroll to anchors
   - Card hover animations
   - Form submission (contact modal)

**Navigation Flow:**

1. User clicks internal link (e.g., `href="src/pages/database.html"`)
2. Browser navigates to new page
3. New page loads: same CSS, scripts re-initialize
4. Language preference restored from localStorage (current language maintained)

**State Management:**
- `localStorage.getItem('sospermesso-lang')`: Persists user's language selection across sessions
- `localStorage.getItem('scrollPositions')`: Remembers scroll position for back navigation
- No global state object; state is scattered in DOM attributes and localStorage

## Key Abstractions

**Card Component:**
- Purpose: Reusable content container with hover effects and gradient backgrounds
- Examples: `src/pages/index.html` (guides, tests sections), `src/pages/database.html` (permit listings)
- Pattern: HTML structure with class `.card` + class modifiers (`.card-yellow`, `.card-link`) + CSS styling
- Behavior: On hover → translateY(-8px) scale(1.02) + golden glow shadow + icon bounce animation

**Button Component:**
- Purpose: Interactive element for user actions
- Examples: Primary buttons (yellow gradient), Secondary buttons (red gradient)
- Pattern: HTML `<button>` or `<a>` with class `.btn` + modifier (`.btn-primary`, `.btn-secondary`)
- Behavior: On hover → translateY(-2px) + enhanced shadow + scale effect

**Modal Component (Contact Form):**
- Purpose: Overlay dialog for user contact submission
- Location: `src/components/contact-form.html`
- Pattern: HTML structure with `.contact-modal`, `.contact-modal-backdrop`, `.contact-modal-content`
- Behavior: Triggered by `openContactModal()` function, validates form fields, shows loading state, displays success/error

**Permit Detail Page Template:**
- Purpose: Standardized structure for individual permit pages
- Examples: `src/pages/permesso-studio.html`, `src/pages/permesso-lavoro-subordinato.html`, etc.
- Pattern: Fixed sections with emoji headers (📝 Cos'è, ⏱️ Durata, ✅ Requisiti, 📄 Documenti, 💡 Aspetti pratici)
- Behavior: Breadcrumb navigation → page header with icon → content cards → related links → contact CTA

**Database Category Section:**
- Purpose: Organize permits by category with visual distinction
- Location: `src/pages/database.html`
- Pattern: Div with class `.category-section` containing `.category-title` + `.permit-list` with `.permit-link` items
- Behavior: Each category has color coding (purple, orange, blue, teal) with colored border and title

## Entry Points

**Home Page:**
- Location: `index.html` (root level)
- Triggers: User opens website, navigation to home
- Responsibilities: Present hero section with CTA, showcase tests section, display guide cards, show useful links, load contact form modal

**Database/Permit Listing:**
- Location: `src/pages/database.html`
- Triggers: User clicks "Esplora i Permessi" or "Database" link
- Responsibilities: Display categorized list of all permit types, enable navigation to individual permit pages

**Permit Detail Pages:**
- Location: `src/pages/permesso-*.html` (multiple permit types)
- Triggers: User clicks on permit link from database
- Responsibilities: Present comprehensive information about specific permit type with structured sections

**About/Chi Siamo:**
- Location: `src/pages/chi-siamo.html`
- Triggers: User clicks "Chi siamo" navigation link
- Responsibilities: Display organization information and mission

## Error Handling

**Strategy:** Graceful degradation with console logging and fallback behaviors.

**Patterns:**
- Language loading: If JSON fetch fails for non-Italian language, fallback to Italian and retry
- Component loading: If contact form fetch fails, log error but don't break page (contact link may be disabled)
- Navigation: If target anchor element doesn't exist, smooth scroll still works but scrolls to calculated position
- Form validation: Client-side validation on contact form with visual feedback; no server-side validation (no backend)

## Cross-Cutting Concerns

**Logging:**
- Console logging for debugging (app.js line 304-315 logs brand message)
- Analytics placeholder: `trackEvent()` function ready for Google Analytics or other tracking (currently logs to console)

**Validation:**
- HTML5 native validation on contact form (required fields, email type, minlength)
- JavaScript validation: message minimum 20 characters, form submission prevention on validation failure

**Authentication:**
- None required (static website)
- Typeform handling delegated to external provider

**Accessibility:**
- Semantic HTML: header, nav, section, article tags
- ARIA labels: menu toggle button has `aria-label="Menu"`
- Keyboard navigation: Tab key detection (app.js line 287-298) adds `.keyboard-navigation` class for focus states
- Focus management: Contact modal manages focus when opened/closed
- Color contrast: CSS variables for colors designed with accessibility in mind
- Touch targets: Mobile-optimized 44x44px minimum for interactive elements

**Performance:**
- CSS-based animations (no JavaScript animations) for smooth 60fps performance
- IntersectionObserver for scroll-triggered animations (not polling)
- Lazy loading setup for images with `data-src` attribute (mobile.js)
- SVG components (lighthouse, paperwork) instead of raster images for scalability
- Minimal JavaScript bundle: two small files under 15KB each
- Cache headers disabled on HTML (`no-cache` meta tag) for development

---

*Architecture analysis: 2026-01-25*
