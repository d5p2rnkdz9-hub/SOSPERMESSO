# TestCard

Le due porte d'ingresso ai test interattivi, sempre in coppia e con la stessa forma.

- Card bianca, contorno `border-ui` in `sp-ink`, raggio `radius-lg`, ombra `sticker-md`, padding 18px 22px.
- Titolo h3 (Poppins 800, 21–22px) + riga d'azione (Poppins 700, 16–17px) che finisce con →.
- Testi fissi: «Non ho ancora un permesso» / «Aiutami a capire se posso averlo →» e «Ho già un permesso» / «Posso rinnovarlo o convertirlo? →».
- Disposizione: griglia `repeat(auto-fit, minmax(240px, 1fr))` con gap `space-4`. Su mobile vanno in colonna.
- Si usano nell'hero (su `sp-yellow`) e nel riepilogo finale «Non sai da dove partire?».
- Il consumatore fornisce: i due href verso app.sospermesso.it.
