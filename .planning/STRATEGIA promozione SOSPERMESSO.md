# SOSpermesso — Sommario di strategia

*Documento di riepilogo della prima valutazione strategica. Versione 1 — aprile 2026.*
*Interlocutori: Alberto Pasquero (Studio Legale Oltre). Partner potenziali: Antartide (Roma), Bacan (Milano).*

---

## 1. Inquadramento del progetto

SOSpermesso.it è una knowledge base gratuita sull'immigrazione in Italia: 41+ permessi di soggiorno, dizionario burocratico, sportelli di aiuto legale, guide tematiche (protezione internazionale, ricongiungimento, documenti per la Questura), tutto in 11 lingue. Al centro del progetto c'è un **decision tree interattivo** (30 outcome pages) che aiuta l'utente a capire quale permesso può richiedere.

Il sito è online da circa 2 mesi. Oggi il tree gira su Typeform esterno. È in costruzione la sostituzione: una app Next.js deployata su Netlify (il codice di questo repository), multilingua, che replica e migliora il Typeform attuale.

## 2. Lo scenario di partenza — analisi onesta

Il dato di fatto: **in 2 mesi, zero completamenti del test** nonostante il sito sia online. Non è un problema singolo, ma la somma di tre criticità:

**Discovery.** Il sito ha pochissime visite. Senza traffico, anche il miglior funnel non converte. Il traffico oggi non ha canali di acquisizione strutturati.

**Placement.** Sul sito il test non è l'azione primaria. L'hero spinge su "Tutti i Permessi" (il database), non sul test. Il test è una card fra tante nella sezione "Test interattivi", più in basso. Un utente capita sul sito e non percepisce che il test sia la cosa da fare per prima.

**Friction.** Il passaggio dal sito a Typeform (dominio diverso, branding generico, percepito come "survey") fa perdere utenti al momento del click. Chi è disorientato — che è poi il target — non attraversa facilmente quel salto di fiducia.

**Frammentazione.** Oggi coesistono: sospermesso.it (sito principale) + form.typeform.com (test) + testsospermesso.netlify.app (alcune pagine della nuova app). Tre domini, tre esperienze visive. Disorienta e spacca l'autorità SEO.

**Fiducia.** La homepage non mostra "chi c'è dietro". Non c'è comitato scientifico visibile, non ci sono loghi di partner, non c'è una faccia. Il progetto appare anonimo, il che per una materia delicata come l'immigrazione è penalizzante.

## 3. Le due nature del progetto — tenerle separate

Il rischio più grande è mescolare due prodotti diversi sotto lo stesso tetto senza distinguerli.

**Prodotto A — migrante (B2C, gratuito).** Obiettivo: reach, utilità, missione sociale, reputazione. Non è un prodotto commerciale. È il motore di autorevolezza e di traffico.

**Prodotto B — professionista (B2B, a pagamento).** Obiettivo: fatturato. Target: avvocati, CAF, patronati, ONG, operatori sportello. Valore: tempo risparmiato su lavoro tecnico (circolari, giurisprudenza, modelli atti, formazione accreditata).

Decisione da prendere: il Pro vivrà come **sottocartella `/pro` di sospermesso.it** (raccomandato — concentra l'autorità SEO, racconta che è lo stesso progetto) oppure come sottodominio `pro.sospermesso.it` (più separato, utile se in futuro il Pro diventa uno spinoff).

## 4. Fronte 1 — Sito attuale + embed + promo

### 4.1 Consolidamento tecnico e architetturale

**Sottodominio `app.sospermesso.it`** puntato via DNS a Netlify. L'utente clicca "Fai il test" su sospermesso.it e arriva su `app.sospermesso.it` senza rendersene conto: stesso brand, stesso guscio, zero friction di dominio. È l'alternativa migliore all'iframe (che funziona ma crea grattacapi su mobile).

**Consolidamento dei link**: le voci "Contattaci" oggi puntano a testsospermesso.netlify.app. Vanno ricondotte sotto sospermesso.it o app.sospermesso.it. Obiettivo: un utente, un brand visivo, un dominio percepito.

### 4.2 Interventi prioritari sulla homepage

In ordine di impatto rispetto alla fatica:

- **Cambio del CTA primario dell'hero**: da "Tutti i Permessi →" a "Fai il test — scopri quale permesso puoi chiedere". Il database diventa secondario, perché il test *porta* alla parte giusta del database.
- **Tre mini-signal sotto l'hero**: "Nessun dato personale raccolto · 3 minuti · 11 lingue". Tolgono obiezioni silenziose.
- **Strip partner above the fold**: "Con il supporto di [loghi Oltre / Antartide / Bacan]" + link a "Chi siamo". Segnale di legittimità immediata.
- **Meta + Open Graph** ottimizzati su tutte le outcome pages: preview dignitosa su WhatsApp/Telegram quando i link vengono condivisi.
- **Language switcher** più visibile (non sepolto in un menu a tendina).
- **Pulsante "Condividi il risultato"** (copy link + WhatsApp) + **salvataggio outcome in PDF** su ogni pagina di risultato. Aumentano valore percepito e virialità.
- **Schema.org LegalService** sulle outcome pages: aiuta Google a capire cosa è il sito e a rankarlo meglio sulle query long-tail.

### 4.3 Promozione — ritmo sostenibile, non lancio in pompa magna

Il progetto cresce per accumulo, non per effetto lancio. Due canali complementari, tempi diversi:

**Social / short-form video (canale rapido).** Le 30 outcome pages sono, di fatto, 100-180 possibili video brevi (una FAQ = un video 40-60s). Aggiungere in rotazione: news reattivi (nuove circolari, decreti flussi, sentenze), mythbusting (false credenze circolanti nelle comunità), casi reali anonimizzati.

Formato ideale: avvocato in camera o voiceover con testo grande. Autorevolezza = persona vera con competenza vera. Canali: TikTok + Instagram Reels come priorità, con amplificazione obbligatoria da parte dei canali dei tre studi partner.

Nota sulla lingua: il contenuto in italiano viaggia comunque nelle comunità migranti grazie alle "persone-hub" bilingui che traducono e inoltrano. Quindi la produzione può partire in italiano, con sottotitoli nella lingua target dei contenuti evergreen. Per i news reattivi l'italiano è sufficiente all'inizio.

**Sportelli, CAF, patronati (canale lento ma ad alta conversione).** È dove davvero i migranti *ricevono* gli strumenti che usano. Preparare un one-pager stampabile con QR code e spiegazione in 2 minuti di come usare SOSpermesso con gli utenti. Prime 10 destinazioni da contattare: Caritas, Centri Astalli, ACLI, INCA, Sant'Egidio, Naga (Milano), ASGI, oltre alle reti locali dei tre studi partner.

**Ultima leva, fisica**: QR nelle sale d'attesa delle questure e prefetture più grandi (Milano, Roma, Torino). Richiede interlocuzione locale ma è esattamente il tipo di cosa che uno studio legale può spingere sul proprio territorio.

### 4.4 Autorevolezza

Senza autorevolezza, tutto il resto — e soprattutto la parte Pro — non regge.

- **Comitato scientifico visibile**: 4-6 nomi tra i tre studi partner + 1-2 accademici di diritto dell'immigrazione (Università di Milano, Roma Tre, Bicocca). Foto, bio, affiliazione. È il segnale che un professionista legge in 10 secondi.
- **Posizionamento rispetto ad ASGI**: non competere, citare e linkare. Obiettivo nel primo anno: un contributo dei tre studi su *Diritto, Immigrazione e Cittadinanza*.
- **Independenza editoriale dichiarata**: SOSpermesso informa, non fa pubblicità. Fondamentale per non erodere l'autorevolezza.

## 5. Fronte 2 — Parte Pro (B2B)

Approccio lean: non costruire il prodotto prima di sapere se c'è domanda. Sequenza in tre fasi.

### Fase 1 — Costruire la lista (giorni 1-45)

- Landing page `/pro`: una pagina sola, spiega cosa sarà SOSpermesso Pro, chi c'è dietro (comitato scientifico), form di iscrizione alla newsletter. Niente prezzi, niente prodotto ancora.
- Mailing via **Brevo** o **Mailchimp** (gratis fino a 1000-2000 contatti, setup in mezza giornata). È il "CRM" minimo da cui partire.
- Prima newsletter: "SOSpermesso Pro — cosa stiamo costruendo e perché". Spedita alle reti dei tre studi + ASGI + ordini avvocati + alcuni CAF. Obiettivo: 200-300 iscritti nei primi 45 giorni.
- Poi newsletter quindicinale: 1 circolare commentata + 1 sentenza + 2-3 link di aggiornamento. Ogni studio partner scrive a rotazione.

### Fase 2 — Primo prodotto a pagamento (giorni 45-90)

- Un **webinar accreditato** per crediti formativi, 2 ore, prezzo 49-69€. Tema di attualità (es. "Decreto flussi 2026: cosa sapere per assistere i clienti").
- Stack minimo: Eventbrite per iscrizioni + Zoom per la diretta + fatturazione manuale. Time to market rapidissimo.
- Obiettivo realistico primo webinar: 50-80 partecipanti, 2.500-5.000€ di ricavi. Poco rilevante come fatturato; molto rilevante come proof of concept.

### Fase 3 — Prodotto stabile (mese 4+)

- Se il webinar funziona: calendario mensile + si inizia a costruire l'**abbonamento** (20-35€/mese o 200-300€/anno). Contenuto: archivio ricercabile di circolari e giurisprudenza, modelli di atti, ricerca semantica (l'SDK Anthropic è già nel progetto — tecnicamente fattibile).
- Se non funziona: sondaggio alla lista per capire perché, ricalibratura. Questo apprendimento è più prezioso dell'eventuale fallimento del primo webinar.

## 6. Partnership con studi legali

"Con il supporto di…" è un inizio ma è passivo. Per attivare davvero la partnership:

- **Contributo editoriale**: ogni studio produce 1-2 pezzi a trimestre per newsletter/knowledge base. Li firma. Fa un investimento visibile e riceve visibilità qualificata.
- **Amplificazione social**: ogni studio ripubblica i video SOSpermesso tramite i propri canali, taggando il progetto. Moltiplicatore x4 del reach organico, costo zero.
- **Geografia naturale**: Oltre (Torino/Genova), Antartide (Roma/Centro-Sud), Bacan (Milano/Lombardia). Non sono concorrenti frontali. Narrativa: "rete nazionale di studi", che è un asset commerciale forte rispetto al "singolo studio".
- **Co-hosting webinar**: i relatori dei webinar accreditati (Fase 2 Pro) ruotano tra i tre studi. Ciascuno porta i propri clienti/contatti, arricchendo la lista comune.

## 7. Cosa NON fare ora

- **Ridisegno totale del sito**: se funziona basicamente, meglio perfezionarlo che rifarlo. Il tempo e il budget vanno su contenuti e promo.
- **App mobile**: mai. Gli utenti migranti usano browser su telefono economico.
- **Proliferazione di social**: due canali ben presidiati valgono cinque abbandonati.
- **Area riservata / login per il Pro** prima di avere almeno 300 iscritti newsletter e un webinar fatto. Divora tempo di sviluppo senza generare valore finché non c'è massa critica.
- **Vendere contenuti pro nella stessa pagina del form migrante**: spacca autorevolezza e confonde le audience.

## 8. Piano dei prossimi 60-90 giorni (sintesi)

**Settimane 1-3 — consolidamento sito e embed:**
1. Setup sottodominio `app.sospermesso.it` verso Netlify.
2. Cambio CTA hero, strip partner, mini-signal, OG tags, Schema.org.
3. Consolidamento link Contattaci sotto un unico dominio.
4. Pulsante "Condividi risultato" + salva PDF sulle outcome pages.

**Settimane 2-6 — promo (in parallelo):**
5. Pacchetto 5 video prodotti in un singolo shooting, pubblicati in rotazione.
6. Contatto di 10 sportelli/CAF con one-pager + QR.
7. Cross-post dei video dai canali dei tre studi partner.

**Settimane 1-6 — Pro Fase 1 (in parallelo):**
8. Pagina `/pro` + setup Brevo/Mailchimp.
9. Prima newsletter di lancio spedita alle reti dei tre studi.
10. Calendario editoriale newsletter quindicinale avviato.

**Settimane 7-12 — Pro Fase 2:**
11. Pianificazione e accreditamento primo webinar.
12. Landing page dedicata e apertura iscrizioni.
13. Esecuzione webinar + raccolta feedback partecipanti.

## 9. Domande aperte da chiarire

- **Chi sviluppa?** Tempo e competenze realmente disponibili nei prossimi 60-90 giorni influenzano cosa si riesce a fare davvero.
- **Antartide e Bacan**: già a bordo o da convincere? Se non ancora coinvolti, primo task è un incontro di 30 minuti per formalizzare scambio (contributo editoriale + amplificazione in cambio di visibilità).
- **Budget disponibile** nei prossimi 3 mesi (stima grossa: 0 / 2-3k / 10k+). Cambia cosa si può delegare (video maker, copy, legal design) e cosa resta fai-da-te.
- **Struttura del dominio Pro**: confermare `/pro` sottocartella vs `pro.sospermesso.it` sottodominio.
- **Persona(e) davanti alla camera** per i video brevi: chi di voi si presta, con che disponibilità settimanale.

## 10. Principi di fondo

- **Reach e fatturato nutrono percorsi diversi.** Non confondere KPI: views TikTok ≠ iscritti newsletter pro ≠ partecipanti webinar ≠ abbonati paganti. Ciascuno va misurato per sé.
- **Autorevolezza prima di monetizzazione.** Senza comitato scientifico visibile, partner dichiarati e contenuto di qualità, la parte a pagamento non decolla.
- **Fare meno, farlo bene, farlo costantemente.** Un video a settimana per 6 mesi batte 20 video in 2 settimane e poi silenzio.
- **Tracciare, anche senza dati personali.** Analytics anonimi sui funnel (dove gli utenti entrano, dove escono, quali outcome sono più frequenti) sono un asset commerciale — raccontano la storia del bisogno, utile sia per migliorare il prodotto sia per convincere partner e finanziatori.
