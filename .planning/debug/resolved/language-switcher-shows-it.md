---
status: resolved
trigger: "Language switcher shows IT on EN test page even though curl returns EN"
created: 2026-02-05T14:30:00Z
updated: 2026-02-05T14:30:00Z
---

## Current Focus

hypothesis: detectLanguageFromPath() checks URL path (/en/) but test page is at /_test-layout-en.html which doesn't match /en/
test: Verify the path detection logic fails for test page URL
expecting: Path /_test-layout-en.html returns 'it' from detectLanguageFromPath()
next_action: Confirm root cause and propose fix

## Symptoms

expected: Language switcher should show "EN" on the English test page
actual: Shows "IT" even on /en/ page and _test-layout-en.html
errors: None visible
reproduction: Open http://localhost:8080/_test-layout-en.html in browser
started: Just discovered during component testing
key_clue: curl returns correct "EN" but browser shows "IT" - suggests JS override

## Eliminated

## Evidence

- timestamp: 2026-02-05T14:35:00Z
  checked: language-switcher.liquid component
  found: Uses Liquid conditional {% if lang == 'en' %} to render correct initial value
  implication: Server-side rendering is correct, confirmed by curl

- timestamp: 2026-02-05T14:36:00Z
  checked: Built HTML output (_site/_test-layout-en.html)
  found: Contains "EN" in the HTML as expected
  implication: Confirms server renders correct value, problem is client-side

- timestamp: 2026-02-05T14:37:00Z
  checked: app.js lines 179-200 (detectLanguageFromPath function)
  found: Function checks if path.startsWith('/en/') || path === '/en', returns 'it' otherwise
  implication: Test page URL /_test-layout-en.html does NOT match /en/ pattern, so returns 'it'

- timestamp: 2026-02-05T14:38:00Z
  checked: app.js lines 198-201 (currentLanguageDisplay update)
  found: JS unconditionally overwrites currentLanguageDisplay.textContent with detected language
  implication: ROOT CAUSE FOUND - JS overwrites correct server-rendered value with wrong detection

## Resolution

root_cause: JavaScript detectLanguageFromPath() only checks URL path patterns (/en/), but the server already renders the correct language from page.lang. The JS then unconditionally overwrites the correct server-rendered value with its (incorrect) path-based detection. For pages not in /en/ directory (like test pages), it defaults to Italian.
fix: Changed detectLanguageFromPath() to detectLanguage() which now prioritizes document.documentElement.lang (HTML lang attribute set by server) over URL path detection
verification:
  - _site/_test-layout-en.html has lang="en" - JS will now read this and show EN
  - _site/_test-layout.html has lang="it" - JS will read this and show IT
  - /en/ pages still work via both HTML attr and URL path fallback
  - Simulated JS execution confirms detectLanguage() returns 'en' for EN test page
  - Simulated JS execution confirms detectLanguage() returns 'it' for IT test page
files_changed:
  - src/scripts/app.js
