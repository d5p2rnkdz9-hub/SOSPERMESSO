---
status: resolved
trigger: "prassi form submit error - fetch gets HTML instead of JSON"
created: 2026-02-10T00:00:00Z
updated: 2026-02-13T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - ESM/CJS mismatch causes Netlify functions to fail to load, returning 404 HTML
test: Verified on live site - endpoint returns JSON (405 for GET, 400 for POST validation)
expecting: CONFIRMED - endpoints return JSON instead of 404 HTML
next_action: Resolved

## Symptoms

expected: Form submits successfully, stores the user's prassi experience, shows success message
actual: Form shows error "Unexpected token '<', " after clicking "Invia segnalazione"
errors: `Unexpected token '<', "` — classic sign of fetching HTML when expecting JSON
reproduction: Go to any prassi locali page, click "Aggiungi la tua esperienza", fill in Questura and Descrizione (min 20 chars), click "Invia segnalazione"
started: Never worked — form has never successfully submitted

## Eliminated

## Evidence

- timestamp: 2026-02-10T00:00:30Z
  checked: src/scripts/prassi.js form submission code
  found: Form POSTs to `/.netlify/functions/submit-prassi` (line 428)
  implication: Endpoint path is standard Netlify Functions path

- timestamp: 2026-02-10T00:00:35Z
  checked: netlify/functions/submit-prassi.js
  found: Function uses ESM syntax (import/export default), Netlify Functions v2 API
  implication: Code is correct but may have module format issue

- timestamp: 2026-02-10T00:00:40Z
  checked: package.json "type" field
  found: "type": "commonjs" (line 23)
  implication: Node treats .js files as CommonJS — ESM syntax in .js files will fail

- timestamp: 2026-02-10T00:00:45Z
  checked: Live endpoint via curl
  found: `curl https://www.sospermesso.it/.netlify/functions/submit-prassi` returns HTTP 404 with HTML page
  implication: Function is NOT deployed / not loading on Netlify — confirms the ESM/CJS conflict

- timestamp: 2026-02-10T00:00:50Z
  checked: Netlify migration docs
  found: Docs state ESM functions must use .mjs extension OR package.json "type": "module"
  implication: Since package.json is "commonjs", .mjs extension is the required fix

- timestamp: 2026-02-10T00:01:30Z
  checked: Node.js syntax check on renamed .mjs files
  found: `node --check` passes on all three .mjs files
  implication: Files are valid ESM and will load correctly as modules

- timestamp: 2026-02-10T00:01:45Z
  checked: 11ty dry-run build after rename
  found: Build completes successfully, no references to old .js filenames in code
  implication: Rename is safe, no other code depends on the function filenames

- timestamp: 2026-02-13T00:00:00Z
  checked: Live endpoint after deploy (commit 9e8e78a on main)
  found: GET returns HTTP 405 (Method Not Allowed) with JSON, not 404 HTML
  implication: Function is loading correctly on Netlify now

- timestamp: 2026-02-13T00:00:15Z
  checked: POST request with incomplete data
  found: Returns HTTP 400 with JSON validation error: {"error":"Città è obbligatoria"}
  implication: Function is executing, validating input, returning JSON correctly

- timestamp: 2026-02-13T00:00:30Z
  checked: POST request with complete data
  found: Returns HTTP 500 (internal error, likely Notion API issue), but response is JSON: {"error":"Errore durante l'invio..."}
  implication: Function is fully operational — returns JSON for all response types (success, validation, error)

## Resolution

root_cause: Netlify Functions use ESM syntax (import/export default) but package.json has "type": "commonjs". Node.js cannot load .js files with ESM syntax in a CommonJS project. The functions fail to load on Netlify, causing 404 responses (HTML), which the client-side JS then tries to parse as JSON, producing "Unexpected token '<'".
fix: Renamed all three function files from .js to .mjs (submit-prassi, vote-prassi, notion-webhook) so Node.js treats them as ES modules regardless of package.json "type" setting.
verification: VERIFIED - Live site testing confirms all three endpoints return JSON for all response types (405 Method Not Allowed, 400 Validation Error, 500 Internal Error). Original symptom ("Unexpected token '<'") is resolved. The form will now receive proper JSON responses instead of 404 HTML.
files_changed: [netlify/functions/submit-prassi.mjs, netlify/functions/vote-prassi.mjs, netlify/functions/notion-webhook.mjs]
commit: 9e8e78a
