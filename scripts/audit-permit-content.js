/**
 * Content audit script for Phase 44.1-01
 * Compares static permit HTML files against Notion-generated content
 * Identifies files safe to redirect vs. files with unique content requiring migration
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Mapping from CONTEXT.md (old static file → canonical target slug)
const MAPPING = {
  "permesso-asilo.html": { target: "permesso-richiesta-asilo", type: "redirect" },
  "permesso-asilo-politico.html": { target: "permesso-asilo-status-rifugiato", type: "content" },
  "permesso-assistenza-minore.html": { target: "permesso-assistenza-minore-art-31", type: "content" },
  "permesso-attesa-occupazione.html": { target: "permesso-attesa-occupazione-art-22", type: "content" },
  "permesso-calamita-naturale.html": { target: "permesso-calamita-naturale-art-20-bis", type: "content" },
  "permesso-coesione-familiare.html": { target: "permesso-famiglia-o-motivi-familiari-senza-nullaosta-per-ricongiungimento-coesione", type: "content" },
  "permesso-conviventi-familiari-italiani.html": { target: "permesso-famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19", type: "content" },
  "permesso-cure-mediche-art-36-d-lgs-286-1998.html": { target: "permesso-cure-mediche-dopo-ingresso-con-visto-art-36", type: "placeholder" },
  "permesso-cure-mediche-ex-art-19-comma-2-lett-d-bis.html": { target: "permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia", type: "placeholder" },
  "permesso-cure-mediche-per-donna-in-stato-di-gravidanza-e-padre-del-bambino-art-19.html": { target: "PARENT", type: "parent" },
  "permesso-cure-mediche.html": { target: "permesso-cure-mediche-dopo-ingresso-con-visto-art-36", type: "content" },
  "permesso-donna-in-stato-di-gravidanza-e-padre-del-bambino.html": { target: "PARENT", type: "parent" },
  "permesso-famiglia-motivi-famigliari-art-19.html": { target: "permesso-famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19", type: "content" },
  "permesso-famiglia-motivi-famigliari-art-30-dopo-ingresso-con-nullaosta.html": { target: "permesso-famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare", type: "content" },
  "permesso-famiglia-motivi-familiari-art-30-dopo-ingresso-con-nullaosta.html": { target: "permesso-famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare", type: "content" },
  "permesso-famiglia-motivi-familiari-art-30-senza-nullaosta-coesione.html": { target: "permesso-famiglia-o-motivi-familiari-senza-nullaosta-per-ricongiungimento-coesione", type: "content" },
  "permesso-famiglia-motivi-familiari-convivente-con-parente-cittaadino-italiano-art-19.html": { target: "permesso-famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19", type: "content" },
  "permesso-familiari-di-cittadini-ue-carta-ue.html": { target: "permesso-carta-di-soggiorno-per-familiari-di-cittadini-ue-d-lgs-30-07", type: "content" },
  "permesso-familiari-di-italiani-dinamici-carta-ue.html": { target: "permesso-carta-di-soggiorno-per-familiari-di-italiani-dinamici-d-lgs-30-07", type: "content" },
  "permesso-famit-familiari-italiani-statici.html": { target: "permesso-famit-per-familiari-di-cittadini-italiani-statici", type: "content" },
  "permesso-famit-per-familiari-di-cittidini-statici.html": { target: "permesso-famit-per-familiari-di-cittadini-italiani-statici", type: "content" },
  "permesso-genitore-di-cittadino-italiano.html": { target: "permesso-famiglia-per-genitore-di-cittadino-italiano-art-30", type: "content" },
  "permesso-genitore-minore-italiano.html": { target: "permesso-famiglia-per-genitore-di-cittadino-italiano-art-30", type: "content" },
  "permesso-gravi-motivi-salute.html": { target: "permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia", type: "content" },
  "permesso-gravidanza.html": { target: "permesso-cure-mediche-art-19-donna-in-stato-di-gravidanza", type: "content" },
  "permesso-lavoro-autonomo.html": { target: "PARENT", type: "parent" },
  "permesso-minori-stranieri-affidati.html": { target: "permesso-affidamento-a-familiari-entro-il-quarto-grado", type: "content" },
  "permesso-persona-gravemente-malata-che-si-trova-gia-in-italia.html": { target: "permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia", type: "content" },
  "permesso-prosieguo-amministrativo.html": { target: "permesso-integrazione-prosieguo-amministrativo", type: "content" },
  "permesso-prosieguo-amministravo.html": { target: "permesso-integrazione-prosieguo-amministrativo", type: "content" },
  "permesso-protezione-speciale-art-32-d-lgs-25-2008.html": { target: "permesso-protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale-art-32-d-lgs-25-2008", type: "content" },
  "permesso-protezione-speciale.html": { target: "permesso-protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale-art-32-d-lgs-25-2008", type: "content" },
  "permesso-ricongiungimento-familiare.html": { target: "permesso-famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare", type: "content" },
  "permesso-studio.html": { target: "PARENT", type: "parent" }
};

/**
 * Extract plain text from HTML (strip tags, normalize whitespace)
 */
function extractTextContent(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Extract Q&A questions from static HTML file
 */
function extractQuestions(html) {
  const questions = [];
  const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];

  for (const match of h2Matches) {
    const text = match.replace(/<[^>]+>/g, '').trim();
    // Skip section headers that are not questions
    if (text.length > 3 && !text.match(/^(documenti|primo rilascio|rinnovo)/i)) {
      questions.push(text.toLowerCase());
    }
  }

  return questions;
}


/**
 * Compare static file questions with Notion questions
 */
function compareContent(staticQuestions, notionQuestions) {
  if (staticQuestions.length === 0) {
    return { category: 'placeholder', notes: 'No Q&A content in static file' };
  }

  // Check if all static questions are covered in Notion
  const uncovered = staticQuestions.filter(sq => {
    // Check if any Notion question covers this topic
    const covered = notionQuestions.some(nq => {
      // Normalize for comparison
      const sqNorm = sq.replace(/[?!.,;:]/g, '').trim();
      const nqNorm = nq.replace(/[?!.,;:]/g, '').trim();

      // Check for substantial overlap
      return nqNorm.includes(sqNorm) || sqNorm.includes(nqNorm);
    });

    return !covered;
  });

  if (uncovered.length === 0) {
    return { category: 'equivalent', notes: 'All content covered in Notion' };
  } else if (uncovered.length === staticQuestions.length) {
    return { category: 'unique-content', notes: `${uncovered.length} questions not in Notion: ${uncovered.slice(0, 3).join(', ')}` };
  } else {
    return { category: 'unique-content', notes: `${uncovered.length}/${staticQuestions.length} questions need migration: ${uncovered.slice(0, 2).join(', ')}` };
  }
}

/**
 * Main audit function
 */
async function auditPermitContent() {
  console.log('Starting permit content audit...\n');
  console.log('Comparing static permit files against their canonical targets\n');

  const pagesDir = path.join(process.cwd(), 'src', 'pages');

  // Get all static permit files
  const allFiles = fs.readdirSync(pagesDir);
  const permitFiles = allFiles.filter(f => f.startsWith('permesso-') && f.endsWith('.html'));

  console.log(`Found ${permitFiles.length} static permit files\n`);

  const results = [];
  let count = 0;

  for (const filename of permitFiles) {
    count++;

    // Check if file is in mapping
    if (!MAPPING[filename]) {
      console.log(`[${count}/${permitFiles.length}] ${filename} - NOT IN MAPPING, skipping`);
      continue;
    }

    const mapping = MAPPING[filename];
    const filePath = path.join(pagesDir, filename);
    const html = fs.readFileSync(filePath, 'utf-8');

    console.log(`[${count}/${permitFiles.length}] Auditing ${filename}...`);

    // Check if it's already a redirect
    if (html.includes('Redirecting to') || mapping.type === 'redirect') {
      results.push({
        file: filename,
        category: 'redirect-only',
        target: mapping.target,
        notes: 'Already a redirect'
      });
      console.log(`  → redirect-only\n`);
      continue;
    }

    // Check if it's a parent placeholder
    if (mapping.target === 'PARENT') {
      results.push({
        file: filename,
        category: 'parent',
        target: mapping.target,
        notes: 'Needs parent/hub page (Plan 02)'
      });
      console.log(`  → parent placeholder\n`);
      continue;
    }

    // Extract questions from static file
    const staticQuestions = extractQuestions(html);
    console.log(`  Static questions: ${staticQuestions.length}`);

    if (staticQuestions.length === 0) {
      results.push({
        file: filename,
        category: 'placeholder',
        target: mapping.target,
        notes: 'No Q&A content'
      });
      console.log(`  → placeholder\n`);
      continue;
    }

    // Check if target exists as a static file (canonical page)
    const targetFilePath = path.join(pagesDir, `${mapping.target}.html`);

    if (!fs.existsSync(targetFilePath)) {
      results.push({
        file: filename,
        category: 'unique-content',
        target: mapping.target,
        notes: 'TARGET FILE NOT FOUND (canonical page missing)'
      });
      console.log(`  → TARGET FILE NOT FOUND\n`);
      continue;
    }

    try {
      // Read target file content
      const targetHtml = fs.readFileSync(targetFilePath, 'utf-8');
      const targetQuestions = extractQuestions(targetHtml);
      console.log(`  Target questions: ${targetQuestions.length}`);

      // Compare content
      const comparison = compareContent(staticQuestions, targetQuestions);

      results.push({
        file: filename,
        category: comparison.category,
        target: mapping.target,
        notes: comparison.notes
      });

      console.log(`  → ${comparison.category}\n`);

    } catch (err) {
      console.error(`  ERROR: ${err.message}\n`);
      results.push({
        file: filename,
        category: 'error',
        target: mapping.target,
        notes: `Error: ${err.message}`
      });
    }
  }

  // Generate report
  console.log('\n=== GENERATING REPORT ===\n');

  const reportPath = path.join(process.cwd(), '.planning', 'phases', '44.1-url-coverage-content-preservation', 'CONTENT-AUDIT.md');

  // Ensure directory exists
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Build markdown report
  let report = `# Permit Content Audit Report\n\n`;
  report += `**Generated:** ${new Date().toISOString().split('T')[0]}\n`;
  report += `**Phase:** 44.1-01\n\n`;
  report += `## Overview\n\n`;
  report += `Audited ${permitFiles.length} static permit HTML files against Notion-generated content.\n\n`;

  // Summary statistics
  const byCategory = {
    'redirect-only': results.filter(r => r.category === 'redirect-only').length,
    'placeholder': results.filter(r => r.category === 'placeholder').length,
    'equivalent': results.filter(r => r.category === 'equivalent').length,
    'unique-content': results.filter(r => r.category === 'unique-content').length,
    'parent': results.filter(r => r.category === 'parent').length,
    'error': results.filter(r => r.category === 'error').length
  };

  report += `### Summary\n\n`;
  report += `| Category | Count | Safe to Redirect? |\n`;
  report += `|----------|-------|-------------------|\n`;
  report += `| Redirect-only | ${byCategory['redirect-only']} | ✓ Yes |\n`;
  report += `| Placeholder | ${byCategory['placeholder']} | ✓ Yes |\n`;
  report += `| Equivalent | ${byCategory['equivalent']} | ✓ Yes |\n`;
  report += `| Unique content | ${byCategory['unique-content']} | ✗ **Migration needed** |\n`;
  report += `| Parent needed | ${byCategory['parent']} | — See Plan 02 |\n`;
  report += `| Error | ${byCategory['error']} | — Investigate |\n\n`;

  const safeCount = byCategory['redirect-only'] + byCategory['placeholder'] + byCategory['equivalent'];
  report += `**Safe to redirect:** ${safeCount}/${permitFiles.length}\n`;
  report += `**Needs migration:** ${byCategory['unique-content']}\n\n`;

  // Detailed table
  report += `## Detailed Audit Results\n\n`;
  report += `| Static File | Category | Canonical Target | Notes |\n`;
  report += `|-------------|----------|------------------|-------|\n`;

  for (const result of results) {
    const icon = result.category === 'unique-content' ? '⚠️' :
                 result.category === 'error' ? '❌' : '✓';
    report += `| ${icon} ${result.file} | ${result.category} | ${result.target} | ${result.notes} |\n`;
  }

  report += `\n## Duplicate Entries in Notion\n\n`;
  report += `The following entries were identified in Phase 43 and need filtering in permits.js (Plan 02):\n\n`;
  report += `- duplicate-attivita-sportiva\n`;
  report += `- duplicate-motivi-religiosi\n`;
  report += `- duplicate-residenza-elettiva\n\n`;
  report += `These are already prefixed with [DUPLICATE] in Notion but still generate pages in _site/. They will be filtered out in permits.js.\n\n`;

  // Files needing migration
  const needsMigration = results.filter(r => r.category === 'unique-content');
  if (needsMigration.length > 0) {
    report += `## Files Requiring Content Migration\n\n`;
    for (const file of needsMigration) {
      report += `### ${file.file}\n\n`;
      report += `- **Target:** ${file.target}\n`;
      report += `- **Issue:** ${file.notes}\n`;
      report += `- **Action:** Extract unique Q&A from static file and add to Notion page\n\n`;
    }
  } else {
    report += `## ✓ No Migration Needed\n\n`;
    report += `All static file content is already present in Notion. Safe to proceed with redirects.\n\n`;
  }

  // Write report
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`Report written to: ${reportPath}`);
  console.log(`\nSummary: ${safeCount} safe, ${byCategory['unique-content']} need migration, ${byCategory['parent']} need parent pages`);
}

// Run audit
auditPermitContent().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
