---
phase: 02-document-templates
plan: 01
subsystem: infra
tags: [nodejs, notion, netlify, dotenv, build-system]

# Dependency graph
requires:
  - phase: 01-page-foundation
    provides: restructured documenti-questura.html with 46 badge links
provides:
  - Node.js build infrastructure with @notionhq/client
  - Notion client module for database queries
  - Netlify build configuration
  - Environment variable template for API key
affects: [02-02-templates, 03-complete-coverage]

# Tech tracking
tech-stack:
  added: [@notionhq/client, dotenv]
  patterns: [notion-build-pipeline, graceful-exit-on-missing-env]

key-files:
  created:
    - package.json
    - .env.example
    - netlify.toml
    - scripts/notion-client.js
    - scripts/build-documents.js
  modified: []

key-decisions:
  - "Graceful exit (exit 0) when NOTION_API_KEY not configured - allows CI to pass during setup"
  - "Database ID stored as constant in notion-client.js rather than env var"
  - "Node.js 18 specified as Netlify build environment"

patterns-established:
  - "Notion client module: fetch data from database, return normalized objects"
  - "Build script pattern: test connection, fetch data, generate (stub for now)"
  - "Netlify redirects: /documenti/* maps to /src/pages/documenti-*.html"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Phase 2 Plan 1: Build Infrastructure Summary

**Node.js build pipeline with @notionhq/client for Notion database queries and Netlify deployment configuration**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T12:57:19Z
- **Completed:** 2026-01-25T13:00:XX
- **Tasks:** 3
- **Files created:** 5

## Accomplishments
- Initialized Node.js project with @notionhq/client and dotenv dependencies
- Created Notion client module with fetchPermitData() for querying permit document database
- Configured Netlify build pipeline with Node.js 18 and security headers
- Stub build script allows CI to pass while awaiting Notion API key configuration

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Node.js project with dependencies** - `4e1f488` (chore)
2. **Task 2: Create Notion client module with database query** - `6514b08` (feat)
3. **Task 3: Create Netlify build configuration** - `5c2253d` (feat)

## Files Created

- `package.json` - Node.js project with @notionhq/client and dotenv dependencies, build:docs script
- `package-lock.json` - Dependency lockfile
- `.env.example` - Template for NOTION_API_KEY environment variable
- `scripts/notion-client.js` - Notion API client with fetchPermitData() and testConnection()
- `scripts/build-documents.js` - Stub build script with graceful exit when Notion not configured
- `netlify.toml` - Build configuration with Node.js 18, security headers, and URL redirects

## Decisions Made

- **Graceful exit on missing API key:** Build script exits with code 0 (not 1) when NOTION_API_KEY is not configured. This allows CI deployments to pass during initial setup before Notion integration is complete.
- **Database ID as constant:** The Notion database ID is stored directly in notion-client.js rather than as an environment variable. The database is specific to this project and unlikely to change.
- **Node.js 18 for Netlify:** Specified explicit Node version in netlify.toml for reproducible builds.

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

**External services require manual configuration:**

Before the build script can fetch data from Notion:

1. **Create Notion integration:**
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Name it (e.g., "SOS Permesso Build")
   - Copy the "Internal Integration Secret"

2. **Share database with integration:**
   - Open the permit database in Notion
   - Click "..." menu in top right
   - Select "Connections" > "Add connections"
   - Add your integration

3. **Set environment variable:**
   - Local: Create `.env` file with `NOTION_API_KEY=secret_xxx...`
   - Netlify: Add NOTION_API_KEY in Site settings > Environment variables

4. **Verify:**
   ```bash
   npm run build:docs
   # Should show: "Connected to Notion database: [database name]"
   # And: "Found X permit types"
   ```

## Next Phase Readiness

- Build infrastructure ready for template generation
- Plan 02-02 can implement full template generation when Notion is configured
- Current stub script demonstrates the connection flow and data fetching

---
*Phase: 02-document-templates*
*Completed: 2026-01-25*
