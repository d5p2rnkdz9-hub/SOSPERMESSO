// Netlify Function v2.0 - Submit Prassi Locali to Notion
// Accepts form submissions and creates Notion pages with Status=Pending

import { Client } from "@notionhq/client";

// 105 Italian questura cities (provincial capitals)
const QUESTURA_CITIES = [
  "Agrigento", "Alessandria", "Ancona", "Aosta", "Arezzo", "Ascoli Piceno",
  "Asti", "Avellino", "Bari", "Barletta-Andria-Trani", "Belluno", "Benevento",
  "Bergamo", "Biella", "Bologna", "Bolzano", "Brescia", "Brindisi",
  "Cagliari", "Caltanissetta", "Campobasso", "Caserta", "Catania", "Catanzaro",
  "Chieti", "Como", "Cosenza", "Cremona", "Crotone", "Cuneo",
  "Enna", "Fermo", "Ferrara", "Firenze", "Foggia", "Forlì-Cesena",
  "Frosinone", "Genova", "Gorizia", "Grosseto", "Imperia", "Isernia",
  "L'Aquila", "La Spezia", "Latina", "Lecce", "Lecco", "Livorno",
  "Lodi", "Lucca", "Macerata", "Mantova", "Massa-Carrara", "Matera",
  "Messina", "Milano", "Modena", "Monza e Brianza", "Napoli", "Novara",
  "Nuoro", "Oristano", "Padova", "Palermo", "Parma", "Pavia",
  "Perugia", "Pesaro e Urbino", "Pescara", "Piacenza", "Pisa", "Pistoia",
  "Pordenone", "Potenza", "Prato", "Ragusa", "Ravenna", "Reggio Calabria",
  "Reggio Emilia", "Rieti", "Rimini", "Roma", "Rovigo", "Salerno",
  "Sassari", "Savona", "Siena", "Siracusa", "Sondrio", "Sud Sardegna",
  "Taranto", "Teramo", "Terni", "Torino", "Trapani", "Trento",
  "Treviso", "Trieste", "Udine", "Varese", "Venezia", "Verbano-Cusio-Ossola",
  "Vercelli", "Verona", "Vibo Valentia", "Vicenza", "Viterbo"
];

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
    const { city, description, date, category, pageUrl, pageSlug } = await req.json();

    // Validate required fields
    if (!city || typeof city !== 'string' || city.trim() === '') {
      return new Response(JSON.stringify({ error: 'Città è obbligatoria' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!description || typeof description !== 'string' || description.trim().length < 20) {
      return new Response(JSON.stringify({ error: 'Descrizione deve essere almeno 20 caratteri' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate city against questura list
    if (!QUESTURA_CITIES.includes(city.trim())) {
      return new Response(JSON.stringify({ error: 'Città non valida. Seleziona dalla lista.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Initialize Notion client
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // Create Notion page in Prassi database
    const response = await notion.pages.create({
      parent: { database_id: process.env.PRASSI_DB_ID },
      properties: {
        "Citta": {
          title: [{ text: { content: city.trim() } }]
        },
        "Descrizione": {
          rich_text: [{ text: { content: description.trim() } }]
        },
        "Data esperienza": {
          date: date ? { start: date } : null
        },
        "Categoria": {
          rich_text: category && category.trim() !== ''
            ? [{ text: { content: category.trim() } }]
            : []
        },
        "Pagina": {
          url: pageUrl || null
        },
        "Slug pagina": {
          rich_text: pageSlug
            ? [{ text: { content: pageSlug } }]
            : []
        },
        "Status": {
          select: { name: "Pending" }
        },
        "Voti Confermo": {
          number: 0
        },
        "Voti Non Confermo": {
          number: 0
        }
      }
    });

    console.log(`[submit-prassi] Created submission: ${response.id} for ${city}`);

    return new Response(JSON.stringify({
      success: true,
      id: response.id
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('[submit-prassi] Error:', error);

    return new Response(JSON.stringify({
      error: 'Errore durante l\'invio. Riprova più tardi.'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
