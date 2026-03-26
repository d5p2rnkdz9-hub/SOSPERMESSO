#!/usr/bin/env node
/**
 * Fix ES translation issues in Notion.
 * Applies: bad term fixes, per-permit critical/high fixes,
 * duplicate block removal, Peninsular→LatAm Spanish fixes.
 *
 * Usage:
 *   node scripts/fix-es-translations.js                # full run
 *   node scripts/fix-es-translations.js --dry-run      # preview only
 *   node scripts/fix-es-translations.js --slug attesa-occupazione  # single permit
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const ES_DB_ID = '93ad8b71-73e7-499b-83bc-a1975bda89dd';
const NOTION_DELAY = 350;
const DRY_RUN = process.argv.includes('--dry-run');
const SLUG_FILTER = (() => {
  const idx = process.argv.indexOf('--slug');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── BAD TERM replacements (global, all permits) ────────────────────────────
// From translator review (Cynthia Chavez) + AI review findings

const BAD_TERMS = [
  // --- Translator review terms (Cynthia) ---
  ['permisos de estancia', 'permisos de estadía'],
  ['permiso de estancia', 'permiso de estadía'],
  ['de estancia', 'de estadía'],
  ['Reagrupación familiar', 'Reunificación familiar'],
  ['reagrupación familiar', 'reunificación familiar'],
  ['Jefatura de Policía', 'Oficina de extranjería/migraciones'],
  ['jefatura de policía', 'oficina de extranjería/migraciones'],
  ['Oficina postal habilitada', 'Oficina de Correos habilitada (Poste Italiane)'],
  ['oficina postal habilitada', 'oficina de Correos habilitada (Poste Italiane)'],
  ['documentos requeridos', 'documentos necesarios'],
  ['Documentos requeridos', 'Documentos necesarios'],
  ['Extracto de cuenta bancaria', 'Estado de cuenta bancaria'],
  ['extracto de cuenta bancaria', 'estado de cuenta bancaria'],
  ['Extracto de cuenta', 'Estado de cuenta'],
  ['extracto de cuenta', 'estado de cuenta'],
  ['Declaración de hospitalidad', 'Declaración/constancia de hospedaje'],
  ['declaración de hospitalidad', 'declaración/constancia de hospedaje'],
  ['Caducado', 'Vencido'],
  ['caducado', 'vencido'],
  ['Haz nuestro test', 'Realiza nuestro test'],
  ['Asistencia legal', 'Asesoría legal'],
  ['asistencia legal', 'asesoría legal'],
  ['Póliza de seguro', 'Seguro de salud'],
  ['póliza de seguro', 'seguro de salud'],
  ['conversión desde', 'conversión a partir de'],
  ['Conversión desde', 'Conversión a partir de'],

  // --- AI review findings ---
  // S-1: bollettino mistranslation
  ['boletín de pago postal', 'boleta de pago postal (bollettino postale)'],
  ['Boletín de pago postal', 'Boleta de pago postal (bollettino postale)'],
  ['un boletín de pago', 'una boleta de pago'],
  ['Un boletín de pago', 'Una boleta de pago'],
  ['el boletín de pago', 'la boleta de pago'],
  ['El boletín de pago', 'La boleta de pago'],

  // S-2: false cognate — curas médicas
  ['curas médicas', 'tratamientos médicos'],
  ['Curas médicas', 'Tratamientos médicos'],
  ['curas medicas', 'tratamientos médicos'],
  ['Curas medicas', 'Tratamientos médicos'],

  // S-4: Italianism — operador legal
  ['operador legal', 'asesor legal'],
  ['Operador legal', 'Asesor legal'],

  // S-5: Peninsular verbs
  ['rellenar', 'llenar'],
  ['Rellenar', 'Llenar'],

  // S-6: Peninsular nouns
  ['carné de conducir', 'licencia de conducir'],
  ['Carné de conducir', 'Licencia de conducir'],
  ['carne de conducir', 'licencia de conducir'],
  ['sin ánimo de lucro', 'sin fines de lucro'],
  ['sin animo de lucro', 'sin fines de lucro'],

  // S-7: Unexplained abbreviations
  ['Autoridad de P.S.', 'Questura'],

  // Peninsular → LatAm: visado
  ['con visado', 'con visa'],
  ['el visado', 'la visa'],
  ['un visado', 'una visa'],
  ['del visado', 'de la visa'],

  // Italianism: sociedad deportiva
  ['sociedad deportiva', 'club deportivo'],
  ['Sociedad deportiva', 'Club deportivo'],

  // Italianism: sujetos privados
  ['sujetos privados', 'entidades privadas'],

  // Italianism: audición (false friend)
  ['la audición', 'la entrevista'],
  ['La audición', 'La entrevista'],
  ['la audicion', 'la entrevista'],
  ['La audicion', 'La entrevista'],

  // Peninsular: echar una mano
  ['echar una mano', 'dar una mano'],

  // Peninsular: nóminas
  ['nóminas', 'recibos de sueldo'],
  ['nominas', 'recibos de sueldo'],

  // Italianism: finalizado a
  ['finalizado a', 'orientado a'],
  ['Finalizado a', 'Orientado a'],

  // Peninsular: caducar verb forms (beyond the noun "caducado")
  ['cuando caduque', 'cuando venza'],
  ['cuando caduca', 'cuando vence'],
  ['antes de que caduque', 'antes de que venza'],
  ['Cuando caduque', 'Cuando venza'],
  ['Cuando caduca', 'Cuando vence'],
  ['que caduca', 'que vence'],
  ['ha caducado', 'ha vencido'],
  ['está caducado', 'está vencido'],

  // Italianism: recorrido realizado (percorso realizzato)
  ['recorrido realizado', 'proceso de integración'],

  // Peninsular: estanco
  ['en un estanco', 'en una tabacchería (tienda de tabaco)'],
  ['un estanco', 'una tabacchería (tienda de tabaco)'],
];

// ─── Per-permit specific fixes (CRITICAL + HIGH) ───────────────────────────

const PERMIT_SPECIFIC_FIXES = {
  // A-1: Medical visa permit wrongly claims work rights
  'cure-mediche-dopo-ingresso-con-visto-per-cure-mediche': {
    textReplacements: [
      [
        'Trabajar (trabajo asalariado o autónomo)',
        'Este permiso generalmente no permite trabajar. Para trabajar, debes convertir tu permiso en uno por motivos de trabajo'
      ],
    ],
  },

  // A-2: "más o menos" on legal threshold
  'lavoro-subordinato-conversione-da-altro-permesso': {
    textReplacements: [
      [
        'al menos 538 euros al mes, más o menos',
        'al menos equivalente al subsidio social (assegno sociale), actualmente alrededor de 538 euros mensuales'
      ],
      // A-9: Wrong 60-day direction
      [
        '60 días antes del vencimiento',
        '60 días después del vencimiento'
      ],
    ],
  },

  // A-6: Hardcoded year
  'richiesta-asilo': {
    textReplacements: [
      [
        'Si en 2025 has ganado menos de 13.500 euros',
        'Si en el último año fiscal has ganado menos de 13.500 euros'
      ],
      [
        'Si en 2025 has ganado menos de 13.700 euros',
        'Si en el último año fiscal has ganado menos de 13.700 euros'
      ],
    ],
  },

  // A-4/A-5: protezione sociale confused with especial/humanitaria
  'protezione-sociale-vittime-di-tratta': {
    textReplacements: [
      [
        'permiso de estancia por motivos humanitarios',
        'permiso de estadía por protección social (art. 18 T.U. Immigrazione)'
      ],
      [
        'permiso por protección especial',
        'permiso por protección social'
      ],
      [
        'El permiso por protección especial es solicitado',
        'El permiso por protección social es solicitado'
      ],
    ],
  },

  // A-8: Grammar + seasonal permit
  'lavoro-subordinato-stagionale-dopo-ingresso-con-visto-per-flussi-stagionali': {
    textReplacements: [
      [
        'No es necesario una nueva autorización',
        'No es necesaria una nueva autorización (nulla osta)'
      ],
    ],
  },

  // B-5: calamita naturale — dangling sentence
  'calamita-naturale': {
    textReplacements: [
      [
        'renovable por otros seis meses en caso de que',
        'renovable por otros seis meses en caso de que la situación de emergencia en tu país continúe'
      ],
    ],
  },

  // C-10: SSN wrong translation
  'famiglia-senza-nullaosta-per-ricongiungimento-coesione-familiare': {
    textReplacements: [
      [
        'SSN (Seguridad Social italiana)',
        'SSN (Servicio Nacional de Salud italiano)'
      ],
      [
        'SSN (Seguridad Social)',
        'SSN (Servicio Nacional de Salud)'
      ],
    ],
  },

  // C-11: Agencia Tributaria is the SPANISH tax agency
  'famiglia-convivente-con-pariente-cittadino-italiano-entro-il-secondo-grado': {
    textReplacements: [
      [
        'Agencia Tributaria',
        'Agenzia delle Entrate (oficina de impuestos)'
      ],
    ],
  },

  // C-5: Wrong term for prosieguo amministrativo
  'minore-eta-per-msna': {
    textReplacements: [
      [
        'trámite administrativo',
        'continuación administrativa (prosieguo amministrativo)'
      ],
    ],
  },

  // C-8: "El permiso está de papel" grammar
  'cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia': {
    textReplacements: [
      [
        'El permiso está de papel',
        'El permiso es en formato papel'
      ],
      [
        'el permiso está de papel',
        'el permiso es en formato papel'
      ],
    ],
  },
};

// ─── Permits with duplicate Q&A blocks to remove ─────────────────────────

const DUPLICATE_PERMITS = new Set([
  'carta-di-soggiorno-per-familiari-di-italiani-dinamici',
  'lavoro-subordinato-conversione-da-altro-permesso',
  'motivi-religiosi',
  'residenza-elettiva',
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

  // 1. Apply per-permit specific fixes first
  const specific = PERMIT_SPECIFIC_FIXES[slug];
  if (specific && specific.textReplacements) {
    for (const [from, to] of specific.textReplacements) {
      if (result.includes(from)) {
        result = result.split(from).join(to);
        changes.push(`SPECIFIC: "${from.substring(0, 60)}..." → "${to.substring(0, 60)}..."`);
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

  return { text: result, changes };
}

function applyToRichText(richTextArray, slug) {
  if (!richTextArray || !Array.isArray(richTextArray)) return { updated: false, changes: [] };

  let anyChanged = false;
  const allChanges = [];

  // Check combined text for specific fixes (cross-segment matches)
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

  // 1. Handle duplicate block removal
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

  // 2. Build skip set for deleted blocks
  const skipIds = new Set();
  if (DUPLICATE_PERMITS.has(slug)) {
    findDuplicateBlocks(blocks).forEach(id => skipIds.add(id));
  }

  // 3. Apply text fixes to all remaining blocks
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
  console.log(`\n=== ES Translation Fix Script ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'LIVE (updating Notion)'}`);
  if (SLUG_FILTER) console.log(`Filter: ${SLUG_FILTER}`);
  console.log('');

  // Load cache to map slugs → page IDs
  const cachePath = path.join(__dirname, '../_cache/permits-es.json');
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

  // Summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SUMMARY`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Permits processed: ${results.length}`);
  console.log(`Permits with changes: ${results.filter(r => r.changes > 0).length}`);
  console.log(`Total changes: ${totalFixed}`);
  if (DRY_RUN) {
    console.log(`\n  DRY RUN — no changes were made. Run without --dry-run to apply.`);
  }

  // Write change log
  const logPath = path.join(__dirname, '../review-reports/es-fix-log.md');
  const logContent = [
    `# ES Translation Fix Log`,
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
