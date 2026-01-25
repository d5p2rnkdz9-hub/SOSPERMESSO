# Testing Patterns

**Analysis Date:** 2025-01-25

## Test Framework

**Runner:**
- Not detected - No test framework configured

**Assertion Library:**
- Not detected - No testing setup found

**Run Commands:**
- No npm scripts or test commands configured
- No package.json file exists in project
- No test runner configuration files present (.jest.config.js, vitest.config.js, etc.)

## Test File Organization

**Location:**
- No test files found in codebase
- Pattern would be: `src/**/*.test.js` or `tests/` directory

**Naming:**
- No existing test files to establish pattern
- Convention would be: `*.test.js` or `*.spec.js`

**Structure:**
- Not yet implemented

## Current Testing State

**Status:** ZERO TEST COVERAGE

This is a **vanilla JavaScript static site** with no automated testing infrastructure. The project relies on:
- Manual testing in browser
- Visual regression testing (manual)
- Cross-browser testing (manual)

## Testing Opportunities

### Unit Testing Candidates

**Utility Functions** (`src/scripts/app.js`):
```javascript
// Would benefit from unit tests
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
```

**Data Loading** (`src/scripts/app.js`):
```javascript
// Async function with error handling - ideal for testing
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
    if (lang !== 'it') {
      return loadContent('it');
    }
    return null;
  }
}
```

**Mobile Classes** (`src/scripts/mobile.js`):
```javascript
// Well-structured class with testable methods
class SwipeDetector {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      threshold: options.threshold || 50,
      restraint: options.restraint || 100,
      allowedTime: options.allowedTime || 300,
      ...options
    };
    // ...
  }

  handleSwipe(direction) {
    if (this.options.onSwipeLeft && direction === 'left') {
      this.options.onSwipeLeft();
    }
    if (this.options.onSwipeRight && direction === 'right') {
      this.options.onSwipeRight();
    }
  }
}

class CardCarousel {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container || window.innerWidth > 768) return;
    this.init();
  }
  // ...
}
```

### DOM Testing Candidates

**Menu Toggle** (`src/scripts/app.js`, lines 9-34):
- Test: Opening/closing mobile menu
- Test: Menu closes when clicking outside
- Test: Menu closes when clicking nav link
- Test: Toggle icon changes

**Language Switcher** (`src/scripts/app.js`, lines 40-80):
- Test: Language selection updates display
- Test: Language persists to localStorage
- Test: Language option click changes URL

**Scroll Animations** (`src/scripts/app.js`, lines 83-109):
- Test: Intersection Observer fires on scroll
- Test: Elements animate on entry
- Test: Stagger delays applied correctly
- Test: Animation cleanup on unobserve

### Integration Testing Candidates

**Contact Form Submission** (`src/components/contact-form.html`):
- Form validation before submit
- Loading state during submission
- Success/error feedback
- Modal close on success

**Page Navigation** (`src/pages/`):
- Language switching across pages
- Menu navigation links work
- Breadcrumbs display correctly
- History management

## Mocking Patterns

**Recommended Framework:** Vitest or Jest (lightweight for vanilla JS)

**Patterns to Mock:**

**1. Fetch API:**
```javascript
// Example mock for loadContent() testing
global.fetch = vi.fn((url) => {
  if (url.includes('content-it.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ tests: { items: [] } })
    });
  }
  return Promise.reject(new Error('404'));
});
```

**2. localStorage:**
```javascript
const mockLocalStorage = {
  getItem: vi.fn((key) => {
    if (key === 'sospermesso-lang') return 'en';
    return null;
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

global.localStorage = mockLocalStorage;
```

**3. DOM Elements:**
```javascript
document.body.innerHTML = `
  <button id="menu-toggle">☰</button>
  <div id="nav-menu">
    <a class="nav-link">Link 1</a>
  </div>
`;
```

**4. IntersectionObserver:**
```javascript
global.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    this.callback([{ isIntersecting: true, target: element }]);
  }
  unobserve() {}
};
```

**5. Window/Screen Properties:**
```javascript
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 768
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 1024
});
```

**What to Mock:**
- Browser APIs (fetch, localStorage, IntersectionObserver)
- Window/document properties
- DOM element queries and manipulation
- Event listeners
- Navigation/history

**What NOT to Mock:**
- CSS calculations (actually compute them)
- Animation timings (use real timers or `vi.useFakeTimers()`)
- Event propagation (use real events)
- Actual function logic being tested

## Fixtures and Factories

**Test Data Location:**
Would be placed in `tests/fixtures/` or `tests/mocks/`

**Example Content Fixture:**
```javascript
// tests/fixtures/content.js
export const mockContentIT = {
  tests: {
    items: [
      {
        icon: '🤞',
        title: 'Posso AVERE un permesso?',
        url: 'https://form.typeform.com/to/kt7P9Ejk'
      }
    ]
  }
};

export const mockContentEN = {
  tests: {
    items: [
      {
        icon: '🤞',
        title: 'Can I GET a permit?',
        url: 'https://form.typeform.com/to/kt7P9Ejk'
      }
    ]
  }
};
```

**Example DOM Fixture:**
```javascript
// tests/fixtures/dom.js
export function setupMenuHTML() {
  document.body.innerHTML = `
    <button id="menu-toggle" aria-label="Menu">☰</button>
    <div id="nav-menu">
      <ul class="nav-menu">
        <li><a href="#guide" class="nav-link">Guide</a></li>
        <li><a href="database.html" class="nav-link">Database</a></li>
      </ul>
    </div>
  `;
}

export function setupLanguageSwitcherHTML() {
  document.body.innerHTML = `
    <div class="language-switcher">
      <button class="language-button" id="language-toggle">
        <span id="current-language">IT 🇮🇹</span>
      </button>
      <div class="language-dropdown">
        <div class="language-option" data-lang="it">
          <span>🇮🇹</span>
          <span>Italiano</span>
        </div>
        <div class="language-option" data-lang="en">
          <span>🇬🇧</span>
          <span>English</span>
        </div>
      </div>
    </div>
  `;
}
```

## Coverage

**Requirements:**
- Not enforced (no configuration)

**Target Coverage (Recommended):**
- Utility functions: 90%+
- DOM interactions: 70%+ (harder without E2E)
- Event handlers: 80%+
- Overall: 60%+ for initial phase

**View Coverage (Future Setup):**
```bash
npm run test:coverage
# Would generate: coverage/index.html
```

## Test Types

**Unit Tests:**
- **Scope:** Individual functions in isolation
- **Approach:** Mock external dependencies (fetch, DOM, localStorage)
- **Examples:**
  - `debounce()` function with timers
  - `isInViewport()` with mocked getBoundingClientRect
  - `loadContent()` with mocked fetch
  - `getSafeAreaInsets()` with computed styles

**Integration Tests:**
- **Scope:** Multiple functions working together
- **Approach:** Minimal mocking, test actual interactions
- **Examples:**
  - Language switching (language option click → localStorage → display update)
  - Menu toggle (button click → class toggle → DOM visibility)
  - Scroll animations (IntersectionObserver → class addition → opacity change)

**E2E Tests:**
- **Framework:** Not currently used (Cypress, Playwright recommended)
- **Coverage:** Would test full user flows across pages
- **Examples:**
  - User changes language and navigates to different page
  - User opens contact form, fills fields, submits
  - User clicks accordion/expandable sections and content shows

## Recommended Test Setup

**For Quality Focus:**

1. **Install Test Framework:**
   ```bash
   npm install -D vitest @vitest/ui jsdom
   ```

2. **Configuration File** (`vitest.config.js`):
   ```javascript
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
     test: {
       environment: 'jsdom',
       coverage: {
         provider: 'v8',
         reporter: ['text', 'html'],
         exclude: ['node_modules/', 'tests/']
       },
       globals: true,
       setupFiles: ['./tests/setup.js']
     }
   });
   ```

3. **Test File Pattern** (`tests/**/*.test.js`):
   ```javascript
   import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
   import { debounce } from '../src/scripts/app.js';

   describe('debounce', () => {
     it('should delay function execution', async () => {
       const fn = vi.fn();
       const debounced = debounce(fn, 100);

       debounced();
       debounced();
       debounced();

       expect(fn).not.toHaveBeenCalled();

       await new Promise(resolve => setTimeout(resolve, 150));

       expect(fn).toHaveBeenCalledOnce();
     });
   });
   ```

4. **NPM Scripts** (`package.json`):
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:watch": "vitest --watch",
       "test:coverage": "vitest --coverage",
       "test:ui": "vitest --ui"
     }
   }
   ```

---

*Testing analysis: 2025-01-25*
