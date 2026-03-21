#!/usr/bin/env node
/**
 * Phase 1 automated TR translation quality check.
 * Scans static TR HTML files for common AI translation errors.
 *
 * Usage: node scripts/check-tr-translation.js
 */

const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const TR_DIRS = [
  path.join(__dirname, '../tr'),
  path.join(__dirname, '../tr/src/pages'),
];

const STATIC_EXTENSIONS = ['.html'];

// Known bad term translations: [wrong, correct, notes]
const BAD_TERMS = [
  ['Akış vizesi',         'Decreto Flussi kapsamında çalışma vizesi',  'literal translation of "Decreto Flussi"'],
  ['akış vizesi',         'Decreto Flussi kapsamında çalışma vizesi',  'literal translation of "Decreto Flussi"'],
  ['Aile uyumu',          'Aile birleşimi',                            'wrong translation of "ricongiungimento familiare"'],
  ['aile uyumu',          'aile birleşimi',                            'wrong translation of "ricongiungimento familiare"'],
  ['Statik İtalyan',      'Başka bir AB ülkesinde yaşamamış İtalyan',  'Italian legal jargon borrowed literally'],
  ['Dinamik İtalyan',     'Başka bir AB ülkesinde yaşamış İtalyan',    'Italian legal jargon borrowed literally'],
  ['statik vatandaş',     'Başka bir AB ülkesinde yaşamamış vatandaş', 'Italian legal jargon borrowed literally'],
  ['dinamik vatandaş',    'Başka bir AB ülkesinde yaşamış vatandaş',   'Italian legal jargon borrowed literally'],
  ['Hikayeniz benzerizdir', 'Hikayeniz size özeldir',                  'broken/meaningless phrase'],
  ['hikayeniz benzerizdir', 'hikayeniz size özeldir',                  'broken/meaningless phrase'],
];

// Regex artifact patterns
const ARTIFACT_PATTERNS = [
  { re: /\([A-Z]\)/g,          label: 'parenthetical capital letter — likely a leftover annotation artifact' },
  { re: /\b(\w{4,})\s+\1\b/gi, label: 'consecutive duplicate word' },
];

// Incomplete sentence patterns: Turkish phrases that strongly suggest a dangling clause
// (modifier/relative clause with no main predicate following)
const INCOMPLETE_SENTENCE_PATTERNS = [
  {
    re: /[A-ZÇĞİÖŞÜa-zçğışöşü]{3,}(den|dan|ten|tan)\s*\./g,
    label: 'sentence ends with ablative suffix (-den/-dan) — likely missing main verb',
  },
  {
    re: /[A-ZÇĞİÖŞÜa-zçğışöşü]{3,}(arak|erek)\s*\./g,
    label: 'sentence ends with -arak/-erek (converb) — incomplete structure',
  },
  {
    re: /[A-ZÇĞİÖŞÜa-zçğışöşü]{3,}(mek|mak|mek için|mak için)\s*\./g,
    label: 'sentence ends with infinitive — likely missing main clause',
  },
  {
    re: /Talep etmek\s*:/gi,
    label: '"Talep etmek:" — infinitive used as heading, unnatural Turkish',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripHtml(html) {
  // Remove front matter
  html = html.replace(/^---[\s\S]*?---\n/, '');
  // Remove script/style blocks entirely
  html = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Remove HTML comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  // Remove HTML tags, keep text
  html = html.replace(/<[^>]+>/g, ' ');
  // Collapse whitespace
  html = html.replace(/\s+/g, ' ').trim();
  return html;
}

function getLineNumber(source, index) {
  return source.substring(0, index).split('\n').length;
}

function findLineForMatch(source, matchStr) {
  const idx = source.indexOf(matchStr);
  if (idx === -1) return '?';
  return getLineNumber(source, idx);
}

// ─── Checks ──────────────────────────────────────────────────────────────────

function checkRegister(text, filename) {
  const issues = [];
  // Count informal "sen" (standalone word, not part of "senden", "senin" etc.)
  const senMatches = [...text.matchAll(/\bsen\b/gi)];
  const sizMatches = [...text.matchAll(/\bsiz\b/gi)];

  if (senMatches.length > 0 && sizMatches.length > 0) {
    issues.push({
      type: 'REGISTER MIX',
      detail: `Both "sen" (${senMatches.length}x) and "siz" (${sizMatches.length}x) found — inconsistent formal/informal register`,
      line: '(multiple)',
      suggestion: 'Use only "siz" (formal) throughout',
    });
  } else if (senMatches.length > 0) {
    issues.push({
      type: 'REGISTER',
      detail: `"sen" (informal) found ${senMatches.length} time(s) — site should use formal "siz"`,
      line: '(multiple)',
      suggestion: 'Replace all "sen" / "seni" / "senin" with "siz" / "sizi" / "sizin"',
    });
  }
  return issues;
}

function checkBadTerms(rawHtml, text) {
  const issues = [];
  for (const [bad, correct, note] of BAD_TERMS) {
    if (text.includes(bad)) {
      const line = findLineForMatch(rawHtml, bad);
      issues.push({
        type: 'BAD TERM',
        detail: `"${bad}" — ${note}`,
        line,
        suggestion: `→ "${correct}"`,
      });
    }
  }
  return issues;
}

function checkArtifacts(rawHtml, text) {
  const issues = [];
  for (const { re, label } of ARTIFACT_PATTERNS) {
    const matches = [...text.matchAll(re)];
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

function checkIncompleteSentences(rawHtml, text) {
  const issues = [];
  for (const { re, label } of INCOMPLETE_SENTENCE_PATTERNS) {
    const matches = [...text.matchAll(re)];
    for (const m of matches) {
      const line = findLineForMatch(rawHtml, m[0]);
      issues.push({
        type: 'INCOMPLETE',
        detail: `"${m[0]}" — ${label}`,
        line,
        suggestion: 'Rewrite as complete sentence with main predicate',
      });
    }
  }
  return issues;
}

function checkDuplication(rawHtml, text) {
  const issues = [];
  // Find phrases of 4+ words that appear twice consecutively or very close together
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length - 8; i++) {
    const phrase = words.slice(i, i + 5).join(' ');
    if (phrase.length < 15) continue; // skip short phrases
    const nextChunk = words.slice(i + 1, i + 12).join(' ');
    if (nextChunk.includes(phrase)) {
      const line = findLineForMatch(rawHtml, phrase);
      issues.push({
        type: 'DUPLICATION',
        detail: `Phrase appears twice in close proximity: "${phrase}"`,
        line,
        suggestion: 'Remove duplicate occurrence',
      });
      i += 5; // skip ahead to avoid re-reporting same block
    }
  }
  return issues;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function collectFiles() {
  const files = [];
  for (const dir of TR_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (STATIC_EXTENSIONS.includes(path.extname(f))) {
        files.push(path.join(dir, f));
      }
    }
  }
  return files;
}

function checkFile(filepath) {
  const rawHtml = fs.readFileSync(filepath, 'utf-8');
  const text = stripHtml(rawHtml);
  const relPath = path.relative(path.join(__dirname, '..'), filepath);

  const issues = [
    ...checkRegister(text, relPath),
    ...checkBadTerms(rawHtml, text),
    ...checkArtifacts(rawHtml, text),
    ...checkIncompleteSentences(rawHtml, text),
    ...checkDuplication(rawHtml, text),
  ];

  return { file: relPath, issues };
}

function run() {
  const files = collectFiles();
  console.log(`\n=== TR Translation Quality Check ===`);
  console.log(`Scanning ${files.length} files...\n`);

  let totalIssues = 0;
  const results = [];

  for (const f of files) {
    const result = checkFile(f);
    results.push(result);
    totalIssues += result.issues.length;
  }

  // Print results
  for (const { file, issues } of results) {
    if (issues.length === 0) {
      console.log(`✅  ${file} — no issues found`);
      continue;
    }
    console.log(`\n❌  ${file} — ${issues.length} issue(s)`);
    for (const issue of issues) {
      console.log(`    [${issue.type}] line ${issue.line}`);
      console.log(`      Problem:    ${issue.detail}`);
      console.log(`      Suggestion: ${issue.suggestion}`);
    }
  }

  // Summary
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Files scanned:  ${files.length}`);
  console.log(`Files with issues: ${results.filter(r => r.issues.length > 0).length}`);
  console.log(`Total issues:   ${totalIssues}`);

  // Issue type breakdown
  const byType = {};
  for (const { issues } of results) {
    for (const issue of issues) {
      byType[issue.type] = (byType[issue.type] || 0) + 1;
    }
  }
  if (Object.keys(byType).length > 0) {
    console.log('\nBy type:');
    for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type.padEnd(12)} ${count}`);
    }
  }

  console.log('');
}

run();
