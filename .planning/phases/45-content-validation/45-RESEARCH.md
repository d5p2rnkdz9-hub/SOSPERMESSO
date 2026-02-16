# Phase 45: Content Validation - Research

**Researched:** 2026-02-16
**Domain:** Content quality assurance, Notion database validation, cross-reference verification
**Confidence:** HIGH

## Summary

Phase 45 is a comprehensive validation pass on all permit and document pages generated in Phases 43-44. This is NOT a new content creation phase but a **content accuracy verification and gap-filling phase**. The research reveals a two-layer validation approach: (1) validate Notion page content against Notion database columns (source of truth), and (2) validate generated HTML output against the Phase 43 content rules established in project memory.

The standard approach is manual review with automated assist: Claude iterates through permit pages in Notion, cross-references Q&A content against database columns, adds missing information directly to Notion via API, and logs all changes in a validation report. The user reviews the report, spot-checks HTML output in the browser, and approves before the phase is complete.

Key insight: Database columns (Posso lavorare?, Quanto dura?, Doc primo rilascio, etc.) are authoritative. Notion page content must accurately reflect these values. Phase 43 content rules (no doc lists in Q&A, bollettino includes 40EUR, full URLs, "tu" tone) must be enforced across ALL pages, not just newly populated ones.

**Primary recommendation:** One-by-one Notion page review using MCP tools to read pages and database properties, identify gaps/conflicts, update pages directly, and compile a detailed validation report for user sign-off.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @notionhq/client | Latest (installed) | Notion API client for reading database and pages | Official JavaScript SDK, already used throughout project |
| Notion MCP tools | Latest (available) | High-level page reading and updating | Simpler than raw API for structured content review |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | Latest (installed) | Environment variable management | Loading NOTION_API_KEY for API access |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual Notion review | Automated validation script | Manual catches tone/clarity issues that scripts cannot; automated scales better for large volumes |
| MCP notion-search | Raw API database queries | MCP provides filtered search; raw API gives more control over pagination |
| Report in Markdown | Interactive HTML report | Markdown is git-versionable and readable in terminal; HTML requires browser |

**Installation:**
No new packages needed. All tools already available.

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── validate-content.js         # Main validation orchestrator
├── validators/
│   ├── column-validator.js     # Check page content vs. DB columns
│   ├── rule-validator.js       # Enforce Phase 43 content rules
│   └── conflict-detector.js    # Find DB-vs-content conflicts
└── report-generator.js         # Generate VALIDATION-REPORT.md
```

### Pattern 1: Database Column Cross-Reference
**What:** Verify that Notion page Q&A content accurately reflects database column values
**When to use:** For every permit page during validation
**Example:**
```javascript
// Database says: "Posso lavorare?" = "SI"
// Page content should include: "puoi lavorare" or "consente di lavorare"
// Database says: "Quanto dura?" = "2 anni"
// Page content should include: "2 anni" in the duration section

async function validateWorkRights(pageId, permitName) {
  // Fetch database property
  const dbValue = await getProperty(pageId, "Posso lavorare?");

  // Fetch page content blocks
  const blocks = await getPageBlocks(pageId);
  const dirittiaSection = findSection(blocks, "Che diritti mi dà");

  // Validate
  if (dbValue === "SI" && !dirittiaSection.includes("lavorare")) {
    return {
      issue: "MISSING_INFO",
      column: "Posso lavorare?",
      dbValue: "SI",
      pageContent: dirittiaSection,
      fix: "Add work rights paragraph"
    };
  }

  if (dbValue === "NO" && !dirittiaSection.includes("NON puoi lavorare")) {
    return {
      issue: "MISSING_INFO",
      column: "Posso lavorare?",
      dbValue: "NO",
      pageContent: dirittiaSection,
      fix: "Add explicit work restriction warning"
    };
  }

  return { valid: true };
}
```

### Pattern 2: Phase 43 Content Rule Enforcement
**What:** Check all pages (not just newly populated) for compliance with established content rules
**When to use:** For every permit page and document page during validation
**Example:**
```javascript
// Phase 43 rules from MEMORY.md:
// 1. No document lists in Q&A content (link to doc pages instead)
// 2. Bollettino amount includes 40EUR (never list separately)
// 3. Links must be full URLs (https://www.sospermesso.it/...)
// 4. "Tu" tone (conversational, direct address)

const PHASE_43_RULES = [
  {
    id: "NO_DOC_LISTS",
    name: "No document lists in Q&A",
    check: (blocks) => {
      // Look for bulleted lists that are document names
      const docListPattern = /marca da bollo|bollettino postale|copia del passaporto|foto/gi;
      return !blocks.some(b =>
        b.type === 'bulleted_list_item' &&
        docListPattern.test(b.bulleted_list_item.rich_text[0]?.plain_text)
      );
    },
    fix: "Replace doc list with link to documenti-{slug}-primo.html or documenti-{slug}-rinnovo.html"
  },
  {
    id: "BOLLETTINO_INCLUDES_40",
    name: "Bollettino includes 40EUR electronic permit fee",
    check: (blocks) => {
      const text = blocks.map(b => b.plain_text || '').join(' ');
      // Check if text mentions both bollettino and separate 40EUR
      return !(text.includes('bollettino') && text.match(/40\s*€.*rilascio.*elettronico/gi));
    },
    fix: "Remove separate 40EUR line; it's already in the bollettino amount"
  },
  {
    id: "FULL_URLS",
    name: "Links must be full URLs",
    check: (blocks) => {
      const links = extractLinks(blocks);
      return links.every(link => link.startsWith('https://www.sospermesso.it/'));
    },
    fix: "Convert relative links to full URLs"
  },
  {
    id: "TU_TONE",
    name: "Use 'tu' conversational tone",
    check: (blocks) => {
      const text = blocks.map(b => b.plain_text || '').join(' ');
      // Check for formal "lei" constructions vs. informal "tu"
      return !text.match(/\b(Lei|Suo|Sua|possono)\b/gi);
    },
    fix: "Convert formal 'lei' to informal 'tu' (puoi, tuo, devi)"
  }
];

function validateRules(pageBlocks, permitName) {
  const violations = [];

  for (const rule of PHASE_43_RULES) {
    if (!rule.check(pageBlocks)) {
      violations.push({
        rule: rule.id,
        permitName,
        fix: rule.fix
      });
    }
  }

  return violations;
}
```

### Pattern 3: Conflict Detection and Logging
**What:** Identify cases where database column says X but page content says Y
**When to use:** During validation when discrepancies are found
**Example:**
```javascript
async function detectConflicts(pageId, permitName) {
  const conflicts = [];

  // Check: Quanto dura?
  const dbDuration = await getProperty(pageId, "Quanto dura?");
  const pageBlocks = await getPageBlocks(pageId);
  const durationSection = findSection(pageBlocks, "Quanto dura");

  if (dbDuration && durationSection) {
    // Extract duration from page content
    const pageDuration = extractDuration(durationSection);

    if (dbDuration !== pageDuration) {
      conflicts.push({
        type: "CONFLICT",
        column: "Quanto dura?",
        dbValue: dbDuration,
        pageValue: pageDuration,
        permitName,
        resolution: "USER_REVIEW_REQUIRED"
      });
    }
  }

  return conflicts;
}

// Log conflicts for user review (don't auto-fix)
function logConflict(conflict) {
  return `## CONFLICT: ${conflict.permitName}

**Column:** ${conflict.column}
**Database says:** ${conflict.dbValue}
**Page content says:** ${conflict.pageValue}

**Action required:** User must decide which is correct and update accordingly.
`;
}
```

### Pattern 4: Gap-Filling with Notion API
**What:** Add missing information to Notion pages when database has data but page doesn't
**When to use:** When validation finds missing required sections
**Example:**
```javascript
// Database has "Quanto dura?" = "2 anni"
// Page is missing "Quanto dura?" section entirely
// Add section to Notion page

async function fillMissingDuration(pageId, permitName, dbDuration) {
  const content = `

**Quanto dura questo permesso?**

Il permesso ha una durata di **${dbDuration}** e può essere rinnovato se continui a soddisfare i requisiti.
`;

  // Append to page using Notion API
  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Quanto dura questo permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: `Il permesso ha una durata di ` }
          }, {
            type: "text",
            text: { content: dbDuration },
            annotations: { bold: true }
          }, {
            type: "text",
            text: { content: ` e può essere rinnovato se continui a soddisfare i requisiti.` }
          }]
        }
      }
    ]
  });

  // Log in report
  return {
    action: "ADDED",
    section: "Quanto dura?",
    permitName,
    source: `Database column value: ${dbDuration}`
  };
}
```

### Pattern 5: Validation Report Generation
**What:** Compile all validation actions into a structured markdown report
**When to use:** At the end of validation pass before user sign-off
**Example:**
```javascript
function generateValidationReport(results) {
  const report = `# Phase 45: Content Validation Report

**Generated:** ${new Date().toISOString().split('T')[0]}
**Total permits validated:** ${results.length}

## Summary

| Status | Count |
|--------|-------|
| ✓ Valid (no changes) | ${results.filter(r => r.valid).length} |
| ✓ Fixed (info added) | ${results.filter(r => r.fixed).length} |
| ⚠️ Conflicts found | ${results.filter(r => r.conflicts).length} |
| ✗ Rule violations | ${results.filter(r => r.violations).length} |

## Changes Made

${results.filter(r => r.changes).map(r => `
### ${r.permitName}

${r.changes.map(c => `- **${c.action}:** ${c.description}`).join('\n')}

**Source:** ${r.source}
**Blocks added:** ${r.blocksAdded || 0}
`).join('\n')}

## Conflicts Requiring User Review

${results.filter(r => r.conflicts).map(r => `
### ${r.permitName}

${r.conflicts.map(c => logConflict(c)).join('\n')}
`).join('\n')}

## Suggested Spot-Check Permits

Based on volume of changes, recommend checking these permits visually:
${suggestSpotChecks(results)}

## Next Steps

1. User reviews this report
2. User resolves conflicts (if any)
3. User runs: \`npm run build\`
4. User spot-checks suggested permits in browser
5. User approves Phase 45 completion
`;

  return report;
}
```

### Anti-Patterns to Avoid
- **Deleting existing content:** Phase explicitly forbids removing sections or info
- **Auto-resolving conflicts:** When DB and page disagree, log for user review (don't guess)
- **Skipping Phase 43 rules on old pages:** Rules apply to ALL pages, not just newly populated
- **Validating HTML instead of Notion:** Notion is source of truth; validate there first

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Page content fetching | Custom block parser | Notion MCP notion-search + blocks.children.list | MCP handles pagination and filtering; API handles block traversal |
| Conflict resolution | Automated merge logic | User review workflow | Content decisions require human judgment on accuracy |
| Tone validation | NLP sentiment analysis | Pattern matching for "tu" vs "lei" | Simple regex catches formal/informal, NLP is overkill |
| Report formatting | Custom template engine | String templates in JavaScript | Markdown is simple enough for template literals |

**Key insight:** This is a content accuracy review, not a code generation task. Human judgment on conflicts and user sign-off are essential. Automation assists by identifying issues and logging them clearly.

## Common Pitfalls

### Pitfall 1: Validating only newly populated permits
**What goes wrong:** Old permits (populated before Phase 43) aren't checked for Phase 43 rule compliance
**Why it happens:** Assumption that only new content needs validation
**How to avoid:** Validate ALL permits in the database, regardless of when they were populated
**Warning signs:** User finds rule violations in permits that weren't touched in Phase 43

### Pitfall 2: Auto-fixing conflicts without user review
**What goes wrong:** Script overwrites correct page content with incorrect database value (or vice versa)
**Why it happens:** Assuming database is always right
**How to avoid:** Log all conflicts in report with both values shown; user decides which is correct
**Warning signs:** User reports accurate content was replaced with wrong information

### Pitfall 3: Missing sparse database columns
**What goes wrong:** Validation fails when database column is empty/null
**Why it happens:** Not all permits have values for all columns (e.g., "posso convertire?" only applicable to some)
**How to avoid:** Treat null/empty columns as "not applicable" rather than "missing data"
**Warning signs:** Validation report flags 30+ permits as missing conversion info when it's legitimately N/A

### Pitfall 4: Not checking document pages
**What goes wrong:** Only permit pages validated; document pages missed
**Why it happens:** Phase description mentions "permit pages" more prominently
**How to avoid:** CONTEXT.md explicitly includes document pages in scope; validate both
**Warning signs:** Document pages have Phase 43 rule violations that weren't caught

### Pitfall 5: No rebuild before spot-check
**What goes wrong:** User spot-checks old HTML output, doesn't see Notion changes
**Why it happens:** Forgot that Notion edits don't appear until site rebuild
**How to avoid:** Workflow explicitly includes `npm run build` after Notion edits, before spot-check
**Warning signs:** User reports "changes not showing up" on website

## Code Examples

Verified patterns from existing codebase and Notion API docs:

### Fetching Database Page Properties
```javascript
// Source: Notion API + existing permits.js pattern
const { Client } = require("@notionhq/client");

async function fetchPermitProperties(notion, pageId) {
  const page = await notion.pages.retrieve({ page_id: pageId });

  return {
    tipo: page.properties["Nome permesso"]?.title?.[0]?.plain_text || null,
    possoLavorare: page.properties["Posso lavorare?"]?.select?.name || null,
    quantoDura: page.properties["Quanto dura?"]?.rich_text?.[0]?.plain_text || null,
    docPrimo: page.properties["Doc primo rilascio"]?.multi_select?.map(d => d.name) || [],
    docRinnovo: page.properties["Doc rinnovo"]?.multi_select?.map(d => d.name) || [],
    modPrimo: page.properties["Mod primo rilascio"]?.multi_select?.[0]?.name || null,
    modRinnovo: page.properties["Mod rinnovo"]?.multi_select?.[0]?.name || null,
    possoConvertire: page.properties["posso convertire?"]?.rich_text?.[0]?.plain_text || null,
    notes: page.properties["NOTES"]?.rich_text?.[0]?.plain_text || null
  };
}
```

### Fetching Page Content Blocks
```javascript
// Source: Notion API docs + existing audit-permits.js
async function fetchPageBlocks(notion, pageId) {
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

    // Rate limiting: 350ms delay between requests
    if (cursor) {
      await new Promise(resolve => setTimeout(resolve, 350));
    }
  } while (cursor);

  return blocks;
}
```

### Finding Q&A Section in Blocks
```javascript
// Extract specific Q&A section from page blocks
function findSection(blocks, sectionName) {
  let inSection = false;
  let sectionBlocks = [];

  for (const block of blocks) {
    // Check for section heading (heading_3 or bold paragraph)
    if (block.type === 'heading_3') {
      const heading = block.heading_3?.rich_text?.[0]?.plain_text || '';
      if (heading.includes(sectionName)) {
        inSection = true;
        continue;
      } else if (inSection) {
        // Hit next heading, section ended
        break;
      }
    } else if (block.type === 'paragraph') {
      const richText = block.paragraph?.rich_text || [];
      if (richText.length > 0 && richText[0].annotations?.bold) {
        const text = richText[0].plain_text || '';
        if (text.includes(sectionName)) {
          inSection = true;
          continue;
        } else if (inSection) {
          break;
        }
      }
    }

    // Collect blocks in this section
    if (inSection) {
      sectionBlocks.push(block);
    }
  }

  return sectionBlocks;
}
```

### Validating Work Rights Section
```javascript
// Check if page accurately reflects "Posso lavorare?" column
function validateWorkRights(pageBlocks, dbValue) {
  const dirittiSection = findSection(pageBlocks, "Che diritti");

  if (dirittiSection.length === 0) {
    return {
      valid: false,
      issue: "MISSING_SECTION",
      fix: "Add 'Che diritti mi dà?' section"
    };
  }

  const sectionText = dirittiSection
    .map(b => b.paragraph?.rich_text?.map(r => r.plain_text).join('') || '')
    .join(' ')
    .toLowerCase();

  if (dbValue === "SI") {
    // Must mention work rights
    if (!sectionText.includes("lavorare") && !sectionText.includes("lavoro")) {
      return {
        valid: false,
        issue: "MISSING_INFO",
        column: "Posso lavorare?",
        dbValue: "SI",
        fix: "Add work rights paragraph (puoi lavorare)"
      };
    }
  } else if (dbValue === "NO") {
    // Must explicitly state cannot work
    if (!sectionText.includes("non puoi lavorare")) {
      return {
        valid: false,
        issue: "MISSING_WARNING",
        column: "Posso lavorare?",
        dbValue: "NO",
        fix: "Add explicit work restriction (NON puoi lavorare)"
      };
    }
  }

  return { valid: true };
}
```

### Adding Missing Section to Notion Page
```javascript
// Source: Notion API blocks.children.append
async function addMissingSection(notion, pageId, sectionData) {
  const blocks = [];

  // Question heading
  blocks.push({
    type: "paragraph",
    paragraph: {
      rich_text: [{
        type: "text",
        text: { content: sectionData.question },
        annotations: { bold: true }
      }]
    }
  });

  // Answer content
  if (Array.isArray(sectionData.content)) {
    // Bulleted list
    for (const item of sectionData.content) {
      blocks.push({
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: item }
          }]
        }
      });
    }
  } else {
    // Plain paragraph
    blocks.push({
      type: "paragraph",
      paragraph: {
        rich_text: [{
          type: "text",
          text: { content: sectionData.content }
        }]
      }
    });
  }

  // Append to page
  await notion.blocks.children.append({
    block_id: pageId,
    children: blocks
  });

  return {
    action: "ADDED",
    section: sectionData.question,
    blocksAdded: blocks.length
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual HTML editing | Notion-powered content management | Phase 40 (v3.1, Feb 2026) | Source of truth moved to Notion |
| No validation process | Structured validation with report | Phase 45 (this phase) | Quality assurance before production |
| Content rules undocumented | Phase 43 rules in MEMORY.md | Phase 43 (Feb 2026) | Consistent quality standards |
| No cross-reference check | Database columns vs. page content | Phase 45 (this phase) | Accuracy verification |

**Deprecated/outdated:**
- Manual HTML content review: Now validate in Notion before rebuild
- Per-permit ad-hoc fixes: Now systematic validation pass with report

## Content Validation Best Practices (2026)

### Approval Workflow Structure
A content approval workflow defines who needs to review what, when in the process that happens, and how feedback is handled. For Phase 45, roles are:
- **Validator (Claude):** Reviews content against rules and database
- **Approver (User):** Reviews validation report and spot-checks output
- **Resolver (User/Claude):** Handles conflicts based on domain knowledge

### Multi-Stage Quality Control
Organizations scale content production effectively by implementing multi-stage quality control systems that combine AI automation with human oversight at critical decision points. Phase 45 uses:
1. **Automated pre-screening:** Claude checks all pages for Phase 43 rule violations
2. **Column cross-reference:** Claude validates page content against database values
3. **Conflict logging:** Claude flags discrepancies for human review
4. **Human approval:** User reviews report and resolves conflicts
5. **Spot-check:** User visually inspects high-change permits in browser

### Data Quality and Validation Rules
By embedding automated validation rules directly into workflows, you can catch errors at the source, preventing them from causing downstream failures. Phase 45 rules:
- **NO_DOC_LISTS:** Catch document checklists in Q&A content
- **BOLLETTINO_INCLUDES_40:** Prevent duplicate cost line items
- **FULL_URLS:** Ensure links work across environments
- **TU_TONE:** Maintain conversational voice consistency

### AI Content Oversight
AI-generated drafts can accelerate production, but human oversight remains vital. Human-in-the-loop editing ensures content aligns with brand voice, maintains accuracy, and addresses complex topics. Phase 45 workflow:
- Claude identifies issues and suggests fixes
- User reviews suggestions and decides on action
- User resolves conflicts with domain knowledge
- User approves final output after spot-check

## Validation Scope

### Permit Pages
**Count:** ~67 permit pages in database (56 with content, 18 placeholders, 4 variants after Phase 43)
**Columns to validate:**
- Posso lavorare? → "Che diritti mi dà?" section
- Quanto dura? → "Quanto dura questo permesso?" section
- Doc primo rilascio / Doc rinnovo → Links to document pages (NOT lists)
- Mod primo rilascio / Mod rinnovo → "Come/dove si chiede?" section
- posso convertire? → "Posso convertirlo?" section (if applicable)
- NOTES → Additional context woven into narrative

**Phase 43 rules to check:**
1. No document lists in Q&A content
2. Bollettino includes 40EUR (never separate line)
3. Full URLs for all links
4. "Tu" conversational tone

### Document Pages
**Count:** ~63 canonical pages + 38 redirects (101 total)
**Content to validate:**
- Cost breakdown section (Phase 44) accuracy
- Document list completeness
- Notes/Q&A sections from Notion
- Links to related permit pages

**Phase 43 rules to check:**
1. Bollettino amount includes 40EUR
2. Full URLs for all links
3. "Tu" tone in notes/descriptions

## Open Questions

1. **Placeholder page handling**
   - What we know: 18 permits marked "Contenuto in arrivo" after Phase 43
   - What's unclear: Should these be flagged in report or skipped entirely?
   - Recommendation: Flag with "pagina in arrivo" status in report; don't block phase on them

2. **NOTES column interpretation**
   - What we know: Contains "discrepanze normative o tra siti"
   - What's unclear: How strictly should NOTES content match page narrative?
   - Recommendation: Check that NOTES topics are addressed, not word-for-word match

3. **Variant page validation**
   - What we know: 4 variant permits have parent/child structure
   - What's unclear: Should common info be identical across variants?
   - Recommendation: Validate each variant independently; consistency nice-to-have but not required

4. **Conflict resolution authority**
   - What we know: Database columns are "source of truth" per CONTEXT.md
   - What's unclear: What if database is demonstrably wrong and page content is correct?
   - Recommendation: User reviews all conflicts and updates database OR page as appropriate

5. **Spot-check sampling**
   - What we know: User will spot-check "a few permits" before approval
   - What's unclear: How many is "a few"? Which criteria for selection?
   - Recommendation: Report suggests 5-7 permits with highest change volume

## Sources

### Primary (HIGH confidence)
- [Notion API: Retrieve page properties](https://developers.notion.com/reference/retrieve-a-page) - Official endpoint docs
- [Notion API: Retrieve block children](https://developers.notion.com/reference/get-block-children) - Official block fetching docs
- [Notion API: Append block children](https://developers.notion.com/reference/patch-block-children) - Official block writing docs
- Existing codebase: `scripts/audit-content.js` - Current content audit implementation
- Existing codebase: `scripts/audit-permits.js` - Current permit audit implementation
- Phase 43 research: `.planning/phases/43-populate-blank-permits/43-RESEARCH.md` - Content rules and patterns
- MEMORY.md: Phase 43 content rules - Established quality standards

### Secondary (MEDIUM confidence)
- [Content Approval Workflow Best Practices](https://www.screendragon.com/blog/content-approval-workflow-meaning-best-practices/) - Approval workflow structure
- [AI Content Quality Control 2026](https://koanthic.com/en/ai-content-quality-control-complete-guide-for-2026-2/) - Multi-stage quality control systems
- [Content Quality Assurance Framework](https://www.siteimprove.com/blog/content-quality-assurance-framework/) - Data quality validation rules

### Tertiary (LOW confidence)
- None - research based on official docs, existing project files, and verified web sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Notion client already in use, patterns established in Phase 43
- Architecture: HIGH - Based on existing audit scripts + Notion API docs
- Pitfalls: HIGH - Informed by Phase 43 research and CONTEXT.md constraints
- Code examples: HIGH - Extracted from audit-content.js, audit-permits.js, Notion API docs
- Validation rules: HIGH - Phase 43 rules documented in MEMORY.md

**Research date:** 2026-02-16
**Valid until:** 60 days (Notion API stable, project patterns established)

**Notes:**
- User decisions from CONTEXT.md strictly followed (never delete, log conflicts, user reviews all)
- Phase 43 content rules apply to ALL pages, not just newly populated
- Database columns are source of truth per CONTEXT.md
- Document pages explicitly in scope ("document Notion pages should be mirrored in Q&A")
- Spot-check threshold and permit selection left to Claude's discretion per CONTEXT.md
