require('dotenv').config();
const { Client } = require('@notionhq/client');

async function inspectDatabase() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const DATABASE_ID = '3097355e-7f7f-819c-af33-d0fd0739cc5b';

  // Search for one page from this database
  const response = await notion.search({
    filter: { property: 'object', value: 'page' },
    page_size: 100
  });

  const page = response.results.find(p =>
    p.parent?.database_id === DATABASE_ID ||
    p.parent?.data_source_id === DATABASE_ID
  );

  if (!page) {
    console.log('No page found from this database');
    return;
  }

  console.log('=== All properties with types ===');
  const props = Object.keys(page.properties).sort();

  for (const propName of props) {
    const prop = page.properties[propName];
    console.log(`\n${propName}`);
    console.log(`  Type: ${prop.type}`);

    // Show value for relevant types
    if (prop.type === 'number') {
      console.log(`  Value: ${prop.number}`);
    } else if (prop.type === 'checkbox') {
      console.log(`  Value: ${prop.checkbox}`);
    } else if (prop.type === 'select') {
      console.log(`  Value: ${prop.select?.name || 'null'}`);
    } else if (prop.type === 'rich_text') {
      console.log(`  Value: ${prop.rich_text?.[0]?.plain_text || ''}`);
    } else if (prop.type === 'multi_select') {
      console.log(`  Value: ${prop.multi_select?.map(s => s.name).join(', ') || 'none'}`);
    }
  }
}

inspectDatabase().catch(console.error);
