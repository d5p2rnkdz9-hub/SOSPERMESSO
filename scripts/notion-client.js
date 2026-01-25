/**
 * Notion API client for fetching permit document data
 * Database ID: 1ad7355e-7f7f-80bc-b445-000b881c6c80
 */
const { Client } = require("@notionhq/client");
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = "1ad7355e7f7f80bcb445000b881c6c80";

/**
 * Fetch all permit data from Notion database
 * @returns {Promise<Array>} Array of permit objects with document lists
 */
async function fetchPermitData() {
  const response = await notion.databases.query({
    database_id: DATABASE_ID
  });

  return response.results.map(page => ({
    id: page.id,
    tipo: page.properties.Tipo?.select?.name || null,
    slug: page.properties.Slug?.rich_text?.[0]?.plain_text || null,
    primoDocuments: page.properties["Doc primo rilascio"]?.multi_select?.map(d => d.name) || [],
    rinnovoDocuments: page.properties["Doc rinnovo"]?.multi_select?.map(d => d.name) || [],
    primoMethod: page.properties["Mod primo rilascio"]?.select?.name || null,
    rinnovoMethod: page.properties["Mod rinnovo"]?.select?.name || null,
  }));
}

/**
 * Test connection to Notion API
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection() {
  try {
    const response = await notion.databases.retrieve({
      database_id: DATABASE_ID
    });
    console.log(`Connected to Notion database: ${response.title[0]?.plain_text || 'Untitled'}`);
    return true;
  } catch (error) {
    console.error(`Notion connection failed: ${error.message}`);
    return false;
  }
}

module.exports = { fetchPermitData, testConnection, DATABASE_ID };
