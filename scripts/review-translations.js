#!/usr/bin/env node
/**
 * Translation quality review script.
 * Scans static HTML pages and Notion-cached Q&A content for a given language.
 *
 * Usage:
 *   node scripts/review-translations.js --lang tr
 *   node scripts/review-translations.js --lang fr
 *   node scripts/review-translations.js --lang es
 *
 * Outputs:
 *   review-reports/{lang}-automated.md       Human-readable issue report
 *   review-reports/{lang}-for-ai-review.json  Structured JSON for AI batch review
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const langIdx = args.indexOf('--lang');
if (langIdx === -1 || !args[langIdx + 1]) {
  console.error('Usage: node scripts/review-translations.js --lang <code>');
  console.error('Example: node scripts/review-translations.js --lang tr');
  process.exit(1);
}
const LANG = args[langIdx + 1].toLowerCase();

const ROOT         = path.join(__dirname, '..');
const CACHE_FILE   = path.join(ROOT, `_cache/permits-${LANG}.json`);
const STATIC_DIRS  = [
  path.join(ROOT, LANG),
  path.join(ROOT, LANG, 'src', 'pages'),
];
const REPORTS_DIR  = path.join(ROOT, 'review-reports');
const BATCH_SIZE   = 6;

// ─── Load language glossary ───────────────────────────────────────────────────

const glossaryPath = path.join(__dirname, 'glossaries', `${LANG}.js`);
const glossary = fs.existsSync(glossaryPath) ? require(glossaryPath) : {};

const REGISTER               = glossary.register || null;
const BAD_TERMS              = glossary.badTerms || [];
const PRESERVED_TERMS        = glossary.preservedTerms || [];
const EXTRA_ARTIFACTS        = glossary.artifactPatterns || [];
const EXTRA_INCOMPLETE       = glossary.incompleteSentencePatterns || [];

// ─── Default checks (language-agnostic) ──────────────────────────────────────

const DEFAULT_ARTIFACT_PATTERNS = [
  { re: /\([A-Z]\)/g,          label: 'parenthetical capital letter — likely leftover annotation artifact' },
  { re: /\b(\w{4,})\s+\1\b/gi, label: 'consecutive duplicate word' },
];

const ALL_ARTIFACT_PATTERNS = [...DEFAULT_ARTIFACT_PATTERNS, ...EXTRA_ARTIFACTS];
const ALL_INCOMPLETE_PATTERNS = [...EXTRA_INCOMPLETE];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html) {
  // Remove YAML front matter
  html = html.replace(/^---[\s\S]*?---\n/, '');
  // Remove script/style blocks entirely
  html = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Remove HTML comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  // Remove HTML tags
  html = html.replace(/<[^>]+>/g, ' ');
  // Collapse whitespace
  return html.replace(/\s+/g, ' ').trim();
}

function findLineForMatch(source, matchStr) {
  const idx = source.indexOf(matchStr);
  if (idx === -1) return '?';
  return source.substring(0, idx).split('\n').length;
}

// ─── Checks ───────────────────────────────────────────────────────────────────

/**
 * Register check: detect inconsistent formal/informal pronoun usage.
 * Only runs when the glossary defines a register pair.
 */
function checkRegister(text) {
  const issues = [];
  if (!REGISTER) return issues;

  const { formal, informal } = REGISTER;

  // Use word-boundary regex for Latin-script languages; fallback to includes() for others.
  let formalCount, informalCount;

  try {
    const fRe = new RegExp(`\\b${escapeRegex(formal)}\\b`, 'gi');
    const iRe = new RegExp(`\\b${escapeRegex(informal)}\\b`, 'gi');
    formalCount   = [...text.matchAll(fRe)].length;
    informalCount = [...text.matchAll(iRe)].length;
  } catch (_) {
    // Non-Latin scripts: simple inclusion count
    formalCount   = (text.match(new RegExp(escapeRegex(formal),   'g')) || []).length;
    informalCount = (text.match(new RegExp(escapeRegex(informal), 'g')) || []).length;
  }

  if (informalCount > 0 && formalCount > 0) {
    issues.push({
      type: 'REGISTER MIX',
      detail: `Both formal "${formal}" (${formalCount}x) and informal "${informal}" (${informalCount}x) found — inconsistent register`,
      line: '(multiple)',
      suggestion: `Use only "${formal}" (formal) throughout`,
    });
  } else if (informalCount > 0) {
    issues.push({
      type: 'REGISTER',
      detail: `Informal "${informal}" found ${informalCount} time(s) — site should use formal "${formal}"`,
      line: '(multiple)',
      suggestion: `Replace all occurrences of informal pronoun with formal "${formal}"`,
    });
  }

  return issues;
}

/**
 * Bad term check: flag known mistranslations from the glossary.
 */
function checkBadTerms(rawHtml, text) {
  const issues = [];
  for (const entry of BAD_TERMS) {
    const { wrong, correct, source, note } = entry;
    if (text.includes(wrong)) {
      const line = findLineForMatch(rawHtml, wrong);
      issues.push({
        type: 'BAD TERM',
        detail: `"${wrong}"${note ? ` — ${note}` : ''}${source ? ` (source: "${source}")` : ''}`,
        line,
        suggestion: `→ "${correct}"`,
      });
    }
  }
  return issues;
}

/**
 * Preserved terms check: flag if a known translated form of a preserved term appears.
 * Only fires when the glossary provides explicit `translatedForms` mappings.
 * We do NOT flag absence — a page about family reunification has no reason to mention "C3".
 */
function checkPreservedTerms(rawHtml, text) {
  const issues = [];
  for (const entry of BAD_TERMS) {
    if (!entry.preservedViolation) continue;
    if (text.includes(entry.wrong)) {
      const line = findLineForMatch(rawHtml, entry.wrong);
      issues.push({
        type: 'PRESERVED TERM TRANSLATED',
        detail: `"${entry.wrong}" — "${entry.source}" should stay in Italian`,
        line,
        suggestion: `→ keep as "${entry.correct}"`,
      });
    }
  }
  return issues;
}

/**
 * Artifact check: catch leftover annotation artifacts and consecutive duplicates.
 */
function checkArtifacts(rawHtml, text) {
  const issues = [];
  for (const { re, label } of ALL_ARTIFACT_PATTERNS) {
    // Clone the regex to reset lastIndex
    const cloned = new RegExp(re.source, re.flags);
    const matches = [...text.matchAll(cloned)];
    for (const m of matches) {
      const line = findLineForMatch(rawHtml, m[0]);
      issues.push({
        type: 'ARTIFACT',
        detail: `"${m[0]}" — ${label}`,
        line,
        suggestion: 'Remove or rewrite',
      });
    }
  }
  return issues;
}

/**
 * Incomplete sentence check: language-specific dangling clause patterns.
 */
function checkIncompleteSentences(rawHtml, text) {
  const issues = [];
  for (const { re, label } of ALL_INCOMPLETE_PATTERNS) {
    const cloned = new RegExp(re.source, re.flags);
    const matches = [...text.matchAll(cloned)];
    for (const m of matches) {
      const line = findLineForMatch(rawHtml, m[0]);
      issues.push({
        type: 'INCOMPLETE',
        detail: `"${m[0]}" — ${label}`,
        line,
        suggestion: 'Rewrite as a complete sentence with a main predicate',
      });
    }
  }
  return issues;
}

/**
 * Duplication check: 5-word phrases appearing twice in close proximity.
 */
function checkDuplication(rawHtml, text) {
  const issues = [];
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length - 8; i++) {
    const phrase = words.slice(i, i + 5).join(' ');
    if (phrase.length < 15) continue;
    const nextChunk = words.slice(i + 1, i + 12).join(' ');
    if (nextChunk.includes(phrase)) {
      const line = findLineForMatch(rawHtml, phrase);
      issues.push({
        type: 'DUPLICATION',
        detail: `Phrase appears twice in close proximity: "${phrase}"`,
        line,
        suggestion: 'Remove duplicate occurrence',
      });
      i += 5;
    }
  }
  return issues;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Run all checks on a block of raw HTML + stripped text.
 */
function runChecks(rawHtml, text) {
  return [
    ...checkRegister(text),
    ...checkBadTerms(rawHtml, text),
    ...checkPreservedTerms(rawHtml, text),
    ...checkArtifacts(rawHtml, text),
    ...checkIncompleteSentences(rawHtml, text),
    ...checkDuplication(rawHtml, text),
  ];
}

// ─── File collection ──────────────────────────────────────────────────────────

function collectStaticFiles() {
  const files = [];
  for (const dir of STATIC_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (path.extname(f) === '.html') {
        files.push(path.join(dir, f));
      }
    }
  }
  return files;
}

// ─── Load Notion cache ────────────────────────────────────────────────────────

function loadPermits() {
  if (!fs.existsSync(CACHE_FILE)) {
    console.warn(`Warning: cache file not found: ${CACHE_FILE}`);
    console.warn(`Run "npm run fetch -- --lang ${LANG}" to populate it.`);
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  // Cache file may be the array directly or wrapped in a { permits: [...] } envelope.
  if (Array.isArray(raw)) return raw;
  if (raw.permits && Array.isArray(raw.permits)) return raw.permits;
  // Some cache files are objects keyed by slug.
  return Object.values(raw);
}

// ─── Report generation ────────────────────────────────────────────────────────

function buildMarkdownReport(staticResults, permitResults) {
  const lines = [];
  const now = new Date().toISOString();

  lines.push(`# ${LANG.toUpperCase()} Translation — Automated Quality Report`);
  lines.push(`Generated: ${now}`);
  lines.push('');

  // ── Static pages ──
  lines.push('## Static Pages');
  lines.push('');

  const staticWithIssues = staticResults.filter(r => r.issues.length > 0);
  if (staticWithIssues.length === 0) {
    lines.push('No issues found in static pages.');
  } else {
    for (const { file, issues } of staticWithIssues) {
      lines.push(`### \`${file}\``);
      lines.push('');
      for (const issue of issues) {
        lines.push(`- **[${issue.type}]** line ${issue.line}`);
        lines.push(`  - Problem: ${issue.detail}`);
        lines.push(`  - Suggestion: ${issue.suggestion}`);
      }
      lines.push('');
    }
  }

  // ── Permit Q&A ──
  lines.push('## Permit Q&A Content');
  lines.push('');

  const permitsWithIssues = permitResults.filter(r => r.issues.length > 0);
  if (permitsWithIssues.length === 0) {
    lines.push('No issues found in permit Q&A content.');
  } else {
    for (const { slug, tipo, issues } of permitsWithIssues) {
      lines.push(`### ${slug}${tipo ? ` — ${tipo}` : ''}`);
      lines.push('');
      for (const issue of issues) {
        const loc = issue.section ? `section "${issue.section}"` : `line ${issue.line}`;
        lines.push(`- **[${issue.type}]** ${loc}`);
        lines.push(`  - Problem: ${issue.detail}`);
        lines.push(`  - Suggestion: ${issue.suggestion}`);
      }
      lines.push('');
    }
  }

  // ── Summary ──
  lines.push('---');
  lines.push('## Summary');
  lines.push('');

  const allIssues = [
    ...staticResults.flatMap(r => r.issues),
    ...permitResults.flatMap(r => r.issues),
  ];
  const byType = {};
  for (const issue of allIssues) {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  }

  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Static files checked | ${staticResults.length} |`);
  lines.push(`| Static files with issues | ${staticWithIssues.length} |`);
  lines.push(`| Permit entries checked | ${permitResults.length} |`);
  lines.push(`| Permit entries with issues | ${permitsWithIssues.length} |`);
  lines.push(`| Total issues | ${allIssues.length} |`);
  lines.push('');

  if (Object.keys(byType).length > 0) {
    lines.push('### Issues by type');
    lines.push('');
    lines.push('| Type | Count |');
    lines.push('|------|-------|');
    for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
      lines.push(`| ${type} | ${count} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function buildJsonPayload(staticResults, permitResults, permits) {
  const now = new Date().toISOString();

  // Static pages: include stripped text
  const staticPages = staticResults.map(r => ({
    file: r.file,
    text: r.text,
  }));

  // Permits: include per-section stripped answers
  const permitsJson = permits.map(permit => {
    const sections = (permit.sections || []).map(sec => ({
      question: sec.question || '',
      answer: stripHtml(sec.content || ''),
    }));
    return {
      slug: permit.slug,
      tipo: permit.tipo || '',
      sections,
    };
  });

  // Batch permits into groups of BATCH_SIZE
  const batches = [];
  for (let i = 0; i < permitsJson.length; i += BATCH_SIZE) {
    batches.push({
      batchId: batches.length + 1,
      permits: permitsJson.slice(i, i + BATCH_SIZE).map(p => p.slug),
    });
  }

  return {
    lang: LANG,
    generatedAt: now,
    staticPages,
    permits: permitsJson,
    batches,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log(`\n=== Translation Review: ${LANG.toUpperCase()} ===\n`);

  // Ensure output directory exists
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  // ── Check static files ──
  const staticFiles = collectStaticFiles();
  console.log(`Static HTML files found: ${staticFiles.length}`);

  const staticResults = staticFiles.map(filepath => {
    const rawHtml = fs.readFileSync(filepath, 'utf-8');
    const text    = stripHtml(rawHtml);
    const relPath = path.relative(ROOT, filepath);
    const issues  = runChecks(rawHtml, text);
    return { file: relPath, text, issues };
  });

  // ── Check permit Q&A from cache ──
  const permits = loadPermits();
  console.log(`Permit entries found in cache: ${permits.length}`);

  const permitResults = permits.map(permit => {
    const allIssues = [];
    const sections  = permit.sections || [];

    // Check each section individually (for locating issues)
    for (const sec of sections) {
      const rawContent = sec.content || '';
      const secText    = stripHtml(rawContent);
      const secIssues  = runChecks(rawContent, secText);
      for (const issue of secIssues) {
        allIssues.push({ ...issue, section: sec.question || '(unnamed section)' });
      }
    }

    return { slug: permit.slug, tipo: permit.tipo || '', issues: allIssues };
  });

  // ── Write reports ──
  const mdPath   = path.join(REPORTS_DIR, `${LANG}-automated.md`);
  const jsonPath = path.join(REPORTS_DIR, `${LANG}-for-ai-review.json`);

  const markdown   = buildMarkdownReport(staticResults, permitResults);
  const jsonOutput = buildJsonPayload(staticResults, permitResults, permits);

  fs.writeFileSync(mdPath,   markdown, 'utf-8');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');

  // ── Console summary ──
  const allIssues = [
    ...staticResults.flatMap(r => r.issues),
    ...permitResults.flatMap(r => r.issues),
  ];
  const byType = {};
  for (const issue of allIssues) {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  }

  console.log(`\nResults:`);
  console.log(`  Static files:  ${staticResults.length} checked, ${staticResults.filter(r => r.issues.length > 0).length} with issues`);
  console.log(`  Permit Q&A:    ${permitResults.length} checked, ${permitResults.filter(r => r.issues.length > 0).length} with issues`);
  console.log(`  Total issues:  ${allIssues.length}`);

  if (Object.keys(byType).length > 0) {
    console.log('\n  By type:');
    for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${type.padEnd(16)} ${count}`);
    }
  }

  console.log(`\nOutput files:`);
  console.log(`  ${path.relative(ROOT, mdPath)}`);
  console.log(`  ${path.relative(ROOT, jsonPath)}`);
  console.log('');
}

main();
