#!/usr/bin/env node
/**
 * Populate Q&A content for blank lavoro permits in Notion.
 * Phase 43-03: 5 permits to fill.
 */
require('dotenv').config();
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const SITE = 'https://www.sospermesso.it';

async function writeBlocks(pageId, blocks) {
  // Delete existing blocks first
  const existing = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  for (const block of existing.results) {
    await notion.blocks.delete({ block_id: block.id });
    await sleep(200);
  }

  await notion.blocks.children.append({ block_id: pageId, children: blocks });

  // Verify
  const result = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  return result.results.length;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function bold(text) { return { text: { content: text }, annotations: { bold: true } }; }
function plain(text) { return { text: { content: text } }; }
function link(text, url) { return { text: { content: text, link: { url } }, annotations: { bold: true } }; }

function p(parts) { return { paragraph: { rich_text: Array.isArray(parts) ? parts : [parts] } }; }
function bullet(parts) { return { bulleted_list_item: { rich_text: Array.isArray(parts) ? parts : [parts] } }; }
function empty() { return p([]); }

function docLinks(slug) {
  return [
    p([plain('👉 '), link('Vedi la lista dei documenti per il primo rilascio', `${SITE}/documenti-${slug}-primo.html`)]),
    p([plain('👉 '), link('Vedi la lista dei documenti per il rinnovo', `${SITE}/documenti-${slug}-rinnovo.html`)]),
  ];
}

const permits = [
  {
    id: '2dc7355e-7f7f-80d8-b0a5-c82c9b24043c',
    name: 'Attività sportiva (art.27)',
    slug: 'attivita-sportiva-art-27',
    blocks: [
      p(bold("Che cos'è questo permesso?")),
      p(plain("Il permesso di soggiorno per attività sportiva ti permette di restare in Italia per svolgere un'attività sportiva professionistica o dilettantistica. È riservato a sportivi stranieri che hanno un contratto con una società sportiva italiana e l'autorizzazione del CONI (Comitato Olimpico Nazionale Italiano).")),
      empty(),

      p(bold("Chi può chiederlo?")),
      p(plain("Puoi chiedere questo permesso se:")),
      bullet(plain("Hai un contratto con una società sportiva italiana")),
      bullet(plain("Hai ottenuto la dichiarazione nominativa di assenso del CONI")),
      bullet(plain("Sei entrato in Italia con un visto per attività sportiva")),
      empty(),

      p(bold("Come si chiede questo permesso?")),
      p(plain("Si chiede con il kit postale, sia per il primo rilascio che per il rinnovo.")),
      // doc links inserted below
      empty(),

      p(bold("Che diritti mi dà? A cosa ho accesso?")),
      p(plain("Con questo permesso puoi:")),
      bullet([bold("Svolgere l'attività sportiva per cui hai il contratto")]),
      bullet([bold("Iscriverti al Servizio Sanitario Nazionale (SSN)")]),
      bullet(plain("Chiedere la residenza")),
      p(plain("⚠️ Attenzione: questo permesso ti permette di lavorare solo nell'ambito sportivo per cui è stato rilasciato.")),
      empty(),

      p(bold("Quanto dura questo permesso?")),
      p(plain("Il permesso dura quanto il tuo contratto sportivo, fino a un massimo di 2 anni. Puoi rinnovarlo se il contratto viene rinnovato.")),
      empty(),

      p(bold("Quando scade posso rinnovarlo?")),
      p(plain("Sì, puoi rinnovarlo con il kit postale prima della scadenza, presentando il nuovo contratto sportivo e la conferma del CONI.")),
      empty(),

      p(bold("Posso convertirlo in un altro permesso?")),
      p(plain("Sì, puoi convertirlo in un permesso per motivi di lavoro subordinato.")),
      empty(),

      p(bold("Quanto costa?")),
      p(plain("Il costo totale è circa 126,46€:")),
      bullet(plain("80,46€ per il bollettino postale (include il costo del permesso elettronico)")),
      bullet(plain("30€ per spedire il kit postale")),
      bullet(plain("16€ per la marca da bollo")),
    ]
  },
  {
    id: '1ad7355e-7f7f-8067-ad48-ef7ac7a43a83',
    name: 'Ricerca scientifica (art.27ter)',
    slug: 'ricerca-scientifica-art-27ter',
    blocks: [
      p(bold("Che cos'è questo permesso?")),
      p(plain("Il permesso di soggiorno per ricerca scientifica ti permette di restare in Italia per svolgere attività di ricerca presso un'università, un ente di ricerca o un altro istituto riconosciuto. È previsto dall'articolo 27-ter del Testo Unico sull'immigrazione.")),
      empty(),

      p(bold("Chi può chiederlo?")),
      p(plain("Puoi chiedere questo permesso se:")),
      bullet(plain("Hai una convenzione di accoglienza con un istituto di ricerca italiano riconosciuto dal Ministero")),
      bullet(plain("Sei in possesso di un titolo di studio che ti permette di accedere a programmi di dottorato (di solito una laurea magistrale o equivalente)")),
      bullet(plain("Sei entrato in Italia con un visto per ricerca scientifica")),
      empty(),

      p(bold("Come si chiede questo permesso?")),
      p(plain("Si chiede con il kit postale.")),
      // doc links inserted below
      empty(),

      p(bold("Che diritti mi dà? A cosa ho accesso?")),
      p(plain("Con questo permesso puoi:")),
      bullet([bold("Lavorare come ricercatore presso l'istituto indicato nella convenzione")]),
      bullet([bold("Iscriverti al Servizio Sanitario Nazionale (SSN)")]),
      bullet(plain("Chiedere la residenza")),
      bullet(plain("Svolgere attività di insegnamento collegata alla ricerca")),
      empty(),

      p(bold("Quanto dura questo permesso?")),
      p(plain("Il permesso dura quanto la convenzione di accoglienza. Generalmente da 1 a 2 anni, rinnovabile.")),
      empty(),

      p(bold("Quando scade posso rinnovarlo?")),
      p(plain("Sì, puoi rinnovarlo se la convenzione di accoglienza viene rinnovata o prorogata. Manda la domanda con il kit postale prima della scadenza.")),
      empty(),

      p(bold("Quanto costa?")),
      p(plain("Il costo totale è circa 126,46€:")),
      bullet(plain("80,46€ per il bollettino postale (include il costo del permesso elettronico)")),
      bullet(plain("30€ per spedire il kit postale")),
      bullet(plain("16€ per la marca da bollo")),
    ]
  },
  {
    id: '1ad7355e-7f7f-805b-ba6b-dbff5529fc7f',
    name: 'Lavoro artistico',
    slug: 'lavoro-artistico',
    blocks: [
      p(bold("Che cos'è questo permesso?")),
      p(plain("Il permesso di soggiorno per lavoro artistico ti permette di restare in Italia per svolgere un'attività artistica o nello spettacolo. Copre musicisti, attori, ballerini, artisti circensi e altre professioni artistiche.")),
      empty(),

      p(bold("Chi può chiederlo?")),
      p(plain("Puoi chiedere questo permesso se:")),
      bullet(plain("Hai un contratto di lavoro o un ingaggio per un'attività artistica in Italia")),
      bullet(plain("Sei entrato in Italia con un visto per lavoro artistico")),
      bullet(plain("Il tuo datore di lavoro o committente ha ottenuto l'autorizzazione necessaria")),
      empty(),

      p(bold("Come si chiede questo permesso?")),
      p(plain("Si chiede con il kit postale.")),
      // doc links inserted below
      empty(),

      p(bold("Che diritti mi dà? A cosa ho accesso?")),
      p(plain("Con questo permesso puoi:")),
      bullet([bold("Lavorare nell'ambito artistico e dello spettacolo")]),
      bullet([bold("Iscriverti al Servizio Sanitario Nazionale (SSN)")]),
      bullet(plain("Chiedere la residenza")),
      empty(),

      p(bold("Quanto dura questo permesso?")),
      p(plain("Il permesso dura quanto il tuo contratto o ingaggio, fino a un massimo di 2 anni.")),
      empty(),

      p(bold("Quando scade posso rinnovarlo?")),
      p(plain("Sì, puoi rinnovarlo se hai un nuovo contratto o ingaggio. Manda la domanda con il kit postale prima della scadenza.")),
      empty(),

      p(bold("Quanto costa?")),
      p(plain("Il costo totale è circa 126,46€:")),
      bullet(plain("80,46€ per il bollettino postale (include il costo del permesso elettronico)")),
      bullet(plain("30€ per spedire il kit postale")),
      bullet(plain("16€ per la marca da bollo")),
    ]
  },
  {
    id: '1ad7355e-7f7f-8054-a4a1-e9f4a31686d4',
    name: 'Lavoro subordinato a seguito di sanatoria',
    slug: 'lavoro-subordinato-a-seguito-di-sanatoria',
    blocks: [
      p(bold("Che cos'è questo permesso?")),
      p(plain("Il permesso di soggiorno per lavoro subordinato a seguito di sanatoria (o \"emersione\") ti viene dato se il tuo datore di lavoro ha presentato domanda durante un decreto di regolarizzazione (sanatoria) e la domanda è stata accettata. È un permesso per lavoro dipendente, uguale a quello ottenuto con i flussi, ma con un percorso di ingresso diverso.")),
      empty(),

      p(bold("Chi può chiederlo?")),
      p(plain("Puoi avere questo permesso se:")),
      bullet(plain("Il tuo datore di lavoro ha presentato domanda di emersione durante una sanatoria")),
      bullet(plain("La domanda è stata accettata dalla Prefettura")),
      bullet(plain("Hai firmato il contratto di soggiorno")),
      empty(),

      p(bold("Come si chiede questo permesso?")),
      p(plain("Si chiede con il kit postale, sia per il primo rilascio che per il rinnovo.")),
      // doc links inserted below
      empty(),

      p(bold("Che diritti mi dà? A cosa ho accesso?")),
      p(plain("Con questo permesso puoi:")),
      bullet([bold("Lavorare come dipendente (lavoro subordinato)")]),
      bullet([bold("Iscriverti al Servizio Sanitario Nazionale (SSN)")]),
      bullet(plain("Chiedere la residenza")),
      bullet(plain("Chiedere il ricongiungimento familiare")),
      empty(),

      p(bold("Quanto dura questo permesso?")),
      p(plain("Il permesso ha la stessa durata del contratto di lavoro, fino a un massimo di 2 anni. Puoi rinnovarlo se hai ancora un contratto di lavoro.")),
      empty(),

      p(bold("Quando scade posso rinnovarlo?")),
      p(plain("Sì, puoi rinnovarlo con il kit postale prima della scadenza. Al rinnovo funziona come un normale permesso per lavoro subordinato: devi presentare il contratto di lavoro e le prove di reddito.")),
      empty(),

      p(bold("Quanto costa?")),
      p(plain("Il costo totale è circa 116,46€ o 126,46€ (dipende dalla durata del permesso):")),
      bullet(plain("70,46€ o 80,46€ per il bollettino postale (include il costo del permesso elettronico)")),
      bullet(plain("30€ per spedire il kit postale")),
      bullet(plain("16€ per la marca da bollo")),
    ]
  },
  {
    id: '1ad7355e-7f7f-80b1-bf0e-ced1be3cd742',
    name: 'Tirocinio',
    slug: 'tirocinio',
    blocks: [
      p(bold("Che cos'è questo permesso?")),
      p(plain("Il permesso di soggiorno per tirocinio (stage) ti permette di restare in Italia per svolgere un tirocinio formativo presso un'azienda o un ente. È un permesso temporaneo legato alla durata del tirocinio.")),
      empty(),

      p(bold("Chi può chiederlo?")),
      p(plain("Puoi chiedere questo permesso se:")),
      bullet(plain("Hai una convenzione di tirocinio tra un ente promotore (università, centro per l'impiego, ecc.) e l'azienda ospitante")),
      bullet(plain("Sei entrato in Italia con un visto per tirocinio")),
      empty(),

      p(bold("Come si chiede questo permesso?")),
      p(plain("Si chiede con il kit postale.")),
      // doc links inserted below
      empty(),

      p(bold("Che diritti mi dà? A cosa ho accesso?")),
      p(plain("Con questo permesso puoi:")),
      bullet([bold("Svolgere il tirocinio presso l'azienda ospitante")]),
      bullet([bold("Iscriverti al Servizio Sanitario Nazionale (SSN)")]),
      bullet(plain("Chiedere la residenza")),
      p(plain("⚠️ Attenzione: il tirocinio non è un rapporto di lavoro. Non puoi lavorare al di fuori del tirocinio con questo permesso.")),
      empty(),

      p(bold("Quanto dura questo permesso?")),
      p(plain("Il permesso dura quanto il tirocinio, di solito da 3 a 12 mesi. Non può essere rinnovato come tale.")),
      empty(),

      p(bold("Quando scade posso rinnovarlo?")),
      p(plain("No, il permesso per tirocinio non si rinnova direttamente. Quando scade, devi convertirlo in un altro tipo di permesso (per esempio lavoro subordinato) oppure lasciare l'Italia.")),
      empty(),

      p(bold("Quanto costa?")),
      p(plain("Il costo totale è circa 116,46€:")),
      bullet(plain("70,46€ per il bollettino postale (include il costo del permesso elettronico)")),
      bullet(plain("30€ per spedire il kit postale")),
      bullet(plain("16€ per la marca da bollo")),
    ]
  }
];

async function main() {
  for (const permit of permits) {
    console.error(`\nProcessing: ${permit.name}`);

    // Insert doc links after "Come si chiede" section
    const blocks = [...permit.blocks];
    // Find the position after the "Come si chiede" answer and insert doc links
    const comeIdx = blocks.findIndex((b, i) =>
      i > 0 && blocks[i-1]?.paragraph?.rich_text?.[0]?.text?.content?.includes('kit postale') &&
      blocks[i-1]?.paragraph?.rich_text?.[0]?.annotations?.bold !== true
    );

    if (comeIdx !== -1) {
      const links = docLinks(permit.slug);
      blocks.splice(comeIdx, 0, ...links);
    } else {
      // Fallback: find empty after "Come si chiede" block
      let insertAfter = -1;
      for (let i = 0; i < blocks.length; i++) {
        const rt = blocks[i]?.paragraph?.rich_text;
        if (rt && rt.length > 0 && rt[0]?.text?.content?.includes('kit postale') && !rt[0]?.annotations?.bold) {
          insertAfter = i + 1;
          break;
        }
      }
      if (insertAfter > 0) {
        const links = docLinks(permit.slug);
        blocks.splice(insertAfter, 0, ...links);
      }
    }

    try {
      const count = await writeBlocks(permit.id, blocks);
      console.error(`  ✓ Written ${count} blocks`);
      await sleep(500);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  console.log('Done! All lavoro permits populated.');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
