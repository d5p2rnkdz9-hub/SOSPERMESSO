# 🏮 SOS Permesso - Nuovo Sito Web

Sito web moderno, multilingue e facilmente aggiornabile per informazioni sui permessi di soggiorno in Italia.

## 🎨 Design

- **Color Palette**: Giallo taxi (#FFD700), Rosso (#FF3B3B), Bianco, Nero
- **Style**: Cartoon-friendly, animazioni adorabili
- **Hero**: Lighthouse rosso-bianca a strisce con faccina cartoon
- **Responsive**: Mobile-first design

## 📁 Struttura del Progetto

```
sito-sospermesso/
├── public/
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── animations/
├── src/
│   ├── components/
│   │   └── lighthouse.html      # Componente lighthouse SVG animato
│   ├── pages/
│   │   └── index.html            # Homepage principale
│   ├── styles/
│   │   ├── main.css              # Variabili, reset, layout
│   │   ├── components.css        # Card, bottoni, header, footer
│   │   └── animations.css        # Animazioni cartoon-style
│   ├── scripts/
│   │   └── app.js                # Logica principale JS
│   └── data/
│       ├── content-it.json       # Contenuti in Italiano
│       ├── content-en.json       # Contenuti in English
│       ├── content-fr.json       # Contenuti in Français (da creare)
│       └── content-es.json       # Contenuti in Español (da creare)
└── translations/
    ├── it/                       # Versione italiana statica
    ├── en/                       # Versione inglese statica
    ├── fr/                       # Versione francese statica
    └── es/                       # Versione spagnola statica
```

## 🚀 Features

### ✨ Animazioni
- **Lighthouse**: Faro animato con luce rotante, onde, occhi che lampeggiano
- **Cards**: Effetto bounce/hover con animazione lift
- **Buttons**: Squeeze effect al click
- **Scroll**: Fade-in e slide-up per elementi
- **Icons**: Emoji bounce al hover

### 🌍 Sistema Multilingue
- File JSON separati per ogni lingua
- Language switcher nel header
- URL structure: `/it/`, `/en/`, `/fr/`, `/es/`
- Fallback automatico all'italiano

### 📱 Responsive Design
- Mobile-first approach
- Breakpoints: 480px, 768px, 1200px
- Hamburger menu su mobile
- Grid layout adaptive

## 🛠 Come Usare

### 1. Visualizzare Localmente

Apri `src/pages/index.html` in un browser moderno. Per caricare il lighthouse component, serve un server locale:

```bash
# Opzione 1: Python
python3 -m http.server 8000

# Opzione 2: Node.js (con http-server)
npx http-server -p 8000

# Opzione 3: PHP
php -S localhost:8000
```

Poi visita: `http://localhost:8000/src/pages/index.html`

### 2. Aggiornare Contenuti

Modifica i file JSON in `src/data/`:

```json
{
  "guides": {
    "items": [
      {
        "icon": "📚",
        "title": "Nuovo Titolo",
        "description": "Nuova descrizione",
        "link": "/nuova-pagina"
      }
    ]
  }
}
```

### 3. Aggiungere Nuove Lingue

1. Crea nuovo file JSON: `src/data/content-fr.json`
2. Copia la struttura da `content-it.json`
3. Traduci tutti i testi
4. Aggiungi opzione nel language switcher

### 4. Personalizzare Colori

Modifica le variabili CSS in `src/styles/main.css`:

```css
:root {
  --taxi-yellow: #FFD700;
  --lighthouse-red: #FF3B3B;
  /* ... */
}
```

## 🎯 Sezioni Principali

### Hero Section
- Lighthouse animato adorabile
- Titolo principale
- Alert con aggiornamento legge

### Tests Section
- 3 card con test interattivi (Typeform)
- Stile giallo con hover bounce

### Guides Section
- 5 guide principali
- Card con icone grandi
- Link alle pagine interne

### Links Section
- 3 utility link principali
- Card compatte

### Footer
- Links istituzionali
- Copyright

## 🔧 Tecnologie

- **HTML5**: Markup semantico
- **CSS3**: Grid, Flexbox, CSS Variables, Animations
- **JavaScript (Vanilla)**: Nessuna dipendenza
- **JSON**: Sistema di contenuti
- **SVG**: Lighthouse component animato

## 📦 Build & Deploy

### Opzione 1: Deploy Statico Semplice
1. Copia tutto il contenuto di `src/` nella root
2. Upload su hosting statico (Netlify, Vercel, GitHub Pages)

### Opzione 2: Build con Generatore
Usa uno script per generare versioni statiche multilingue:

```bash
# Da implementare: script di build che:
# 1. Legge ogni content-{lang}.json
# 2. Genera index.html per ogni lingua
# 3. Copia in translations/{lang}/
```

## 🎨 Componenti Riutilizzabili

### Card
```html
<div class="card hover-lift">
  <span class="card-icon">📚</span>
  <h3 class="card-title">Titolo</h3>
  <p class="card-description">Descrizione</p>
</div>
```

### Button
```html
<button class="btn btn-primary squeeze-click">
  Clicca qui →
</button>
```

### Alert
```html
<div class="alert alert-info">
  <span class="alert-icon">🔔</span>
  <div>Messaggio importante</div>
</div>
```

## 🐛 Debug

- Controlla la console per errori di caricamento JSON
- Verifica che il server locale sia attivo per fetch API
- Usa DevTools per testare responsive design

## 📝 TODO

- [ ] Creare content-fr.json e content-es.json
- [ ] Implementare build script per generare versioni statiche
- [ ] Aggiungere più animazioni scroll
- [ ] Ottimizzare lighthouse SVG
- [ ] Aggiungere analytics tracking
- [ ] Creare pagine interne (database, guide, ecc.)
- [ ] Implementare search functionality
- [ ] Aggiungere dark mode (opzionale)

## 🤝 Contribuire

1. Aggiorna i contenuti JSON
2. Testa su diversi browser e device
3. Verifica accessibilità (keyboard navigation, screen readers)
4. Controlla performance (Lighthouse score)

## 📄 Licenza

© 2025 SOS Permesso. Tutti i diritti riservati.

---

Made with 💛 for the immigrant community in Italy
