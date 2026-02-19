# Pitfalls: Netlify Functions + Notion API for Prassi Submission & Voting

**Domain:** Netlify Functions calling Notion API — anonymous submission and voting endpoints
**Milestone context:** v4.1 — prassi locali (crowdsourced questura notes) on existing 11ty/Netlify/Notion site
**Researched:** 2026-02-19
**Overall confidence:** HIGH (findings verified against official Netlify docs, Notion API docs, and multiple forum threads)

---

## Critical Pitfalls

Mistakes that cause data loss, security incidents, or require endpoint rewrites.

---

### Pitfall 1: The Vote Endpoint Has a Read-Modify-Write Race Condition

**What goes wrong:** `vote-prassi.js` fetches the current vote count from Notion, adds 1, then writes it back. If two requests arrive within milliseconds of each other, both read the same current value (e.g., 42), both write 43, and one vote is silently lost.

**Why it happens:** The Notion API has no atomic increment operation. There is no `{ $increment: 1 }` equivalent like you'd have in MongoDB or a SQL `UPDATE SET votes = votes + 1`. The read-modify-write pattern is the only option, which is inherently non-atomic.

**Consequences:**
- Votes are silently dropped under concurrent load
- Vote count drifts downward from reality over time
- No error is thrown — the data is just wrong
- For a small-scale project (tens of votes, not thousands), this is tolerable but must be understood

**Prevention:**
- Accept the limitation explicitly — for small-scale immigrant sharing, simultaneous votes on a single prassi entry are astronomically rare
- Document the known limitation in code comments: `// NOTE: read-modify-write, not atomic. Acceptable at this scale.`
- Do NOT attempt to "fix" with complex locking mechanisms (they won't work with stateless serverless functions anyway)
- If exact vote counts become critical later, switch to a proper database (Supabase, PlanetScale, etc.) — Notion is not a vote store

**Detection (warning signs):**
- Vote counts that seem "low" compared to user reports
- Two simultaneous test requests producing a +1 instead of +2 delta

**Phase to address:** Submission Phase — accept the tradeoff upfront, document it.

**Confidence:** HIGH — Notion API reference confirms no atomic increment; behavior is a fundamental property of read-modify-write patterns.

---

### Pitfall 2: The Build Hook URL Is a Secret That Treats Itself as Public

**What goes wrong:** Netlify Build Hook URLs respond to any unauthenticated POST request. Once the URL is known, anyone can trigger unlimited rebuilds. The Notion automation sends the URL in plain HTTP to the Notion automation engine. If the URL appears in git history, browser network tab (if ever called client-side), logs, or is shared by accident, rebuilds can be triggered continuously.

**Why it happens:** Netlify documents build hooks as "HTTPS URL that responds to POST requests" — the implication of that being an unauthenticated public URL is easy to miss. Notion automations require the full URL to trigger the webhook.

**Consequences:**
- Build minutes exhausted (free tier: 300 build minutes/month)
- Each rebuild of this site takes ~72 seconds (per MEMORY.md), so ~250 malicious triggers = entire month's budget gone
- Site may show outdated content while builds queue
- No Netlify mechanism to rate-limit build hook triggers on free tier

**Prevention:**
- Never commit the build hook URL to git — treat it like an API key
- Store it only in Notion automation configuration (server-side) and Netlify UI
- Rotate the hook URL immediately if it is ever exposed
- On Netlify: configure the hook to only deploy a specific branch, reducing blast radius
- Consider a Netlify Function intermediary: Notion automation calls `/.netlify/functions/trigger-rebuild` which validates a shared secret header before calling the build hook URL server-side. This keeps the real hook URL out of any external system.

**Detection (warning signs):**
- Build minutes depleting faster than expected
- Builds triggering without corresponding Notion status changes
- Build hook URL appearing in git diff, browser network tab, or logs

**Phase to address:** Build Hook Integration Phase — before wiring Notion automation.

**Confidence:** HIGH — verified by Netlify build hooks documentation and community discussions confirming unauthenticated nature.

---

### Pitfall 3: Anonymous Submission Endpoint Invites Spam and Junk Data

**What goes wrong:** `submit-prassi.js` accepts POST requests with no authentication. Bots and malicious users can flood the Notion database with garbage data. This degrades the admin review experience and may exhaust Notion API rate limits.

**Why it happens:** The endpoint is publicly reachable via `/.netlify/functions/submit-prassi`. There is no server-side guard beyond the existing client-side localStorage 24h limit, which does nothing against scripts or curl.

**Consequences:**
- Admin (single person reviewing in Notion) drowns in spam entries
- Notion database fills with garbage
- Notion API rate limit (3 req/s average) can be hit by a sustained flood
- Legitimate submissions get buried

**Prevention (layered approach — pick all three):**

1. **Honeypot field (server-side check):** Add a hidden field (`data-bot-trap` or similar) to the submission form. Any submission where this field is filled = bot. Reject silently with `200 OK` (don't tell bots they failed). Server-side check in the function, not just client-side.

2. **Server-side rate limiting by IP:** Check `event.headers['x-forwarded-for']` or `event.headers['client-ip']`. Store IP + timestamp in a simple in-memory cache (for the function instance lifetime) or use a lightweight key-value store. On Netlify free tier with stateless functions, true IP-based rate limiting requires an external store (Upstash Redis has a generous free tier). For small scale: accept that IP rate limiting is imperfect on serverless (stateless) but add it anyway as a deterrent.

3. **Content validation:** Minimum field lengths (e.g., questura city required, description minimum 20 characters), maximum field lengths (cap at 1000 chars to prevent huge payloads), and basic sanitization (strip HTML tags before sending to Notion to prevent XSS in the admin view).

**What NOT to do:**
- Do NOT add reCAPTCHA for this user base — immigrants with limited Italian literacy are already stressed; friction will kill legitimate submissions
- Do NOT require account creation — anonymous is the stated design goal
- Do NOT rely solely on client-side localStorage — it is trivially bypassed

**Detection (warning signs):**
- Notion database getting entries with clearly fake data (random strings, repeated patterns)
- Notion API returning 429 during spikes
- Function invocation count spiking without corresponding user activity

**Phase to address:** Submit Function Phase — build defenses into the initial implementation.

**Confidence:** HIGH — verified against Netlify abuse prevention discussions and honeypot documentation.

---

### Pitfall 4: CORS Headers Missing on Error Responses (Only Set on Happy Path)

**What goes wrong:** The function sets `Access-Control-Allow-Origin` in the success response but forgets to set it on validation errors (400), rate limit errors (429), and unexpected errors (500). The browser receives the error response but cannot read it because CORS headers are absent. The client-side code sees a network error instead of a meaningful error code and cannot give the user useful feedback.

**Why it happens:** Developers set CORS headers in the success branch and forget that every response path — including thrown exceptions caught in a try/catch — must also set the header.

**Consequences:**
- User submits form, gets an opaque network error instead of "please fill in the questura name"
- Developer debugging sees CORS errors in the console that hide the real underlying error
- Retry logic in the client has no status code to act on

**Prevention:**
```javascript
// Set CORS headers as a constant, include in ALL responses
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.sospermesso.it',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Handle preflight
if (event.httpMethod === 'OPTIONS') {
  return { statusCode: 204, headers: corsHeaders, body: '' };
}

try {
  // ... logic
  return { statusCode: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
} catch (err) {
  // CORS headers MUST be here too
  return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Internal error' }) };
}
```

- Use `'https://www.sospermesso.it'` as the specific origin, NOT `'*'` — wildcard prevents credentials and is weaker security
- Handle the OPTIONS preflight method explicitly — browsers send this before the real POST

**Detection (warning signs):**
- Browser console shows "CORS error" or "No 'Access-Control-Allow-Origin' header present" on a non-200 response
- Network tab shows error responses from the function but the browser cannot read the body

**Phase to address:** Both submit and vote function implementations — first line of the handler.

**Confidence:** HIGH — verified against Netlify CORS support guide and standard browser behavior.

---

## Moderate Pitfalls

Mistakes that cause delays, confusing behavior, or technical debt.

---

### Pitfall 5: Notion API Cold Path Through @notionhq/client Bundle Size

**What goes wrong:** `@notionhq/client` is ~1.5MB installed. When Netlify bundles the function with esbuild, the bundle still includes the full SDK. Combined with Node.js cold start (~2-3 seconds on Netlify free tier), the first request after a period of inactivity takes 3-5 seconds before any Notion API call is even made. Users get a spinner for 4-6 seconds total.

**Why it happens:** Serverless functions are not kept warm between invocations. Each new function instance has to initialize the runtime and load all dependencies.

**Consequences:**
- First submission or vote after site quiets down feels broken
- Users click "Submit" twice (causing duplicate submissions)
- Users see a long loading state and abandon

**Prevention:**
- Set a generous client-side timeout (8-10 seconds) with a spinner — do not fail after 3 seconds
- Show a "Sending..." loading state immediately on form submit to prevent double-clicks
- Disable the submit button on first click and only re-enable it on success or failure
- Accept cold start as a property of the platform at this scale — do not over-engineer warming solutions for a small volunteer site
- Keep the function bundle small: import only what you need from the SDK (`const { Client } = require('@notionhq/client')`)

**Detection (warning signs):**
- First request timing out intermittently after a period of no traffic
- Users reporting double submissions
- Response time of >5s on the first hit, <1s on subsequent hits

**Phase to address:** Submit and vote function implementations.

**Confidence:** MEDIUM — cold start times verified by benchmark data (Netlify ~3s cold) and @notionhq/client npm package size; specific combined behavior is inference from both data points.

---

### Pitfall 6: Notion API Rate Limit (3 req/s) Silently Fails Under Mild Traffic

**What goes wrong:** The Notion API enforces a limit of 3 requests per second per integration key. For most of this site's lifetime, this is not an issue. But during a shared social media post or news mention, many simultaneous submissions hit the endpoint at once, all calling the Notion API with the same integration key. The function receives `429 rate_limited` from Notion and has no retry logic. The response to the user is a generic error.

**Why it happens:** Small-scale projects don't think about rate limits. The Notion SDK does not retry 429s by default.

**Consequences:**
- Legitimate submissions silently dropped during traffic spikes
- User sees "something went wrong" with no guidance
- Admin never knows a submission failed

**Prevention:**
- Implement basic retry with exponential backoff in the function (1-2 retries max, respecting `Retry-After` header):
  ```javascript
  // Respect Retry-After header from Notion on 429
  if (error.status === 429) {
    const retryAfter = error.headers?.['retry-after'] || 1;
    await new Promise(r => setTimeout(r, retryAfter * 1000));
    // retry once
  }
  ```
- Return a `503` (Service Unavailable) with a user-friendly message and `Retry-After` header if retries fail — do not swallow the error
- Log rate limit events to detect spikes early

**Detection (warning signs):**
- Function logs showing `APIResponseError: rate_limited` (status 429)
- User reports of "error" messages on the submission form during periods of higher traffic

**Phase to address:** Both function implementations — before first deployment.

**Confidence:** HIGH — Notion API rate limit of 3 req/s is officially documented; retry-after header behavior is confirmed in Notion developer docs.

---

### Pitfall 7: esbuild ESM/CommonJS Mismatch With @notionhq/client

**What goes wrong:** If the Netlify Function file uses ESM syntax (`import { Client } from '@notionhq/client'`) but the Netlify esbuild bundler compiles to CommonJS, or vice versa, the deployed function crashes immediately with `Error [ERR_REQUIRE_ESM]` or module resolution failures. This only manifests on deploy — local `netlify dev` may behave differently.

**Why it happens:** This project uses `eleventy.config.mjs` (ESM) for 11ty config and CommonJS `module.exports` for data files (per MEMORY.md project patterns). The Netlify Functions directory is a separate context. If the function file format doesn't match the bundler's output format, there's a mismatch.

**Consequences:**
- Function deploys successfully but crashes on every invocation with a module error
- Error is not visible until an actual invocation attempt
- `netlify dev` locally may work fine, masking the issue

**Prevention:**
- Use CommonJS syntax for Netlify Function files: `const { Client } = require('@notionhq/client')` and `exports.handler = async (event) => { ... }` — this matches the project's existing data file pattern
- Verify the `@notionhq/client` package supports CommonJS (it does — it ships both CJS and ESM builds)
- Do NOT set `"type": "module"` in a `package.json` inside the `netlify/functions/` directory
- Test with `netlify functions:invoke` locally after a full build, not just `netlify dev`

**Detection (warning signs):**
- Function invocation returning `500` with `ERR_REQUIRE_ESM` or `Cannot find module` in function logs
- Works locally, fails on Netlify deploy
- ESM and CJS syntax mixed in the same function file

**Phase to address:** Function file creation — establish module format in the first line of code.

**Confidence:** HIGH — verified by Netlify CLI GitHub issues and forum threads; @notionhq/client npm page confirms CJS/ESM dual package support.

---

### Pitfall 8: Build Triggered by Notion Automation Runs Full Build (72 Seconds)

**What goes wrong:** The Notion automation triggers the Netlify Build Hook when a prassi entry gets status "Approvato". Netlify runs the full site build: `npm run build` = Notion content fetch (all permits, all documents) + 11ty. This takes ~72 seconds for a cold build (per MEMORY.md). Every approval triggers this full rebuild. If the admin approves 10 entries in quick succession, 10 builds queue up, each taking 72 seconds. Free tier has 300 build minutes/month — 250 builds exhaust it.

**Why it happens:** There is no partial rebuild option in this site's architecture. All content comes from Notion, and the build script fetches everything.

**Consequences:**
- Build minutes consumed faster than expected
- Admin is unaware because they only see the Notion database change, not the Netlify build queue
- Site content is stale during queued builds

**Prevention:**
- The Notion API response cache (`last_edited_time` tracking per MEMORY.md) significantly reduces rebuild time for unchanged content — warm builds take ~11-13s vs ~72s cold. This is the most important mitigation.
- Configure Netlify to skip identical builds — enable "Skip identical builds" in Netlify site settings to prevent redundant queued builds
- Brief the admin on batching approvals: "Approve a few at once, wait 2 minutes for the build to finish, then continue"
- Set a Netlify build notification (email/Slack) so admin knows when a build completes
- Consider a cooldown in the Notion automation: only trigger build hook if no build was triggered in the last 5 minutes (Notion automation condition on a "last built" timestamp property)

**Detection (warning signs):**
- Netlify build minutes depleting faster than expected for a small site
- Admin reporting that approved content does not appear quickly despite approving
- Multiple builds queued in Netlify dashboard

**Phase to address:** Build Hook Integration Phase — understand the rebuild economics before wiring automation.

**Confidence:** HIGH — project build time is documented in MEMORY.md (72s cold, 11-13s warm); Netlify free tier build minutes (300/month) are public pricing.

---

### Pitfall 9: Notion Database Page Creation Succeeds But Field Mapping Is Wrong

**What goes wrong:** `submit-prassi.js` creates a Notion page with properties mapped to the prassi database schema. If a property name has a typo, wrong type, or doesn't match the Notion database schema exactly, the Notion API silently accepts the page creation but stores the data in the wrong field, or omits it entirely. The admin sees an empty or malformed entry.

**Why it happens:** Notion API page creation does not validate property names against the database schema — it accepts unknown property names and ignores them. There is no compile-time type checking between the function code and the Notion database definition.

**Consequences:**
- Submissions appear to succeed (HTTP 200 from Notion) but data is missing
- Admin sees entries with empty fields — unclear if user error or bug
- Debugging requires cross-referencing API payloads with Notion DB schema

**Prevention:**
- Write a one-time test script that creates a test page in the prassi database and reads it back to verify all fields are populated correctly — run this before first deployment
- Keep a local copy of the prassi database property names and types as a comment in the function code
- Use a schema constant at the top of the function:
  ```javascript
  // Notion prassi DB property names — verify against DB if submissions appear empty
  const PROPS = {
    questura: 'Questura',     // title property
    status: 'Status',          // select property
    description: 'Descrizione', // rich_text property
    votes: 'Voti',             // number property
  };
  ```
- Implement a schema validation test as a build-time check or pre-deploy script

**Detection (warning signs):**
- Test submissions in Notion showing empty fields despite the function returning 200
- Notion API not returning an error for properties with wrong names (it won't — this is silent failure)
- Admin reporting "I see the entry but the description is missing"

**Phase to address:** Submit function implementation — include a schema validation test before deploy.

**Confidence:** HIGH — Notion API documentation confirms that unknown properties are silently ignored during page creation.

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable quickly.

---

### Pitfall 10: NOTION_API_KEY Not Scoped to Functions on Netlify

**What goes wrong:** `NOTION_API_KEY` is set as a Netlify environment variable but without the "Functions" scope selected (or with only "Build" scope). The function cannot read `process.env.NOTION_API_KEY` at runtime and crashes with "Client must be initialized with an auth token."

**Why it happens:** Netlify environment variables have scope options: "All scopes", "Builds", "Runtime" (Functions/Edge), and "Post processing". The scope must include "Runtime" for functions to read it.

**Prevention:**
- In Netlify UI: Environment Variables → `NOTION_API_KEY` → verify scope includes "Functions" or "All"
- Test by invoking the function after deployment and checking for auth errors
- Add a guard at the top of each function: `if (!process.env.NOTION_API_KEY) return { statusCode: 500, body: 'Missing API key' }`

**Phase to address:** First function deployment.

---

### Pitfall 11: OPTIONS Preflight Not Handled (CORS Pre-flight 405)

**What goes wrong:** Browsers send a preflight `OPTIONS` request before any cross-origin `POST` with a JSON body. If the function handler only handles `POST`, the `OPTIONS` request returns 200 with no CORS headers (or a 405 Method Not Allowed), and the browser blocks the actual POST from ever being sent. The form appears broken even though the function logic is correct.

**Prevention:**
```javascript
if (event.httpMethod === 'OPTIONS') {
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.sospermesso.it',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body: '',
  };
}
```

**Detection:** Browser console showing `OPTIONS` request returning 405 or no CORS headers, followed by "CORS preflight failed."

**Phase to address:** Function implementation — first test from a browser (not curl) will reveal this immediately.

---

### Pitfall 12: Netlify Function Logs Are Transient (No Persistent Log Store)

**What goes wrong:** Netlify's free tier function logs are available in the UI for a limited window (~1 hour for real-time, up to a few days for structured logs depending on plan). If a submission failure occurs and is only discovered later (admin notices a gap in the data), the logs may already be gone.

**Prevention:**
- Log key events to console with structured data: `console.log(JSON.stringify({ event: 'submit', questura, status: 'ok', notionPageId }))` — these appear in Netlify function logs
- For error cases, log enough context to reconstruct what happened: `console.error(JSON.stringify({ event: 'submit_failed', error: err.message, status: err.status }))`
- Accept that log retention is limited — for a small volunteer project, this is tolerable
- If persistent logs become critical, add a simple Notion page as a log entry (low rate, append-only) or use a free Sentry.io integration

**Phase to address:** Both function implementations.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| `submit-prassi.js` implementation | CORS on error paths (#4), OPTIONS preflight (#11), schema mismatch (#9) | Set CORS constants first; write schema test before deploy |
| `vote-prassi.js` implementation | Race condition (#1), CORS on error paths (#4) | Document known limitation; set CORS constants first |
| First function deployment | env var scope (#10), esbuild CJS/ESM (#7) | Verify env scope in Netlify UI; use CommonJS syntax |
| Build hook wiring (Notion automation) | Hook URL exposure (#2), full rebuild economics (#8) | Store URL as secret; understand build minute budget |
| Anonymous submission launch | Bot spam (#3), Notion rate limits (#6) | Honeypot + content validation; add retry on 429 |
| Post-launch monitoring | Transient logs (#12), cold start double-submit (#5) | Disable button on click; accept cold start latency |

---

## Sources

**Netlify Functions — Timeout and Limits:**
- [Netlify Docs: Functions Overview](https://docs.netlify.com/build/functions/overview/)
- [Netlify Support: Function timeout at 10s on Starter plan](https://answers.netlify.com/t/function-timeout-at-10s-on-starter-plan-despite-new-30s-limit/153127)
- [Netlify Support: Why is my function timing out?](https://answers.netlify.com/t/support-guide-why-is-my-function-taking-long-or-timing-out/71689)

**Netlify Build Hooks:**
- [Netlify Docs: Build Hooks](https://docs.netlify.com/build/configure-builds/build-hooks/)
- [Netlify Blog: Power your site with APIs and Build Hooks](https://www.netlify.com/blog/2021/12/22/power-your-site-with-apis-and-build-hooks/)

**Netlify CORS:**
- [Netlify Support: Handling CORS on Netlify](https://answers.netlify.com/t/support-guide-handling-cors-on-netlify/107739)
- [Netlify Support: CORS issue with Netlify Functions](https://answers.netlify.com/t/cors-issue-with-netlify-functions/103443)

**Netlify esbuild Bundling:**
- [Netlify Support: Bundling functions using ESBuild compiles to commonJS](https://answers.netlify.com/t/bundling-functions-using-esbuild-compiles-to-commonjs/128855)
- [Netlify CLI GitHub Issue: ESM in functions with esbuild](https://github.com/netlify/cli/issues/6445)

**Cold Start:**
- [Benchmark: Vercel vs Netlify vs Cloudflare Serverless Cold Starts](https://punits.dev/blog/vercel-netlify-cloudflare-serverless-cold-starts/)
- [Netlify Support: Functions — potential cold start issues](https://answers.netlify.com/t/functions-potential-cold-start-issues/107322)

**Notion API Rate Limits:**
- [Notion Docs: Request Limits](https://developers.notion.com/reference/request-limits)
- [Thomas Frank: How to Handle Notion API Request Limits](https://thomasjfrank.com/how-to-handle-notion-api-request-limits/)

**Netlify Functions Abuse Prevention:**
- [Netlify Support: Functions abuse prevention](https://answers.netlify.com/t/functions-abuse-prevention/17814)
- [Netlify Docs: Rate Limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)

**Honeypot Spam Protection:**
- [WorkOS: Stop bots with honeypots](https://workos.com/blog/stop-bots-with-honeypots)
- [CSS-Tricks: Building a Honeypot Field That Works](https://css-tricks.com/building-a-honeypot-field-that-works/)

---

*Last updated: 2026-02-19*
*Research mode: Pitfalls dimension for specific milestone (v4.1 Netlify Functions + Notion API)*
