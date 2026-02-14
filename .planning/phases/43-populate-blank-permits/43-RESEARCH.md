# Phase 43: Populate Blank Permits - Research

**Researched:** 2026-02-14
**Domain:** Notion API content generation, Q&A narrative writing from structured data
**Confidence:** HIGH

## Summary

Phase 43 populates ~17 blank permit pages with Q&A content in Notion. The research reveals this is **NOT a content writing task** but a **content transformation and backfill task**. The Notion database already contains structured column data (Posso lavorare?, Quanto dura?, Doc primo rilascio, NOTES, etc.) for all permits. Some permits also have rich HTML content in existing static pages that needs backfilling into Notion.

The standard approach is a two-step process:
1. **Backfill step:** For permits where old HTML pages contain richer content than Notion page blocks, manually copy/paste that content into Notion as page blocks (using Notion UI or MCP update-page tool)
2. **Generate step:** For truly blank permits, use Notion API to programmatically write Q&A blocks by transforming database column values into narrative paragraphs

The "Attesa occupazione (art.22)" page (ID: 2f67355e-7f7f-813a-83f3-d5f229f0ba8c) is the gold standard reference for tone, structure, and formatting.

**Primary recommendation:** Use Notion MCP tools (`notion-update-page` with Markdown format) for writing content to permit pages. Process permits by Macrocategoria (protezione first), with build checkpoints between categories for user spot-checking.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @notionhq/client | Latest (already in use) | Notion API client for Node.js | Official JavaScript SDK, already used in `_data/permits.js` for fetching |
| Notion MCP tools | Latest | High-level content writing via enhanced Markdown | Simpler than raw API for structured content creation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | Latest (installed) | Environment variable management | Loading NOTION_API_KEY for API access |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Notion MCP `notion-update-page` | Raw Notion API `blocks.children.append` | MCP uses enhanced Markdown (simpler), raw API uses block objects (more control but verbose) |
| Programmatic generation | Manual Notion UI editing | Manual is faster for backfill, programmatic is scalable for truly blank permits |

**Installation:**
No new packages needed — Notion client already installed, MCP tools already available.

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── populate-permits.js       # Main content population script
├── notion-writer.js          # Wrapper for Notion MCP or API calls
├── content-transformer.js    # Transform column data → Q&A narrative
└── templates/
    └── permit-qa-template.js # Standard Q&A section templates
```

### Pattern 1: Database Column → Q&A Narrative Transform
**What:** Convert structured database properties into conversational Q&A paragraphs
**When to use:** For truly blank permits with no existing HTML content
**Example:**
```javascript
// Source: Database column "Posso lavorare?" = "SI"
// Transform to Q&A narrative:

function transformWorkRights(possoLavorare) {
  if (possoLavorare === "SI") {
    return {
      question: "✅ Che diritti mi dà? A cosa ho accesso?",
      content: "Con questo permesso puoi:\n- **Lavorare** (lavoro autonomo o subordinato)\n- **Iscriverti al Servizio Sanitario Nazionale (SSN) e avere un medico di base**\n- Chiedere la residenza"
    };
  } else if (possoLavorare === "NO") {
    return {
      question: "Posso lavorare con questo permesso?",
      content: "⚠️ **No, con questo permesso NON puoi lavorare.**"
    };
  }
  return null;
}
```

### Pattern 2: Document List → Checklist
**What:** Convert "Doc primo rilascio" multi_select array into user-friendly checklist
**When to use:** For all permits with document requirements
**Example:**
```javascript
// Source: Doc primo rilascio = ["marca da bollo da 16€", "Copia del passaporto", "4 Foto"]
// Transform to checklist paragraph:

function transformDocumentList(docs) {
  if (!docs || docs.length === 0) return null;

  const listItems = docs.map(doc => `- ${doc}`).join('\n');
  return {
    question: "Che documenti servono?",
    content: `Per richiedere questo permesso devi portare in Questura:\n\n${listItems}`
  };
}
```

### Pattern 3: Backfill HTML → Notion Markdown
**What:** Extract Q&A content from existing HTML pages and write to Notion
**When to use:** When old HTML pages have richer content than Notion page blocks
**Example:**
```javascript
// Example: "Lavoro autonomo" has detailed HTML content but blank Notion page
// 1. Read existing HTML from src/pages/permesso-lavoro-autonomo.html
// 2. Extract Q&A sections (h2 headings + content)
// 3. Convert to Notion Markdown format
// 4. Use notion-update-page to replace_content

const content = `**Che cos'è questo permesso?**
È un permesso di soggiorno per chi **lavora in modo indipendente**...

**Quanto dura questo permesso?**
- La durata dipende dall'attività che svolgi...`;

// Write via MCP:
await notionUpdatePage({
  page_id: "1ad7355e-7f7f-80d0-8eb7-eaf89571f818",
  command: "replace_content",
  new_str: content
});
```

### Pattern 4: Batch Processing by Category
**What:** Process permits grouped by Macrocategoria with checkpoints
**When to use:** For all content population to enable incremental review
**Example:**
```javascript
// Categories: protezione, lavoro, cure mediche, motivi familiari, altro
const categories = ['protezione', 'lavoro', 'cure mediche', 'motivi familiari', 'altro'];

for (const category of categories) {
  console.log(`\nProcessing category: ${category}`);
  const permits = allPermits.filter(p => p.category === category);

  for (const permit of permits) {
    await populatePermitContent(permit);
  }

  console.log(`✅ Completed ${category}. Run build and review before continuing.`);
  // User manually runs: npm run build
  // User spot-checks _site/permesso-*.html pages for this category
  // User gives go-ahead for next category
}
```

### Anti-Patterns to Avoid
- **Writing from scratch without checking existing content:** Always check if old HTML pages have content first (backfill beats regeneration)
- **Using raw block objects when Markdown works:** Notion enhanced Markdown is simpler and more maintainable than block JSON
- **Processing all permits at once:** Batch by category with checkpoints so user can catch issues early
- **Ignoring the reference model:** "Attesa occupazione" page has proven tone/structure — study it carefully

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Writing Notion blocks | Custom block object builder | Notion enhanced Markdown format via MCP | Markdown is simpler, handles formatting/lists/headings automatically |
| HTML → Markdown conversion | Regex-based parser | Existing HTML is already simple enough to manually paste | Low volume (< 20 permits), manual is faster and more accurate |
| Content validation | Custom diff checker | User spot-check after build | Manual review catches tone/clarity issues that code cannot |
| Question detection | NLP or pattern matching | Explicit Q&A structure from reference model | Standard sections are known (7 core questions), not discovery problem |

**Key insight:** This is a small-scale content backfill task (<20 permits), not a large-scale automation problem. Manual steps (paste HTML, spot-check output) are faster and more reliable than building custom tooling.

## Common Pitfalls

### Pitfall 1: Assuming all permits are truly blank
**What goes wrong:** Script tries to generate content for permits that already have partial content in Notion or full content in HTML
**Why it happens:** TODO-permits.md snapshot is outdated (from 2026-02-01), actual state may differ
**How to avoid:** Always fetch fresh data from Notion API before starting, check both Notion page blocks AND existing HTML files
**Warning signs:** Script overwrites good existing content, user reports missing sections

### Pitfall 2: Using raw Notion API blocks instead of Markdown
**What goes wrong:** Code becomes verbose with nested block object structures, hard to read/maintain
**Why it happens:** Developer follows raw API docs instead of using higher-level MCP tools
**How to avoid:** Use `notion-update-page` with `command: "replace_content"` and Notion Markdown format string
**Warning signs:** 50+ lines of block JSON for simple Q&A section, difficult to visualize output

### Pitfall 3: Missing the tone/voice from reference model
**What goes wrong:** Generated content sounds robotic, doesn't match "Attesa occupazione" conversational style
**Why it happens:** Transformer functions focus on data structure, not narrative voice
**How to avoid:** Study "Attesa occupazione" page carefully, use conversational templates ("ti permette di...", "puoi...", "devi...")
**Warning signs:** User reports content feels "cold" or "bureaucratic"

### Pitfall 4: No checkpoint between categories
**What goes wrong:** Script processes all 17 permits, user finds issue at end, must redo everything
**Why it happens:** Batch processing all at once without intermediate review
**How to avoid:** Process one Macrocategoria at a time, require user build+review before next batch
**Warning signs:** User requests "undo" after finding errors in multiple permits

### Pitfall 5: Duplicate permit handling
**What goes wrong:** Script creates content for both duplicate "Residenza elettiva" or "Motivi religiosi" pages
**Why it happens:** Database has 2 rows with same Nome permesso but different IDs
**How to avoid:** Identify duplicates first (see AUDIT-content.md), merge into single page before populating
**Warning signs:** Build generates two identical permit pages with different URLs

## Code Examples

Verified patterns from existing codebase and Notion API docs:

### Fetching Permit Data from Notion
```javascript
// Source: _data/permits.js (existing code)
const { Client } = require("@notionhq/client");

async function fetchPermitData(notion) {
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100
    });

    const dbPages = response.results.filter(page =>
      page.parent?.database_id === DATABASE_ID
    );
    allPages.push(...dbPages);

    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allPages;
}
```

### Writing Content to Notion Page (MCP)
```javascript
// Source: Notion MCP tool documentation
// Use notion-update-page with Notion enhanced Markdown

const content = `**Che cos'è questo permesso?**
Il permesso di soggiorno per lavoro autonomo ti permette di lavorare in proprio in Italia.

**Quanto dura?**
La durata è di solito **1-2 anni** ed è rinnovabile.

**✅ Che diritti mi dà?**
Con questo permesso puoi:
- **Lavorare in proprio** con partita IVA
- **Iscriverti al Servizio Sanitario Nazionale**
- **Chiedere la residenza**`;

// Call via MCP tool (researcher cannot execute directly, but planner will use this)
// mcp__claude_ai_Notion__notion-update-page with:
// {
//   "data": {
//     "page_id": "1ad7355e-7f7f-80d0-8eb7-eaf89571f818",
//     "command": "replace_content",
//     "new_str": content
//   }
// }
```

### Standard Q&A Section Template
```javascript
// Based on "Attesa occupazione (art.22)" reference model
const STANDARD_QUESTIONS = [
  {
    id: 'cose',
    heading: '**Che cos\'è questo permesso?**',
    sourceColumn: null, // Manual narrative from NOTES
    required: true
  },
  {
    id: 'chi',
    heading: '**Chi può chiederlo?**',
    sourceColumn: null, // Manual narrative from NOTES
    required: true
  },
  {
    id: 'come',
    heading: '**Come/dove si chiede?**',
    sourceColumn: 'Mod primo rilascio', // KIT, QUESTURA, SPORTELLO, etc.
    required: true
  },
  {
    id: 'diritti',
    heading: '**✅ Che diritti mi dà? A cosa ho accesso?**',
    sourceColumn: 'Posso lavorare?', // SI/NO
    required: true
  },
  {
    id: 'durata',
    heading: '**Quanto dura questo permesso?**',
    sourceColumn: 'Quanto dura?', // "1 anno", "2 anni", etc.
    required: true
  },
  {
    id: 'rinnovo',
    heading: '**Quando scade posso rinnovarlo?**',
    sourceColumn: null, // Manual narrative
    required: true
  },
  {
    id: 'conversione',
    heading: '**Posso convertirlo in un altro permesso?**',
    sourceColumn: 'posso convertire?',
    required: false // Only if column has value
  }
];
```

### Document List Formatting
```javascript
// Transform Doc primo rilascio multi_select array → checklist
function formatDocumentList(documents, type = 'primo') {
  if (!documents || documents.length === 0) {
    return '⚠️ *Documenti da definire*';
  }

  const intro = type === 'primo'
    ? 'Per il primo rilascio devi portare in Questura:'
    : 'Per il rinnovo devi portare in Questura:';

  const listItems = documents.map(doc => `- ${doc}`).join('\n');

  return `${intro}\n\n${listItems}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static HTML permit pages | 11ty-generated from Notion data | Phase 40 (v3.1, Feb 2026) | Pages now rebuild when Notion content updates |
| Manual HTML editing | Edit in Notion, run build | Phase 40 (v3.1, Feb 2026) | Content management centralized in Notion |
| Build scripts (build-permits.js) | 11ty data files (_data/permits.js) | Phase 40 (v3.1, Feb 2026) | Cleaner architecture, single build command |

**Deprecated/outdated:**
- `scripts/build-permits.js`: Legacy build script, replaced by `_data/permits.js` + 11ty templates in Phase 40

## Notion API Details

### Append Block Children Endpoint
**URL:** `https://developers.notion.com/reference/patch-block-children`
**Purpose:** Add blocks to existing page (alternative to MCP replace_content)
**Limitations:**
- Maximum 100 blocks per request
- 2 levels of nesting maximum per request
- Rate limit: 3 requests/second recommended

### Create Page Endpoint
**URL:** `https://developers.notion.com/reference/post-page`
**Purpose:** Create new pages with content
**Note:** Not needed for Phase 43 — all permit pages already exist in database

### Notion Enhanced Markdown Format
**Resource:** `notion://docs/enhanced-markdown-spec` (fetch via MCP)
**Supported syntax:**
- Headings: `# H1`, `## H2`, `### H3`
- Bold: `**text**`, Italic: `*text*`
- Lists: `- item` (bulleted), `1. item` (numbered)
- Links: `[text](url)`
- Callouts: Special blocks (check spec for syntax)
- Code: Inline backticks, code blocks

## Research Methodology

**Sources consulted:**
1. Existing project files (_data/permits.js, CLAUDE.md, PROJECT.md)
2. Notion database structure (1ad7355e-7f7f-8088-a065-e814c92e2cfd)
3. Reference permit page (Attesa occupazione: 2f67355e-7f7f-813a-83f3-d5f229f0ba8c)
4. Blank permit page example (Lavoro autonomo: 1ad7355e-7f7f-80d0-8eb7-eaf89571f818)
5. TODO-permits.md list (17 permits flagged as needing content)
6. AUDIT-content.md (duplicate permits, missing docs, vague wording)
7. Notion API official docs (2026 web search results)

**Key findings:**
- 17 permits listed in TODO-permits.md as needing content (last generated 2026-02-01)
- Some "blank" permits actually have content in Notion but not in old HTML (backfill scenario)
- Database has duplicate permit names (Residenza elettiva x2, Motivi religiosi x2)
- 2 "Unknown" entries with no Nome permesso (filtered out by build system)
- Macrocategoria values: protezione, lavoro, cure mediche, motivi familiari, altro
- Reference page "Attesa occupazione" has 8 Q&A sections with conversational tone

## Open Questions

1. **Exact permit count needing content**
   - What we know: TODO-permits.md lists 17, but snapshot is from 2026-02-01
   - What's unclear: Actual current count may differ if permits were updated since
   - Recommendation: Fetch fresh data at planning time, generate new TODO list

2. **Backfill vs. generate ratio**
   - What we know: "Lavoro autonomo" has HTML content but blank Notion page (backfill case)
   - What's unclear: How many of the 17 are backfill vs. truly blank
   - Recommendation: Audit each permit manually before starting, categorize as backfill/generate

3. **NOTES column structure**
   - What we know: Contains "discrepanze normative o tra siti" from various sources
   - What's unclear: How to incorporate NOTES into narrative Q&A (verbatim? summarize?)
   - Recommendation: Study NOTES across permits, decide on pattern during planning

4. **Duplicate merge strategy**
   - What we know: 2 duplicates exist (Residenza elettiva, Motivi religiosi)
   - What's unclear: Which page to keep, how to merge content if both have partial info
   - Recommendation: User chooses which to keep, other gets deleted or redirected

## Sources

### Primary (HIGH confidence)
- [Notion API: Append block children](https://developers.notion.com/reference/patch-block-children) - Official endpoint docs
- [Notion API: Working with page content](https://developers.notion.com/docs/working-with-page-content) - Official guide
- Existing codebase: `_data/permits.js` - Current Notion fetch implementation
- Notion MCP tool: `notion-update-page` - Available tool for writing content
- Reference permit: Attesa occupazione (ID: 2f67355e-7f7f-813a-83f3-d5f229f0ba8c) - Gold standard

### Secondary (MEDIUM confidence)
- [Notion JavaScript SDK GitHub](https://github.com/makenotion/notion-sdk-js) - Official SDK repo
- [Notion API: Create a page](https://developers.notion.com/reference/post-page) - Official page creation docs

### Tertiary (LOW confidence)
- None — all research based on official docs and existing project files

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Notion client already in use, MCP tools verified available
- Architecture: HIGH - Patterns based on existing permits.js implementation + reference page analysis
- Pitfalls: MEDIUM - Based on general Notion API experience + project constraints from CONTEXT.md
- Code examples: HIGH - Extracted from working _data/permits.js + official Notion API docs

**Research date:** 2026-02-14
**Valid until:** 60 days (Notion API stable, project patterns established)

**Notes:**
- User decisions from CONTEXT.md strictly followed (content from columns+NOTES only, batch by category, backfill+generate two-step process)
- Reference model "Attesa occupazione" studied in detail as instructed
- Duplicate and unknown permit issues flagged from AUDIT-content.md
- Fresh permit count must be verified at planning time (TODO-permits.md may be stale)
