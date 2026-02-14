---
phase: 42-build-pipeline
plan: 02
subsystem: infra
tags: [netlify, webhook, debounce, blobs, ci-cd]

# Dependency graph
requires:
  - phase: 41-prassi-locali
    provides: Webhook infrastructure foundation (signature verification, challenge handling)
provides:
  - 30-minute debounce window for Notion webhook preventing excessive builds
  - Netlify Blobs integration for persistent state across serverless invocations
  - Build trigger with descriptive title for better visibility
affects: [build-pipeline, content-workflow, future-webhook-handlers]

# Tech tracking
tech-stack:
  added: [@netlify/blobs v10.6.0]
  patterns: [serverless-state-management, debounce-with-persistent-storage]

key-files:
  created: []
  modified:
    - netlify/functions/notion-webhook.mjs
    - package.json
    - package-lock.json

key-decisions:
  - "30-minute debounce window chosen to cover typical editing sessions"
  - "Netlify Blobs used for state persistence (zero-config, native Netlify integration)"
  - "Update timestamp BEFORE triggering build to prevent race conditions"
  - "Return descriptive response for debounced requests with minutes_since_last"

patterns-established:
  - "Debounce pattern: Check last timestamp, return early if within window, update timestamp before action"
  - "Serverless state: Use Netlify Blobs getStore() for persistent key-value storage"

# Metrics
duration: 2min
completed: 2026-02-14
---

# Phase 42 Plan 02: Notion Webhook Debounce Summary

**30-minute debounce window prevents excessive Netlify builds from rapid Notion edits, using Netlify Blobs for persistent timestamp storage**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-14T13:29:47Z
- **Completed:** 2026-02-14T13:31:45Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Installed @netlify/blobs dependency for serverless state management
- Added 30-minute debounce window to webhook handler
- Timestamp check prevents builds if last trigger within 30 minutes
- Timestamp updated BEFORE build trigger to prevent race conditions
- Preserved signature verification and challenge handling logic
- Added descriptive trigger_title in build hook POST requests
- Comprehensive logging for all debounce decisions

## Task Commits

**Note:** This task was executed together with plan 42-01 in commit 9c8e033. The marker commit da43c84 documents task 42-02 completion.

1. **Task 1: Install @netlify/blobs and extend webhook with debounce** - `da43c84` (feat)
   - Actual implementation in: `9c8e033` (refactor - combined with 42-01)

**Plan metadata:** Not created (combined execution)

## Files Created/Modified
- `netlify/functions/notion-webhook.mjs` - Added debounce logic with Netlify Blobs state management
- `package.json` - Added @netlify/blobs@^10.6.0 dependency
- `package-lock.json` - Updated lockfile with @netlify/blobs and sub-dependencies

## Implementation Details

### Debounce Logic Flow
1. Content update event received (page.content_updated or data_source.schema_updated)
2. Get webhook-state store via `getStore('webhook-state')`
3. Read last-build-trigger timestamp from blob storage
4. Compare current time with last trigger
5. **If within 30-minute window:**
   - Log debounce decision with minutes since last
   - Return 200 with debounced message
   - Exit early (no build triggered)
6. **If outside window or first trigger:**
   - Update timestamp in blob storage FIRST (prevents race)
   - Trigger Netlify build hook with descriptive title
   - Return 200 with success message

### Debounce Window Choice
- **30 minutes chosen** to cover typical editing sessions
- User typically makes multiple edits within a session
- Long enough to batch all session edits into one build
- Short enough that published content refreshes within acceptable window

### Race Condition Prevention
Critical implementation detail: timestamp is updated BEFORE the build trigger, not after. This ensures that if multiple webhooks arrive nearly simultaneously (during server scaling), only one will pass the debounce check.

### Logging Strategy
All debounce decisions are logged with context:
- `[notion-webhook] Debounced: Xmin since last trigger (< 30min)` — Build skipped
- `[notion-webhook] Triggering build (30min window passed or first trigger)` — Build initiated

## Decisions Made

**1. Netlify Blobs over other state management**
- Rationale: Zero-config, native Netlify integration, no external dependencies
- Alternative considered: Redis/Upstash (rejected — adds complexity, requires separate service)
- Trade-off: Netlify-specific (not portable), but acceptable since function already Netlify-specific

**2. 30-minute debounce window**
- Rationale: Covers typical editing session duration based on expected user behavior
- Alternative considered: 15 min (too short, multiple builds per session), 60 min (too long, stale content)
- Trade-off: Content updates delayed up to 30 min max, but saves build minutes

**3. Update timestamp BEFORE build trigger**
- Rationale: Prevents race conditions if multiple webhooks arrive simultaneously
- Critical for correctness in concurrent scenarios
- No trade-off: strictly better than updating after

**4. Descriptive trigger_title in POST body**
- Rationale: Better visibility in Netlify build log/dashboard
- Shows "Notion content updated" instead of generic webhook trigger
- No trade-off: pure improvement

## Deviations from Plan

**Combined execution with plan 42-01**
- **Issue:** Plans 42-01 and 42-02 were executed together in commit 9c8e033
- **Reason:** Both plans modified the same files (webhook, package.json) and had no conflicts
- **Resolution:** Created marker commit da43c84 to document 42-02 task completion
- **Impact:** No functional impact, cleaner git history (fewer commits), proper task tracking maintained

---

**Total deviations:** 1 execution pattern change (combined with 42-01)
**Impact on plan:** No scope change, all required functionality delivered exactly as specified

## Issues Encountered
None — plan executed smoothly. Debounce logic integrated cleanly with existing webhook structure.

## User Setup Required
None — @netlify/blobs works automatically on Netlify with zero configuration.

## Next Phase Readiness

**Ready for next phase (42-03 or beyond):**
- Webhook infrastructure complete with debounce
- Build trigger efficiency optimized
- Notion content changes handled correctly with rate limiting

**No blockers or concerns.**

---
*Phase: 42-build-pipeline*
*Completed: 2026-02-14*
