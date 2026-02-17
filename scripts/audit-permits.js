#!/usr/bin/env node
/**
 * Audit all permits in Notion database
 * Generates fresh categorized list of permits needing content
 * Identifies duplicates and backfill candidates
 *
 * Usage: node scripts/audit-permits.js
 * Output: JSON to stdout, redirectable to file
 */

require('dotenv').config();
const { Client } = require("@notionhq/client");

const DATABASE_ID = "3097355e-7f7f-819c-af33-d0fd0739cc5b";
const REFERENCE_PAGE_ID = "2f67355e-7f7f-813a-83f3-d5f229f0ba8c"; // Attesa occupazione

/**
 * Generate URL-friendly slug
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
 * Fetch all permit pages from database
 */
async function fetchPermitData(notion) {
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
      page.parent?.database_id === DATABASE_ID
    );
    allPages.push(...dbPages);

    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allPages.map(page => ({
    id: page.id,
    tipo: page.properties["Nome permesso"]?.title?.[0]?.plain_text || null,
    slug: slugify(page.properties["Nome permesso"]?.title?.[0]?.plain_text || null),
    macrocategoria: page.properties["Macrocategoria"]?.select?.name || null,
    possoLavorare: page.properties["Posso lavorare?"]?.select?.name || null,
    quantoDura: page.properties["Quanto dura?"]?.rich_text?.[0]?.plain_text || null,
    docPrimo: page.properties["Doc primo rilascio"]?.multi_select?.map(d => d.name) || [],
    docRinnovo: page.properties["Doc rinnovo"]?.multi_select?.map(d => d.name) || [],
    modPrimo: page.properties["Mod primo rilascio"]?.multi_select?.[0]?.name || null,
    modRinnovo: page.properties["Mod rinnovo"]?.multi_select?.[0]?.name || null,
    possoConvertire: page.properties["posso convertire?"]?.rich_text?.[0]?.plain_text || null,
    notes: page.properties["NOTES"]?.rich_text?.[0]?.plain_text || null,
    last_edited_time: page.last_edited_time
  }));
}

/**
 * Fetch page blocks to check for content
 */
async function fetchPageBlocks(notion, pageId) {
  const blocks = [];
  let cursor = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
    });

    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return blocks;
}

/**
 * Analyze reference model (Attesa occupazione) structure
 */
async function analyzeReferenceModel(notion) {
  console.error('\n[Analyzing reference model: Attesa occupazione]');

  try {
    const blocks = await fetchPageBlocks(notion, REFERENCE_PAGE_ID);

    const sections = [];
    for (const block of blocks) {
      if (block.type === 'heading_3') {
        const text = block.heading_3?.rich_text?.[0]?.plain_text || '';
        sections.push(text);
      } else if (block.type === 'paragraph') {
        const richText = block.paragraph?.rich_text || [];
        if (richText.length > 0 && richText[0].annotations?.bold) {
          const text = richText[0].plain_text || '';
          if (text.endsWith('?')) {
            sections.push(text);
          }
        }
      }
    }

    console.error(`Found ${sections.length} Q&A sections in reference model:`);
    sections.forEach((s, i) => console.error(`  ${i+1}. ${s}`));

    return {
      page_id: REFERENCE_PAGE_ID,
      total_blocks: blocks.length,
      question_sections: sections,
      block_types: [...new Set(blocks.map(b => b.type))]
    };
  } catch (err) {
    console.error(`Error analyzing reference model: ${err.message}`);
    return null;
  }
}

/**
 * Check for duplicate permit names
 */
function findDuplicates(permits) {
  const nameCount = {};
  const duplicates = [];

  for (const permit of permits) {
    if (!permit.tipo) continue;

    if (!nameCount[permit.tipo]) {
      nameCount[permit.tipo] = [];
    }
    nameCount[permit.tipo].push(permit);
  }

  for (const [name, instances] of Object.entries(nameCount)) {
    if (instances.length > 1) {
      duplicates.push({
        name,
        instances: instances.map(p => ({
          id: p.id,
          slug: p.slug,
          macrocategoria: p.macrocategoria,
          last_edited: p.last_edited_time
        }))
      });
    }
  }

  return duplicates;
}

/**
 * Categorize permits by content status
 */
async function categorizePermits(notion, permits) {
  const categories = {
    protezione: [],
    lavoro: [],
    'cure mediche': [],
    'motivi familiari': [],
    altro: []
  };

  const blank = [];
  const hasContent = [];
  const noName = [];

  console.error('\n[Checking content status...]');

  let count = 0;
  for (const permit of permits) {
    count++;

    if (!permit.tipo) {
      noName.push(permit);
      console.error(`  ${count}/${permits.length} - [NO NAME] ID: ${permit.id}`);
      continue;
    }

    if (count % 10 === 0) {
      console.error(`  ${count}/${permits.length} - ${permit.tipo}`);
    }

    try {
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 350));

      const blocks = await fetchPageBlocks(notion, permit.id);
      const hasBlocks = blocks && blocks.length > 0;

      const status = {
        ...permit,
        hasBlocks,
        blockCount: blocks.length
      };

      if (hasBlocks) {
        hasContent.push(status);
      } else {
        blank.push(status);
      }

      // Add to category
      const cat = permit.macrocategoria?.toLowerCase() || 'altro';
      if (categories[cat]) {
        categories[cat].push(status);
      } else {
        categories.altro.push(status);
      }

    } catch (err) {
      console.error(`  Error checking ${permit.tipo}: ${err.message}`);
      blank.push({ ...permit, hasBlocks: false, blockCount: 0, error: err.message });
    }
  }

  return { categories, blank, hasContent, noName };
}

/**
 * Main audit function
 */
async function main() {
  if (!process.env.NOTION_API_KEY) {
    console.error('ERROR: NOTION_API_KEY not set');
    process.exit(1);
  }

  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  console.error('=== PERMIT DATABASE AUDIT ===');
  console.error(`Database ID: ${DATABASE_ID}`);
  console.error(`Date: ${new Date().toISOString()}`);

  // Step 1: Analyze reference model
  const referenceModel = await analyzeReferenceModel(notion);

  // Step 2: Fetch all permits
  console.error('\n[Fetching all permits from database...]');
  const permits = await fetchPermitData(notion);
  console.error(`Found ${permits.length} total permit entries`);

  // Step 3: Find duplicates
  console.error('\n[Checking for duplicates...]');
  const duplicates = findDuplicates(permits);
  console.error(`Found ${duplicates.length} duplicate permit names`);
  if (duplicates.length > 0) {
    duplicates.forEach(d => {
      console.error(`  - "${d.name}" (${d.instances.length} instances)`);
      d.instances.forEach(inst => {
        console.error(`    ID: ${inst.id} | Category: ${inst.macrocategoria} | Edited: ${inst.last_edited}`);
      });
    });
  }

  // Step 4: Categorize by content status
  const { categories, blank, hasContent, noName } = await categorizePermits(notion, permits);

  console.error('\n[SUMMARY]');
  console.error(`Total permits: ${permits.length}`);
  console.error(`With content: ${hasContent.length}`);
  console.error(`Blank (no blocks): ${blank.length}`);
  console.error(`No name (unknown): ${noName.length}`);
  console.error('\nBy Macrocategoria:');
  for (const [cat, perms] of Object.entries(categories)) {
    const blankInCat = perms.filter(p => !p.hasBlocks).length;
    console.error(`  ${cat}: ${perms.length} total (${blankInCat} blank)`);
  }

  // Output JSON to stdout
  const result = {
    audit_date: new Date().toISOString(),
    database_id: DATABASE_ID,
    reference_model: referenceModel,
    summary: {
      total: permits.length,
      has_content: hasContent.length,
      blank: blank.length,
      no_name: noName.length
    },
    duplicates,
    permits_by_category: categories,
    blank_permits: blank.map(p => ({
      id: p.id,
      tipo: p.tipo,
      slug: p.slug,
      macrocategoria: p.macrocategoria,
      blockCount: p.blockCount,
      docPrimo: p.docPrimo,
      docRinnovo: p.docRinnovo,
      notes: p.notes ? p.notes.substring(0, 100) : null
    })),
    has_content_permits: hasContent.map(p => ({
      id: p.id,
      tipo: p.tipo,
      slug: p.slug,
      macrocategoria: p.macrocategoria,
      blockCount: p.blockCount
    })),
    no_name_permits: noName
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
