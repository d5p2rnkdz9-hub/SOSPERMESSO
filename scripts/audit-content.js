#!/usr/bin/env node

/**
 * Content Audit Script
 * Examines Notion database for content quality issues
 * Generates markdown report for Phase 43 and Phase 45 action
 */

require('dotenv').config();
const { Client } = require("@notionhq/client");
const fs = require('fs');
const path = require('path');

const DATABASE_ID = "3097355e-7f7f-819c-af33-d0fd0739cc5b";
const OUTPUT_PATH = path.join(process.cwd(), '.planning', 'AUDIT-content.md');

/**
 * Delay helper for rate limiting
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Slugify a permit name (for URL matching)
 */
function slugify(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert Notion page ID to clickable URL
 */
function notionUrl(pageId) {
  const cleanId = pageId.replace(/-/g, '');
  return `https://notion.so/${cleanId}`;
}

/**
 * Fetch all pages from Notion database
 */
async function fetchAllPages(notion) {
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100
    });

    // Filter pages that belong to our database
    const dbPages = response.results.filter(page =>
      page.parent?.database_id === DATABASE_ID ||
      page.parent?.data_source_id === DATABASE_ID
    );
    allPages.push(...dbPages);

    hasMore = response.has_more;
    startCursor = response.next_cursor;

    // Rate limiting: 350ms delay between requests
    if (hasMore) {
      await delay(350);
    }
  }

  return allPages;
}

/**
 * Extract plain text from rich_text array
 */
function extractPlainText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(segment => segment.plain_text || '').join('').trim();
}

/**
 * Check if text contains overly synthetic/technical legal references
 * Flags if 3+ legal patterns appear in one field
 */
function isSyntheticText(text) {
  if (!text) return false;

  const legalPatterns = [
    /\bart\./gi,
    /\bcomma\b/gi,
    /d\.lgs/gi,
    /\bn\.\s*\d+/gi,
    /\bdel\s+\d{4}/gi,
    /\blegge\s+\d+/gi
  ];

  const matches = legalPatterns.filter(pattern => pattern.test(text)).length;
  return matches >= 3;
}

/**
 * Check if text contains vague/unclear wording
 */
function hasVagueWording(text) {
  if (!text) return false;

  const vagueTerms = [
    /\bgenerico\b/gi,
    /\bvario\b/gi,
    /\baltro\b/gi,
    /\becc\.?\b/gi
  ];

  return vagueTerms.some(pattern => pattern.test(text));
}

/**
 * Audit database and collect issues
 */
async function auditDatabase() {
  if (!process.env.NOTION_API_KEY) {
    console.error('ERROR: NOTION_API_KEY not set in .env');
    process.exit(1);
  }

  console.log('Starting content audit...\n');

  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const pages = await fetchAllPages(notion);

  console.log(`Fetched ${pages.length} pages from Notion\n`);

  // Issue categories
  const issues = {
    missingCapitalization: [],
    syntheticText: [],
    vagueWording: [],
    missingDocuments: [],
    duplicateNames: [],
    longDocumentNames: [],
    variantPatterns: []
  };

  // Track names for duplicate detection
  const nameMap = new Map();

  for (const page of pages) {
    const tipo = page.properties["Nome permesso"]?.title?.[0]?.plain_text || null;

    if (!tipo) {
      console.warn(`Skipping page ${page.id} - no permit name`);
      continue;
    }

    const slug = slugify(tipo);
    const url = notionUrl(page.id);

    // Check 1: Missing capitalization
    if (tipo && tipo[0] !== tipo[0].toUpperCase()) {
      issues.missingCapitalization.push({
        name: tipo,
        url,
        current: tipo,
        suggested: tipo[0].toUpperCase() + tipo.slice(1)
      });
    }

    // Check 2: Overly synthetic text in doc notes
    const docNotesRichText = page.properties["Info extra su doc rilascio"]?.rich_text || [];
    const docNotes = extractPlainText(docNotesRichText);

    if (docNotes && isSyntheticText(docNotes)) {
      issues.syntheticText.push({
        name: tipo,
        url,
        field: 'Info extra su doc rilascio',
        excerpt: docNotes.substring(0, 120) + '...'
      });
    }

    // Check 3: Vague wording in title
    if (hasVagueWording(tipo)) {
      issues.vagueWording.push({
        name: tipo,
        url,
        field: 'Nome permesso',
        issue: 'Contains vague terms (generico, vario, altro, ecc.)'
      });
    }

    // Check 4: Missing document lists
    const primoDocuments = page.properties["Doc primo rilascio"]?.multi_select || [];
    const rinnovoDocuments = page.properties["Doc rinnovo"]?.multi_select || [];

    if (primoDocuments.length === 0 && rinnovoDocuments.length === 0) {
      issues.missingDocuments.push({
        name: tipo,
        url,
        primoMissing: primoDocuments.length === 0,
        rinnovoMissing: rinnovoDocuments.length === 0
      });
    }

    // Check 5: Duplicate or near-duplicate names
    const normalizedName = tipo.toLowerCase().replace(/\s+/g, ' ').trim();
    if (nameMap.has(normalizedName)) {
      const existing = nameMap.get(normalizedName);
      issues.duplicateNames.push({
        name1: existing.tipo,
        url1: existing.url,
        name2: tipo,
        url2: url
      });
    } else {
      nameMap.set(normalizedName, { tipo, url });
    }

    // Check 6: Overly long document names
    const allDocs = [...primoDocuments, ...rinnovoDocuments];
    for (const doc of allDocs) {
      if (doc.name && doc.name.length > 80) {
        issues.longDocumentNames.push({
          permitName: tipo,
          permitUrl: url,
          docName: doc.name,
          length: doc.name.length
        });
      }
    }

    // Check 7: Parent/child variant pattern
    const variantMatch = tipo.match(/^(.+?)\s+a\s+seguito\s+di\s+(.+)$/i);
    if (variantMatch) {
      issues.variantPatterns.push({
        name: tipo,
        url,
        baseName: variantMatch[1].trim(),
        variantName: variantMatch[2].trim()
      });
    }
  }

  return { pages, issues };
}

/**
 * Generate markdown report
 */
function generateReport(totalPages, issues) {
  const totalIssues = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);

  let md = `# Content Audit Report\n\n`;
  md += `**Generated:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Database:** Documenti Questura / Database permessi\n`;
  md += `**Total pages audited:** ${totalPages}\n`;
  md += `**Total issues found:** ${totalIssues}\n\n`;

  // Summary table
  md += `## Summary\n\n`;
  md += `| Issue Type | Count |\n`;
  md += `|------------|-------|\n`;
  md += `| Missing capitalization | ${issues.missingCapitalization.length} |\n`;
  md += `| Overly synthetic text | ${issues.syntheticText.length} |\n`;
  md += `| Vague/unclear wording | ${issues.vagueWording.length} |\n`;
  md += `| Missing document lists | ${issues.missingDocuments.length} |\n`;
  md += `| Duplicate names | ${issues.duplicateNames.length} |\n`;
  md += `| Overly long document names | ${issues.longDocumentNames.length} |\n`;
  md += `| Parent/child variants to verify | ${issues.variantPatterns.length} |\n\n`;

  // Missing capitalization
  md += `## Missing Capitalization (${issues.missingCapitalization.length})\n\n`;
  if (issues.missingCapitalization.length === 0) {
    md += `No issues found.\n\n`;
  } else {
    md += `| Page | Field | Current | Suggested |\n`;
    md += `|------|-------|---------|----------|\n`;
    for (const item of issues.missingCapitalization) {
      md += `| [${item.name}](${item.url}) | Nome permesso | ${item.current} | ${item.suggested} |\n`;
    }
    md += `\n`;
  }

  // Overly synthetic text
  md += `## Overly Synthetic Text (${issues.syntheticText.length})\n\n`;
  if (issues.syntheticText.length === 0) {
    md += `No issues found.\n\n`;
  } else {
    md += `Pages with 3+ legal reference patterns in user-facing fields:\n\n`;
    md += `| Page | Field | Excerpt |\n`;
    md += `|------|-------|--------|\n`;
    for (const item of issues.syntheticText) {
      md += `| [${item.name}](${item.url}) | ${item.field} | ${item.excerpt} |\n`;
    }
    md += `\n`;
  }

  // Vague wording
  md += `## Vague/Unclear Wording (${issues.vagueWording.length})\n\n`;
  if (issues.vagueWording.length === 0) {
    md += `No issues found.\n\n`;
  } else {
    md += `| Page | Field | Issue |\n`;
    md += `|------|-------|-------|\n`;
    for (const item of issues.vagueWording) {
      md += `| [${item.name}](${item.url}) | ${item.field} | ${item.issue} |\n`;
    }
    md += `\n`;
  }

  // Missing document lists
  md += `## Missing Document Lists (${issues.missingDocuments.length})\n\n`;
  if (issues.missingDocuments.length === 0) {
    md += `No issues found.\n\n`;
  } else {
    md += `Pages with empty document lists (need content in Phase 43):\n\n`;
    md += `| Page | Primo Missing | Rinnovo Missing |\n`;
    md += `|------|---------------|----------------|\n`;
    for (const item of issues.missingDocuments) {
      md += `| [${item.name}](${item.url}) | ${item.primoMissing ? '✗' : '✓'} | ${item.rinnovoMissing ? '✗' : '✓'} |\n`;
    }
    md += `\n`;
  }

  // Duplicate names
  md += `## Duplicate Names (${issues.duplicateNames.length})\n\n`;
  if (issues.duplicateNames.length === 0) {
    md += `No issues found.\n\n`;
  } else {
    md += `| Name 1 | Name 2 |\n`;
    md += `|--------|--------|\n`;
    for (const item of issues.duplicateNames) {
      md += `| [${item.name1}](${item.url1}) | [${item.name2}](${item.url2}) |\n`;
    }
    md += `\n`;
  }

  // Long document names
  md += `## Overly Long Document Names (${issues.longDocumentNames.length})\n\n`;
  if (issues.longDocumentNames.length === 0) {
    md += `No issues found.\n\n`;
  } else {
    md += `Document names longer than 80 characters (likely too synthetic for display):\n\n`;
    md += `| Permit | Document Name | Length |\n`;
    md += `|--------|---------------|--------|\n`;
    for (const item of issues.longDocumentNames) {
      md += `| [${item.permitName}](${item.permitUrl}) | ${item.docName.substring(0, 60)}... | ${item.length} |\n`;
    }
    md += `\n`;
  }

  // Variant patterns
  md += `## Parent/Child Variants to Verify (${issues.variantPatterns.length})\n\n`;
  if (issues.variantPatterns.length === 0) {
    md += `No issues found.\n\n`;
  } else {
    md += `Permits matching "X a seguito di Y" pattern. Verify Notion structure mirrors website variant grouping:\n\n`;
    md += `| Permit | Base Name | Variant Name |\n`;
    md += `|--------|-----------|-------------|\n`;
    for (const item of issues.variantPatterns) {
      md += `| [${item.name}](${item.url}) | ${item.baseName} | ${item.variantName} |\n`;
    }
    md += `\n`;
  }

  return md;
}

/**
 * Main execution
 */
async function main() {
  try {
    const { pages, issues } = await auditDatabase();
    const report = generateReport(pages.length, issues);

    // Ensure .planning directory exists
    const planningDir = path.join(process.cwd(), '.planning');
    if (!fs.existsSync(planningDir)) {
      fs.mkdirSync(planningDir, { recursive: true });
    }

    // Write report
    fs.writeFileSync(OUTPUT_PATH, report, 'utf8');

    console.log('✓ Content audit complete\n');
    console.log(`Report written to: ${OUTPUT_PATH}\n`);
    console.log('Summary:');
    console.log(`  Total pages audited: ${pages.length}`);
    console.log(`  Missing capitalization: ${issues.missingCapitalization.length}`);
    console.log(`  Overly synthetic text: ${issues.syntheticText.length}`);
    console.log(`  Vague wording: ${issues.vagueWording.length}`);
    console.log(`  Missing documents: ${issues.missingDocuments.length}`);
    console.log(`  Duplicate names: ${issues.duplicateNames.length}`);
    console.log(`  Long document names: ${issues.longDocumentNames.length}`);
    console.log(`  Variant patterns: ${issues.variantPatterns.length}`);

    const totalIssues = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`\n  TOTAL ISSUES: ${totalIssues}\n`);

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

main();
