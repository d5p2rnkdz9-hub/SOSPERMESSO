require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Permit data with Q&A content
const permits = [
  {
    name: "Figlio minore di più di 14 anni che vive con i genitori",
    pageId: "3067355e-7f7f-80ad-b6a1-cebacca743f2",
    content: [
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Che cos'è questo permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "È un permesso di soggiorno che viene rilasciato ai figli minori di genitori stranieri regolarmente soggiornanti in Italia. Questo permesso è necessario quando il figlio ha più di 14 anni e deve avere un proprio documento di soggiorno separato da quello dei genitori." }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Chi può chiederlo?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Può chiederlo:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Il figlio minorenne (sopra i 14 anni) di genitori stranieri con permesso di soggiorno" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Il genitore può richiedere il permesso per conto del figlio minore" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Il figlio deve vivere con almeno uno dei genitori in Italia" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Come/dove si chiede?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Il permesso si richiede:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Tramite KIT postale presso gli uffici postali (Poste Italiane)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Oppure direttamente in Questura, se richiesto" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Il genitore presenta la domanda per conto del minore" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Che diritti mi dà? A cosa ho accesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Con questo permesso puoi:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Vivere regolarmente in Italia con i tuoi genitori" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Accedere al sistema scolastico italiano (iscrizione a scuola)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Iscriverti al Servizio Sanitario Nazionale (SSN)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Viaggiare all'interno dell'Italia e nello spazio Schengen (con condizioni)" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Quanto dura questo permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "La durata del permesso segue quella del permesso di soggiorno dei genitori. Normalmente è valido fino al compimento dei 18 anni del minore, dopodiché sarà necessario richiedere un permesso di soggiorno diverso (ad esempio per studio o per lavoro)." }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Quando scade posso rinnovarlo?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Sì, puoi rinnovarlo finché rimani minorenne e continui a vivere con i tuoi genitori in Italia. Il rinnovo segue le stesse modalità della prima richiesta (KIT postale o Questura). Quando compirai 18 anni, dovrai convertire il permesso in un altro tipo (studio, lavoro, motivi familiari, etc.)." }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Posso convertirlo in un altro permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Sì, al compimento dei 18 anni puoi convertire questo permesso in:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso per studio (se sei iscritto a un percorso scolastico o universitario)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso per lavoro (se hai un contratto di lavoro)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso per motivi familiari (se continui a vivere con i genitori)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso UE per soggiornanti di lungo periodo (se hai i requisiti)" }
          }]
        }
      }
    ]
  },
  {
    name: "Residenza elettiva",
    pageId: "2e77355e-7f7f-8058-beb5-cfcc98c6d2fe",
    content: [
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Che cos'è questo permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Il permesso di soggiorno per residenza elettiva è destinato a cittadini stranieri che desiderano vivere stabilmente in Italia senza svolgere attività lavorativa. È pensato per persone economicamente indipendenti che hanno risorse sufficienti per mantenersi senza lavorare, come pensionati stranieri o persone con rendite." }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Chi può chiederlo?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Può chiedere questo permesso chi:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Ha risorse economiche stabili e documentabili per mantenersi in Italia senza lavorare" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Ha un'abitazione idonea in Italia (di proprietà o in affitto)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Ha un'assicurazione sanitaria valida in Italia" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Non intende svolgere attività lavorativa in Italia (subordinata o autonoma)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "È già entrato in Italia con un visto per residenza elettiva" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Come/dove si chiede?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Prima di entrare in Italia:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Devi richiedere un visto per residenza elettiva presso il Consolato italiano nel tuo Paese" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Una volta in Italia:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Entro 8 giorni lavorativi dall'ingresso, richiedi il permesso di soggiorno tramite KIT postale (Poste Italiane)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Oppure direttamente in Questura, se richiesto" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Per i documenti necessari, vedi la pagina dedicata: " }
          }, {
            type: "text",
            text: { content: "https://www.sospermesso.it/documenti-residenza-elettiva-primo.html" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Che diritti mi dà? A cosa ho accesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Con questo permesso:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Puoi vivere stabilmente in Italia" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Puoi viaggiare liberamente nello spazio Schengen (con condizioni)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Puoi accedere ai servizi sanitari se hai un'assicurazione sanitaria" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "NON puoi lavorare (né come dipendente né come autonomo)" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "⚠️ Attenzione: questo permesso non consente di svolgere alcun tipo di attività lavorativa in Italia." },
            annotations: { bold: false }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Quanto dura questo permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Il primo permesso di soggiorno per residenza elettiva ha una durata variabile, solitamente 1 anno. Può essere rinnovato se continui a soddisfare i requisiti economici e di alloggio." }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Quando scade posso rinnovarlo?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Sì, puoi rinnovarlo se:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Hai ancora risorse economiche sufficienti per mantenerti" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Hai ancora un'abitazione idonea in Italia" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Hai un'assicurazione sanitaria valida" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Non hai svolto attività lavorativa non autorizzata" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Per i documenti necessari per il rinnovo, vedi: " }
          }, {
            type: "text",
            text: { content: "https://www.sospermesso.it/documenti-residenza-elettiva-rinnovo.html" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Posso convertirlo in un altro permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "La conversione in altri permessi di soggiorno è possibile solo in casi specifici, ad esempio:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso per lavoro subordinato (se ottieni un contratto di lavoro e ci sono quote disponibili)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso per motivi familiari (se hai un coniuge o familiare italiano/straniero regolare)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso UE per soggiornanti di lungo periodo (se hai i requisiti di reddito e residenza)" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "La conversione richiede sempre la verifica dei requisiti specifici del nuovo permesso." }
          }]
        }
      }
    ]
  },
  {
    name: "Motivi religiosi",
    pageId: "2e77355e-7f7f-80f7-897e-d212e47bf04b",
    content: [
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Che cos'è questo permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Il permesso di soggiorno per motivi religiosi è destinato a ministri di culto, religiosi, missionari e altre figure che svolgono attività religiose in Italia per conto di confessioni religiose riconosciute. Consente di svolgere attività legate al proprio ministero religioso." }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Chi può chiederlo?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Può chiedere questo permesso chi:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "È un ministro di culto (sacerdote, pastore, imam, rabbino, monaco, etc.)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "È un membro di un ordine religioso o congregazione" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Svolge attività religiose per conto di una confessione religiosa riconosciuta in Italia" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Ha ricevuto un incarico ufficiale dalla propria organizzazione religiosa" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "È entrato in Italia con un visto per motivi religiosi" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Come/dove si chiede?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Prima di entrare in Italia:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Devi richiedere un visto per motivi religiosi presso il Consolato italiano nel tuo Paese" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Una volta in Italia:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Entro 8 giorni lavorativi dall'ingresso, richiedi il permesso di soggiorno tramite KIT postale (Poste Italiane)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Oppure direttamente in Questura, se richiesto" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Per i documenti necessari, vedi la pagina dedicata: " }
          }, {
            type: "text",
            text: { content: "https://www.sospermesso.it/documenti-motivi-religiosi-primo.html" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Che diritti mi dà? A cosa ho accesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Con questo permesso:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Puoi svolgere attività religiose e ministeriali in Italia" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Puoi celebrare riti, cerimonie e funzioni religiose" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Puoi svolgere attività di formazione religiosa e catechesi" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Puoi accedere ai servizi sanitari se hai un'assicurazione sanitaria" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "NON puoi svolgere attività lavorative diverse da quelle religiose" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "⚠️ Attenzione: puoi svolgere solo le attività religiose previste dal tuo incarico, non altre forme di lavoro." },
            annotations: { bold: false }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Quanto dura questo permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Il permesso di soggiorno per motivi religiosi ha una durata variabile, solitamente 1 o 2 anni, a seconda della durata dell'incarico religioso. Può essere rinnovato se l'incarico continua." }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Quando scade posso rinnovarlo?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Sì, puoi rinnovarlo se:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Il tuo incarico religioso è ancora in corso" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "La tua organizzazione religiosa conferma la continuazione della missione" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Hai mezzi di sostentamento adeguati (forniti dall'organizzazione religiosa)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Hai un'assicurazione sanitaria valida" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Per i documenti necessari per il rinnovo, vedi: " }
          }, {
            type: "text",
            text: { content: "https://www.sospermesso.it/documenti-motivi-religiosi-rinnovo.html" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Posso convertirlo in un altro permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "La conversione in altri permessi di soggiorno è possibile in casi specifici:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso per lavoro subordinato (se ottieni un contratto di lavoro e ci sono quote disponibili)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso per motivi familiari (se hai un coniuge o familiare italiano/straniero regolare)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso per studio (se ti iscrivi a un percorso di formazione)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Permesso UE per soggiornanti di lungo periodo (se hai i requisiti di reddito e residenza)" }
          }]
        }
      }
    ]
  },
  {
    name: "Acquisto cittadinanza o stato di apolide",
    pageId: "1ad7355e-7f7f-809b-b8fb-e9c19fb89c4d",
    content: [
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Che cos'è questo permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Questo è un permesso di soggiorno temporaneo che viene rilasciato a chi ha presentato domanda di cittadinanza italiana (per naturalizzazione, matrimonio, etc.) o di riconoscimento dello status di apolide e sta aspettando la decisione. È un permesso \"ponte\" che ti consente di rimanere regolarmente in Italia mentre aspetti l'esito della tua pratica." }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Chi può chiederlo?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Può chiederlo chi:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Ha presentato domanda di cittadinanza italiana (per matrimonio, residenza, naturalizzazione, etc.)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Ha presentato domanda di riconoscimento dello status di apolide" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Sta aspettando la risposta alla propria domanda" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Il proprio permesso di soggiorno precedente è scaduto o sta per scadere" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Come/dove si chiede?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Il permesso si richiede:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Tramite KIT postale presso gli uffici postali (Poste Italiane)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Oppure direttamente in Questura, se richiesto" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Devi presentare la ricevuta della domanda di cittadinanza o di riconoscimento dello status di apolide" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Che diritti mi dà? A cosa ho accesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Con questo permesso:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Puoi rimanere regolarmente in Italia mentre aspetti la decisione sulla cittadinanza o sullo status di apolide" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Mantieni i diritti del tuo permesso precedente (se lo avevi), incluso il diritto di lavorare" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Puoi iscriverti al Servizio Sanitario Nazionale (SSN)" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Puoi viaggiare nello spazio Schengen (con condizioni)" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Quanto dura questo permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "La durata di questo permesso varia a seconda della tua situazione:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Normalmente viene rilasciato per 2 anni" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Dura fino alla decisione finale sulla tua domanda di cittadinanza o di riconoscimento dello status di apolide" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Se la pratica si prolunga oltre i 2 anni, puoi rinnovarlo" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Quando scade posso rinnovarlo?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Sì, puoi rinnovarlo se la tua domanda di cittadinanza o di riconoscimento dello status di apolide è ancora in corso e non hai ancora ricevuto una decisione definitiva. Il rinnovo segue le stesse modalità della prima richiesta." }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Cosa succede quando la domanda viene decisa?" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Se la cittadinanza viene concessa: diventi cittadino italiano e non hai più bisogno del permesso di soggiorno" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Se lo status di apolide viene riconosciuto: puoi richiedere un permesso di soggiorno per apolidia" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Se la domanda viene respinta: dovrai richiedere un altro tipo di permesso di soggiorno se hai i requisiti" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Posso convertirlo in un altro permesso?" },
            annotations: { bold: true }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Normalmente non devi convertire questo permesso perché:" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Se la cittadinanza viene concessa, diventi cittadino italiano" }
          }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{
            type: "text",
            text: { content: "Se lo status di apolide viene riconosciuto, ottieni il permesso per apolidia" }
          }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Se la domanda viene respinta e hai ancora un titolo per rimanere in Italia (lavoro, famiglia, studio, etc.), puoi chiedere il permesso corrispondente alla tua situazione." }
          }]
        }
      }
    ]
  }
];

async function populatePermit(permit) {
  console.log(`\n📝 Writing content for: ${permit.name}`);
  console.log(`   Page ID: ${permit.pageId}`);

  try {
    // Append all blocks to the page
    const response = await notion.blocks.children.append({
      block_id: permit.pageId,
      children: permit.content
    });

    console.log(`   ✓ Written ${permit.content.length} blocks`);

    // Verify by fetching the page
    const verification = await notion.blocks.children.list({
      block_id: permit.pageId,
      page_size: 100
    });

    console.log(`   ✓ Verified: ${verification.results.length} total blocks`);

    return {
      name: permit.name,
      pageId: permit.pageId,
      blocksWritten: permit.content.length,
      totalBlocks: verification.results.length,
      success: true
    };
  } catch (error) {
    console.error(`   ✗ Error: ${error.message}`);
    return {
      name: permit.name,
      pageId: permit.pageId,
      error: error.message,
      success: false
    };
  }
}

async function main() {
  console.log('=== Populating Remaining Permits (43-04) ===\n');
  console.log(`Total permits to populate: ${permits.length}\n`);

  const results = [];

  for (const permit of permits) {
    const result = await populatePermit(permit);
    results.push(result);

    // Rate limiting: 350ms between requests (under 3 req/sec)
    if (permit !== permits[permits.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 350));
    }
  }

  console.log('\n=== Summary ===\n');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✓ Successful: ${successful.length}`);
  console.log(`✗ Failed: ${failed.length}`);

  if (successful.length > 0) {
    console.log('\n✓ Successfully populated:');
    successful.forEach(r => {
      console.log(`  - ${r.name} (${r.blocksWritten} blocks written, ${r.totalBlocks} total)`);
    });
  }

  if (failed.length > 0) {
    console.log('\n✗ Failed:');
    failed.forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
}

main().catch(console.error);
