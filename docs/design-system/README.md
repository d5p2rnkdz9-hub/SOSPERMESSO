# SOSpermesso — Adesivo

Chiaro come un cartello stradale, amichevole come un adesivo. È il linguaggio visivo di sospermesso.it, dell'app dei test e dei materiali stampati (volantini). Nasce dal logo: giallo taxi, contorno nero spesso, ombra piena senza sfumature.

## Per chi progettiamo

Persone straniere in Italia, spesso con una domanda urgente sul permesso di soggiorno. Molte leggono l'italiano come seconda lingua o usano una delle altre 10 lingue del sito (inglese, francese, spagnolo, turco, russo, arabo, urdu, farsi, bengalese, cinese). Usano soprattutto il telefono.

## Principi

1. **Prima la risposta.** In alto, ogni pagina dice cosa fare; il resto viene dopo.
2. **Un colore, un significato.** Giallo (`sp-yellow`) = agisci. Rosso (`sp-red`) = attenzione o scadenza. I quattro colori di categoria (`cat-*`) orientano nel database dei permessi.
3. **Piatto e deciso.** Niente sfumature né bagliori: contorno `sp-ink` e ombra piena (`sticker*`). Si legge anche stampato in bianco e nero.
4. **Per ogni lingua.** Font e icone che reggono 11 lingue, arabo e cinese compresi. Ogni icona ha sempre il testo accanto.

## Tono dei testi

- Si dà del tu, con frasi brevi e verbi d'azione: «Rispondi a poche domande e scopri cosa puoi fare.»
- Le card sono domande in prima persona: «Posso portare qui la mia famiglia?», «Il mio permesso è pronto?»
- I due ingressi del test sono sempre gemelli: **Non ho ancora un permesso** → «Aiutami a capire se posso averlo» · **Ho già un permesso** → «Posso rinnovarlo o convertirlo?»
- I termini tecnici (Questura, kit postale, cedolino, nulla osta) restano in italiano e rimandano al Dizionario.
- Niente punto finale nelle parole-timbro: **Facile**, non «Facile.».

## Fondamenti visivi

### Colore
- Il fondo pagina è `sp-paper`. Card e campi sono `sp-white`.
- Su qualunque colore vivace (giallo, categorie) il testo è sempre `sp-ink`. Il bianco si usa solo su `sp-ink` e su `sp-red`.
- Il grigio più chiaro ammesso per il testo è `sp-muted` (#5A5A5A).
- Categorie di permesso: Studio/Lavoro `cat-work`, Protezione `cat-protection`, Cure mediche `cat-health`, Motivi familiari `cat-family`. Ognuna ha una tinta chiara `-tint` per i fondi.
- Avvisi: i fondi sono le tinte `state-*-tint` con contorno `sp-ink`. La scadenza è un blocco pieno `sp-red` con testo bianco.

### Tipografia
- **Poppins** 700/800 per titoli, pulsanti, menu ed etichette.
- **Atkinson Hyperlegible** 400/700 per il testo corrente. È progettato per lettori con difficoltà: lettere ben distinte (I l 1, O 0, rn m). Sostituisce Inter.
- Le lingue non latine usano Noto Sans Arabic / Nastaliq Urdu / Bengali / SC, come già fa il sito.
- Il testo corrente è a 17px su desktop e mai sotto i 16px su mobile (evita lo zoom di iOS). Tutto in stampa: corpo ≥ 12pt.

### Forma: l'effetto adesivo
- Contorno `border-ui` (2.5px) `sp-ink` + ombra piena `sticker` / `sticker-md`.
- **Hover:** l'elemento sale di 3px (`translate(-3px,-3px)`) e l'ombra cresce di 3px.
- **Premuto:** l'elemento scende (`translate(3px,3px)`) e l'ombra si riduce a 1–2px.
- **Focus:** `focus-ring` giallo esterno, il bordo resta.
- Raggi: chip `radius-sm`, campi `radius-md`, card `radius-lg`, blocchi `radius-xl`, pulsanti e menu `radius-pill`.
- Piccole rotazioni (−6° … +3°) solo per elementi «adesivo» isolati: timbro, logo, badge del volantino. Mai sul testo corrente.

### Il timbro
La parola chiave del titolo (es. **Facile**) va in bianco su un blocco `sp-ink` pieno, con raggio `radius-md`, ruotato di −5/−6°, senza doppio bordo e senza punto.

### Spazi
Griglia a base 4 (`space-1` … `space-8`). Margine laterale di 16px su mobile e 24px su desktop. Il contenuto è largo al massimo 1240px.

## Iconografia

- Icone a linea: tratto 2px, estremi e giunture arrotondati, griglia 24, colore `sp-ink`. Sostituiscono le emoji.
- Il set completo (20 icone) è nel gruppo **Icons** degli asset. Si usano inline con `stroke="currentColor"`.
- Sostituzioni principali: 📄 → documenti, ⏱️ → tempo, 💰 → costi, 🔄 → rinnovo, 💼 → lavoro, 🛡️ → protezione, 🏥 → cure-mediche, 👨‍👩‍👧‍👦 → famiglia, ✅ → spunta, 💡 → info.
- Nel selettore della lingua si usa la **bandierina SVG** (`IMAGES/flags/*.svg` nel sito), più il codice (IT) e la freccetta.

## Componenti

| Componente | Dove | Regole |
|---|---|---|
| NavPill | menu principale | pill bianca, `border-ui`, `sticker`, testo `button`; le voci a tendina hanno la freccetta grigia; badge NUOVO `badge-new` |
| LanguageToggle | menu | bandierina + codice + freccetta, senza contorno |
| TestCard | hero, riepilogo finale | due card gemelle bianche, occhiello + domanda, `sticker-md` |
| CategoryCard | «Trova il tuo permesso» | fascia superiore `cat-*`, corpo `cat-*-tint`, elenco con chevron |
| PermitCard | pagina Database | fascia `cat-*` con l'occhiello, nome del permesso, pulsanti Cos'è / Primo rilascio / Rinnovo; segnaposto tratteggiato |
| GuideCard | «Guide passo passo» | chip di argomento + domanda h3 + link sottolineato in giallo; «In arrivo» tratteggiato |
| Stamp | titoli display | parola chiave bianca su `sp-ink` pieno, ruotata, senza punto |
| ToolBlock | Aiuto legale / Dizionario | blocco pieno `cat-health` / `cat-family`, icona in cerchio bianco |
| Alert | pagine dei permessi | Da sapere / Attenzione / Scadenza |
| Checklist | sezioni #primo / #rinnovo | testata gialla con contatore, barra `state-success`, righe da 56px |

## Cosa cambia rispetto al sito attuale

| Prima | Adesso |
|---|---|
| Gradienti e bagliori dorati | Colori piatti + ombra piena nera |
| Emoji come icone | Icone a linea coerenti |
| 12 colori d'accento | 4 colori, uno per categoria |
| Inter per il testo | Atkinson Hyperlegible |
| Card che si ingrandiscono al passaggio | Card che si sollevano di 3px |
| Rosso #FF5252 con testo bianco (contrasto 3,2:1) | `sp-red` #D62828 (6,8:1) |
| #FFD700 | `sp-yellow` #FFD400 |

## Materiali stampati

- Volantino A4: fondo `sp-yellow`, titolo display da 84px con il timbro, blocco QR bianco con `sticker-lg`, quattro riquadri tinta, elenco delle lingue, linguette da strappare opzionali.
- Margine di sicurezza di 44px dai bordi. Nessun grigio sotto #767676.
