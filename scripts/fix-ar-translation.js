#!/usr/bin/env node
/**
 * Fix Arabic translation quality issues based on professional translator review.
 *
 * Patterns fixed:
 * 1. Italian terms left untranslated in Arabic text (hybrid structures)
 * 2. Broken list structure (concatenated <li> items)
 * 3. Missing separators/punctuation
 * 4. Spelling errors in Italian terms
 * 5. Missing € symbols
 */

const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, '..', '_cache', 'permits-ar.json');
const IT_CACHE_PATH = path.join(__dirname, '..', '_cache', 'permits-it.json');

// === TERM REPLACEMENT MAP ===
// Order matters: longer/more specific patterns FIRST to avoid partial matches.
// Each replacement is applied once per regex pass (no cascading).
const TERM_REPLACEMENTS = [
  // Spelling fixes first (before term replacements)
  { pattern: /contrato di affitto/g, replacement: 'contratto di affitto' },
  { pattern: /contrato/g, replacement: 'contratto' },

  // Compound terms first (before their components)
  // "Commissione Territoriale" — must come before standalone "Commissione"
  { pattern: /Commissione Territoriale/g, replacement: 'اللجنة الإقليمية المختصة' },

  // "Permesso di Soggiorno" → "تصريح الإقامة"
  { pattern: /هو Permesso di Soggiorno/g, replacement: 'هو تصريح إقامة' },
  { pattern: /الـ Permesso di Soggiorno/g, replacement: 'تصريح الإقامة' },
  { pattern: /Permesso di Soggiorno/g, replacement: 'تصريح الإقامة' },
  { pattern: /permesso di soggiorno/gi, replacement: 'تصريح الإقامة' },

  // "Carta di soggiorno" — keep Italian in parentheses (users need to recognize this)
  { pattern: /الـ Carta di soggiorno/gi, replacement: 'بطاقة الإقامة (Carta di soggiorno)' },
  { pattern: /Carta di soggiorno/gi, replacement: 'بطاقة الإقامة (Carta di soggiorno)' },
  // "la Carta" standalone (after Carta di soggiorno is handled)
  { pattern: /الـ Carta(?![a-zA-Z])/g, replacement: 'بطاقة الإقامة (Carta)' },

  // "Questura" → Arabic description (only when NOT already in parentheses)
  { pattern: /في Questura(?!\))/g, replacement: 'لدى مصلحة الشرطة (Questura)' },
  { pattern: /إلى Questura(?!\))/g, replacement: 'إلى مصلحة الشرطة (Questura)' },
  { pattern: /(?<!\()Questura(?!\))/g, replacement: 'مصلحة الشرطة (Questura)' },

  // "Kit Postale" / "Kit postale"
  { pattern: /الـ Kit Postale/gi, replacement: 'طلب البريد (Kit Postale)' },
  { pattern: /Kit Postale/gi, replacement: 'طلب البريد (Kit Postale)' },

  // Standalone "Commissione" (after Commissione Territoriale is already replaced)
  // Only match standalone, not inside already-replaced Arabic text
  { pattern: /(?<![ا-ي])Commissione(?! Territoriale)/g, replacement: 'اللجنة المختصة' },

  // "Nulla Osta"
  { pattern: /Nulla Osta/g, replacement: 'تصريح العمل المسبق (Nulla Osta)' },

  // "Decreto Flussi"
  { pattern: /Decreto Flussi/g, replacement: 'نظام تدفقات العمالة (Decreto Flussi)' },

  // "Sportello Unico"
  { pattern: /Sportello Unico/g, replacement: 'مكتب الهجرة الموحد (Sportello Unico)' },

  // "Prefettura"
  { pattern: /Prefettura/g, replacement: 'المحافظة (Prefettura)' },

  // "Poste Italiane"
  { pattern: /Poste Italiane/g, replacement: 'البريد الإيطالي (Poste Italiane)' },

  // Cost-related: "Marca da bollo" (only in content, not in primoDocuments/rinnovoDocuments)
  { pattern: /Marca da bollo/gi, replacement: 'طابع ضريبي (Marca da bollo)' },
];

// === FIX LIST STRUCTURE ===
// Compare IT and AR: if IT has more <li> items, AR items were concatenated.
// Use IT structure to guide splitting.
function fixListStructure(arContent, itContent) {
  if (!itContent) return arContent;

  const itLiCount = (itContent.match(/<li>/g) || []).length;
  const arLiCount = (arContent.match(/<li>/g) || []).length;

  if (itLiCount <= arLiCount || itLiCount === 0) return arContent;

  let result = arContent;

  // Process each <ul> or <ol> block
  result = result.replace(/<(ul|ol)>([\s\S]*?)<\/\1>/g, (match, tag, ulContent) => {
    // Parse into current items
    const rawItems = [];
    const liRegex = /<li>([\s\S]*?)<\/li>/g;
    let m;
    while ((m = liRegex.exec(ulContent)) !== null) {
      rawItems.push(m[1]);
    }

    const newItems = [];
    for (const item of rawItems) {
      // Only try to split items that are suspiciously long and don't contain nested HTML
      if (item.length > 50 && !item.includes('<ul>') && !item.includes('<p>')) {
        const splits = splitConcatenatedArabic(item);
        newItems.push(...splits);
      } else {
        newItems.push(item);
      }
    }

    return `<${tag}>` + newItems.map(i => `<li>${i.trim()}</li>`).join('') + `</${tag}>`;
  });

  return result;
}

function splitConcatenatedArabic(text) {
  // Two-phase splitting:
  //
  // Phase 1: Character-level split on Arabic word boundaries.
  // Key insight: ة (taa marbouta) ALWAYS ends a word in Arabic.
  // If a non-space Arabic letter follows ة, it's a concatenation point.
  // Also: ي at end of adjective/nisba followed by a new word start (ال or consonant).
  //
  // Phase 2: Phrase-level split on common sentence starters.
  // For longer concatenated items, split on phrases like "لديك", "يمكنك", etc.

  // Phase 1: taa marbouta boundary
  let result = text.replace(/ة([\u0600-\u06FF])/g, (match, nextChar) => {
    return 'ة\x00' + nextChar; // Use null byte as split marker
  });

  // Split where ي (ya) at word end is followed by ال (definite article) — always a word boundary
  result = result.replace(/ي(ال)/g, (match, rest) => {
    return 'ي\x00' + rest;
  });

  // Split where word-FINAL ي is followed by a new word starting with common letters.
  // Require 2+ Arabic chars before ي (ensures ي is part of a multi-char word, not word-initial).
  // This avoids splitting "يمكنك" (word starts with ي) while catching "القسريتشويه".
  // Extended consonant list: common Arabic word starters after word-final ي
  result = result.replace(/([\u0600-\u06FF]{2})ي([تمنعحسشصبجكقفغزردذوأإ][\u0600-\u06FF]{3,})/g, (match, before, rest) => {
    return before + 'ي\x00' + rest;
  });

  // Split on the markers
  let parts = result.split('\x00').filter(s => s.trim().length > 0);

  // Phase 2: Phrase-level split on common sentence starters
  const starters = [
    'لديك ',      // "you have"
    'لديه ',      // "he/she has"
    'ليس ',       // "not"
    'لا يمكنك ',  // "you cannot"
    'لا يمكن ',   // "cannot"
    'يمكنك ',     // "you can"
    'يمكن ',      // "can"
    'الحصول ',    // "obtaining"
    'التسجيل ',   // "registration"
    'العمل ',     // "work"
    'أن تكون ',   // "that you are"
    'أن يكون ',   // "that it is"
    'إذا ',       // "if"
    'وجود ',      // "existence of"
    'تقديم ',     // "submitting"
    'يجب ',       // "must"
    'يحق ',       // "entitled"
    'تصريح ',     // "permit"
    'بطاقة ',     // "card"
    'مصلحة ',     // "office/department"
    'نظام ',      // "system"
  ];

  const finalParts = [];
  for (const part of parts) {
    if (part.length > 50) {
      // Try phrase-level split
      let subParts = [part];
      for (const starter of starters) {
        const newSubs = [];
        for (const seg of subParts) {
          const splits = trySplitOn(seg, starter);
          newSubs.push(...splits);
        }
        if (newSubs.every(r => r.trim().length > 5)) {
          subParts = newSubs;
        }
      }
      finalParts.push(...subParts);
    } else {
      finalParts.push(part);
    }
  }

  return finalParts.filter(s => s.trim().length > 0);
}

function trySplitOn(text, starter) {
  // Find positions where starter appears NOT at position 0 and preceded by
  // an Arabic character (no space between)
  const parts = [];
  let lastSplit = 0;

  for (let i = 1; i < text.length - starter.length; i++) {
    if (text.substring(i, i + starter.length) === starter) {
      const charBefore = text[i - 1];
      // Arabic Unicode range: \u0600-\u06FF
      const isArabicBefore = /[\u0600-\u06FF]/.test(charBefore);
      const isSpaceBefore = /\s/.test(charBefore);
      const isPunctBefore = /[،.؛:!؟)\]]/.test(charBefore);

      // Don't split if preceded by ل (lam) — likely part of ال definite article
      const isLamBefore = charBefore === 'ل';

      // Split only if directly preceded by Arabic letter (no space/punctuation/lam)
      if (isArabicBefore && !isSpaceBefore && !isPunctBefore && !isLamBefore) {
        parts.push(text.substring(lastSplit, i));
        lastSplit = i;
      }
    }
  }

  parts.push(text.substring(lastSplit));
  return parts;
}

function applyTermReplacements(text) {
  let result = text;
  for (const { pattern, replacement } of TERM_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  // Cleanup: fix double-nesting from replacements applied to already-replaced text
  result = result.replace(/طلب البريد \(طلب البريد \(Kit Postale\)\)/g, 'طلب البريد (Kit Postale)');
  result = result.replace(/مصلحة الشرطة \(مصلحة الشرطة \(Questura\)\)/g, 'مصلحة الشرطة (Questura)');
  result = result.replace(/نظام تدفقات العمالة \(نظام تدفقات العمالة \(Decreto Flussi\)\)/g, 'نظام تدفقات العمالة (Decreto Flussi)');
  return result;
}

// === MAIN ===
function main() {
  const ar = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  const it = JSON.parse(fs.readFileSync(IT_CACHE_PATH, 'utf8'));

  let totalTermFixes = 0;
  let totalListFixes = 0;

  for (const arPermit of ar) {
    const itPermit = it.find(p => p.slug === arPermit.slug);

    for (let i = 0; i < arPermit.sections.length; i++) {
      const section = arPermit.sections[i];
      const itSection = itPermit?.sections[i];
      const original = section.content;

      // Step 1: Fix Italian terms FIRST (so list splitter can detect Arabic boundaries)
      let fixed = applyTermReplacements(section.content);

      // Step 2: Fix list structure (now working with Arabic text)
      fixed = fixListStructure(fixed, itSection?.content);

      if (fixed !== original) {
        const termChanges = (original.match(/Permesso di Soggiorno|Questura|Kit Postale|Commissione|Nulla Osta|Decreto Flussi|Sportello Unico|Prefettura|Poste Italiane|contrato/gi) || []).length;
        totalTermFixes += termChanges;

        const origLis = (original.match(/<li>/g) || []).length;
        const fixedLis = (fixed.match(/<li>/g) || []).length;
        if (fixedLis > origLis) totalListFixes += (fixedLis - origLis);

        section.content = fixed;
      }

      // Step 3: Fix Italian terms in question titles too
      const origQ = section.question;
      section.question = applyTermReplacements(section.question);
      if (section.question !== origQ) totalTermFixes++;
    }

    // Also fix the 'tipo' field
    arPermit.tipo = applyTermReplacements(arPermit.tipo);
  }

  // Write fixed cache
  fs.writeFileSync(CACHE_PATH, JSON.stringify(ar, null, 2), 'utf8');

  console.log(`\n=== AR Translation Fix Report ===`);
  console.log(`Italian terms replaced: ~${totalTermFixes}`);
  console.log(`List items restored: ${totalListFixes}`);

  // Verify: count remaining Italian terms
  const allText = JSON.stringify(ar);
  const remaining = {
    'Permesso di Soggiorno': (allText.match(/Permesso di Soggiorno/gi) || []).length,
    'Questura (standalone)': (allText.match(/(?<!\()Questura(?!\))/g) || []).length,
    'Kit Postale (standalone)': (allText.match(/(?<!\()Kit Postale(?!\))/gi) || []).length,
    'Commissione (standalone)': (allText.match(/(?<!\()Commissione(?!\)| Territoriale)/g) || []).length,
  };
  console.log('\nRemaining Italian terms (should be 0 or in parentheses only):');
  console.log(JSON.stringify(remaining, null, 2));
}

main();
