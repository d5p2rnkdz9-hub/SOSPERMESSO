# Guida al Caricamento su Hosting

## 📁 Struttura File Pronta per l'Hosting

Il sito è ora pronto per essere caricato! La struttura è:

```
Sito_Nuovo/
├── index.html                 # ✅ Homepage (rinominato da PREVIEW.html)
├── 7ozbvy.gif                 # ✅ Favicon
├── claude.md                  # 📖 Documentazione (non necessario caricare)
├── HOSTING_GUIDE.md          # 📖 Questa guida (non necessario caricare)
├── src/
│   ├── components/           # ✅ Componenti riutilizzabili
│   │   ├── contact-form.html
│   │   ├── lighthouse.html
│   │   └── paperwork-illustration.html
│   ├── pages/               # ✅ Tutte le pagine del sito
│   │   ├── index.html
│   │   ├── database.html
│   │   ├── chi-siamo.html
│   │   ├── permesso-studio.html
│   │   ├── permesso-lavoro-subordinato.html
│   │   ├── permesso-lavoro-autonomo.html
│   │   ├── permesso-asilo.html
│   │   ├── permesso-ue-lungo-periodo.html
│   │   ├── permesso-ricongiungimento-familiare.html
│   │   └── permesso-protezione-sussidiaria.html
│   ├── styles/              # ✅ File CSS
│   │   ├── main.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   ├── mobile.css
│   │   └── mobile-fix.css
│   ├── scripts/             # ✅ File JavaScript
│   │   ├── app.js
│   │   └── mobile.js
│   └── data/               # ✅ Contenuti JSON
│       ├── content-it.json
│       └── content-en.json
└── NOTION_WEBSITE/         # ❌ NON CARICARE (vecchi file)
```

## 🚀 Opzioni di Hosting

### Opzione 1: **Netlify** (Consigliato - Gratis)

1. **Crea account su** [netlify.com](https://netlify.com)
2. **Trascina l'intera cartella** `Sito_Nuovo` nella dashboard Netlify
3. **Configurazione automatica** - Netlify rileva automaticamente che è un sito statico
4. **Ottieni URL** - Riceverai un URL tipo `tuo-sito.netlify.app`
5. **Dominio personalizzato** (opzionale) - Puoi collegare `sospermesso.it`

**Vantaggi:**
- ✅ Completamente gratis
- ✅ HTTPS automatico
- ✅ Deploy in secondi
- ✅ CI/CD integrato (aggiornamenti automatici da Git)

### Opzione 2: **Vercel** (Alternativa Gratis)

1. **Crea account su** [vercel.com](https://vercel.com)
2. **Import Project** → Upload cartella `Sito_Nuovo`
3. **Deploy** - Automatico
4. **URL** - `tuo-sito.vercel.app`

### Opzione 3: **GitHub Pages** (Gratis)

1. **Crea repository** su GitHub
2. **Carica tutti i file** (escluso NOTION_WEBSITE)
3. **Settings** → **Pages** → Abilita GitHub Pages
4. **URL** - `username.github.io/sospermesso`

### Opzione 4: **Hosting Tradizionale** (cPanel, FTP)

1. **Accedi al tuo hosting** via FTP (FileZilla, Cyberduck)
2. **Carica nella cartella** `public_html` o `www`:
   - `index.html` (nella root)
   - `7ozbvy.gif` (nella root)
   - Cartella `src/` completa
3. **NON caricare:**
   - `NOTION_WEBSITE/`
   - `claude.md`
   - `HOSTING_GUIDE.md`

## ✅ Checklist Pre-Upload

- [x] File `index.html` rinominato da PREVIEW.html
- [x] Tutti i link interni aggiornati a `index.html`
- [x] Favicon `7ozbvy.gif` nella root
- [x] Emoji 🆘 in tutti gli header
- [x] Header viola con design nuovo
- [x] Tutte le pagine dei permessi linkate correttamente

## 🔗 Collegamenti Verificati

### Homepage (index.html)
- ✅ Link a `src/pages/database.html`
- ✅ Link a `src/pages/chi-siamo.html`
- ✅ Link a test Typeform (esterni)

### Database (src/pages/database.html)
- ✅ Link a `../../index.html` (home)
- ✅ Link a tutte le pagine dei permessi:
  - `permesso-studio.html`
  - `permesso-lavoro-subordinato.html`
  - `permesso-lavoro-autonomo.html`
  - `permesso-ue-lungo-periodo.html`
  - `permesso-asilo.html`
  - `permesso-protezione-sussidiaria.html`
  - `permesso-ricongiungimento-familiare.html`

### Tutte le Pagine Permessi
- ✅ Breadcrumb: Home → Database → Pagina Corrente
- ✅ Header con link a Home, Database, Chi siamo
- ✅ Footer con contact form

## 🎨 Features del Sito

### Design
- Header viola gradiente con emoji 🆘
- Hero section colorato e friendly
- Sezioni con gradienti vivaci
- Cards con effetti hover
- Mobile-first responsive

### Funzionalità
- Contact form modal (integrato ma simulato)
- Language switcher (struttura pronta per traduzioni)
- Lighthouse mascot (componente disponibile)
- Cartoon illustrations (componente disponibile)

## 🔄 Aggiornamenti Futuri

Per aggiornare il sito:

1. **Se usi Netlify/Vercel:**
   - Modifica i file in locale
   - Trascina di nuovo la cartella aggiornata
   - Deploy automatico

2. **Se usi Git + Netlify/Vercel:**
   - `git add .`
   - `git commit -m "Update"`
   - `git push`
   - Deploy automatico

3. **Se usi FTP:**
   - Modifica i file in locale
   - Carica solo i file modificati via FTP

## 📱 Test Dopo Upload

Verifica:
1. [ ] Homepage si carica correttamente
2. [ ] Tutti i link funzionano
3. [ ] Favicon appare nel browser
4. [ ] Design responsive su mobile
5. [ ] Contact form si apre
6. [ ] Link esterni ai Typeform funzionano

## 🆘 Troubleshooting

**Problema: Favicon non appare**
- Soluzione: Hard refresh (`Ctrl+Shift+R`)

**Problema: Link rotti**
- Soluzione: Verifica percorsi relativi `../../` per subfolders

**Problema: CSS non caricato**
- Soluzione: Verifica path `src/styles/*.css` e che cartella `src/` sia caricata

**Problema: Immagini/decorazioni non appaiono**
- Soluzione: Sono SVG inline nell'HTML, non servono file esterni

## 💡 Consigli

1. **Usa Netlify o Vercel** - Più facile e veloce
2. **Collega dominio personalizzato** - `sospermesso.it`
3. **Abilita HTTPS** - Automatico su Netlify/Vercel
4. **Configura analytics** - Google Analytics o Plausible
5. **Backup regolari** - Scarica i file periodicamente

## 📞 Integrazioni Future

### Contact Form (attualmente simulato)
Per rendere funzionale il form:
1. Usa servizi come:
   - **Formspree** (gratis fino a 50 form/mese)
   - **Netlify Forms** (gratis, 100 form/mese)
   - **EmailJS** (gratis, 200 email/mese)

2. Modifica `src/components/contact-form.html`:
   - Sostituisci il `setTimeout` con chiamata API reale
   - Esempio con Formspree:
   ```javascript
   const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(data)
   });
   ```

### Traduzioni
Per aggiungere altre lingue:
1. Traduci `src/data/content-it.json` in altre lingue
2. Crea `content-fr.json`, `content-es.json`, ecc.
3. Implementa logica in `src/scripts/app.js` per caricare JSON in base a lingua

---

**Pronto per il deploy! 🚀**

Per qualsiasi problema, consulta la documentazione in `claude.md`
