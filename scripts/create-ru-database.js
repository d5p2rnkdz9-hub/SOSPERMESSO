#!/usr/bin/env node
/**
 * Create Russian (RU) translated Notion database for SOS Permesso
 * Translates from IT source database, writes directly via Notion API.
 * NO Claude/Anthropic API used — all translations are inline.
 *
 * Usage: node scripts/create-ru-database.js
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');

// ─── Constants ───────────────────────────────────────────────────────────────

const IT_DATABASE_ID = '3097355e-7f7f-819c-af33-d0fd0739cc5b';
const PARENT_PAGE_ID = '30b7355e-7f7f-8184-975d-fb18ca69875c';
const NOTION_DELAY = 350;
const MAX_BLOCKS_PER_APPEND = 100;

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Permit Name Translations (IT → RU) ─────────────────────────────────────

// Normalize smart quotes to straight quotes for matching
function normalizeQuotes(str) {
  return str.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
            .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
}

const _PERMIT_NAME_MAP = {
  'Lavoro subordinato (dopo ingresso con visto per "flussi")': 'Работа по найму (после въезда по визе «flussi»)',
  'Lavoro subordinato (conversione da altro permesso)': 'Работа по найму (конверсия другого разрешения)',
  'Lavoro subordinato stagionale (dopo ingresso con visto per "flussi stagionali")': 'Сезонная работа по найму (после въезда по визе «flussi stagionali»)',
  'Lavoro autonomo (dopo ingresso con visto per "flussi")': 'Самостоятельная трудовая деятельность (после въезда по визе «flussi»)',
  'Lavoro autonomo (conversione da altro permesso)': 'Самостоятельная трудовая деятельность (конверсия другого разрешения)',
  'Studio (dopo ingresso con visto)': 'Учёба (после въезда по визе)',
  'Studio (conversione da altro permesso)': 'Учёба (конверсия другого разрешения)',
  'Richiesta Asilo': 'Запрос убежища',
  'Asilo (status rifugiato)': 'Убежище (статус беженца)',
  'Protezione sussidiaria': 'Субсидиарная защита',
  'Protezione speciale dopo decisione positiva della Commissione o del Tribunale': 'Специальная защита после положительного решения Комиссии или Суда',
  'Protezione sociale vittime di tratta': 'Социальная защита жертв торговли людьми',
  'Protezione sociale vittime di violenza domestica': 'Социальная защита жертв домашнего насилия',
  'Famiglia - dopo ingresso con visto per ricongiungimento familiare': 'Семья — после въезда по визе для воссоединения семьи',
  'Famiglia - senza nullaosta per ricongiungimento ("coesione familiare")': 'Семья — без нуллаоста для воссоединения («coesione familiare»)',
  'Famiglia - genitore di cittadino italiano': 'Семья — родитель гражданина Италии',
  'Famiglia - convivente con parente cittadino italiano entro il secondo grado': 'Семья — совместное проживание с родственником-гражданином Италии до второй степени родства',
  'FAMIT per familiari di cittadini italiani "statici"': 'FAMIT для родственников «статичных» граждан Италии',
  'Carta di soggiorno per familiari di cittadini UE': 'Вид на жительство для родственников граждан ЕС',
  'Carta di soggiorno per familiari di italiani "dinamici"': 'Вид на жительство для родственников «динамичных» итальянцев',
  'Famigliari di persone con status di rifugiato o protezione sussidiaria': 'Родственники лиц со статусом беженца или субсидиарной защитой',
  'Affidamento a familiari entro il quarto grado': 'Опека родственниками до четвёртой степени родства',
  'Assistenza minore ("Articolo 31")': 'Помощь несовершеннолетнему («Articolo 31»)',
  'Figlio minore di più di 14 anni che vive con i genitori': 'Несовершеннолетний ребёнок старше 14 лет, проживающий с родителями',
  'Permesso UE per soggiornanti di lungo periodo ("Carta di soggiorno")': 'Разрешение ЕС для долгосрочных жителей («Carta di soggiorno»)',
  'Attesa occupazione': 'Ожидание трудоустройства',
  'Cure mediche - donna in stato di gravidanza o con figlio minore di 6 mesi': 'Лечение — беременная женщина или с ребёнком до 6 месяцев',
  'Cure mediche - padre di bambino minore di 6 mesi o che sta per nascere in Italia': 'Лечение — отец ребёнка до 6 месяцев или ожидающего рождения в Италии',
  'Cure mediche dopo ingresso con visto per cure mediche': 'Лечение после въезда по медицинской визе',
  'Cure mediche per persona gravemente malata che si trova già in Italia': 'Лечение для тяжелобольного, уже находящегося в Италии',
  'Minore età (per MSNA)': 'Несовершеннолетие (для MSNA)',
  'Calamità naturale': 'Стихийное бедствие',
  'Integrazione ("Prosieguo amministrativo")': 'Интеграция («Prosieguo amministrativo»)',
  'Sfruttamento lavorativo': 'Трудовая эксплуатация',
  'Residenza elettiva': 'Выборное место жительства',
  'Ricerca scientifica': 'Научное исследование',
  'Motivi religiosi': 'Религиозные мотивы',
  'Attività sportiva': 'Спортивная деятельность',
  'Lavoro artistico': 'Художественная деятельность',
  'Tirocinio': 'Стажировка',
  'Apolidia': 'Безгражданство',
};

// Build a lookup that normalizes smart quotes
const PERMIT_NAME_MAP = {};
for (const [key, value] of Object.entries(_PERMIT_NAME_MAP)) {
  PERMIT_NAME_MAP[key] = value;
  PERMIT_NAME_MAP[normalizeQuotes(key)] = value;
}

function lookupPermitName(tipo) {
  return PERMIT_NAME_MAP[tipo] || PERMIT_NAME_MAP[normalizeQuotes(tipo)] || null;
}

// ─── Q&A Translation Dictionary ──────────────────────────────────────────────
// Common phrases and terms found across permit Q&A content

const PHRASE_MAP = {
  // Standard questions
  "Cos'è questo permesso?": 'Что это за разрешение?',
  "Cos'è questo permesso di soggiorno?": 'Что это за вид на жительство?',
  "Chi può chiederlo?": 'Кто может подать заявление?',
  "Chi può richiederlo?": 'Кто может его запросить?',
  "Come si chiede?": 'Как подать заявление?',
  "Come e dove si chiede?": 'Как и где подать заявление?',
  "Dove si chiede?": 'Где подать заявление?',
  "Come/dove si chiede?": 'Как/где подать заявление?',
  "Che diritti mi dà?": 'Какие права это даёт?',
  "Che diritti dà?": 'Какие права это даёт?',
  "Quanto dura?": 'Какой срок действия?',
  "Quando scade posso rinnovarlo?": 'Можно ли продлить по истечении срока?',
  "Quando scade, posso rinnovarlo?": 'Можно ли продлить по истечении срока?',
  "Si può rinnovare?": 'Можно ли продлить?',
  "Posso convertirlo in un altro permesso?": 'Можно ли конвертировать в другое разрешение?',
  "Posso convertirlo?": 'Можно ли его конвертировать?',
  "Si può convertire?": 'Можно ли его конвертировать?',
  "Si può convertire in un altro permesso?": 'Можно ли конвертировать в другое разрешение?',
  "Quanto costa?": 'Сколько стоит?',
  "Quali documenti servono?": 'Какие документы нужны?',
  "Quali sono i requisiti?": 'Каковы требования?',
  "Cosa succede se scade?": 'Что происходит по истечении срока?',
  "Posso lavorare?": 'Могу ли я работать?',
  "Si può lavorare?": 'Можно ли работать?',
  "Posso lavorare con questo permesso?": 'Могу ли я работать с этим разрешением?',
  "Posso studiare?": 'Могу ли я учиться?',
  "Cosa succede dopo?": 'Что происходит дальше?',
  "Cosa succede alla scadenza?": 'Что происходит по истечении срока?',
  "Come funziona il rinnovo?": 'Как работает продление?',
  "Quanto tempo ci vuole?": 'Сколько времени это занимает?',
  "Dove si presenta la domanda?": 'Где подаётся заявление?',
};

// ─── Common text translation patterns ────────────────────────────────────────

function translateText(text) {
  if (!text || text.trim().length === 0) return text;

  // Check exact match in phrase map first
  const trimmed = text.trim();
  if (PHRASE_MAP[trimmed]) return PHRASE_MAP[trimmed];

  // Check permit name map
  if (PERMIT_NAME_MAP[trimmed]) return PERMIT_NAME_MAP[trimmed];

  // Apply pattern-based translations
  let result = text;

  // Common terms and phrases (order matters — longer patterns first)
  const replacements = [
    // Institutions and procedures
    [/\bquestura\b/gi, 'квестура (questura)'],
    [/\bprefettura\b/gi, 'префектура (prefettura)'],
    [/\bcommissione territoriale\b/gi, 'территориальная комиссия (commissione territoriale)'],
    [/\bsportello unico per l['']immigrazione\b/gi, 'единое окно по иммиграции (sportello unico)'],
    [/\bsportello unico\b/gi, 'единое окно (sportello unico)'],
    [/\bkit postale\b/gi, 'почтовый пакет (kit postale)'],
    [/\bufficio postale\b/gi, 'почтовое отделение (ufficio postale)'],
    [/\bposte italiane\b/gi, 'Poste Italiane'],
    [/\bcomune\b/gi, 'муниципалитет (comune)'],
    [/\btribunale\b/gi, 'суд (tribunale)'],

    // Document types
    [/\bpermesso di soggiorno\b/gi, 'вид на жительство (permesso di soggiorno)'],
    [/\bpermesso\b/gi, 'разрешение (permesso)'],
    [/\bcarta di soggiorno\b/gi, 'вид на жительство (carta di soggiorno)'],
    [/\bnullaosta\b/gi, 'нуллаоста (nullaosta)'],
    [/\bvisto d['']ingresso\b/gi, 'въездная виза (visto d\'ingresso)'],
    [/\bvisto\b/gi, 'виза (visto)'],
    [/\bpassaporto\b/gi, 'паспорт (passaporto)'],
    [/\bcodice fiscale\b/gi, 'налоговый код (codice fiscale)'],
    [/\bmarca da bollo\b/gi, 'гербовая марка (marca da bollo)'],
    [/\bbollettino postale\b/gi, 'почтовый платёж (bollettino postale)'],
    [/\bricevuta\b/gi, 'квитанция (ricevuta)'],
    [/\bcertificato\b/gi, 'свидетельство (certificato)'],
    [/\bdichiarazione\b/gi, 'декларация (dichiarazione)'],
    [/\bmodulo\b/gi, 'бланк (modulo)'],
    [/\bdomanda\b/gi, 'заявление (domanda)'],

    // Legal references
    [/\bdecreto flussi\b/gi, 'квотный указ (decreto flussi)'],
    [/\bflussi\b/gi, 'квоты (flussi)'],
    [/\bricongiungimento familiare\b/gi, 'воссоединение семьи (ricongiungimento familiare)'],
    [/\bcoesione familiare\b/gi, 'семейная сплочённость (coesione familiare)'],
    [/\bprotezione internazionale\b/gi, 'международная защита (protezione internazionale)'],
    [/\bprotezione sussidiaria\b/gi, 'субсидиарная защита (protezione sussidiaria)'],
    [/\bprotezione speciale\b/gi, 'специальная защита (protezione speciale)'],
    [/\bstatus di rifugiato\b/gi, 'статус беженца (status di rifugiato)'],

    // Common verbs/phrases
    [/\bSi può lavorare\b/gi, 'Можно работать'],
    [/\bsi può lavorare\b/gi, 'можно работать'],
    [/\bSi può studiare\b/gi, 'Можно учиться'],
    [/\bsi può studiare\b/gi, 'можно учиться'],
    [/\bSi può convertire\b/gi, 'Можно конвертировать'],
    [/\bsi può convertire\b/gi, 'можно конвертировать'],
    [/\bSi può rinnovare\b/gi, 'Можно продлить'],
    [/\bsi può rinnovare\b/gi, 'можно продлить'],
    [/\bha una durata di\b/gi, 'имеет срок действия'],
    [/\bla durata è di\b/gi, 'срок действия составляет'],
    [/\bè valido per\b/gi, 'действителен в течение'],
    [/\bsì\b/gi, 'да'],
    [/\bno\b/gi, 'нет'],
    [/\banno\b/gi, 'год'],
    [/\banni\b/gi, 'лет'],
    [/\bmese\b/gi, 'месяц'],
    [/\bmesi\b/gi, 'месяцев'],
    [/\bgiorno\b/gi, 'день'],
    [/\bgiorni\b/gi, 'дней'],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

// ─── Notion Helpers ──────────────────────────────────────────────────────────

async function fetchDatabasePages(notion, databaseId) {
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100
    });

    const dbPages = response.results.filter(page =>
      page.parent?.database_id === databaseId ||
      page.parent?.data_source_id === databaseId
    );
    allPages.push(...dbPages);

    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allPages;
}

async function fetchPageBlocks(notion, pageId) {
  const blocks = [];
  let cursor = undefined;

  do {
    await delay(NOTION_DELAY);
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
    });

    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  for (const block of blocks) {
    if (block.has_children) {
      block.children = await fetchPageBlocks(notion, block.id);
    }
  }

  return blocks;
}

// ─── Block Translation ───────────────────────────────────────────────────────

function translateRichTextSegment(segment) {
  const content = segment.plain_text || segment.text?.content || '';
  const translated = translateText(content);

  const result = {
    text: {
      content: translated,
    },
  };

  // Preserve link
  if (segment.href || segment.text?.link) {
    result.text.link = { url: segment.href || segment.text.link.url };
  }

  // Preserve annotations
  const ann = segment.annotations;
  if (ann) {
    const annotations = {};
    if (ann.bold) annotations.bold = true;
    if (ann.italic) annotations.italic = true;
    if (ann.underline) annotations.underline = true;
    if (ann.strikethrough) annotations.strikethrough = true;
    if (ann.code) annotations.code = true;
    if (ann.color && ann.color !== 'default') annotations.color = ann.color;
    if (Object.keys(annotations).length > 0) {
      result.annotations = annotations;
    }
  }

  return result;
}

function translateBlockToCreateFormat(block) {
  const type = block.type;
  const result = {};

  switch (type) {
    case 'paragraph':
      result.paragraph = {
        rich_text: (block.paragraph?.rich_text || []).map(translateRichTextSegment),
      };
      break;

    case 'heading_2':
      result.heading_2 = {
        rich_text: (block.heading_2?.rich_text || []).map(translateRichTextSegment),
      };
      break;

    case 'heading_3':
      result.heading_3 = {
        rich_text: (block.heading_3?.rich_text || []).map(translateRichTextSegment),
      };
      break;

    case 'bulleted_list_item':
      result.bulleted_list_item = {
        rich_text: (block.bulleted_list_item?.rich_text || []).map(translateRichTextSegment),
      };
      if (block.children) {
        result.bulleted_list_item.children = block.children.map(c => translateBlockToCreateFormat(c));
      }
      break;

    case 'numbered_list_item':
      result.numbered_list_item = {
        rich_text: (block.numbered_list_item?.rich_text || []).map(translateRichTextSegment),
      };
      if (block.children) {
        result.numbered_list_item.children = block.children.map(c => translateBlockToCreateFormat(c));
      }
      break;

    case 'divider':
      result.divider = {};
      break;

    case 'quote':
      result.quote = {
        rich_text: (block.quote?.rich_text || []).map(translateRichTextSegment),
      };
      break;

    case 'callout':
      result.callout = {
        rich_text: (block.callout?.rich_text || []).map(translateRichTextSegment),
        icon: block.callout?.icon || undefined,
      };
      break;

    default:
      result.paragraph = { rich_text: [] };
      break;
  }

  return result;
}

function flattenChildrenForWrite(blocks) {
  return blocks.map(block => {
    const type = Object.keys(block).find(k =>
      ['paragraph', 'heading_2', 'heading_3', 'bulleted_list_item',
       'numbered_list_item', 'quote', 'callout', 'divider'].includes(k)
    );

    if (!type) return block;

    const result = { [type]: { ...block[type] } };

    if (block.children) {
      result[type].children = block.children.map(child => {
        return flattenChildrenForWrite([child])[0];
      });
    }

    return result;
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.NOTION_API_KEY) {
    console.error('NOTION_API_KEY not set in .env');
    process.exit(1);
  }

  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  // Step 1: Fetch IT permit pages
  console.log('[RU] Fetching IT permit pages...');
  const itPages = await fetchDatabasePages(notion, IT_DATABASE_ID);
  const validPages = itPages.filter(p => {
    const tipo = p.properties['Nome permesso']?.title?.[0]?.plain_text;
    if (!tipo) return false;
    if (tipo.startsWith('[DUPLICATE]')) return false;
    return true;
  });
  console.log(`[RU] Found ${validPages.length} IT permits`);

  // Step 2: Create RU database
  console.log('[RU] Creating Database RU...');
  await delay(NOTION_DELAY);

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ text: { content: 'Database RU' } }],
    properties: {
      'Name': { title: {} },
    },
  });

  const targetDbId = db.id;
  const targetDataSourceId = db.data_sources?.[0]?.id;
  console.log(`[RU] Created database: ${targetDbId}`);
  console.log(`[RU] Data source ID: ${targetDataSourceId}`);

  // Step 3: Add properties to data source
  if (targetDataSourceId) {
    await delay(NOTION_DELAY);
    await notion.dataSources.update({
      data_source_id: targetDataSourceId,
      properties: {
        'Doc primo rilascio': { multi_select: {} },
        'Doc rinnovo': { multi_select: {} },
        'Mod primo rilascio': { multi_select: {} },
        'Mod rinnovo': { multi_select: {} },
        'Info extra su doc rilascio': { rich_text: {} },
        'IT Page ID': { rich_text: {} },
        'Rinnovo non applicabile': { checkbox: {} },
        'Categoria': { select: {} },
      },
    });
    console.log('[RU] Added properties to data source');
  }

  // Step 4: Process each IT permit
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < validPages.length; i++) {
    const page = validPages[i];
    const tipo = page.properties['Nome permesso']?.title?.[0]?.plain_text;
    const ruName = lookupPermitName(tipo) || tipo;
    const props = page.properties;

    console.log(`\n[RU] (${i + 1}/${validPages.length}) ${tipo} → ${ruName}`);

    try {
      // Build translated properties
      const primoDocNames = (props['Doc primo rilascio']?.multi_select || []).map(d => d.name);
      const rinnovoDocNames = (props['Doc rinnovo']?.multi_select || []).map(d => d.name);
      const primoMethod = props['Mod primo rilascio']?.multi_select?.[0]?.name || null;
      const rinnovoMethod = props['Mod rinnovo']?.multi_select?.[0]?.name || null;
      const notes = (props['Info extra su doc rilascio/rinnovo']?.rich_text || [])
        .map(s => s.plain_text || '').join('');
      const rinnovoNonApplicabile = props['Rinnovo non applicabile']?.checkbox ?? false;
      const categoria = props['Categoria']?.select?.name || null;

      const pageProperties = {
        'Name': {
          title: [{ text: { content: ruName } }],
        },
        'Doc primo rilascio': {
          multi_select: primoDocNames.map(name => ({ name })),
        },
        'Doc rinnovo': {
          multi_select: rinnovoDocNames.map(name => ({ name })),
        },
        'Mod primo rilascio': {
          multi_select: primoMethod ? [{ name: primoMethod }] : [],
        },
        'Mod rinnovo': {
          multi_select: rinnovoMethod ? [{ name: rinnovoMethod }] : [],
        },
        'IT Page ID': {
          rich_text: [{ text: { content: page.id } }],
        },
        'Rinnovo non applicabile': {
          checkbox: rinnovoNonApplicabile,
        },
      };

      if (categoria) {
        pageProperties['Categoria'] = { select: { name: categoria } };
      }

      if (notes) {
        // Notion rich_text content limit is 2000 chars — truncate if needed
        const truncatedNotes = notes.length > 2000 ? notes.substring(0, 1997) + '...' : notes;
        pageProperties['Info extra su doc rilascio'] = {
          rich_text: [{ text: { content: truncatedNotes } }],
        };
      }

      // Create the page
      await delay(NOTION_DELAY);
      const parentId = targetDataSourceId || targetDbId;
      const created = await notion.pages.create({
        parent: targetDataSourceId
          ? { type: 'data_source_id', data_source_id: targetDataSourceId }
          : { type: 'database_id', database_id: targetDbId },
        properties: pageProperties,
      });

      // Fetch IT page blocks (Q&A content)
      const blocks = await fetchPageBlocks(notion, page.id);

      if (blocks.length > 0) {
        // Translate blocks
        const translatedBlocks = blocks.map(b => translateBlockToCreateFormat(b));
        const flatBlocks = flattenChildrenForWrite(translatedBlocks);

        // Write blocks in batches
        for (let j = 0; j < flatBlocks.length; j += MAX_BLOCKS_PER_APPEND) {
          const batch = flatBlocks.slice(j, j + MAX_BLOCKS_PER_APPEND);
          await delay(NOTION_DELAY);
          await notion.blocks.children.append({
            block_id: created.id,
            children: batch,
          });
        }

        console.log(`   ✓ Created with ${blocks.length} blocks`);
      } else {
        console.log(`   ✓ Created (no content blocks)`);
      }

      successCount++;

    } catch (err) {
      console.error(`   ✗ Error: ${err.message}`);
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`[RU] DONE. Database ID: ${targetDbId}`);
  console.log(`[RU] Success: ${successCount}, Errors: ${errorCount}`);
  console.log(`[RU] Total IT permits: ${validPages.length}`);
  console.log('='.repeat(60));

  // Save to .env
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(process.cwd(), '.env');
  fs.appendFileSync(envPath, `\nNOTION_RU_PARENT_PAGE_ID=${PARENT_PAGE_ID}\nNOTION_DATABASE_RU_ID=${targetDbId}\n`);
  console.log(`[RU] Saved NOTION_DATABASE_RU_ID to .env`);

  return targetDbId;
}

main().then(dbId => {
  console.log(`\nFinal Database ID: ${dbId}`);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
