#!/usr/bin/env node
/**
 * Fix FR translation issues in Notion.
 * Applies: tu→vous register fix, critical legal fixes, bad term fixes,
 * duplicate block removal.
 *
 * Usage:
 *   node scripts/fix-fr-translations.js                # full run
 *   node scripts/fix-fr-translations.js --dry-run      # preview only
 *   node scripts/fix-fr-translations.js --slug attesa-occupazione  # single permit
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const FR_DB_ID = 'b7955daa-3da7-4a0c-ac9d-0bbe4ba7d70e';
const NOTION_DELAY = 350;
const DRY_RUN = process.argv.includes('--dry-run');
const SLUG_FILTER = (() => {
  const idx = process.argv.indexOf('--slug');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── TU → VOUS replacements ─────────────────────────────────────────────────
// French informal (tu) → formal (vous) conversion

const TU_VOUS_EXACT = [
  // Pronouns — subject
  [' tu ', ' vous '],
  ['Tu ', 'Vous '],
  [' tu,', ' vous,'],
  [' tu.', ' vous.'],

  // Pronouns — object/reflexive
  [' toi ', ' vous '],
  [' toi.', ' vous.'],
  [' toi,', ' vous,'],
  [' te ', ' vous '],
  [' t\'', ' vous '],
  ['Te ', 'Vous '],

  // Possessives — ton/ta/tes → votre/vos
  [' ton ', ' votre '],
  [' ton.', ' votre.'],
  [' ton,', ' votre,'],
  ['Ton ', 'Votre '],
  [' ta ', ' votre '],
  [' ta.', ' votre.'],
  [' ta,', ' votre,'],
  ['Ta ', 'Votre '],
  [' tes ', ' vos '],
  [' tes.', ' vos.'],
  [' tes,', ' vos,'],
  ['Tes ', 'Vos '],

  // Common verb forms — present tense tu → vous
  [' peux ', ' pouvez '],
  [' peux.', ' pouvez.'],
  [' peux,', ' pouvez,'],
  ['Tu peux', 'Vous pouvez'],
  [' fais ', ' faites '],
  [' fais.', ' faites.'],
  ['Tu fais', 'Vous faites'],
  [' vas ', ' allez '],
  [' vas.', ' allez.'],
  ['Tu vas', 'Vous allez'],
  [' es ', ' êtes '],
  ['Tu es ', 'Vous êtes '],
  [' as ', ' avez '],
  ['Tu as ', 'Vous avez '],
  [' dois ', ' devez '],
  [' dois.', ' devez.'],
  ['Tu dois', 'Vous devez'],
  [' veux ', ' voulez '],
  ['Tu veux', 'Vous voulez'],
  [' sais ', ' savez '],
  ['Tu sais', 'Vous savez'],
  [' vis ', ' vivez '],
  ['Tu vis', 'Vous vivez'],
  [' viens ', ' venez '],
  ['Tu viens', 'Vous venez'],
  [' reçois ', ' recevez '],
  ['Tu reçois', 'Vous recevez'],

  // Imperative tu → vous
  ['Demande ', 'Demandez '],
  [' demande ', ' demandez '],
  ['Fais ', 'Faites '],
  ['Va ', 'Allez '],
  [' va ', ' allez '],
  ['Prends ', 'Prenez '],
  ['Vérifie ', 'Vérifiez '],
  ['Assure-toi', 'Assurez-vous'],
  ['assure-toi', 'assurez-vous'],
  ['Inscris-toi', 'Inscrivez-vous'],
  ['inscris-toi', 'inscrivez-vous'],
  ['Rends-toi', 'Rendez-vous'],
  ['rends-toi', 'rendez-vous'],
  ['Adresse-toi', 'Adressez-vous'],
  ['adresse-toi', 'adressez-vous'],
  ['Rappelle-toi', 'Rappelez-vous'],
  ['N\'oublie pas', 'N\'oubliez pas'],
  ['n\'oublie pas', 'n\'oubliez pas'],
  ['Contacte ', 'Contactez '],
  ['Envoie ', 'Envoyez '],
  ['Présente ', 'Présentez '],
  ['Ajoute ', 'Ajoutez '],

  // Reflexive verbs — tu form
  [' t\'inscrire', ' vous inscrire'],
  [' t\'inscrire', ' vous inscrire'],
  [' t\'adresser', ' vous adresser'],

  // Maman/papa → Mère/père
  ['Maman', 'Mère'],
  ['maman', 'mère'],
  ['Papa', 'Père'],
  ['papa', 'père'],

  // "plus ou moins" on legal thresholds
  ['plus ou moins', ''],
  [', plus ou moins', ''],
];

// Words that should NOT be converted (false positives)
const TU_VOUS_EXCEPTIONS = new Set([
  'tu', // standalone will be caught by patterns above
  'statue', 'statut', 'situation', 'constitue', 'institut',
  'battu', 'revêtu', 'obtenu', 'détenu', 'retenu', 'contenu',
  'vas-y', // keep as expression
]);

// ─── BAD TERM replacements ──────────────────────────────────────────────────

const BAD_TERMS = [
  // Italian calques
  ['Peut le demander qui', 'Peuvent en faire la demande les personnes qui'],
  ['opérateur légal', 'conseiller juridique'],
  ['opérateur expert', 'avocat ou conseiller juridique spécialisé'],
  ['Opérateur légal', 'Conseiller juridique'],
  ['operateur legal', 'conseiller juridique'],
  ['operateur expert', 'avocat ou conseiller juridique spécialisé'],
  ['cession de bâtiment', 'mise à disposition du logement (cessione di fabbricato)'],
  ['cession de batiment', 'mise à disposition du logement (cessione di fabbricato)'],
  ['cessione di fabbricato', 'cessione di fabbricato'],  // preserve if already Italian

  // False friends
  ['registre civil', 'registre de la population (anagrafe)'],

  // Legal term corrections
  ['pour motifs humanitaires', 'pour protection sociale (art. 18 T.U. Immigrazione)'],
  ['protection spéciale est demandé', 'protection sociale est demandé'],
  ['protection spéciale est demandée', 'protection sociale est demandée'],

  // Outdated year
  ['Si en 2025 vous avez gagné', 'Si au cours de la dernière année fiscale vous avez gagné'],
  ['Si en 2025 tu as gagné', 'Si au cours de la dernière année fiscale vous avez gagné'],
  ['En 2025', 'Au cours de la dernière année fiscale'],
];

// ─── Per-permit specific fixes (CRITICAL + HIGH) ────────────────────────────

const PERMIT_SPECIFIC_FIXES = {
  // Truncated sentence
  'calamita-naturale': {
    textReplacements: [
      [
        'renouvelable pour six mois supplémentaires si',
        'renouvelable pour six mois supplémentaires si la situation d\'urgence dans votre pays persiste'
      ],
      [
        'renouvelable pour six mois supplementaires si',
        'renouvelable pour six mois supplémentaires si la situation d\'urgence dans votre pays persiste'
      ],
    ],
  },

  // Wrong direction for 60 days
  'lavoro-subordinato-dopo-ingresso-con-visto-per-flussi': {
    textReplacements: [
      [
        '60 jours avant l\'expiration',
        '60 jours suivant l\'expiration'
      ],
      [
        '60 jours avant l\u2019expiration',
        '60 jours suivant l\u2019expiration'
      ],
    ],
  },

  // "más o menos" equivalent
  'lavoro-subordinato-conversione-da-altro-permesso': {
    textReplacements: [
      [
        '538 euros par mois, plus ou moins',
        '538 euros par mois (montant de l\'allocation sociale, mis à jour annuellement)'
      ],
    ],
  },

  // Seasonal permit — no new nulla osta claim
  'lavoro-subordinato-stagionale-dopo-ingresso-con-visto-per-flussi-stagionali': {
    textReplacements: [
      [
        'Il n\'est pas nécessaire d\'obtenir une nouvelle autorisation de travail',
        'Il n\'est généralement pas nécessaire d\'obtenir une nouvelle autorisation de travail (nulla osta)'
      ],
      [
        'Il n\u2019est pas necessaire d\u2019obtenir une nouvelle autorisation',
        'Il n\'est généralement pas nécessaire d\'obtenir une nouvelle autorisation (nulla osta)'
      ],
    ],
  },

  // Income requirement wrong
  'ue-per-soggiornanti-di-lungo-periodo-carta-di-soggiorno': {
    textReplacements: [
      [
        'un revenu d\'au moins 7.000 euros au cours des trois dernières années',
        'un revenu annuel au moins égal au montant de l\'allocation sociale (assegno sociale, environ 7.000 euros par an)'
      ],
      [
        'un revenu d\u2019au moins 7.000 euros au cours des trois dernieres annees',
        'un revenu annuel au moins égal au montant de l\'allocation sociale (assegno sociale, environ 7.000 euros par an)'
      ],
    ],
  },

  // protezione sociale confused with especial
  'protezione-sociale-vittime-di-tratta': {
    textReplacements: [
      [
        'titre de séjour pour protection spéciale',
        'titre de séjour pour protection sociale'
      ],
      [
        'titre de sejour pour protection speciale',
        'titre de séjour pour protection sociale'
      ],
      [
        'Le titre de séjour pour protection spéciale est demandé',
        'Le titre de séjour pour protection sociale est demandé'
      ],
    ],
  },
};

// ─── Permits with duplicate Q&A blocks ──────────────────────────────────────

const DUPLICATE_PERMITS = new Set([
  'carta-di-soggiorno-per-familiari-di-italiani-dinamici',
  'lavoro-subordinato-conversione-da-altro-permesso',
  'motivi-religiosi',
  'residenza-elettiva',
  'figlio-minore-di-piu-di-14-anni-che-vive-con-i-genitori',
]);

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

  if (depth < 3) {
    for (const block of blocks) {
      if (block.has_children) {
        block._children = await fetchPageBlocks(block.id, depth + 1);
      }
    }
  }
  return blocks;
}

// ─── Text transformation ────────────────────────────────────────────────────

function applyTextFixes(text, slug) {
  let result = text;
  let changes = [];

  // 1. Per-permit specific fixes
  const specific = PERMIT_SPECIFIC_FIXES[slug];
  if (specific && specific.textReplacements) {
    for (const [from, to] of specific.textReplacements) {
      if (result.includes(from)) {
        result = result.split(from).join(to);
        changes.push(`SPECIFIC: "${from.substring(0, 60)}..." → "${to.substring(0, 60)}..."`);
      }
    }
  }

  // 2. Bad term fixes
  for (const [from, to] of BAD_TERMS) {
    if (result.includes(from)) {
      result = result.split(from).join(to);
      changes.push(`BAD_TERM: "${from}" → "${to}"`);
    }
  }

  // 3. Tu → vous exact replacements
  for (const [from, to] of TU_VOUS_EXACT) {
    if (result.includes(from)) {
      result = result.split(from).join(to);
      changes.push(`REGISTER: "${from.trim()}" → "${to.trim()}"`);
    }
  }

  return { text: result, changes };
}

function applyToRichText(richTextArray, slug) {
  if (!richTextArray || !Array.isArray(richTextArray)) return { updated: false, changes: [] };

  let anyChanged = false;
  const allChanges = [];

  // Check combined text for specific fixes
  const combinedText = richTextArray.map(s => s.plain_text || s.text?.content || '').join('');
  const specific = PERMIT_SPECIFIC_FIXES[slug];
  if (specific && specific.textReplacements) {
    for (const [from, to] of specific.textReplacements) {
      if (combinedText.includes(from)) {
        const newText = combinedText.split(from).join(to);
        allChanges.push(`SPECIFIC: "${from.substring(0, 60)}..." → "${to.substring(0, 60)}..."`);
        anyChanged = true;
        const newRichText = [{ text: { content: newText }, plain_text: newText, annotations: {} }];
        return { richText: newRichText, updated: true, changes: allChanges };
      }
    }
  }

  // Per-segment fixes
  const newRichText = richTextArray.map(segment => {
    const content = segment.plain_text || segment.text?.content || '';
    if (!content.trim()) return segment;

    const { text: fixed, changes } = applyTextFixes(content, slug);
    if (fixed !== content) {
      anyChanged = true;
      allChanges.push(...changes);
      return {
        ...segment,
        text: { ...(segment.text || {}), content: fixed },
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

// ─── Duplicate block detection ──────────────────────────────────────────────

function findDuplicateBlocks(blocks) {
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

  const duplicateQuestions = Object.entries(questionPositions)
    .filter(([_, positions]) => positions.length > 1);

  if (duplicateQuestions.length === 0) return [];

  let duplicateStartIdx = Infinity;
  for (const [question, positions] of duplicateQuestions) {
    const secondOccurrence = positions[1];
    if (secondOccurrence < duplicateStartIdx) {
      duplicateStartIdx = secondOccurrence;
    }
  }

  return blocks.slice(duplicateStartIdx).map(b => b.id);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function processPermit(pageId, slug) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Processing: ${slug} (${pageId})`);

  const blocks = await fetchPageBlocks(pageId);
  console.log(`  Fetched ${blocks.length} blocks`);

  let totalChanges = 0;
  const changeLog = [];

  // 1. Duplicate block removal
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

  // 2. Skip set
  const skipIds = new Set();
  if (DUPLICATE_PERMITS.has(slug)) {
    findDuplicateBlocks(blocks).forEach(id => skipIds.add(id));
  }

  // 3. Text fixes
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
      if (block._children) {
        await processBlocks(block._children);
      }
    }
  }
  await processBlocks(blocks);

  if (totalChanges > 0) {
    console.log(`  Applied ${totalChanges} changes:`);
    const uniqueChanges = [...new Set(changeLog)];
    uniqueChanges.forEach(c => console.log(`    - ${c}`));
  } else {
    console.log(`  No changes needed`);
  }

  return { slug, changes: totalChanges, details: changeLog };
}

async function main() {
  console.log(`\n=== FR Translation Fix Script ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'LIVE (updating Notion)'}`);
  if (SLUG_FILTER) console.log(`Filter: ${SLUG_FILTER}`);
  console.log('');

  const cachePath = path.join(__dirname, '../_cache/permits-fr.json');
  const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  console.log(`Loaded ${cache.length} permits from cache`);

  const slugToPageId = {};
  for (const entry of cache) {
    const pageId = entry.notionPageId || entry.id;
    if (pageId) slugToPageId[entry.slug] = pageId;
  }
  console.log(`Mapped ${Object.keys(slugToPageId).length} slugs to Notion page IDs`);

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
    const result = await processPermit(pageId, slug);
    results.push(result);
    totalFixed += result.changes;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SUMMARY`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Permits processed: ${results.length}`);
  console.log(`Permits with changes: ${results.filter(r => r.changes > 0).length}`);
  console.log(`Total changes: ${totalFixed}`);
  if (DRY_RUN) {
    console.log(`\n  DRY RUN — no changes were made. Run without --dry-run to apply.`);
  }

  const logPath = path.join(__dirname, '../review-reports/fr-fix-log.md');
  const logContent = [
    `# FR Translation Fix Log`,
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
  ].join('\n');

  fs.writeFileSync(logPath, logContent, 'utf-8');
  console.log(`\nChange log written to: ${logPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
