# Phase 16: Permit Build System - Research

**Researched:** 2026-01-28
**Domain:** Node.js build script with Notion API for HTML generation
**Confidence:** HIGH

## Summary

This phase creates a build system to generate permit pages (`permesso-*.html`) from Notion database content. The project already has a working pattern: `build-documents.js` generates document pages from the same Notion database. The permit build system will follow this pattern with additions for fetching page content (blocks) and parsing Q&A format.

The Notion SDK v5.8.0 is already installed and supports `blocks.children.list` for fetching page content. Three Q&A formats exist in Notion content that must be parsed: heading_3 blocks, bold paragraph questions, and inline bold at paragraph start.

**Primary recommendation:** Use the existing `scripts/` architecture. Create `build-permits.js` following `build-documents.js` pattern, extend `notion-client.js` with block fetching, and create `templates/permesso.js` for the standard 7-section template.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @notionhq/client | ^5.8.0 | Notion API access | Already installed, official SDK |
| Node.js | >=18 | Build runtime | Project standard, SDK requirement |
| dotenv | ^17.2.3 | Environment config | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fs/promises | (built-in) | File I/O | Writing generated HTML |
| path | (built-in) | Path manipulation | Output directory handling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct API calls | notion-sdk-js | SDK provides pagination helpers, types; already installed |
| Custom template | EJS/Handlebars | Overkill for single template; project uses JS template literals |
| Python | Node.js | Project already has Node.js build; consistency preferred |

**Installation:**
No additional packages needed. Existing dependencies are sufficient.

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── build-documents.js    # EXISTING: Document page generation
├── build-permits.js      # NEW: Permit page generation
├── notion-client.js      # EXTEND: Add block fetching functions
├── slug-map.json         # EXISTING: URL aliases (if needed for permits)
└── templates/
    ├── primo.js          # EXISTING: Document template
    ├── rinnovo.js        # EXISTING: Document template
    ├── helpers.js        # EXISTING: Shared helpers
    └── permesso.js       # NEW: Permit page template
```

### Pattern 1: Notion Block Fetching with Recursion
**What:** Fetch page content by retrieving all blocks, handling pagination and nested children.
**When to use:** When fetching permit page content from Notion.
**Example:**
```javascript
// Source: https://developers.notion.com/reference/get-block-children
async function fetchPageBlocks(pageId) {
  const blocks = [];
  let cursor = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
    });

    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  // Handle nested children if needed
  for (const block of blocks) {
    if (block.has_children) {
      block.children = await fetchPageBlocks(block.id);
    }
  }

  return blocks;
}
```

### Pattern 2: Q&A Parsing with Section Detection
**What:** Parse Notion blocks into Q&A sections by detecting question patterns.
**When to use:** When transforming raw blocks into structured permit content.
**Example:**
```javascript
// Three Q&A styles from MILESTONE-SUMMARY.md:
// 1. heading_3 for questions
// 2. Bold paragraph + dividers
// 3. Inline bold at paragraph start

function isQuestionBlock(block) {
  // Style 1: heading_3
  if (block.type === 'heading_3') {
    return {
      type: 'heading',
      question: extractPlainText(block.heading_3.rich_text)
    };
  }

  // Style 2 & 3: paragraph with bold text at start
  if (block.type === 'paragraph') {
    const richText = block.paragraph.rich_text;
    if (richText.length > 0) {
      const firstSegment = richText[0];
      // Check if paragraph starts with bold text ending in ?
      if (firstSegment.annotations?.bold &&
          firstSegment.plain_text.trim().endsWith('?')) {
        return {
          type: 'bold-paragraph',
          question: firstSegment.plain_text.trim()
        };
      }
    }
  }

  return null;
}
```

### Pattern 3: Template Generation with Escaping
**What:** Generate HTML from structured content using template literals with proper escaping.
**When to use:** When creating the final HTML output.
**Example:**
```javascript
// Source: Existing templates/primo.js pattern
function generatePermessoPage(permit) {
  const escapedTipo = escapeHtml(permit.tipo);
  const sectionsHtml = permit.sections.map(section =>
    generateSectionHtml(section)
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <title>Permesso per ${escapedTipo} - SOS Permesso</title>
  <!-- ... existing head pattern ... -->
</head>
<body>
  <!-- ... existing structure from permesso-studio.html ... -->
  ${sectionsHtml}
  <!-- ... footer ... -->
</body>
</html>`;
}
```

### Anti-Patterns to Avoid
- **Inline API calls in template:** Fetch all data first, then generate. Don't make API calls during templating.
- **No error handling for empty content:** Always check for empty blocks/content and handle gracefully.
- **Ignoring nested children:** Notion blocks can have children (nested lists). Use recursive fetching.
- **Hardcoding section order:** Map Q&A to standard sections dynamically, not by position.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pagination | Manual cursor tracking | SDK pagination helpers | `iteratePaginatedAPI` handles edge cases |
| HTML escaping | Regex replacement | `helpers.js` escapeHtml | Already handles all special chars |
| Slug generation | Manual slugify | `notion-client.js` slugify | Already handles accents, special chars |
| Block recursion | Flat fetching | Recursive fetchPageBlocks | `has_children` flag indicates nesting |

**Key insight:** The existing `build-documents.js` and `notion-client.js` already solve many sub-problems. Extend rather than rewrite.

## Common Pitfalls

### Pitfall 1: API Rate Limits
**What goes wrong:** Hitting Notion API rate limits (3 requests/second) when fetching many permits.
**Why it happens:** Each permit needs page properties AND blocks (2+ API calls).
**How to avoid:** Add delays between requests, batch operations, log progress.
**Warning signs:** 429 HTTP responses, "rate_limited" errors.

### Pitfall 2: Inconsistent Q&A Detection
**What goes wrong:** Missing questions or incorrectly parsing non-question paragraphs as questions.
**Why it happens:** Three different Q&A styles in Notion content.
**How to avoid:** Test parser against all known formats (Studio, Protezione speciale, Richiesta Asilo).
**Warning signs:** Missing sections, duplicate content, malformed HTML.

### Pitfall 3: Nested Block Content Loss
**What goes wrong:** Lists inside sections lose their content because `has_children` wasn't checked.
**Why it happens:** Notion API doesn't return nested content in first-level response.
**How to avoid:** Always check `has_children` and recursively fetch children.
**Warning signs:** Empty lists, missing sub-content.

### Pitfall 4: Empty Permits Not Tracked
**What goes wrong:** Permits without Notion content silently fail instead of being logged.
**Why it happens:** No explicit check for empty block arrays.
**How to avoid:** Check block array length, write to `.planning/TODO-permits.md`.
**Warning signs:** Permit pages missing without explanation.

### Pitfall 5: Overwriting Existing Formatted Pages
**What goes wrong:** Well-formatted manual pages get replaced with less-formatted generated pages.
**Why it happens:** Build script doesn't check for existing content quality.
**How to avoid:** Add `--force` flag requirement for existing files, or check file modification date.
**Warning signs:** Loss of custom formatting, broken layouts.

## Code Examples

Verified patterns from official sources:

### Fetching Block Children (Official Notion API)
```javascript
// Source: https://developers.notion.com/reference/get-block-children
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function getPageContent(pageId) {
  const blocks = [];
  let cursor;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
    });

    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return blocks;
}
```

### Block Type Handling
```javascript
// Source: https://developers.notion.com/reference/block
function blockToHtml(block) {
  switch (block.type) {
    case 'paragraph':
      return `<p>${richTextToHtml(block.paragraph.rich_text)}</p>`;

    case 'heading_3':
      return `<h2>${richTextToHtml(block.heading_3.rich_text)}</h2>`;

    case 'bulleted_list_item':
      // Note: Notion doesn't wrap list items in <ul>, must handle grouping
      return `<li>${richTextToHtml(block.bulleted_list_item.rich_text)}</li>`;

    case 'numbered_list_item':
      return `<li>${richTextToHtml(block.numbered_list_item.rich_text)}</li>`;

    case 'divider':
      return '<hr>';

    default:
      console.warn(`Unknown block type: ${block.type}`);
      return '';
  }
}

function richTextToHtml(richTextArray) {
  return richTextArray.map(segment => {
    let text = escapeHtml(segment.plain_text);

    if (segment.annotations.bold) text = `<strong>${text}</strong>`;
    if (segment.annotations.italic) text = `<em>${text}</em>`;
    if (segment.href) text = `<a href="${segment.href}">${text}</a>`;

    return text;
  }).join('');
}
```

### List Grouping Pattern
```javascript
// Notion returns list items as separate blocks, must group them
function groupListItems(blocks) {
  const result = [];
  let currentList = null;
  let currentListType = null;

  for (const block of blocks) {
    const isList = ['bulleted_list_item', 'numbered_list_item'].includes(block.type);

    if (isList) {
      if (currentListType !== block.type) {
        // Start new list
        currentList = { type: block.type, items: [] };
        result.push(currentList);
        currentListType = block.type;
      }
      currentList.items.push(block);
    } else {
      // Non-list block, reset list tracking
      currentList = null;
      currentListType = null;
      result.push(block);
    }
  }

  return result;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Notion API v4 | Notion API v5 (2025-09-03) | 2025 | New version header required |
| databases.query | search + filter | Permission workaround | Already implemented in notion-client.js |

**Deprecated/outdated:**
- Notion API version 2022-06-28: SDK v5.x requires 2025-09-03 minimum
- The existing `notion-client.js` uses fallback for both `dataSources.retrieve` and `databases.retrieve` - this is correct

## Open Questions

Things that couldn't be fully resolved:

1. **Standard Section Mapping**
   - What we know: 7 standard sections defined in requirements
   - What's unclear: How to map varying Q&A questions to standard sections (e.g., "Che cos'è?" vs "Cos'è questo permesso?")
   - Recommendation: Create mapping array of synonymous questions, fall back to "Additional Q&A" for unmatched

2. **Permit Variants (MIGR-01)**
   - What we know: Some permits have variants (e.g., 3 types of Lavoro subordinato)
   - What's unclear: How variants are represented in Notion (separate rows? property?)
   - Recommendation: Examine actual Notion database structure during implementation; may need Phase 17

3. **Existing Page Handling**
   - What we know: 22 permit pages exist with varying quality
   - What's unclear: Whether to overwrite all or preserve some
   - Recommendation: Start with one proof-of-concept page (permesso-studio.html), add `--force` flag later

## Sources

### Primary (HIGH confidence)
- Notion JavaScript SDK repository: https://github.com/makenotion/notion-sdk-js
- Notion API Block reference: https://developers.notion.com/reference/block
- Notion API Retrieve block children: https://developers.notion.com/reference/get-block-children
- Existing codebase: `scripts/build-documents.js`, `scripts/notion-client.js`

### Secondary (MEDIUM confidence)
- Notion API Working with page content: https://developers.notion.com/docs/working-with-page-content
- Project MILESTONE-SUMMARY.md: Q&A format documentation

### Tertiary (LOW confidence)
- None - all findings verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing installed dependencies
- Architecture: HIGH - Follows established build-documents.js pattern
- Block fetching: HIGH - Verified with official Notion API docs
- Q&A parsing: MEDIUM - Logic is sound but needs testing against actual Notion content
- Pitfalls: MEDIUM - Based on API documentation and common patterns

**Research date:** 2026-01-28
**Valid until:** 60 days (stable APIs, existing codebase)
