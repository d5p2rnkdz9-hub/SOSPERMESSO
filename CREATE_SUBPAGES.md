# 📋 Creazione Sottopagine Database

## ✅ Pagina Creata
1. **permesso-studio.html** - Completa con tutti i dettagli

## 📝 Template per Altre Pagine

Usa `permesso-studio.html` come template e modifica:

### Elementi da Cambiare:
1. **Title** (riga 5): `<title>Nome Permesso - SOS Permesso</title>`
2. **Breadcrumb** (riga 41): Nome permesso
3. **Page Icon** (riga 48): Emoji appropriata
4. **Page Title** (riga 49): Nome permesso
5. **Subtitle** (riga 50): Breve descrizione
6. **Contenuto**: Sezioni specifiche per quel permesso

### Sezioni Standard da Includere:
- ✅ Cos'è
- ✅ Durata
- ✅ Requisiti (Primo rilascio + Rinnovo)
- ✅ Documenti (Primo rilascio + Rinnovo)  
- ✅ Si può lavorare?
- ✅ Conversione possibile
- ✅ Costi

### Link da Aggiornare in database.html:
```html
<a href="nome-file.html" class="card card-link hover-lift">
```

## 🚀 Quick Create (copypaste)

```bash
# Copia template
cp src/pages/permesso-studio.html src/pages/NUOVO-PERMESSO.html

# Modifica il nuovo file con i dati specifici
```

## 📚 Permessi Prioritari da Creare:

### Studio/Lavoro
- [x] Permesso per studio
- [ ] Lavoro subordinato
- [ ] Lavoro autonomo  
- [ ] Permesso UE lungo periodo
- [ ] Attesa occupazione

### Protezione
- [ ] Richiesta asilo (permesso giallo)
- [ ] Asilo politico (status rifugiato)
- [ ] Protezione sussidiaria
- [ ] Protezione speciale
- [ ] Minore età

### Cure Mediche
- [ ] Gravidanza
- [ ] Cure mediche
- [ ] Gravi motivi di salute

### Motivi Familiari
- [ ] Ricongiungimento familiare
- [ ] Coesione familiare
- [ ] Genitore minore italiano
- [ ] Carta soggiorno familiari

---

**Nota:** Ogni pagina usa lo stesso header/footer e include il contact form modal.
