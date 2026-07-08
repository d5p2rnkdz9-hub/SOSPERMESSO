# SOSpermesso — Strategia e Piano Operativo

*Documento unico: visione strategica (parte A) + piano di lavoro concreto (parte B).*
*Versione 2 — maggio 2026.*
*Interlocutori: Alberto Pasquero (Studio Legale Oltre). Partner: Antartide (Roma), Bacan (Milano).*

---

## PARTE A — STRATEGIA

### 1. Inquadramento del progetto

SOSpermesso.it è una knowledge base gratuita sull'immigrazione in Italia: 41+ permessi di soggiorno, dizionario burocratico, sportelli di aiuto legale, guide tematiche (protezione internazionale, ricongiungimento, documenti per la Questura), tutto in 11 lingue. Al centro del progetto c'è un **decision tree interattivo** (30 outcome pages) che aiuta l'utente a capire quale permesso può richiedere.

Il sito è online da circa 2 mesi. La nuova app Next.js che sostituisce il Typeform è già live su `testsospermesso.netlify.app` (da promuovere a `app.sospermesso.it`).

### 2. Lo scenario di partenza — analisi onesta

Il dato di fatto: **in 2 mesi, zero completamenti del test** nonostante il sito sia online. Non è un problema singolo, ma la somma di tre criticità:

**Discovery.** Il sito ha pochissime visite. Senza traffico, anche il miglior funnel non converte. Il traffico oggi non ha canali di acquisizione strutturati.

**Placement.** Sul sito il test non è l'azione primaria. L'hero spinge su "Tutti i Permessi" (il database), non sul test. Il test è una card fra tante nella sezione "Test interattivi", più in basso. Un utente capita sul sito e non percepisce che il test sia la cosa da fare per prima.

**Friction.** Il passaggio dal sito a Typeform (dominio diverso, branding generico, percepito come "survey") fa perdere utenti al momento del click. Chi è disorientato — che è poi il target — non attraversa facilmente quel salto di fiducia.

**Frammentazione.** Oggi coesistono: sospermesso.it (sito principale) + form.typeform.com (test residui) + testsospermesso.netlify.app (la nuova app). Tre domini, tre esperienze visive. Disorienta e spacca l'autorità SEO.

**Fiducia.** La homepage non mostra "chi c'è dietro". Non c'è comitato scientifico visibile, non ci sono loghi di partner, non c'è una faccia. Il progetto appare anonimo, il che per una materia delicata come l'immigrazione è penalizzante.

### 3. Le due nature del progetto — tenerle separate

Il rischio più grande è mescolare due prodotti diversi sotto lo stesso tetto senza distinguerli.

**Prodotto A — migrante (B2C, gratuito).** Obiettivo: reach, utilità, missione sociale, reputazione. Non è un prodotto commerciale. È il motore di autorevolezza e di traffico.

**Prodotto B — professionista (B2B, a pagamento).** Obiettivo: fatturato. Target: avvocati, CAF, patronati, ONG, operatori sportello. Valore: tempo risparmiato su lavoro tecnico (circolari, giurisprudenza, modelli atti, formazione accreditata).

Decisione presa: il Pro vivrà come **sottocartella `/pro` di sospermesso.it** — concentra l'autorità SEO, racconta che è lo stesso progetto.

### 4. Fronte 1 — Sito attuale + embed + promo

#### 4.1 Consolidamento tecnico e architetturale

**Sottodominio `app.sospermesso.it`** puntato via DNS a Netlify. L'utente clicca "Fai il test" su sospermesso.it e arriva su `app.sospermesso.it` senza rendersene conto: stesso brand, stesso guscio, zero friction di dominio. È l'alternativa migliore all'iframe (che funziona ma crea grattacapi su mobile).

**Consolidamento dei link**: le voci "Contattaci" oggi puntano a testsospermesso.netlify.app. Vanno ricondotte sotto sospermesso.it o app.sospermesso.it. Obiettivo: un utente, un brand visivo, un dominio percepito.

#### 4.2 Interventi prioritari sulla homepage

In ordine di impatto rispetto alla fatica:

- **Cambio del CTA primario dell'hero**: da "Tutti i Permessi →" a "Fai il test — scopri quale permesso puoi chiedere". Il database diventa secondario, perché il test *porta* alla parte giusta del database.
- **Tre mini-signal sotto l'hero**: "Nessun dato personale raccolto · 3 minuti · 5 lingue". Tolgono obiezioni silenziose.
- **Strip partner above the fold**: "Con il supporto di [loghi Oltre / Antartide / Bacan]" + link a "Chi siamo". Segnale di legittimità immediata.
- **Meta + Open Graph** ottimizzati su tutte le outcome pages (✅ fatto sull'app): preview dignitosa su WhatsApp/Telegram quando i link vengono condivisi.
- **Language switcher** più visibile (non sepolto in un menu a tendina).
- **Pulsante "Condividi il risultato"** (✅ fatto sull'app) + **salvataggio outcome in PDF** su ogni pagina di risultato. Aumentano valore percepito e virialità.
- **Schema.org LegalService** sulle outcome pages (✅ fatto sull'app): aiuta Google a capire cosa è il sito e a rankarlo meglio sulle query long-tail.

#### 4.3 Promozione — ritmo sostenibile, non lancio in pompa magna

Il progetto cresce per accumulo, non per effetto lancio. Due canali complementari, tempi diversi:

**Social / short-form video (canale rapido).** Le 30 outcome pages sono, di fatto, 100-180 possibili video brevi (una FAQ = un video 40-60s). Aggiungere in rotazione: news reattivi (nuove circolari, decreti flussi, sentenze), mythbusting (false credenze circolanti nelle comunità), casi reali anonimizzati.

Formato deciso: **video AI** (no shooting fisico). Voiceover con testo grande. Canali: TikTok + Instagram Reels come priorità, con amplificazione obbligatoria da parte dei canali dei tre studi partner.

Nota sulla lingua: il contenuto in italiano viaggia comunque nelle comunità migranti grazie alle "persone-hub" bilingui che traducono e inoltrano. Quindi la produzione può partire in italiano, con sottotitoli nelle 5 lingue target dei contenuti evergreen. Per i news reattivi l'italiano è sufficiente all'inizio.

**Sportelli, CAF, patronati (canale lento ma ad alta conversione).** È dove davvero i migranti *ricevono* gli strumenti che usano. Preparare un one-pager stampabile con QR code e spiegazione in 2 minuti di come usare SOSpermesso con gli utenti. Prime 10 destinazioni da contattare: Caritas, Centri Astalli, ACLI, INCA, Sant'Egidio, Naga (Milano), ASGI, oltre alle reti locali dei tre studi partner.

**Ultima leva, fisica**: QR nelle sale d'attesa delle questure e prefetture più grandi (Milano, Roma, Torino). Richiede interlocuzione locale ed è esattamente il tipo di cosa che uno studio legale può spingere sul proprio territorio. Tempi lunghi (3-6 mesi di permessi formali), quindi parallelo lento — non nei prossimi 60-90 giorni.

#### 4.4 Autorevolezza

Senza autorevolezza, tutto il resto — e soprattutto la parte Pro — non regge.

- **Comitato scientifico visibile**: 4-6 nomi tra i tre studi partner + 1-2 accademici di diritto dell'immigrazione (Università di Milano, Roma Tre, Bicocca). Foto, bio, affiliazione. È il segnale che un professionista legge in 10 secondi.
- **Posizionamento rispetto ad ASGI**: non competere, citare e linkare. Obiettivo nel primo anno: un contributo dei tre studi su *Diritto, Immigrazione e Cittadinanza*.
- **Indipendenza editoriale dichiarata**: SOSpermesso informa, non fa pubblicità. Fondamentale per non erodere l'autorevolezza.

### 5. Fronte 2 — Parte Pro (B2B)

Approccio lean: non costruire il prodotto prima di sapere se c'è domanda. Sequenza in tre fasi.

#### Fase 1 — Costruire la lista (giorni 1-45)

- Landing page `/pro`: una pagina sola, spiega cosa sarà SOSpermesso Pro, chi c'è dietro (comitato scientifico), form di iscrizione alla newsletter. Niente prezzi, niente prodotto ancora.
- Mailing via **Brevo** (free fino 300 email/giorno, pricing UE migliore di Mailchimp). È il "CRM" minimo da cui partire.
- Prima newsletter: "SOSpermesso Pro — cosa stiamo costruendo e perché". Spedita alle reti dei tre studi + ASGI + ordini avvocati + alcuni CAF. Obiettivo: 200-300 iscritti nei primi 45 giorni.
- Poi newsletter quindicinale: 1 circolare commentata + 1 sentenza + 2-3 link di aggiornamento. Ogni studio partner scrive a rotazione.

#### Fase 2 — Primo prodotto a pagamento (giorni 45-90)

- Un **webinar accreditato** per crediti formativi, 2 ore, prezzo 49-69€. Tema di attualità (es. "Decreto flussi 2026: cosa sapere per assistere i clienti").
- Stack minimo: Eventbrite per iscrizioni + Zoom per la diretta + fatturazione manuale. Time to market rapidissimo.
- Obiettivo realistico primo webinar: 50-80 partecipanti, 2.500-5.000€ di ricavi. Poco rilevante come fatturato; molto rilevante come proof of concept.

#### Fase 3 — Prodotto stabile (mese 4+)

- Se il webinar funziona: calendario mensile + si inizia a costruire l'**abbonamento** (20-35€/mese o 200-300€/anno). Contenuto: archivio ricercabile di circolari e giurisprudenza, modelli di atti, ricerca semantica (l'SDK Anthropic è già nel progetto — tecnicamente fattibile).
- Se non funziona: sondaggio alla lista per capire perché, ricalibratura. Questo apprendimento è più prezioso dell'eventuale fallimento del primo webinar.

### 6. Partnership con studi legali

"Con il supporto di…" è un inizio ma è passivo. Per attivare davvero la partnership:

- **Contributo editoriale**: ogni studio produce 1-2 pezzi a trimestre per newsletter/knowledge base. Li firma. Fa un investimento visibile e riceve visibilità qualificata.
- **Amplificazione social**: ogni studio ripubblica i video SOSpermesso tramite i propri canali, taggando il progetto. Moltiplicatore x4 del reach organico, costo zero.
- **Geografia naturale**: Oltre (Torino/Genova), Antartide (Roma/Centro-Sud), Bacan (Milano/Lombardia). Non sono concorrenti frontali. Narrativa: "rete nazionale di studi", che è un asset commerciale forte rispetto al "singolo studio".
- **Co-hosting webinar**: i relatori dei webinar accreditati (Fase 2 Pro) ruotano tra i tre studi. Ciascuno porta i propri clienti/contatti, arricchendo la lista comune.

### 7. Cosa NON fare ora

- **Ridisegno totale del sito**: se funziona basicamente, meglio perfezionarlo che rifarlo. Il tempo e il budget vanno su contenuti e promo.
- **App mobile**: mai. Gli utenti migranti usano browser su telefono economico.
- **Proliferazione di social**: due canali ben presidiati valgono cinque abbandonati.
- **Area riservata / login per il Pro** prima di avere almeno 300 iscritti newsletter e un webinar fatto. Divora tempo di sviluppo senza generare valore finché non c'è massa critica.
- **Vendere contenuti pro nella stessa pagina del form migrante**: spacca autorevolezza e confonde le audience.

### 8. Piano dei prossimi 60-90 giorni (sintesi narrativa)

**Settimane 1-3 — consolidamento sito e embed:**
1. Setup sottodominio `app.sospermesso.it` verso Netlify.
2. Cambio CTA hero, strip partner, mini-signal, OG tags, Schema.org.
3. Consolidamento link Contattaci sotto un unico dominio.
4. Pulsante "Condividi risultato" + salva PDF sulle outcome pages.

**Settimane 2-6 — promo (in parallelo):**
5. Pacchetto 5 video AI prodotti in un singolo batch, pubblicati in rotazione.
6. Contatto di 10 sportelli/CAF con one-pager + QR.
7. Cross-post dei video dai canali dei tre studi partner.

**Settimane 1-6 — Pro Fase 1 (in parallelo):**
8. Pagina `/pro` + setup Brevo.
9. Prima newsletter di lancio spedita alle reti dei tre studi.
10. Calendario editoriale newsletter quindicinale avviato.

**Settimane 7-12 — Pro Fase 2:**
11. Pianificazione e accreditamento primo webinar.
12. Landing page dedicata e apertura iscrizioni.
13. Esecuzione webinar + raccolta feedback partecipanti.

### 9. Domande aperte (aggiornate al 7 maggio 2026)

| Domanda | Stato |
|---|---|
| Antartide e Bacan a bordo? | ✅ Assunti come a bordo. Si procede con partner strip e attribuzione contributi. |
| /pro sottocartella o sottodominio? | ✅ **Sottocartella `/pro`** (concentra autorità SEO). |
| Lingue iniziali | ✅ **5: IT, EN, FR, ES, BN.** |
| Persona davanti alla camera per i video | ✅ **AI video**, no shooting fisico. |
| Traduzione tree multilingua | ✅ **AI** via pipeline esistente in `Sito_Nuovo/scripts/`. |
| Chi sviluppa? | ☐ Da definire (un dev attualmente). |
| Budget 3 mesi? | ☐ Da definire. Stima infra ~150€ totale. |

### 10. Principi di fondo

- **Reach e fatturato nutrono percorsi diversi.** Non confondere KPI: views TikTok ≠ iscritti newsletter pro ≠ partecipanti webinar ≠ abbonati paganti. Ciascuno va misurato per sé.
- **Autorevolezza prima di monetizzazione.** Senza comitato scientifico visibile, partner dichiarati e contenuto di qualità, la parte a pagamento non decolla.
- **Fare meno, farlo bene, farlo costantemente.** Un video a settimana per 6 mesi batte 20 video in 2 settimane e poi silenzio.
- **Tracciare, anche senza dati personali.** Analytics anonimi sui funnel (dove gli utenti entrano, dove escono, quali outcome sono più frequenti) sono un asset commerciale — raccontano la storia del bisogno, utile sia per migliorare il prodotto sia per convincere partner e finanziatori.

---

## PARTE B — PIANO OPERATIVO

*Tradotto dal piano sopra in cose concrete da fare, in ordine di dipendenze reali.*

### B.1 Sequenza di lavoro reale

#### P0 — Sistemare il tree conversione (PRIORITÀ ASSOLUTA)
L'app è già live. Il tree "posso avere" funziona. Il tree "rinnovare/convertire" ha problemi specifici da fixare prima di tutto il resto. **Da concordare con Alberto cosa esattamente non va** (logica, contenuti, traduzioni, link). Senza questo, ogni altra cosa è sprecata.

#### P1 — Fondamenta app (parzialmente fatto al 7 maggio 2026)
- ✅ Rimossi 9 file duplicati macOS dal repo
- ✅ Audit privacy analytics → verdetto: la claim "no dati personali" non regge oggi
- ✅ OG metadata + immagini OG dinamiche per anteprime social
- ✅ Schema.org JSON-LD su outcome pages
- ✅ Bottone "Condividi" su outcome pages
- ☐ **Privacy remediation**: rimuovere `userName` e `userAgent` dall'analytics, eliminare sync a Notion (mantenere solo Neon)
- ☐ **Salva PDF** outcome (via `window.print()` + CSS print, o screenshot consigliato in alternativa)
- ☐ Sentry per error monitoring (richiede account utente)
- ⚠️ **Da ruotare ora**: una vecchia API key Notion era in un file duplicato — sostituiscila su https://www.notion.so/my-integrations

#### P2 — Cutover dominio
- ☐ DNS `app.sospermesso.it` → Netlify
- ☐ Redirect 301 da `testsospermesso.netlify.app` → `app.sospermesso.it` (preserva path e locale)
- ☐ Spegnere i 2-3 link Typeform residui (avere/rinnovare/convertire) solo dopo 48h di stabilità sul nuovo dominio

#### P3 — Sito_Nuovo: hero + brand + SEO
- ☐ Creare `Sito_Nuovo/src/pages/index.html` come fonte sorgente Eleventy della homepage
- ☐ Cambio CTA hero: "Fai il test" → `app.sospermesso.it/it/tree`
- ☐ Mini-signal sotto hero: "Nessun dato personale · 3 minuti · 5 lingue"
- ☐ Partner strip con loghi Oltre/Antartide/Bacan in `_includes/components/partner-strip.liquid`
- ☐ Schema.org `Organization` in `base.liquid` + `Article` su `permits.liquid`
- ☐ Sostituire i pochi link Typeform residui con link app.sospermesso.it
- ☐ Fix link "Contattaci" in `_data/nav.js` (oggi puntano a `testsospermesso.netlify.app`)

#### P4 — Traduzione tree in 5 lingue (AI)
Si riusa la pipeline già pronta in `Sito_Nuovo/scripts/` (translate-batch.js + glossario legale + translation memory + Anthropic SDK).
- ☐ Adapter sopra `translate-batch.js` per gestire JSON anziché Notion
- ☐ Estrazione strings da `tree-data.ts` + `conversione-tree.ts` + `rinnovo-conversione-tree.ts`
- ☐ Pipeline IT → EN/FR/ES/BN con glossario legale
- ☐ Spot-check umano sui termini giuridici critici (asilo, protezione, conversione)
- ☐ Riduzione `routing.ts` a 5 locales esposti

#### P5 — Pro Fase 1 (parallelo, ~6 settimane)
- ☐ `Sito_Nuovo/src/pages/pro.html` — landing IT
- ☐ Account Brevo + form embed
- ☐ Comitato scientifico: 4-6 nomi tra i 3 studi + 1-2 accademici
- ☐ Prima newsletter di lancio
- ☐ Calendario quindicinale a rotazione fra studi partner

#### P6 — Promo contenuti (non dev)
- ☐ Pacchetto 5 video AI in batch
- ☐ Outreach 10 sportelli/CAF (Caritas, ACLI, Naga, ASGI, ecc.)
- ☐ Cross-post canali studi partner

#### P7 — Pro Fase 2 (settimane 7-12)
- ☐ Webinar accreditato (49-69€)
- ☐ Eventbrite + Zoom + fatturazione manuale
- ☐ Target 50-80 partecipanti come proof of concept

### B.2 Buchi e avvertenze (da non perdere di vista)

- **Premise "0 completamenti" non sfidata.** La strategia attribuisce lo zero a discovery/placement/friction, ma potrebbe anche essere il Typeform stesso che era confuso. Fare un walk-through del flusso attuale come se fossi un migrante prima di chiudere il rinnovo (1-2 ore).
- **Privacy claim incoerente.** "Non raccogliamo dati personali" è scritto in homepage ma oggi salviamo `userName` (se inserito) e `userAgent` su database Neon e su Notion (USA). Va sistemato (vedi P1).
- **API key Notion da ruotare** (vedi P1). Non rimandare.
- **"11 lingue" → 5 lingue.** Il language switcher dell'app va ridotto a 5 esposte fino a P4 fatto, altrimenti l'utente che switcha in arabo trova un tree in italiano.
- **Decision gates assenti.** Aggiungere cancelli misurabili:
  - **Giorno 30 dopo go-live app**: completamenti tree/settimana. Se < 10/settimana, il problema non era Typeform → 3 interviste a sportelli per capire.
  - **Giorno 45**: iscritti newsletter Pro. Se < 100, ricalibrare prima del webinar.
  - **Giorno 90**: partecipanti webinar. Se < 30, sondaggio alla lista, ricalibrare proposta.
- **QR in questure/prefetture**: lento parallelo (3-6 mesi di permessi formali). Non nei 60-90 giorni.

### B.3 Costi infra stimati (90 giorni)

| Voce | Costo |
|---|---|
| DNS, Netlify, Sentry, Brevo (free tier) | 0 |
| Zoom base | ~15€/mese |
| Accreditamento webinar CNF | 100-300€ una tantum |
| **Totale infra** | **~150€** |

Costi delegabili (se budget): tooling video AI (~50-200€/mese), grafica partner loghi (~200€), eventuale revisione umana traduzioni legali (~500-1500€).
