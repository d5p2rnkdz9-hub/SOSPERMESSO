---
phase: 41-prassi-locali-mvp
plan: 02
subsystem: serverless-api
tags: [netlify-functions, notion-api, serverless, form-submission, voting, cors]
requires:
  - phases/41-prassi-locali-mvp/41-01-PLAN.md
provides:
  - netlify/functions/submit-prassi.js
  - netlify/functions/vote-prassi.js
  - Netlify Functions configuration
affects:
  - phases/41-prassi-locali-mvp/41-03-PLAN.md (client-side form/voting UI)
  - phases/41-prassi-locali-mvp/41-04-PLAN.md (11ty data file integration)
tech-stack:
  added: []
  patterns:
    - Netlify Functions v2.0 (Web Platform API)
    - CORS headers for cross-origin requests
    - Notion API for page creation and updates
    - Client-side localStorage for duplicate vote prevention
key-files:
  created:
    - netlify/functions/submit-prassi.js
    - netlify/functions/vote-prassi.js
  modified:
    - netlify.toml
decisions:
  - id: 41-02-01
    decision: Use Netlify Functions v2.0 (export default async)
    rationale: Modern Web Platform API (Request/Response) is preferred over classic AWS Lambda signature
    impact: ESM imports work correctly with esbuild bundler
  - id: 41-02-02
    decision: Hardcode 105 questura cities in function
    rationale: Static list unlikely to change, avoids external API call or database query
    impact: City validation is fast and deterministic
  - id: 41-02-03
    decision: Skip server-side rate limiting in MVP
    rationale: Client-side localStorage sufficient for MVP, Upstash Redis deferred until abuse occurs
    impact: Simplified implementation, no new dependencies, potential for vote manipulation
  - id: 41-02-04
    decision: CORS allow all origins (*)
    rationale: Public API with no sensitive data, simplifies cross-origin requests
    impact: Functions callable from any domain
metrics:
  duration: 104 seconds
  completed: 2026-02-09
---

# Phase 41 Plan 02: Netlify Functions for Prassi API Summary

**One-liner:** Two serverless endpoints (submit/vote) with Notion integration, CORS support, and 105-city validation.

## What Was Built

### Core Deliverables
1. **submit-prassi.js** - Form submission endpoint
   - Accepts POST with city/description/date/category/pageUrl/pageSlug
   - Validates city against 105 questura cities
   - Creates Notion page with Status=Pending
   - Returns success with page ID or error message
   - Full CORS support (OPTIONS preflight + response headers)

2. **vote-prassi.js** - Voting endpoint
   - Accepts POST with id/voteType (confermo/non_confermo)
   - Fetches current vote count from Notion
   - Increments appropriate counter
   - Returns success with new count or error
   - Full CORS support

3. **netlify.toml updates** - Functions configuration
   - Set functions directory to netlify/functions
   - Enabled esbuild bundler for ESM support
   - No environment variables added (secrets in Netlify dashboard)

### Technical Implementation

**Netlify Functions v2.0 Pattern:**
```javascript
export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Parse body
  const data = await req.json();

  // Validate, process, respond
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: corsHeaders
  });
}
```

**City Validation:**
- 105 Italian questura cities hardcoded in submit-prassi.js
- Array includes all provincial capitals (Agrigento → Viterbo)
- Validation prevents typos and invalid submissions

**Notion Integration:**
- Uses existing @notionhq/client (already installed)
- Submit: `notion.pages.create()` with database_id from env var
- Vote: `notion.pages.retrieve()` + `notion.pages.update()`
- Properties: Citta (title), Descrizione (rich_text), Status (select), vote counts (number)

**CORS Configuration:**
```javascript
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
```

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

### 1. Netlify Functions v2.0 over Classic
**Context:** Netlify supports both classic (AWS Lambda signature) and v2.0 (Web Platform API)

**Decision:** Use v2.0 with `export default async (req, context)`

**Rationale:**
- Modern standard (Request/Response API)
- Better ESM support
- Matches Netlify documentation recommendations
- Cleaner syntax for CORS handling

**Impact:** Requires esbuild bundler in netlify.toml, but provides better developer experience

### 2. Hardcoded City List vs. External Data
**Context:** Need to validate city input against questura locations

**Options:**
- Hardcode 105 cities in function
- Store in Notion database and query
- Use external API

**Decision:** Hardcode in function

**Rationale:**
- List is static (provincial capitals don't change often)
- Avoids external API call overhead
- No additional Notion query needed
- ~3KB array size is negligible

**Impact:** Faster validation, simpler code, must update function if cities change

### 3. No Server-Side Rate Limiting in MVP
**Context:** Research identified @upstash/ratelimit for vote abuse prevention

**Decision:** Skip Upstash Redis, rely on client-side localStorage only

**Rationale:**
- MVP scope - optimize for shipping
- localStorage provides casual duplicate prevention
- No evidence of abuse yet
- Can add Upstash later if needed
- Avoids new dependencies and Redis setup

**Impact:**
- Simplified implementation (saved ~50 lines of code)
- No new npm packages
- Potential for vote manipulation (acceptable MVP risk)
- Easy to add later without breaking changes

### 4. CORS Allow-All (*)
**Context:** Functions need to be callable from SOS Permesso website

**Decision:** Use `Access-Control-Allow-Origin: *`

**Rationale:**
- No authentication or sensitive data
- Public submission/voting endpoints
- Simplifies cross-origin requests
- Could restrict later if needed

**Impact:** Functions callable from any domain (intentional for public API)

## Testing & Verification

**File Structure:**
```
netlify/
└── functions/
    ├── submit-prassi.js (4.6KB, 250 lines)
    └── vote-prassi.js (2.9KB, 117 lines)
```

**Verification Checks:**
- ✓ Both functions exist with proper structure
- ✓ `export default` present in both files
- ✓ `pages.update` in vote-prassi.js
- ✓ CORS headers in all responses (>= 2 occurrences)
- ✓ City validation array (105 cities)
- ✓ netlify.toml has functions directory config
- ✓ esbuild bundler enabled

**Error Handling:**
- 400: Invalid input (missing fields, short description, invalid city)
- 404: Prassi not found (vote endpoint)
- 405: Method not allowed (non-POST requests)
- 500: Notion API errors (with console logging)

**CORS Support:**
- OPTIONS preflight returns 204
- All responses include CORS headers
- Tested patterns support fetch() from browser

## Next Phase Readiness

**Phase 41-03 (Client UI) can proceed:**
- ✓ API endpoints ready for form submission
- ✓ Vote endpoint ready for client-side voting logic
- ✓ CORS configured for browser fetch()
- ✓ Response format documented (success/error structure)

**Required for deployment:**
- User must set NOTION_API_KEY in Netlify dashboard
- User must set PRASSI_DB_ID in Netlify dashboard
- No code changes needed for deployment

**Known Limitations:**
- No server-side rate limiting (client-side only)
- No vote verification (relies on localStorage)
- Vote counts are asynchronous (Notion API latency)
- No webhook integration yet (Plan 41-05)

## Files Modified

### Created
- `netlify/functions/submit-prassi.js` (250 lines)
  - Form submission with Notion page creation
  - City validation (105 questura cities)
  - CORS support with OPTIONS handling
  - Error handling for validation and API failures

- `netlify/functions/vote-prassi.js` (117 lines)
  - Vote increment logic
  - Notion page retrieval and update
  - CORS support with OPTIONS handling
  - 404 handling for invalid page IDs

### Modified
- `netlify.toml`
  - Added [functions] section
  - Set directory and esbuild bundler

## Commits

1. **5bc9198** - `feat(41-02): create Netlify Functions for prassi submission and voting`
   - Created submit-prassi.js and vote-prassi.js
   - Implemented city validation and CORS
   - Notion API integration for page creation and updates

2. **2f4a50d** - `chore(41-02): configure Netlify Functions directory`
   - Updated netlify.toml with functions config
   - Enabled esbuild for ESM support

## Open Questions / Future Work

### Immediate Next Steps (Plan 41-03)
1. Build client-side form modal (similar to contact-form.html)
2. Implement city autocomplete with datalist
3. Add voting UI with localStorage duplicate prevention
4. Integrate with these API endpoints

### Future Enhancements (Post-MVP)
1. **Server-side rate limiting**
   - Add @upstash/ratelimit when abuse occurs
   - Track votes by IP address
   - Sliding window (5 votes per 60 seconds)

2. **Webhook integration** (Plan 41-05)
   - Trigger build when Status changes to Approved
   - Auto-publish approved prassi to static pages

3. **Analytics**
   - Track submission success rate
   - Monitor vote manipulation patterns
   - City distribution analysis

4. **Enhanced validation**
   - Spam detection (duplicate descriptions)
   - Profanity filtering
   - Link validation in descriptions

---

**Summary:** Two production-ready serverless endpoints with Notion integration, CORS support, and input validation. No new dependencies required. Ready for client-side UI integration (Plan 41-03).
