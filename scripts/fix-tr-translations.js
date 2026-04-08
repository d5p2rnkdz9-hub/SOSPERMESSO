#!/usr/bin/env node
/**
 * Fix TR translation issues in Notion.
 * Applies: sen→siz register fix, critical legal fixes, bad term fixes,
 * duplicate block removal, incomplete sentence fixes.
 *
 * Usage:
 *   node scripts/fix-tr-translations.js                # full run
 *   node scripts/fix-tr-translations.js --dry-run      # preview only
 *   node scripts/fix-tr-translations.js --slug attesa-occupazione  # single permit
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const TR_DB_ID = '49d77cd7-b4c7-4c8a-a731-40b6315bc29e';
const NOTION_DELAY = 350;
const DRY_RUN = process.argv.includes('--dry-run');
const SLUG_FILTER = (() => {
  const idx = process.argv.indexOf('--slug');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── SEN → SIZ replacements ────────────────────────────────────────────────
// Turkish vowel harmony: back vowels (a,ı,o,u) → ız/uz; front vowels (e,i,ö,ü) → iz/üz

const SEN_SIZ_REPLACEMENTS = [
  // ----- 2nd person singular verb suffixes → plural -----
  // Present tense -sın/-sin/-sun/-sün → add -ız/-iz/-uz/-üz
  [/(\w)(sın)\b/g, '$1sınız'],
  [/(\w)(sin)\b/g, '$1siniz'],
  [/(\w)(sun)\b/g, '$1sunuz'],
  [/(\w)(sün)\b/g, '$1sünüz'],
  // Conditional -san/-sen → -sanız/-seniz
  [/(\w)(san)\b/g, '$1sanız'],
  [/(\w)(sen)\b/g, '$1seniz'],
  // Past -dın/-din/-dun/-dün → -dınız/-diniz/-dunuz/-dünüz
  [/(\w)(dın)\b/g, '$1dınız'],
  [/(\w)(din)\b/g, '$1diniz'],
  [/(\w)(dun)\b/g, '$1dunuz'],
  [/(\w)(dün)\b/g, '$1dünüz'],
  // Past -tın/-tin/-tun/-tün → add -ız/-iz/-uz/-üz
  [/(\w)(tın)\b/g, '$1tınız'],
  [/(\w)(tin)\b/g, '$1tiniz'],
  [/(\w)(tun)\b/g, '$1tunuz'],
  [/(\w)(tün)\b/g, '$1tünüz'],
];

// Words that naturally end in these suffixes but are NOT sen-forms (whitelist to skip)
const SEN_SIZ_EXCEPTIONS = new Set([
  'basin', 'basın', 'mevsim', 'tasın', 'yasin', 'esin',
  'düşün', 'bülten', 'öğretmen', 'vatandaşın',  // genitive, not verb
]);

// Specific informal→formal replacements (exact words)
const EXACT_REPLACEMENTS = [
  // Informal imperatives
  ['Unutma:', 'Unutmayın:'],
  ['unutma:', 'unutmayın:'],
  ['Doldur:', 'Doldurunuz:'],
  [' gönder ', ' gönderin '],
  [' gönder.', ' gönderin.'],
  [' gönder,', ' gönderin,'],
  [' al.', ' alın.'],
  [' al ', ' alın '],
  [' git ', ' gidin '],
  [' git.', ' gidin.'],
  // Possessive forms: -n → -nız/-niz (only safe patterns)
  [' iznin ', ' izniniz '],
  [' iznin.', ' izniniz.'],
  [' iznini ', ' izninizi '],
  ['başvurun ', 'başvurunuz '],
  ['başvurun.', 'başvurunuz.'],
  ['başvurunu ', 'başvurunuzu '],
  [' evinin ', ' evinizin '],
  // Pronoun forms
  [' sana ', ' size '],
  [' seni ', ' sizi '],
  [' senin ', ' sizin '],
  ['Sana ', 'Size '],
  ['Seni ', 'Sizi '],
  ['Senin ', 'Sizin '],
  // sen as subject (standalone)
  [' sen ', ' siz '],
  ['Sen ', 'Siz '],
  // Common specific verbs
  [' yapabilirsin', ' yapabilirsiniz'],
  [' edebilirsin', ' edebilirsiniz'],
  [' alabilirsin', ' alabilirsiniz'],
  // -mana/-mene (dative gerund sen form) → -manıza/-menize
  [' yapmana ', ' yapmanıza '],
  [' etmene ', ' etmenize '],
];

// ─── BAD TERM replacements ─────────────────────────────────────────────────

const BAD_TERMS = [
  ['posta kiti', 'Kit postale'],
  ['Posta kiti', 'Kit postale'],
  ['akış vizesi', 'Decreto Flussi vizesi'],
  ['Akış vizesi', 'Decreto Flussi vizesi'],
  ['Akış Kararnamesi', 'Decreto Flussi'],
  ['akış kararnamesi', 'Decreto Flussi'],
  ['Aile uyumu', 'Aile bütünlüğü'],
  ['aile uyumu', 'aile bütünlüğü'],
];

// ─── Per-permit specific fixes (CRITICAL + HIGH) ───────────────────────────

const PERMIT_SPECIFIC_FIXES = {
  'cure-mediche-dopo-ingresso-con-visto-per-cure-mediche': {
    textReplacements: [
      // A-1: Remove work rights claim — replace with warning
      [
        'Çalışmak (bağımlı çalışma veya bağımsız çalışma)',
        'Bu izin kural olarak çalışma hakkı vermez. Çalışma izni için izninizi dönüştürmeniz gerekir'
      ],
      // Fix incomplete duration sentence
      [
        'Süresi 1 yıl , sağlık belgesinde belirtilen tıbbi tedaviyi tamamlamak için gereken süreye göre.',
        'Süresi, sağlık belgesinde belirtilen tedaviyi tamamlamak için gereken zamana göre belirlenir; en fazla 1 yıldır.'
      ],
      // Fix double "posta kiti" sentence
      [
        'Başvuru posta kiti yetkili posta ofislerinde bulunan posta kiti ile yapılır.',
        'Başvuru, yetkili posta ofislerinde bulunan Kit postale ile yapılır.'
      ],
    ],
  },

  'richiesta-asilo': {
    textReplacements: [
      // A-4: Fix income threshold (IT source says 13.700)
      ['13.500 Euro', '13.700 Euro'],
      ['13.500 euro', '13.700 euro'],
    ],
  },

  'protezione-speciale': {
    textReplacements: [
      // A-3: Complete truncated sentence
      [
        'Hata yapmamak için önce bir ücretsiz hukuki yardım merkezinden .',
        'Hata yapmamak için önce yakınınızdaki ücretsiz hukuki yardım merkezine danışınız.'
      ],
      [
        'Hata yapmamak için önce bir ücretsiz hukuki yardım merkezinden',
        'Hata yapmamak için önce yakınınızdaki ücretsiz hukuki yardım merkezine danışınız'
      ],
    ],
  },

  'protezione-sussidiaria': {
    textReplacements: [
      // A-5: Add origin-country travel ban (matching refugee page)
      [
        'diğer AB ülkelerine 3 aya kadar gitmek.',
        'diğer AB ülkelerine 3 aya kadar gidebilirsiniz. DİKKAT! Menşe ülkenize seyahat edemezsiniz. Bunu yaparsanız, Emniyet Müdürlüğü (Questura) oturma izninizi iptal edebilir.'
      ],
      // Fix dangling infinitive in travel section
      [
        'İtalya\'da serbestçe seyahat etmek, diğer AB ülkelerine',
        'İtalya\'da serbestçe seyahat edebilir, diğer AB ülkelerine'
      ],
    ],
  },

  'calamita-naturale': {
    textReplacements: [
      // B-13: Fix incomplete sentence (missing verb)
      [
        'Başvuruyu yaşadığın bölgenin Emniyet Müdürlüğü\'ne (Questura) .',
        'Başvurunuzu yaşadığınız bölgenin Emniyet Müdürlüğü\'ne (Questura) yapmalısınız.'
      ],
      [
        'Başvuruyu yaşadığın bölgenin Emniyet Müdürlüğü\'ne (Questura) .',
        'Başvurunuzu yaşadığınız bölgenin Emniyet Müdürlüğü\'ne (Questura) yapmalısınız.'
      ],
    ],
  },

  'attesa-occupazione': {
    textReplacements: [
      // B-12: Fix stray "a" character + clarify eligibility
      [
        'refakatsiz yabancı reşit olmayanlar a yabancı öğrenciler',
        'önceden refakatsiz yabancı reşit olmayan statüsünde bulunan kişiler; yabancı öğrenciler'
      ],
    ],
  },

  'affidamento-a-familiari-entro-il-quarto-grado': {
    textReplacements: [
      // C-12: Fix typo
      ['belgesıyla', 'belgesiyle'],
    ],
  },

  'integrazione-prosieguo-amministrativo': {
    textReplacements: [
      // C-5: Fix word order
      ['Avukat gerekli değildir başvurmak için.', 'Başvuru için avukata gerek yoktur.'],
      // C-11: Fix garbled sentence
      ['Başvuruyu yapabilirsin al Çocuk Mahkemesi\'ne', 'Başvuruyu Çocuk Mahkemesi\'ne'],
    ],
  },

  'lavoro-autonomo-dopo-ingresso-con-visto-per-flussi': {
    textReplacements: [
      // C-8: Fix duplicate "parmak izi için"
      [
        'Parmak izi için Emniyet Müdürlüğü\'ne (Questura) parmak izi için.',
        'Parmak izi almak için Emniyet Müdürlüğü\'nden (Questura) randevu alacaksınız.'
      ],
    ],
  },

  'lavoro-subordinato-conversione-da-altro-permesso': {
    textReplacements: [
      // B-10: Remove "civarında" from legal threshold
      ['538 euro civarında', '538 euro'],
    ],
  },
};

// ─── Notion helpers ─────────────────────────────────────────────────────────

function extractPlainText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(s => s.plain_text || '').join('');
}

async function fetchPageBlocks(pageId, depth = 0) {
  const blocks = [];
  let cursor = undefined;
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
    await delay(NOTION_DELAY);
  } while (cursor);

  // Recursively fetch children (bulleted lists, toggles, etc.)
  if (depth < 3) {
    for (const block of blocks) {
      if (block.has_children) {
        block._children = await fetchPageBlocks(block.id, depth + 1);
      }
    }
  }
  return blocks;
}

// No need to fetch all pages — we use cache for slug→pageId mapping

// Slug is resolved from cache, no need to extract from Notion page properties

// ─── Text transformation ────────────────────────────────────────────────────

function applyTextFixes(text, slug) {
  let result = text;
  let changes = [];

  // 1. Apply per-permit specific fixes first
  const specific = PERMIT_SPECIFIC_FIXES[slug];
  if (specific && specific.textReplacements) {
    for (const [from, to] of specific.textReplacements) {
      if (result.includes(from)) {
        result = result.split(from).join(to);
        changes.push(`SPECIFIC: "${from.substring(0, 50)}..." → "${to.substring(0, 50)}..."`);
      }
    }
  }

  // 2. Apply bad term fixes
  for (const [from, to] of BAD_TERMS) {
    if (result.includes(from)) {
      result = result.split(from).join(to);
      changes.push(`BAD_TERM: "${from}" → "${to}"`);
    }
  }

  // 3. Apply exact replacements (informal → formal)
  for (const [from, to] of EXACT_REPLACEMENTS) {
    if (result.includes(from)) {
      result = result.split(from).join(to);
      changes.push(`REGISTER: "${from.trim()}" → "${to.trim()}"`);
    }
  }

  // 4. Apply regex-based sen→siz suffix fixes
  for (const [regex, replacement] of SEN_SIZ_REPLACEMENTS) {
    const before = result;
    result = result.replace(regex, (match, prefix, suffix) => {
      const word = prefix + suffix;
      const wordLower = word.toLowerCase();
      // Skip known exceptions
      if (SEN_SIZ_EXCEPTIONS.has(wordLower)) return match;
      // Skip if already in siz form (ends in -ız/-iz/-uz/-üz after the suffix)
      if (match.endsWith('ız') || match.endsWith('iz') || match.endsWith('uz') || match.endsWith('üz')) return match;
      return match.replace(regex, replacement);
    });
    if (result !== before) {
      changes.push(`SUFFIX_FIX: applied ${regex.source}`);
    }
  }

  return { text: result, changes };
}

function applyToRichText(richTextArray, slug) {
  if (!richTextArray || !Array.isArray(richTextArray)) return { updated: false, changes: [] };

  let anyChanged = false;
  const allChanges = [];

  // First check: does the COMBINED text across all segments match a specific fix?
  const combinedText = richTextArray.map(s => s.plain_text || s.text?.content || '').join('');
  const specific = PERMIT_SPECIFIC_FIXES[slug];
  if (specific && specific.textReplacements) {
    for (const [from, to] of specific.textReplacements) {
      if (combinedText.includes(from)) {
        // Replace the entire block with a single plain-text segment
        const newText = combinedText.split(from).join(to);
        allChanges.push(`SPECIFIC: "${from.substring(0, 50)}..." → "${to.substring(0, 50)}..."`);
        anyChanged = true;
        // Return a single segment with the fixed text (formatting stripped for this block)
        const newRichText = [{ text: { content: newText }, plain_text: newText, annotations: {} }];
        return { richText: newRichText, updated: true, changes: allChanges };
      }
    }
  }

  // Then apply per-segment fixes (bad terms, register, suffix)
  const newRichText = richTextArray.map(segment => {
    const content = segment.plain_text || segment.text?.content || '';
    if (!content.trim()) return segment;

    const { text: fixed, changes } = applyTextFixes(content, slug);
    if (fixed !== content) {
      anyChanged = true;
      allChanges.push(...changes);
      return {
        ...segment,
        text: {
          ...(segment.text || {}),
          content: fixed,
        },
        plain_text: fixed,
      };
    }
    return segment;
  });

  return { richText: newRichText, updated: anyChanged, changes: allChanges };
}

// ─── Block update ───────────────────────────────────────────────────────────

function getRichTextKey(block) {
  const type = block.type;
  const typeData = block[type];
  if (!typeData) return null;
  if (typeData.rich_text) return 'rich_text';
  return null;
}

async function updateBlock(block, slug) {
  const type = block.type;
  const typeData = block[type];
  if (!typeData) return { updated: false, changes: [] };

  const rtKey = getRichTextKey(block);
  if (!rtKey) return { updated: false, changes: [] };

  const { richText, updated, changes } = applyToRichText(typeData[rtKey], slug);
  if (!updated) return { updated: false, changes: [] };

  if (!DRY_RUN) {
    const updatePayload = {
      block_id: block.id,
      [type]: {
        [rtKey]: richText.map(seg => ({
          type: 'text',
          text: {
            content: seg.text?.content || seg.plain_text || '',
            link: seg.text?.link || null,
          },
          annotations: seg.annotations || {},
        })),
      },
    };
    await notion.blocks.update(updatePayload);
    await delay(NOTION_DELAY);
  }

  return { updated: true, changes };
}

// ─── Duplicate block detection and removal ──────────────────────────────────

const DUPLICATE_PERMITS = new Set([
  'carta-di-soggiorno-per-familiari-di-italiani-dinamici',
  'lavoro-subordinato-conversione-da-altro-permesso',
  'motivi-religiosi',
  'residenza-elettiva',
]);

function findDuplicateBlocks(blocks) {
  // Find question blocks (heading_3 with ?) and detect duplicates
  const questionPositions = {};

  blocks.forEach((block, idx) => {
    const type = block.type;
    const typeData = block[type];
    if (!typeData?.rich_text) return;

    const text = extractPlainText(typeData.rich_text).trim();
    if (!text || !text.endsWith('?')) return;

    if (!questionPositions[text]) {
      questionPositions[text] = [];
    }
    questionPositions[text].push(idx);
  });

  // Find the first duplicate question (all blocks from there to end = duplicate section)
  const duplicateQuestions = Object.entries(questionPositions)
    .filter(([_, positions]) => positions.length > 1);

  if (duplicateQuestions.length === 0) return [];

  // Find the index where duplicates start (second occurrence of first repeated question)
  let duplicateStartIdx = Infinity;
  for (const [question, positions] of duplicateQuestions) {
    const secondOccurrence = positions[1];
    if (secondOccurrence < duplicateStartIdx) {
      duplicateStartIdx = secondOccurrence;
    }
  }

  // All blocks from duplicateStartIdx to end are duplicates
  return blocks.slice(duplicateStartIdx).map(b => b.id);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function processPermit(page, slug) {
  const pageId = page.id;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Processing: ${slug} (${pageId})`);

  const blocks = await fetchPageBlocks(pageId);
  console.log(`  Fetched ${blocks.length} blocks`);

  let totalChanges = 0;
  const changeLog = [];

  // 1. Handle duplicate block removal for known duplicate permits
  if (DUPLICATE_PERMITS.has(slug)) {
    const duplicateIds = findDuplicateBlocks(blocks);
    if (duplicateIds.length > 0) {
      console.log(`  Found ${duplicateIds.length} duplicate blocks to remove`);
      changeLog.push(`DUPLICATE_REMOVAL: ${duplicateIds.length} blocks`);
      if (!DRY_RUN) {
        for (const blockId of duplicateIds) {
          try {
            await notion.blocks.delete({ block_id: blockId });
            await delay(NOTION_DELAY);
            totalChanges++;
          } catch (err) {
            console.error(`    Error deleting block ${blockId}: ${err.message}`);
          }
        }
      } else {
        totalChanges += duplicateIds.length;
      }
    }
  }

  // 2. Build set of duplicate IDs to skip
  const skipIds = new Set();
  if (DUPLICATE_PERMITS.has(slug)) {
    const dups = findDuplicateBlocks(blocks);
    dups.forEach(id => skipIds.add(id));
  }

  // 3. Apply text fixes to all remaining blocks (including children)
  async function processBlocks(blockList) {
    for (const block of blockList) {
      if (skipIds.has(block.id)) continue;

      try {
        const { updated, changes } = await updateBlock(block, slug);
        if (updated) {
          totalChanges++;
          changeLog.push(...changes);
        }
      } catch (err) {
        console.error(`    Error updating block ${block.id}: ${err.message}`);
      }

      // Process children
      if (block._children) {
        await processBlocks(block._children);
      }
    }
  }
  await processBlocks(blocks);

  if (totalChanges > 0) {
    console.log(`  Applied ${totalChanges} changes:`);
    // Dedupe change descriptions
    const uniqueChanges = [...new Set(changeLog)];
    uniqueChanges.forEach(c => console.log(`    - ${c}`));
  } else {
    console.log(`  No changes needed`);
  }

  return { slug, changes: totalChanges, details: changeLog };
}

async function main() {
  console.log(`\n=== TR Translation Fix Script ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'LIVE (updating Notion)'}`);
  if (SLUG_FILTER) console.log(`Filter: ${SLUG_FILTER}`);
  console.log('');

  // Load cache to map slugs to page IDs
  const cachePath = path.join(__dirname, '../_cache/permits-tr.json');
  const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  console.log(`Loaded ${cache.length} permits from cache`);

  // Map slug → { id, slug } from cache (no Notion query needed)
  const slugToPageId = {};
  for (const entry of cache) {
    const pageId = entry.notionPageId || entry.id;
    if (pageId) slugToPageId[entry.slug] = pageId;
  }
  console.log(`Mapped ${Object.keys(slugToPageId).length} slugs to Notion page IDs`);

  // Determine which permits to process
  let slugsToProcess;
  if (SLUG_FILTER) {
    slugsToProcess = [SLUG_FILTER];
  } else {
    slugsToProcess = cache.map(c => c.slug);
  }

  const results = [];
  let totalFixed = 0;

  for (const slug of slugsToProcess) {
    const pageId = slugToPageId[slug];
    if (!pageId) {
      console.log(`\n  SKIP: ${slug} — no page ID in cache`);
      continue;
    }

    const result = await processPermit({ id: pageId }, slug);
    results.push(result);
    totalFixed += result.changes;
  }

  // Summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SUMMARY`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Permits processed: ${results.length}`);
  console.log(`Permits with changes: ${results.filter(r => r.changes > 0).length}`);
  console.log(`Total changes: ${totalFixed}`);
  if (DRY_RUN) {
    console.log(`\n⚠️  DRY RUN — no changes were made. Run without --dry-run to apply.`);
  }

  // Write change log
  const logPath = path.join(__dirname, '../review-reports/tr-fix-log.md');
  const logContent = [
    `# TR Translation Fix Log`,
    ``,
    `Date: ${new Date().toISOString().split('T')[0]}`,
    `Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`,
    ``,
    `## Summary`,
    `- Permits processed: ${results.length}`,
    `- Permits with changes: ${results.filter(r => r.changes > 0).length}`,
    `- Total changes applied: ${totalFixed}`,
    ``,
    `## Changes by permit`,
    ``,
    ...results.filter(r => r.changes > 0).map(r => {
      const uniqueDetails = [...new Set(r.details)];
      return [
        `### ${r.slug}`,
        `Changes: ${r.changes}`,
        ...uniqueDetails.map(d => `- ${d}`),
        '',
      ].join('\n');
    }),
    ``,
    `## Static HTML fixes (applied separately)`,
    `- tr/index.html: "Akış kararnamesi" → "Decreto Flussi"`,
    `- tr/src/pages/database.html: "akış vizesi" → "Decreto Flussi vizesi" (×2), "Aile uyumu" → "Aile bütünlüğü"`,
    `- tr/src/pages/dizionario.html: "Aile uyumu" → "Aile bütünlüğü"`,
    `- tr/src/pages/ricongiungimento-familiare.html: "Aile uyumu" → "Aile bütünlüğü"`,
  ].join('\n');

  fs.writeFileSync(logPath, logContent, 'utf-8');
  console.log(`\nChange log written to: ${logPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
