# Phase 38: Deployment - Research

**Researched:** 2026-02-05
**Domain:** Eleventy 3.x static site deployment to Netlify
**Confidence:** HIGH

## Summary

Deploying an Eleventy 3.x site to Netlify is straightforward with minimal configuration required. Netlify automatically detects Eleventy projects and suggests appropriate build settings. The current SOS Permesso site builds 415 pages in 1.38 seconds locally, well under the 60-second requirement.

The primary task is configuring `netlify.toml` with the correct build command (which must coordinate with the existing Notion content generation scripts), publish directory, and Node.js version. Performance optimizations include caching the `.cache` directory between builds using `netlify-plugin-cache` to avoid redundant network requests and image processing.

Key considerations:
- Existing `netlify.toml` uses outdated build command (`npm run build:docs` for Notion generation only)
- Need to update build command to run both Notion generation AND Eleventy build
- Environment variables (NOTION_API_KEY, etc.) must be set in Netlify UI for security
- Node.js 22 is now the Netlify default and recommended version

**Primary recommendation:** Update `netlify.toml` to run `npm run build` which chains Notion generation + Eleventy build, set NODE_VERSION to 22, configure cache plugin for `.cache` directory, and ensure all sensitive environment variables are set in Netlify UI (not committed to repo).

## Standard Stack

The established tools for deploying Eleventy sites to Netlify:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @11ty/eleventy | 3.1.2 | Static site generator | Project already using v3.x with ESM config |
| Node.js | 22.x | Runtime environment | Netlify default as of Feb 2025, longest LTS support (until Apr 2027) |
| npm | 10.x+ | Package manager | Included with Node.js 22, dependency management |
| netlify.toml | N/A | Build configuration | File-based config, overrides UI settings, version-controlled |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| netlify-plugin-cache | ^1.0.3 | Persist cache between builds | When using Eleventy Fetch or Image plugins (improves build speed) |
| netlify-cli | ^17.x | Local development | Optional - for testing builds locally before deployment |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| netlify.toml | Netlify UI settings | UI settings easier for beginners but harder to version control and sync across team |
| netlify-plugin-cache | Manual cache management | Plugin is simpler, maintained by Netlify, handles edge cases |
| Node.js 22 | Node.js 20 | Node 20 LTS ends Apr 2026 vs Node 22 ends Apr 2027 - shorter support window |

**Installation:**
```bash
# netlify-plugin-cache (if using cache optimization)
npm install --save-dev netlify-plugin-cache

# netlify-cli (optional, for local testing)
npm install --save-dev netlify-cli
```

## Architecture Patterns

### Recommended netlify.toml Structure
```toml
# Build configuration for Eleventy 3.x site
[build]
  # Build command: run Notion generation, then Eleventy
  command = "npm run build"

  # Output directory (Eleventy default)
  publish = "_site"

  # Ignore builds for documentation-only changes
  ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- .planning/"

[build.environment]
  # Node.js version (22 = latest LTS with longest support)
  NODE_VERSION = "22"

  # Production mode (if needed by build scripts)
  NODE_ENV = "production"

# Cache plugin for Eleventy Fetch/Image performance
[[plugins]]
  package = "netlify-plugin-cache"

  [plugins.inputs]
    # Persist Eleventy cache between builds
    paths = [".cache"]

# Security headers
[[headers]]
  for = "/*"

  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Clean URL support (optional - Eleventy outputs .html files)
[[redirects]]
  from = "/:path"
  to = "/:path.html"
  status = 200
  force = false
```

### Pattern 1: Build Script Coordination
**What:** Netlify's build command must coordinate multiple build steps (Notion content generation + Eleventy compilation)
**When to use:** Any static site with pre-build content generation steps
**Example:**
```json
// package.json
{
  "scripts": {
    "build:docs": "node scripts/build-documents.js",
    "build:11ty": "npx @11ty/eleventy",
    "build": "npm run build:docs && npm run build:11ty"
  }
}
```
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "_site"
```
**Why:** Separates concerns (content generation vs site compilation) while ensuring correct execution order. Netlify runs single command, which chains sub-tasks sequentially.

### Pattern 2: Environment Variable Security
**What:** Sensitive values (API keys, tokens) stored in Netlify UI, non-sensitive config in netlify.toml
**When to use:** Any deployment with secrets
**Example:**
```toml
# netlify.toml - ONLY non-sensitive config
[build.environment]
  NODE_VERSION = "22"
  NODE_ENV = "production"
  # NO API keys, tokens, or secrets here!
```
```javascript
// scripts/build-documents.js - reads from process.env
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
// These are set in Netlify UI > Site Settings > Environment Variables
```
**Why:** Netlify UI values are encrypted at rest, not exposed in git history, and accessible only to authorized team members. Source: [Netlify Docs - Environment Variables](https://docs.netlify.com/build/configure-builds/environment-variables/)

### Pattern 3: Cache Optimization for External Data
**What:** Use netlify-plugin-cache to persist `.cache` directory between builds
**When to use:** Sites using Eleventy Fetch (API calls) or Eleventy Image (image optimization)
**Example:**
```toml
# netlify.toml
[[plugins]]
  package = "netlify-plugin-cache"

  [plugins.inputs]
    paths = [".cache"]
```
```javascript
// In Eleventy config or data files using Fetch
const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function() {
  const data = await EleventyFetch("https://api.example.com/data", {
    duration: "1d",
    type: "json",
    directory: ".cache"
  });
  return data;
};
```
**Why:** Without caching, every build re-downloads external data and re-processes images. With caching, only changed resources are fetched/processed, significantly reducing build time. Source: [Eleventy Docs - Deployment](https://www.11ty.dev/docs/deployment/)

### Pattern 4: Context-Specific Configuration
**What:** Different build behaviors for production vs deploy previews
**When to use:** Need different settings for production vs PR previews (e.g., analytics, feature flags)
**Example:**
```toml
# netlify.toml

# Default/production
[build]
  command = "npm run build"
  publish = "_site"

# Deploy previews (PRs)
[context.deploy-preview]
  command = "npm run build:preview"

[context.deploy-preview.environment]
  ENABLE_ANALYTICS = "false"

# Branch deploys (non-main branches)
[context.branch-deploy]
  command = "npm run build"
```
**Why:** Allows testing changes in realistic environment without affecting production settings. Deploy previews can disable expensive operations (analytics, external API calls) for faster feedback.

### Anti-Patterns to Avoid
- **Hard-coding sensitive values in netlify.toml:** Exposes secrets in git history, security risk
- **Using `CI=false` to hide warnings:** Masks real issues that will surface in production - fix warnings instead
- **Not specifying Node version:** Builds use Netlify default which can change, breaking reproducibility
- **Publishing wrong directory:** `publish = "."` deploys entire repo including node_modules - use `_site`
- **Ignoring .gitignore for plugins:** Using Netlify plugins requires `**/node_modules/**` not `node_modules` in `.gitignore`

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Build caching | Custom caching logic in build scripts | netlify-plugin-cache | Official plugin, handles cache invalidation, purging, concurrent builds |
| Local dev environment | Manual env var management, custom dev server | netlify dev command | Pulls prod env vars, mimics Netlify environment, auto-injects functions |
| Redirects/rewrites | Client-side JavaScript redirects | netlify.toml [[redirects]] | Server-side (faster), SEO-friendly, works without JS, supports regex/splats |
| Custom headers | Meta tags or JS injection | netlify.toml [[headers]] | Server-level, better security, works on all assets, supports CSP properly |
| Deploy previews | Manual staging environments | Netlify's built-in previews | Automatic per-PR, unique URLs, auto-cleanup, branch deploys included |
| Build ignore logic | Git hooks or manual skips | netlify.toml ignore command | Integrated with platform, consistent, supports complex git diff logic |

**Key insight:** Netlify provides platform primitives (redirects, headers, caching, previews) that are more performant and reliable than application-level implementations. Use the platform's features rather than reimplementing in your build.

## Common Pitfalls

### Pitfall 1: Dependency Version Mismatches
**What goes wrong:** Build succeeds locally but fails on Netlify with "command not found" or version conflicts
**Why it happens:** Local Node.js version differs from Netlify's build environment, or package-lock.json out of sync
**How to avoid:**
- Explicitly set NODE_VERSION in netlify.toml: `NODE_VERSION = "22"`
- Commit package-lock.json to ensure consistent dependency versions
- Test locally with `netlify build` command (requires netlify-cli)
**Warning signs:**
- Error messages like "node-gyp rebuild failed" or "Module not found"
- Build works locally but fails on Netlify
- Different behavior between local and deployed site
**Source:** [Netlify Docs - Build Troubleshooting](https://docs.netlify.com/build/configure-builds/troubleshooting-tips/)

### Pitfall 2: Wrong Publish Directory
**What goes wrong:** Deploy succeeds but site shows "Page not found" errors, or deploys entire repo including source files
**Why it happens:** Publish directory points to wrong location (`.` instead of `_site`, or typo)
**How to avoid:**
- Verify publish directory matches Eleventy's output: `publish = "_site"`
- Check Eleventy config for custom output directory: `dir.output` in eleventy.config.mjs
- Test build locally and verify `_site` directory contains expected HTML files
**Warning signs:**
- 404 errors after successful deploy
- Source code visible on deployed site
- Huge deploy size (includes node_modules, source files)
**Source:** [Netlify Docs - Build Troubleshooting](https://docs.netlify.com/build/configure-builds/troubleshooting-tips/)

### Pitfall 3: Environment Variables Not Available During Build
**What goes wrong:** Build scripts fail with "undefined" or "null" when accessing process.env variables
**Why it happens:** Variables set in Netlify UI but scope doesn't include "Builds", or variables only set for Functions
**How to avoid:**
- When setting env vars in Netlify UI, ensure scope includes "Builds" checkbox
- Test locally with `netlify dev --context production` to pull prod env vars
- Add fallbacks in build scripts: `const API_KEY = process.env.API_KEY || 'missing'`
**Warning signs:**
- Build fails with "Cannot read property of undefined"
- Error: "API key required" or similar authentication errors
- Build works locally (with .env file) but fails on Netlify
**Source:** [Netlify Docs - Environment Variables](https://docs.netlify.com/build/configure-builds/environment-variables/)

### Pitfall 4: Build Timeout (15 minutes)
**What goes wrong:** Long-running builds exceed Netlify's 15-minute timeout and fail
**Why it happens:** Large sites, unoptimized images, external API calls, or inefficient templates
**How to avoid:**
- Use netlify-plugin-cache to avoid re-downloading/re-processing unchanged assets
- Optimize Eleventy templates: memoize expensive filters/shortcodes
- Use `--incremental` for development (but not production - not reliable on CI)
- Reduce external API calls: cache responses with Eleventy Fetch
- Benchmark build: `DEBUG=Eleventy* npx @11ty/eleventy` to identify slow templates
**Warning signs:**
- Build times over 5 minutes (indicates optimization needed)
- Repeated network requests to same endpoints
- "Build exceeded maximum allowed runtime" error
**Source:** [Eleventy Docs - Performance](https://www.11ty.dev/docs/performance/)

### Pitfall 5: CI Environment Warnings Treated as Errors
**What goes wrong:** Build fails with warnings that don't cause failures locally
**Why it happens:** Many libraries check `CI` env var and treat warnings as errors in CI environments
**How to avoid:**
- Fix warnings in your code (preferred approach)
- If necessary, override with `CI='' npm run build` in netlify.toml command
- Review build logs for actual warnings, address root causes
**Warning signs:**
- Build fails with deprecation warnings or non-critical errors
- Message mentions "CI=true" or "continuous integration"
- Same command succeeds locally but fails on Netlify
**Source:** [Netlify Docs - Build Troubleshooting](https://docs.netlify.com/build/configure-builds/troubleshooting-tips/)

### Pitfall 6: .gitignore Conflicts with Build Plugins
**What goes wrong:** Build fails with "ENOENT: no such file or directory" when using Netlify plugins
**Why it happens:** Standard `.gitignore` with `node_modules` conflicts with Netlify's plugin installation in `.netlify/plugins/node_modules/`
**How to avoid:**
- Change `.gitignore` from `node_modules` to `**/node_modules/**`
- This allows Netlify to manage plugin dependencies in `.netlify/` directory
**Warning signs:**
- Build fails immediately after adding Netlify plugin
- Error mentions `.netlify/plugins/` path
- "Cannot find module" errors for plugin packages
**Source:** [Netlify Docs - Eleventy](https://docs.netlify.com/build/frameworks/framework-setup-guides/eleventy/)

## Code Examples

Verified patterns from official sources:

### Complete netlify.toml for Eleventy 3.x
```toml
# Source: https://docs.netlify.com/build/frameworks/framework-setup-guides/eleventy/
# Source: https://www.11ty.dev/docs/deployment/

[build]
  command = "npm run build"
  publish = "_site"

  # Optional: ignore documentation-only changes
  ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- .planning/ README.md"

[build.environment]
  NODE_VERSION = "22"
  NODE_ENV = "production"

# Cache optimization for Eleventy Fetch/Image
[[plugins]]
  package = "netlify-plugin-cache"

  [plugins.inputs]
    paths = [".cache"]

# Security headers
[[headers]]
  for = "/*"

  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Optional: Clean URLs (remove .html extension)
[[redirects]]
  from = "/:path"
  to = "/:path.html"
  status = 200
  force = false
  conditions = {Role = []}
```

### package.json Build Scripts
```json
{
  "scripts": {
    "dev": "npx @11ty/eleventy --serve",
    "build:docs": "node scripts/build-documents.js",
    "build:11ty": "npx @11ty/eleventy",
    "build": "npm run build:docs && npm run build:11ty"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.1.2",
    "netlify-plugin-cache": "^1.0.3"
  }
}
```

### Build Script with Environment Variables
```javascript
// scripts/build-documents.js
// Source: Netlify Docs - Environment Variables
// https://docs.netlify.com/build/configure-builds/environment-variables/

require('dotenv').config(); // For local development only

// Netlify provides these via UI (not committed to repo)
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY) {
  console.error('ERROR: NOTION_API_KEY not set');
  process.exit(1);
}

// Build logic here
async function buildDocuments() {
  // Use environment variables
  const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}`, {
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28'
    }
  });
  // ... rest of build logic
}

buildDocuments().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
```

### Context-Specific Builds
```toml
# Source: https://docs.netlify.com/build/configure-builds/file-based-configuration/

# Production builds
[context.production]
  command = "npm run build"

[context.production.environment]
  ENABLE_ANALYTICS = "true"
  NODE_ENV = "production"

# Deploy preview builds (PRs)
[context.deploy-preview]
  command = "npm run build:preview"

[context.deploy-preview.environment]
  ENABLE_ANALYTICS = "false"
  NODE_ENV = "development"

# Branch deploy builds
[context.branch-deploy]
  command = "npm run build"

[context.branch-deploy.environment]
  NODE_ENV = "staging"
```

### Local Testing with Netlify CLI
```bash
# Source: https://docs.netlify.com/build/configure-builds/troubleshooting-tips/

# Install Netlify CLI (optional, for local testing)
npm install --save-dev netlify-cli

# Test build locally (mimics Netlify environment)
npx netlify build

# Run dev server with production env vars
npx netlify dev --context production

# Test deploy preview build
npx netlify build --context deploy-preview
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Node.js 18 | Node.js 22 | Feb 2025 | Node 18 EOL (no security patches), Node 22 supported until Apr 2027 |
| Manual env var sync | netlify dev auto-pulls | Netlify CLI 12.x+ (2023) | Eliminates manual .env file creation for local dev |
| Separate cache scripts | netlify-plugin-cache | Plugin API v1 (2020) | Standardized caching, handles edge cases, official support |
| _redirects file | netlify.toml [[redirects]] | TOML support (2017) | Centralized config, better version control, same file as build settings |
| UI-only config | netlify.toml file-based | TOML support (2017) | Config in repo, easier to review in PRs, portable across sites |
| Eleventy v2 CommonJS | Eleventy v3 ESM | Eleventy 3.0 (Nov 2024) | Modern JS, async config, better performance |

**Deprecated/outdated:**
- **.nvmrc alone:** Still works but NODE_VERSION in netlify.toml takes precedence - use netlify.toml for clarity
- **Separate _headers and _redirects files:** Works but harder to maintain - netlify.toml consolidates configuration
- **Node.js 18 or older:** EOL as of Oct 2024, no security patches - upgrade to Node 22
- **CI=false workaround:** Masks warnings that should be fixed - address root causes instead

## Open Questions

Things that couldn't be fully resolved:

1. **Incremental Builds on Netlify**
   - What we know: Eleventy supports `--incremental` flag for local development, caches build output in `.cache` directory
   - What's unclear: Incremental builds not officially recommended for CI/CD (Netlify) due to cache invalidation complexity. Issue #2775 on Eleventy GitHub discusses this.
   - Recommendation: Use netlify-plugin-cache for external data/images, but run full builds (not --incremental) on Netlify for reliability. Build time (1.38s for 415 pages) is already fast enough.

2. **Build Hook Coordination**
   - What we know: Existing netlify.toml has `command = "npm run build:docs"` for Notion content generation
   - What's unclear: Whether Notion content should be generated on every build or cached/committed
   - Recommendation: For Phase 38, generate on every build (`npm run build:docs && npm run build:11ty`). Consider caching generated HTML in future phase if Notion API becomes bottleneck.

3. **Optimal Cache Strategy for Notion Content**
   - What we know: Current build-documents.js generates HTML from Notion on every run, uses manifest for change detection
   - What's unclear: Whether manifest should be committed to repo (enables skipping unchanged pages) or gitignored (always regenerate)
   - Recommendation: Commit manifest (.planning/manifests/) to enable incremental Notion builds. Netlify will pick up manifest from previous deploy.

## Sources

### Primary (HIGH confidence)
- [Eleventy Docs - Deployment](https://www.11ty.dev/docs/deployment/) - Official Eleventy deployment guide
- [Eleventy Docs - Performance](https://www.11ty.dev/docs/performance/) - Official performance optimization strategies
- [Netlify Docs - Eleventy](https://docs.netlify.com/build/frameworks/framework-setup-guides/eleventy/) - Official Netlify-Eleventy integration guide
- [Netlify Docs - File-Based Configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/) - Complete netlify.toml reference
- [Netlify Docs - Environment Variables](https://docs.netlify.com/build/configure-builds/environment-variables/) - Best practices for secrets and configuration
- [Netlify Docs - Build Troubleshooting](https://docs.netlify.com/build/configure-builds/troubleshooting-tips/) - Common build failures and solutions
- [Eleventy Docs - Passthrough Copy](https://www.11ty.dev/docs/copy/) - Official passthrough copy optimization guide

### Secondary (MEDIUM confidence)
- [Netlify Changelog - Node.js 22 Default](https://answers.netlify.com/t/builds-functions-plugins-default-node-js-version-upgrade-to-22/135981) - Feb 2025 Node version update
- [Netlify Docs - Manage Dependencies](https://docs.netlify.com/build/configure-builds/manage-dependencies/) - Node version configuration
- [Eleventy GitHub - Incremental Builds on CI](https://github.com/11ty/eleventy/issues/2775) - Discussion of incremental builds limitations

### Tertiary (LOW confidence - WebSearch, verified with official sources above)
- [Eleventy 3 Upgrade Guide](https://johnwargo.com/posts/2024/eleventy-3-upgrade/) - ESM migration patterns (community blog)
- [How I fixed 11ty performance](https://www.adamdjbrett.com/blog/2025-12-16-eleventy-build-times/) - Real-world build optimization case study

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All recommendations from official Eleventy and Netlify documentation
- Architecture: HIGH - Patterns documented in official guides and verified with sources
- Pitfalls: HIGH - Sourced from official Netlify troubleshooting docs and Eleventy performance guides
- Code examples: HIGH - All examples derived from official documentation with source URLs

**Research date:** 2026-02-05
**Valid until:** 2026-05-05 (90 days - platform infrastructure stable, but monitor for Node.js LTS changes)

**Current project context:**
- Eleventy 3.1.2 installed with ESM config (eleventy.config.mjs)
- 415 pages (260 IT + 209 EN + index files)
- Build time: 1.38 seconds locally (well under 60s requirement)
- Node.js 24.13.0 locally (need to pin to Node 22 for Netlify compatibility)
- Existing netlify.toml configured for Notion-only build (needs update for Eleventy)
- Environment variables: NOTION_API_KEY, NOTION_DATABASE_ID, OPENROUTER_API_KEY required for builds
