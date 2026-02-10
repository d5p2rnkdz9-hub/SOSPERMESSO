// Netlify Function v2.0 - Vote on Prassi Locali
// Increments vote counts in Notion (Confermo/Non Confermo)
// Client-side localStorage prevents duplicate votes (no server-side rate limiting in MVP)

import { Client } from "@notionhq/client";

export default async (req, context) => {
  // CORS headers for all responses
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    // Parse request body
    const { id, voteType } = await req.json();

    // Validate input
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return new Response(JSON.stringify({ error: 'ID mancante' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!voteType || !['confermo', 'non_confermo'].includes(voteType)) {
      return new Response(JSON.stringify({ error: 'Tipo voto non valido' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Initialize Notion client
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // Determine which property to increment
    const property = voteType === 'confermo' ? 'Voti Confermo' : 'Voti Non Confermo';

    // Fetch current page to get current vote count
    const page = await notion.pages.retrieve({ page_id: id });

    if (!page) {
      return new Response(JSON.stringify({ error: 'Prassi non trovata' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const currentCount = page.properties[property]?.number || 0;
    const newCount = currentCount + 1;

    // Update vote count
    await notion.pages.update({
      page_id: id,
      properties: {
        [property]: { number: newCount }
      }
    });

    console.log(`[vote-prassi] Voted ${voteType} on ${id}, new count: ${newCount}`);

    return new Response(JSON.stringify({
      success: true,
      newCount,
      voteType
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('[vote-prassi] Error:', error);

    // Handle Notion API errors (e.g., invalid page ID)
    if (error.code === 'object_not_found') {
      return new Response(JSON.stringify({
        error: 'Prassi non trovata'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({
      error: 'Errore durante il voto. Riprova più tardi.'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
