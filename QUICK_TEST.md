# 🚀 Quick Test Guide - Mobile Priority

## Test SUBITO (2 minuti)

### 1. Apri il Sito
```bash
cd /Users/albertopasquero/Desktop/TECH/SOSpermesso/Sito_Nuovo
python3 -m http.server 8000
```
Visita: **http://localhost:8000/PREVIEW.html**

### 2. Testa Desktop
✅ Lighthouse appare e si anima
✅ Menu funziona
✅ Cards si vedono bene

### 3. Testa Mobile (Chrome DevTools)
**Premi F12 → Toggle Device (Ctrl+Shift+M)**

Seleziona: **iPhone 12 Pro**

#### Checklist Mobile:
- [ ] **NO scroll orizzontale** (importante!)
- [ ] Header compatto (solo icona 🏮)
- [ ] Hamburger menu funziona (☰)
- [ ] Lighthouse dimensioni OK (piccolo ma visibile)
- [ ] Cards in colonna singola
- [ ] Bottoni larghi 100%
- [ ] Click "Scrivici" → Form appare

### 4. Testa Contact Form
1. Click bottone **"Scrivici"**
2. ✅ Modal appare centrato
3. ✅ Backdrop sfocato
4. ✅ Compila form
5. ✅ Submit mostra "Messaggio inviato"
6. ✅ Click X o ESC chiude

## Problemi Comuni

### "Non vedo il lighthouse"
→ Usa server locale, non file://

### "Scroll orizzontale presente"
→ Hard refresh: Ctrl+Shift+R

### "Contact form non si apre"
→ Controlla console: contact-form.html caricato?

### "Menu non funziona"
→ Controlla che mobile.js sia caricato

## Test su Telefono Reale

### Trova IP del tuo computer:
```bash
# Mac/Linux
ifconfig | grep inet

# Windows
ipconfig
```

### Dal telefono:
Apri browser → `http://[TUO-IP]:8000/PREVIEW.html`

Esempio: `http://192.168.1.100:8000/PREVIEW.html`

---

## ✅ Se Tutto OK

Sei pronto per:
1. Aggiungere contenuti
2. Tradurre altre lingue
3. Deploy online

## 🐛 Se Ci Sono Problemi

Leggi:
- `MOBILE_FIXES_APPLIED.md` - Fix applicati
- `MOBILE_GUIDE.md` - Guida completa
- Console browser per errori JavaScript

---

Made with 💛
