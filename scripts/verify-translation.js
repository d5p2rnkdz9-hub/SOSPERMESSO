#!/usr/bin/env node
/**
 * Translation Verification Script
 *
 * Checks translated HTML files for common issues:
 * 1. HTML structure integrity (tag counts match)
 * 2. Italian words remaining (untranslated text)
 * 3. lang attribute updated to target language
 * 4. Character ratio within expected range
 * 5. Glossary term consistency
 *
 * Usage: node scripts/verify-translation.js [--file path] [--dir path]
 */

const fs = require('fs');
const path = require('path');

// Load glossary
const glossaryPath = path.join(__dirname, 'translation-glossary.json');
const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));

// Common Italian word patterns that shouldn't appear in English translation
const italianPatterns = [
  /\b(il|la|lo|i|gli|le)\s+\w+/gi,  // Italian articles
  /\bpermesso\s+di\s+soggiorno\b/gi,
  /\bdella\b|\bdello\b|\bdei\b|\bdegli\b|\bdelle\b/gi,
  /\bpuoi\b|\bpossono\b|\bposso\b/gi,
  /\bquesto\b|\bquesta\b|\bquesti\b|\bqueste\b/gi,
  /\bsono\b(?!\s+\w+\s+permit)/gi,  // "sono" but not in English context
  /\bavere\b|\bessere\b|\bfare\b/gi,
  /zione\b/gi,  // Words ending in -zione
  /ità\b/gi,    // Words ending in -ità
  /mente\b/gi,  // Words ending in -mente (adverbs)
];

// Words that are OK to appear (Italian terms kept intentionally)
const allowedItalianWords = glossary.doNotTranslate.map(w => w.toLowerCase());

function extractTextContent(html) {
  // Remove script and style blocks
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode HTML entities
  text = text.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&#039;/g, "'")
             .replace(/&quot;/g, '"');
  return text;
}

function countTags(html) {
  const tags = {};
  const tagRegex = /<(\/?[a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    tags[tag] = (tags[tag] || 0) + 1;
  }
  return tags;
}

function checkLangAttribute(html, targetLang = 'en') {
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  if (!langMatch) {
    return { ok: false, message: 'No lang attribute found on <html>' };
  }
  if (langMatch[1] !== targetLang) {
    return { ok: false, message: `lang="${langMatch[1]}" should be lang="${targetLang}"` };
  }
  return { ok: true };
}

function findItalianWords(html) {
  const text = extractTextContent(html);
  const issues = [];

  for (const pattern of italianPatterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      // Check if it's an allowed word
      const isAllowed = allowedItalianWords.some(w =>
        match.toLowerCase().includes(w)
      );
      if (!isAllowed && !issues.includes(match)) {
        issues.push(match);
      }
    }
  }

  return issues.slice(0, 10); // Limit to first 10
}

function checkCharacterRatio(itHtml, enHtml) {
  const itText = extractTextContent(itHtml);
  const enText = extractTextContent(enHtml);

  const itLen = itText.replace(/\s+/g, '').length;
  const enLen = enText.replace(/\s+/g, '').length;

  if (itLen === 0) return { ok: true, ratio: 0 };

  const ratio = enLen / itLen;

  // English is typically 0.9-1.3x the length of Italian
  if (ratio < 0.7 || ratio > 1.5) {
    return {
      ok: false,
      ratio: ratio.toFixed(2),
      message: `Character ratio ${ratio.toFixed(2)} outside expected range (0.7-1.5)`
    };
  }

  return { ok: true, ratio: ratio.toFixed(2) };
}

function checkGlossaryConsistency(enHtml) {
  const text = extractTextContent(enHtml).toLowerCase();
  const issues = [];

  // Check that key terms are translated correctly
  for (const [it, en] of Object.entries(glossary.terms)) {
    // If Italian term appears, it should be translated
    if (text.includes(it.toLowerCase()) && !text.includes(en.toLowerCase())) {
      issues.push(`"${it}" found but expected "${en}"`);
    }
  }

  return issues.slice(0, 5);
}

function verifyTranslation(itPath, enPath) {
  const report = {
    file: path.basename(enPath),
    issues: [],
    warnings: [],
    passed: true
  };

  const itHtml = fs.readFileSync(itPath, 'utf8');
  const enHtml = fs.readFileSync(enPath, 'utf8');

  // 1. Check lang attribute
  const langCheck = checkLangAttribute(enHtml, 'en');
  if (!langCheck.ok) {
    report.issues.push(`LANG: ${langCheck.message}`);
  }

  // 2. Check HTML structure
  const itTags = countTags(itHtml);
  const enTags = countTags(enHtml);

  for (const [tag, count] of Object.entries(itTags)) {
    if (enTags[tag] !== count) {
      report.warnings.push(`TAG: <${tag}> count differs (IT: ${count}, EN: ${enTags[tag] || 0})`);
    }
  }

  // 3. Check for Italian words
  const italianWords = findItalianWords(enHtml);
  if (italianWords.length > 0) {
    report.warnings.push(`ITALIAN: Possible untranslated text: ${italianWords.slice(0, 5).join(', ')}`);
  }

  // 4. Check character ratio
  const ratioCheck = checkCharacterRatio(itHtml, enHtml);
  if (!ratioCheck.ok) {
    report.warnings.push(`RATIO: ${ratioCheck.message}`);
  } else {
    report.ratio = ratioCheck.ratio;
  }

  // 5. Check glossary consistency
  const glossaryIssues = checkGlossaryConsistency(enHtml);
  if (glossaryIssues.length > 0) {
    report.warnings.push(`GLOSSARY: ${glossaryIssues.join('; ')}`);
  }

  report.passed = report.issues.length === 0;

  return report;
}

function verifyDirectory(itDir, enDir) {
  const reports = [];

  // Get all HTML files in EN directory
  const enFiles = fs.readdirSync(enDir)
    .filter(f => f.endsWith('.html'))
    .filter(f => !f.includes('index')); // Skip index for now

  for (const file of enFiles) {
    const itPath = path.join(itDir, file);
    const enPath = path.join(enDir, file);

    if (fs.existsSync(itPath)) {
      reports.push(verifyTranslation(itPath, enPath));
    } else {
      reports.push({
        file,
        issues: [`No Italian source found at ${itPath}`],
        passed: false
      });
    }
  }

  return reports;
}

function printReport(reports) {
  console.log('\n========================================');
  console.log('  TRANSLATION VERIFICATION REPORT');
  console.log('========================================\n');

  let passed = 0;
  let warnings = 0;
  let failed = 0;

  for (const report of reports) {
    const status = report.passed
      ? (report.warnings?.length ? '⚠️ ' : '✅')
      : '❌';

    console.log(`${status} ${report.file}`);

    if (report.ratio) {
      console.log(`   Char ratio: ${report.ratio}x`);
    }

    for (const issue of report.issues || []) {
      console.log(`   ❌ ${issue}`);
    }

    for (const warning of report.warnings || []) {
      console.log(`   ⚠️  ${warning}`);
    }

    if (report.passed) {
      if (report.warnings?.length) warnings++;
      else passed++;
    } else {
      failed++;
    }

    console.log('');
  }

  console.log('----------------------------------------');
  console.log(`Total: ${reports.length} files`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ⚠️  Warnings: ${warnings}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log('----------------------------------------\n');
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  // Default paths
  let itDir = path.join(__dirname, '..', 'src', 'pages');
  let enDir = path.join(__dirname, '..', 'en', 'src', 'pages');

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--it-dir' && args[i + 1]) {
      itDir = args[++i];
    } else if (args[i] === '--en-dir' && args[i + 1]) {
      enDir = args[++i];
    } else if (args[i] === '--file' && args[i + 1]) {
      // Single file mode
      const enFile = args[++i];
      const itFile = enFile.replace('/en/', '/').replace('\\en\\', '\\');
      if (fs.existsSync(itFile) && fs.existsSync(enFile)) {
        const report = verifyTranslation(itFile, enFile);
        printReport([report]);
        process.exit(report.passed ? 0 : 1);
      } else {
        console.error('File not found:', enFile);
        process.exit(1);
      }
    }
  }

  // Directory mode
  if (fs.existsSync(enDir)) {
    const reports = verifyDirectory(itDir, enDir);
    printReport(reports);
    const allPassed = reports.every(r => r.passed);
    process.exit(allPassed ? 0 : 1);
  } else {
    console.log('No EN directory found. Run translations first.');
    console.log(`Expected: ${enDir}`);
    process.exit(0);
  }
}

module.exports = { verifyTranslation, verifyDirectory, printReport };
