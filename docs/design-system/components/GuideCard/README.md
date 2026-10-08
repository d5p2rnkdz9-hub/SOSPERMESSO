# GuideCard

Card di una guida nella sezione «Guide passo passo» della home, senza sottotitolo di sezione.

- Card `sp-white`, contorno `border-ui`, raggio `radius-lg`, ombra `sticker`, padding 20px, altezza minima 150px.
- In alto il chip d'argomento (Poppins 700, 12px, maiuscolo, bordo 2px, raggio `radius-sm`): Protezione `cat-protection`, Famiglia `cat-family`, Lavoro `cat-work`, Pratiche `sp-yellow`.
- Il titolo è una domanda in prima persona (Poppins 800, 20px), ad esempio «Il mio permesso è pronto?».
- In fondo il link d'azione, sottolineato con un tratto `sp-yellow` da 3px.
- Guida non ancora pubblicata: badge «In arrivo» tratteggiato accanto al chip; la card resta cliccabile solo se la pagina esiste.
- Griglia: `repeat(auto-fill, minmax(260px, 1fr))`, gap 18px.
- Le 8 guide attuali: protezione internazionale, ricongiungimento familiare, lavorare in Italia, decreto flussi, documenti per la Questura, kit postale, costi, controlla permesso.
