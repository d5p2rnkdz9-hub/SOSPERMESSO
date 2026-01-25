# Coding Conventions

**Analysis Date:** 2025-01-25

## Naming Patterns

**Files:**
- HTML pages: kebab-case with descriptive names (`permesso-studio.html`, `chi-siamo.html`, `contact-form.html`)
- CSS files: kebab-case descriptive (`main.css`, `components.css`, `animations.css`, `mobile.css`, `mobile-fix.css`)
- JavaScript files: kebab-case descriptive (`app.js`, `mobile.js`)
- JSON data files: kebab-case with language code (`content-it.json`, `content-en.json`)

**Functions:**
- camelCase for all function names
- Descriptive verb-first pattern: `loadContent()`, `trackEvent()`, `debounce()`, `isInViewport()`, `initLazyLoading()`, `setVH()`, `handleTouchStart()`, `getSafeAreaInsets()`
- Event handlers use descriptive names: `handleSwipe()`, `handleTouchEnd()`, `handleMenuClick()`
- Class constructors use PascalCase: `SwipeDetector`, `CardCarousel`

**Variables:**
- camelCase for all variables and constants
- Descriptive names: `currentLanguage`, `languageConfig`, `menuToggle`, `navWrapper`, `animateOnScroll`, `pullStartY`
- Semantic naming for state: `isUsingKeyboard`, `pullRefreshActive`
- Event-related variables include context: `startX`, `startY`, `distX`, `distY`, `elapsedTime`

**Types/Classes:**
- PascalCase for class names: `SwipeDetector`, `CardCarousel`
- Config objects use camelCase properties: `languageConfig = { 'it': { label: 'IT 🇮🇹', path: '/it/' } }`

**CSS:**
- kebab-case for class names: `.card`, `.card-icon`, `.btn-primary`, `.section-header`, `.hero-title`
- Semantic class naming: `.btn-primary`, `.btn-secondary`, `.alert-info`, `.alert-warning`, `.alert-success`
- BEM-inspired naming for components: `.card`, `.card-icon`, `.card-title`, `.card-description`
- State classes use underscores: `.nav-wrapper.active`, `.nav-menu.active`, `.language-switcher.active`
- Animation classes: `.emoji-bounce`, `.loading-dots`, `.hover-lift`, `.squeeze-click`

**Data Attributes:**
- kebab-case for data attribute names: `data-lang`, `data-src`

## Code Style

**Formatting:**
- No explicit formatter detected, but code follows consistent conventions
- Indentation: 2 spaces (observed in HTML, CSS, and JavaScript)
- CSS custom properties define all design tokens (colors, spacing, typography, shadows, transitions, z-index)
- Line-length guideline appears to be ~80-100 characters for readability

**Linting:**
- No ESLint, Prettier, or similar configuration detected
- Code manually follows JavaScript ES6+ conventions
- All `const` declarations preferred over `let` or `var`
- Arrow functions used throughout modern code (`() => {}`)
- Template literals used for strings with interpolation: `` `${variable}` ``

## Import Organization

**No module system:**
This is a vanilla JavaScript project (no imports/exports in use).

**Script Loading (HTML):**
- CSS files loaded in `<head>`: main.css → components.css → animations.css → mobile.css → mobile-fix.css
- JavaScript loaded at end of `<body>` (or dynamically via fetch)
- External fonts from Google Fonts loaded via `<link>` with preconnect
- Favicon and apple-touch-icon declared in head

**Component Loading Pattern:**
Components are loaded dynamically via fetch API:
```javascript
// From app.js - example pattern
fetch('src/components/contact-form.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('container-id').innerHTML = html;
  });
```

**Path Aliases:**
- Relative paths used: `../data/`, `../styles/`, `../../images/`
- Root-relative paths used in production: `/it/`, `/en/`, `/fr/`, `/es/`, `/zh/`

## Error Handling

**Patterns:**
- Try-catch blocks for async operations:
  ```javascript
  async function loadContent(lang = 'it') {
    try {
      const response = await fetch(`../data/content-${lang}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.json();
      return content;
    } catch (error) {
      console.error('Error loading content:', error);
      // Fallback to Italian if error
      if (lang !== 'it') {
        return loadContent('it');
      }
      return null;
    }
  }
  ```

- Conditional checks before DOM manipulation:
  ```javascript
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navWrapper = navMenu?.parentElement;

  if (menuToggle && navWrapper) {
    // Safe to proceed
  }
  ```

- Graceful degradation with feature detection:
  ```javascript
  if ('IntersectionObserver' in window) {
    initLazyLoading();
  }

  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
  ```

- Fallback mechanism for language loading (defaults to Italian)

## Logging

**Framework:** `console` object (native)

**Patterns:**
- Branded console message on app load with styled CSS:
  ```javascript
  console.log('%c🏮 SOS Permesso', 'font-size: 24px; font-weight: bold; color: #FFD700; ...');
  console.log('%cCompleto, aggiornato, nella tua lingua', 'font-size: 14px; color: #666;');
  ```

- Error logging with context:
  ```javascript
  console.error('Error loading content:', error);
  ```

- Debug logging for analytics (placeholder):
  ```javascript
  function trackEvent(eventName, eventData = {}) {
    console.log('Track Event:', eventName, eventData);
  }
  ```

- Performance monitoring output:
  ```javascript
  console.log('📱 Mobile Performance:');
  console.log(`⏱️  Page Load Time: ${pageLoadTime}ms`);
  if (pageLoadTime > 3000) {
    console.warn('⚠️  Page load is slow on mobile. Consider optimizing.');
  }
  ```

- Silenced pull-to-refresh check:
  ```javascript
  console.log('Pull to refresh triggered');
  ```

## Comments

**When to Comment:**
- Section headers for logical groupings (observe throughout codebase):
  ```javascript
  // ===============================================
  // MOBILE MENU TOGGLE
  // ===============================================
  ```

- Implementation notes for non-obvious behavior:
  ```javascript
  // For now, we'll just reload with a lang parameter
  // In production, this would navigate to /en/, /fr/, etc.
  ```

- Commented-out fallback code for future use:
  ```javascript
  // Example: Google Analytics
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', eventName, eventData);
  // }
  ```

- Placeholder indicators:
  ```javascript
  // Placeholder for analytics tracking
  // Uncomment to enable pull to refresh
  ```

**JSDoc/TSDoc:**
- Not used in this vanilla JavaScript codebase
- Function parameters documented inline with comments
- Expected parameter types documented in comments where used

## Function Design

**Size:**
- Small, focused functions (typically 5-30 lines)
- Single responsibility principle observed
- Example: `isInViewport()` is 8 lines and does one thing

**Parameters:**
- Default parameters used: `loadContent(lang = 'it')`
- Options objects with defaults for complex constructors:
  ```javascript
  constructor(element, options = {}) {
    this.options = {
      threshold: options.threshold || 50,
      restraint: options.restraint || 100,
      allowedTime: options.allowedTime || 300,
      ...options
    };
  }
  ```

- Destructuring avoided (not used in this codebase)
- Rest parameters used for flexibility: `function executedFunction(...args)`

**Return Values:**
- Explicit null/undefined returns for missing data
- Promises returned from async functions
- Objects returned with multiple values:
  ```javascript
  function getSafeAreaInsets() {
    return {
      top: style.getPropertyValue('--safe-area-inset-top') || '0px',
      bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
      left: style.getPropertyValue('--safe-area-inset-left') || '0px',
      right: style.getPropertyValue('--safe-area-inset-right') || '0px'
    };
  }
  ```

## Module Design

**Exports (CommonJS pattern):**
Only used for potential module consumption (not in active use):
```javascript
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadContent,
    trackEvent,
    debounce,
    isInViewport
  };
}
```

**Barrel Files:**
- Not used (no index.js or barrel pattern)
- Components loaded individually via fetch API
- CSS files concatenated in HTML `<head>`

## CSS Custom Properties (Design Tokens)

**System Location:** `src/styles/main.css` (lines 6-95)

**Color Variables:**
- Primary: `--taxi-yellow`, `--taxi-yellow-light`, `--taxi-yellow-dark`, `--taxi-yellow-bright`
- Accent: `--lighthouse-red`, `--lighthouse-red-dark`, `--lighthouse-red-bright`
- Semantic: `--success`, `--warning`, `--error`, `--info` (with bright variants)
- Accent colors: `--accent-blue`, `--accent-teal`, `--accent-orange`, `--accent-purple`, `--accent-pink`, `--accent-green` (all with bright variants)
- Neutrals: `--black`, `--gray-dark`, `--gray-medium`, `--gray-light`, `--white`, `--off-white`

**Spacing Variables:**
- Scale: `--spacing-xs` (0.5rem), `--spacing-sm` (1rem), `--spacing-md` (1.5rem), `--spacing-lg` (2rem), `--spacing-xl` (3rem), `--spacing-xxl` (4rem)

**Typography Variables:**
- Fonts: `--font-primary` (Inter), `--font-heading` (Poppins)
- Sizes: `--font-size-xs` through `--font-size-5xl`

**Other Design Tokens:**
- Border radius: `--radius-sm` through `--radius-full`
- Shadows: `--shadow-sm` through `--shadow-xl`
- Transitions: `--transition-fast`, `--transition-base`, `--transition-slow`
- Z-index layers: `--z-dropdown`, `--z-sticky`, `--z-fixed`, `--z-modal`, `--z-tooltip`

## Accessibility Features

**Patterns Observed:**
- Semantic HTML: `<button>`, `<nav>`, `<header>`, `<footer>`, `<section>` elements used correctly
- ARIA labels on interactive elements: `aria-label="Menu"`, `aria-label="Chiudi"`
- Keyboard navigation support:
  ```javascript
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isUsingKeyboard = true;
      document.body.classList.add('keyboard-navigation');
    }
  });
  ```

- Focus-visible styling: `*:focus-visible { outline: 3px solid var(--taxi-yellow); outline-offset: 2px; }`
- High contrast ratios for text on backgrounds
- Touch targets minimum 44x44px (enforced in mobile.css)
- Skip to content link pattern available

## Animation Naming Convention

- Entrance animations: `.fade-in`, `.slide-up`, `.bounce-in`, `.slide-in-left`, `.slide-in-right`
- Continuous animations: `.pulse`, `.float`, `.spin`, `.wiggle`, `.emoji-bounce`
- Interactive animations: `.hover-lift`, `.hover-glow`, `.squeeze-click`, `.shake`
- State animations: `.emoji-spin`, `.loading-dots`, `.progress-bar-fill`
- Stagger delays: `.stagger-1` through `.stagger-6`

---

*Convention analysis: 2025-01-25*
