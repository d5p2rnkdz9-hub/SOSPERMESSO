# Codebase Concerns

**Analysis Date:** 2026-01-25

## Tech Debt

**Contact Form Submission Simulation:**
- Issue: Contact form uses `setTimeout(resolve, 1500)` to simulate submission instead of calling a real backend API
- Files: `src/components/contact-form.html` (lines 503-504)
- Impact: Form appears to work but data is never actually sent. Users get false success messages. When deployed to production, real API integration is critical.
- Fix approach: Replace setTimeout simulation with actual fetch call to backend endpoint (currently commented out on lines 497-501). Implement server-side handler for `/api/contact` or connect to Typeform webhook properly.

**Incomplete Language Support:**
- Issue: UI supports 5 languages (IT, EN, FR, ES, ZH) but only 2 content files exist
- Files: `src/data/content-it.json`, `src/data/content-en.json` (FR, ES, ZH missing)
- Impact: Language switcher shows all 5 options but 3 languages have no content file. Clicking FR/ES/ZH will cause fetch errors and fail to load homepage content.
- Fix approach: Create `content-fr.json`, `content-es.json`, `content-zh.json` with full translations. Alternatively, remove unsupported language options from language dropdown until translations are ready.

**Hardcoded Language Fallback:**
- Issue: Language system redirects to new URL on language change (line 77 in `src/scripts/app.js`) but structure doesn't support `/it/`, `/en/` subfolders
- Files: `src/scripts/app.js` (lines 74-77)
- Impact: Language switcher redirects to non-existent URLs, breaking navigation. Feature doesn't work as designed.
- Fix approach: Either implement static site generator for language-specific builds, or refactor to use query parameters (`?lang=en`) instead of URL subfolders.

**Broken Database Page Navigation:**
- Issue: Database page (`src/pages/database.html`) contains internal links to permit pages that use relative paths, but deployment structure unclear
- Files: `src/pages/database.html` (permit links reference pages like `permesso-studio.html`)
- Impact: Links may break if pages are not in expected directory structure. Cross-linking between permit pages may fail.
- Fix approach: Standardize URL structure. Document final deployment layout. Use absolute paths or build-time URL rewriting.

**Missing API Endpoint Documentation:**
- Issue: Contact form code references `/api/contact` endpoint (line 497) and Typeform webhook but no backend implementation exists
- Files: `src/components/contact-form.html` (line 494, commented code)
- Impact: Contact form cannot actually receive or store user messages. No integration path is documented.
- Fix approach: Choose integration path (backend API or Typeform webhook), implement fully, and test end-to-end before deployment.

## Known Bugs

**Language Persistence Bug:**
- Symptoms: Language preference stored in localStorage but redirect on change causes full page reload, losing scroll position and form state
- Files: `src/scripts/app.js` (lines 65-77)
- Trigger: User opens page, clicks language switcher while mid-form or mid-scroll
- Workaround: Use browser back button to recover previous position. Alternatively, disable form submission before language switch.

**Mobile Viewport Height Issue (Partially Fixed):**
- Symptoms: Some iOS devices show navigation bar overlapping content when scrolling or rotating
- Files: `src/scripts/mobile.js` (lines 138-145), `src/styles/mobile-fix.css`
- Current state: Partial fix with `--vh` variable set in mobile.js, but may not cover all iOS Safari edge cases
- Workaround: Test on actual iOS devices. Additional CSS media queries may be needed.

**Swipe Menu Detection Not Initialized on Desktop:**
- Symptoms: SwipeDetector class checks `window.innerWidth <= 768` only once at page load
- Files: `src/scripts/mobile.js` (line 75)
- Trigger: User resizes desktop browser to mobile width - swipe detection doesn't activate
- Impact: Minor - mostly affects development/testing scenarios
- Workaround: Hard refresh page after resizing browser window.

**Pull to Refresh Disabled:**
- Symptoms: Pull to refresh code exists but is commented out
- Files: `src/scripts/mobile.js` (line 132: `// initPullToRefresh();`)
- Reason: Feature was implemented but not enabled
- Impact: Users cannot refresh page with pull gesture on mobile
- Fix approach: Uncomment line 132 or remove unused code entirely.

## Security Considerations

**No Input Sanitization on Contact Form:**
- Risk: Contact form accepts user input without sanitization. XSS possible if messages are displayed without escaping in backend.
- Files: `src/components/contact-form.html` (form fields: name, email, message)
- Current mitigation: HTML form validation (`required`, `type="email"`) prevents obvious issues but is client-side only
- Recommendations: Backend must sanitize and escape all user input before storage/display. Use parameterized queries if storing in database. Validate email format server-side.

**No CSRF Protection:**
- Risk: Contact form lacks CSRF token. If backend receives real submissions, attackers could forge requests from other sites
- Files: `src/components/contact-form.html` (form submission lines 470-522)
- Current mitigation: None
- Recommendations: Add CSRF token to form if backend receives submissions. Use SameSite cookie attribute on backend.

**Privacy Policy Link Points to `/privacy`:**
- Risk: Privacy Policy link (line 90 in `src/components/contact-form.html`) points to relative `/privacy` URL that doesn't exist
- Files: `src/components/contact-form.html`, `src/pages/privacy-policy.html` (exists but not linked correctly)
- Impact: Users clicking privacy link get 404. Legal compliance concern - no way to review privacy policy before submitting data.
- Fix approach: Link should point to `../../src/pages/privacy-policy.html` or determine final URL structure. Ensure privacy policy is accessible from all forms.

**External Typeform Links Not Verified:**
- Risk: Multiple Typeform embed links hardcoded (lines 43, 51, 59, 494 in various files). No validation that forms still exist or are correctly configured
- Files: `src/data/content-it.json`, `src/components/contact-form.html`
- Impact: Forms could be deleted or changed externally without warning. Users directed to wrong form.
- Recommendations: Document all Typeform form IDs and test monthly. Consider hosting test forms on own domain if possible.

## Performance Bottlenecks

**All CSS Files Loaded on Every Page:**
- Problem: Every page loads all 5 CSS files (main.css, components.css, animations.css, mobile.css, mobile-fix.css)
- Files: Link tags in every HTML page header
- Cause: Monolithic CSS approach. Some pages (like simple pages) don't need all animations or component styles
- Improvement path: Concatenate CSS files into single optimized stylesheet with tree-shaking, or split into critical (inline) vs. deferred (lazy) CSS.

**No Image Optimization:**
- Problem: Logo.png and Favicon.svg loaded on every page without srcset/WebP alternatives
- Files: Links in page headers (`src/pages/index.html`, all database pages)
- Cause: Static asset approach without optimization pipeline
- Improvement path: Convert PNG logo to SVG. Generate WebP versions of images. Implement responsive images with srcset. Use build script to optimize on deployment.

**Intersection Observer on Scroll (May Be Expensive):**
- Problem: Every .card, .section-header, .alert element observed individually on page load
- Files: `src/scripts/app.js` (lines 91-108)
- Cause: Database pages with 20+ cards will create 20+ observer instances
- Impact: On slow devices or large pages, could cause frame drops during initial render
- Improvement path: Use single observer instance with callback, or lazy-load components below fold. Consider removing observer on pages with <10 cards.

**Multiple Event Listeners for Mobile Features:**
- Problem: Multiple swipe detectors, event listeners, and performance monitors all initialized simultaneously
- Files: `src/scripts/mobile.js` (multiple addEventListener calls)
- Cause: No event delegation or single responsibility pattern
- Impact: Excessive event listener overhead on mobile devices. Memory usage not optimized.
- Improvement path: Consolidate listeners into single handler. Use event delegation where possible. Remove unused features (pull-to-refresh).

**CSS Animations Running Continuously:**
- Problem: Lighthouse SVG animations (rotate-beam, eye-blink, wave-flow) run for entire page lifetime
- Files: `src/components/lighthouse.html`, `src/styles/animations.css`
- Cause: No pause/stop mechanism when element off-screen
- Impact: CPU usage on mobile remains high even when lighthouse not visible. Battery drain.
- Improvement path: Pause animations when element outside viewport using Intersection Observer. Use `animation-play-state: paused` CSS property.

## Fragile Areas

**Database Page Navigation Structure:**
- Files: `src/pages/database.html`
- Why fragile: Uses relative links like `./permesso-studio.html` without confirmed directory structure. Breaking changes if files are reorganized.
- Safe modification: Before moving any permit page files, search codebase for all hardcoded links. Use `href="./permesso-*.html"` pattern consistently. Add tests for link validity.
- Test coverage: No automated tests verify all database links work.

**Contact Form Data Flow:**
- Files: `src/components/contact-form.html` (lines 470-522)
- Why fragile: Currently simulated submission. When real API is added, any endpoint mismatch breaks form. No retry logic for network failures.
- Safe modification: Before deploying to production, implement backend endpoint first. Test end-to-end with real server. Add error recovery and timeout handling.
- Test coverage: Form validation tested locally but integration untested.

**Language Switcher Logic:**
- Files: `src/scripts/app.js` (lines 40-80)
- Why fragile: Assumes language codes match localStorage keys and URL params. If missing language JSON file, fallback loads Italian but doesn't warn user.
- Safe modification: Add existence check before fetch. Load language with try-catch. Add console.warn if fallback used. Validate language code against whitelist.
- Test coverage: No test for missing language files or malformed JSON.

**Mobile Responsive Breakpoints:**
- Files: `src/styles/mobile-fix.css`, `src/styles/mobile.css`
- Why fragile: Multiple breakpoints (480px, 768px) scattered across files with overlapping media queries. Easy to create conflicting styles.
- Safe modification: Centralize all breakpoints as CSS variables in main.css. Use consistent breakpoint logic across all files.
- Test coverage: Manual testing on 3-4 device sizes only. No automated responsive testing.

**Lighthouse SVG Component:**
- Files: `src/components/lighthouse.html`
- Why fragile: Large SVG (372 lines) with inline styles and multiple animation references. SVG scaling is device-specific (400px → 180px on landscape mobile).
- Safe modification: Extract animations to separate CSS file. Use CSS classes instead of inline style attributes. Document scaling logic with comments.
- Test coverage: Visual testing only. No unit tests for SVG rendering.

## Scaling Limits

**Single Page Becomes Large:**
- Current capacity: Homepage loads 40+ KB CSS + 328 lines JS + 1 main HTML file
- Limit: As more permit pages are added (currently 20+ pages exist), shared assets get replicated in each file instead of cached
- Scaling path: Implement site generator to share assets across all pages. Use service worker to cache CSS/JS globally. Consider static site generator (11ty, Hugo) for multi-page setup.

**No Build Pipeline:**
- Current capacity: Developers manually edit HTML/CSS/JS files
- Limit: As content grows, manual editing becomes error-prone. No minification, no asset versioning, no deployment automation.
- Scaling path: Add build script using Node.js or Python. Automate CSS/JS concatenation and minification. Generate language variants. Deploy to CDN with cache busting.

**JSON Content Files Not Optimized:**
- Current capacity: content-it.json is 4.8 KB, content-en.json is 4.5 KB
- Limit: If more languages added (currently 3 missing), each file replicated in multiple language builds
- Scaling path: Move to single normalized data format. Consider database instead of JSON files. Implement i18n library instead of custom system.

## Dependencies at Risk

**External Google Fonts:**
- Risk: Hardcoded `fonts.googleapis.com` link in every page header. If service down or URL changes, fonts fail to load and fallback to system fonts
- Files: Every HTML page (multiple references to fonts.googleapis.com)
- Impact: Site becomes unstyled in serif default font. Breaks visual design.
- Migration plan: Host fonts locally using `@font-face` or use system font stack as fallback. Add `font-display: swap` to Google Fonts URL to prevent FOIT.

**Typeform Integration:**
- Risk: Site relies on external Typeform embeds for all test forms and contact form. If Typeform changes API, links may break
- Files: `src/data/content-it.json`, `src/data/content-en.json`, `src/components/contact-form.html`
- Impact: Users cannot take tests or submit contact form
- Migration plan: Consider self-hosted form solution or backup form provider. Document all Typeform form IDs for quick migration.

**No Fallback for Missing JavaScript:**
- Risk: Site uses JavaScript heavily (menu toggle, language switcher, animations). If JS fails to load, navigation is broken
- Files: All pages depend on `src/scripts/app.js`
- Impact: Users without JS see broken hamburger menu, non-functional language switcher, no smooth scroll
- Recommendations: Add `<noscript>` warnings. Implement progressive enhancement - make core features work without JS.

## Missing Critical Features

**No Search Functionality:**
- Problem: 30+ pages on database but no way to search for specific permit type
- Blocks: Users must manually browse categories to find relevant permit. Poor UX for mobile.
- Fix path: Implement search using browser-native `<input type="search">` with JavaScript filtering, or integrate Algolia/Elasticsearch.

**No Offline Support:**
- Problem: Site requires internet to function. No service worker or offline fallback
- Blocks: Users on poor connections see broken page. PWA not functional.
- Fix path: Add service worker to cache critical assets. Implement offline.html fallback page. Consider static pre-rendering of frequently accessed pages.

**No Analytics:**
- Problem: No way to track user behavior, which pages are popular, form submission rates
- Blocks: Cannot optimize content or improve UX based on data. Marketing effectiveness unknown.
- Fix path: Add Google Analytics or Matomo. Track page views, form interactions, CTA clicks. Review monthly.

**No Accessibility for Screen Readers:**
- Problem: While HTML is semantic, many components lack ARIA labels and descriptions
- Blocks: Blind/low-vision users cannot navigate effectively. Lighthouse SVG and paperwork illustrations have no alt text
- Fix path: Add `aria-label` to interactive elements. Add alt text to all images. Test with screen reader (NVDA, JAWS). Aim for WCAG 2.1 AA compliance.

**No Mobile App:**
- Problem: Site is responsive but not installable as PWA
- Blocks: Users must bookmark site. Cannot add to home screen on iOS.
- Fix path: Add manifest.json with app metadata. Implement service worker. Test "Add to Home Screen" on iOS and Android.

## Test Coverage Gaps

**No Automated Tests:**
- What's not tested: Any functionality. No unit tests, integration tests, or E2E tests exist.
- Files: All source files in `src/`
- Risk: Regressions not caught. Breaking changes deployed unknowingly.
- Priority: High - should add test suite before deploying to production

**No Link Validation:**
- What's not tested: All internal and external links on database pages
- Files: `src/pages/database.html`, all permit page files
- Risk: Broken links discovered by users only
- Priority: High - add broken-link checker to CI pipeline

**No Form Submission Testing:**
- What's not tested: Contact form validation, error handling, successful submission
- Files: `src/components/contact-form.html`
- Risk: Form may fail silently in production
- Priority: Critical - test with real backend before deploying

**No Mobile Device Testing:**
- What's not tested: Actual behavior on iOS Safari, Chrome Mobile with real network conditions
- Files: All CSS (mobile.css, mobile-fix.css) and JavaScript files
- Risk: Mobile users experience unexpected bugs (viewport issues, touch event failures)
- Priority: High - test on 5+ real devices (iPhone, Android, iPad)

**No Performance Testing:**
- What's not tested: Page load time, Core Web Vitals (LCP, FID, CLS), performance on slow 3G
- Files: All pages
- Risk: Site may be slow on mobile, hurting SEO and user experience
- Priority: High - add Lighthouse CI to measure performance on every commit

**No Cross-Browser Testing:**
- What's not tested: Compatibility with older browsers (IE 11 fallback, older Safari versions)
- Files: All CSS and JavaScript
- Risk: Older devices/browsers fail silently
- Priority: Medium - test on Safari, Firefox, Chrome, Edge. Document minimum browser versions.

---

*Concerns audit: 2026-01-25*
