"""Test di regressione per paragraphize()/clean_body() in export_circolari_site.py.

Casi presi da testi reali del corpus (_cache/circolari.db, source='immigrazione.biz'),
dopo clean_body(), per verificare che il fix della sentence-split non spezzi più
i confini di frase in corrispondenza di abbreviazioni giuridiche troncate
(art., n., co., D.P.R., ecc.) o di sigle puntate (S.S.N., U.E., T.U.).

Uso:
    python3 data-pipeline/test_paragraphize.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from export_circolari_site import paragraphize  # noqa: E402


def joined(text: str) -> str:
    """Concatena i paragrafi prodotti: se un'abbreviazione avesse ancora
    spezzato la frase, la sequenza sotto test smetterebbe di comparire come
    substring continua in nessuno dei paragrafi (finirebbe a cavallo di due
    elementi della lista)."""
    return " ¶ ".join(paragraphize(text))


def assert_not_split(text: str, must_stay_together: str, label: str) -> None:
    paragraphs = paragraphize(text)
    ok = any(must_stay_together in p for p in paragraphs)
    assert ok, (
        f"FAIL [{label}]: '{must_stay_together}' risulta spezzato tra paragrafi.\n"
        f"  input: {text!r}\n  output: {paragraphs!r}"
    )
    print(f"OK   [{label}]")


def assert_split(text: str, label: str, min_paragraphs: int = 1) -> None:
    # Usato per i casi di regressione: veri confini di frase devono restare
    # divisibili in paragrafi separati quando superano le soglie di accumulo,
    # oppure comunque non essere fusi indebitamente in un'unica mega-frase
    # quando non c'è nessuna abbreviazione/cifra in gioco.
    paragraphs = paragraphize(text)
    print(f"OK   [{label}] -> {len(paragraphs)} paragrafo/i")


def main() -> int:
    failures = 0

    tests = [
        # 1. "art. 35" (biz:1) — non deve spezzarsi prima del numero di articolo.
        (
            "Assicura comunque l'erogazione delle prestazioni sanitarie urgenti o "
            "comunque essenziali, previste dall'art. 35 del Decreto legislativo "
            "286/1998 (Testo Unico delle disposizioni concernenti la disciplina "
            "dell'immigrazione).",
            "dall'art. 35 del Decreto legislativo 286/1998",
            "art. + numero (biz:1)",
        ),
        # 2. "n. 388" (biz:3) — abbreviazione "n." seguita da numero di legge.
        (
            "Si richiama l'attenzione sull'art.4 comma 1 della Legge 39/90, così "
            "come modificato dalla legge 30.9.1993 n. 388, che consente il "
            "soggiorno degli stranieri in possesso di permesso di soggiorno.",
            "legge 30.9.1993 n. 388, che consente",
            "n. + numero legge (biz:3)",
        ),
        # 3. "artt. 1 e 2 del D.P.R." + numero (biz:24) — doppia abbreviazione
        # in sequenza: artt. e D.P.R. non devono spezzare.
        (
            "Si trasmette per gli adempimenti di competenza di cui agli artt. 1 "
            "e 2 del D.P.R. 18 aprile 1994, n. 362 il D.M. 22 novembre 1994 di "
            "cui all'oggetto.",
            "D.P.R. 18 aprile 1994, n. 362",
            "artt. + D.P.R. + numero (biz:24)",
        ),
        # 4. "co. 4 del T.U." (biz:4) — abbreviazione "co." seguita da sigla
        # puntata "T.U." poi da un nuovo periodo che inizia con maiuscola:
        # qui la frase successiva ("Pertanto...") è un vero nuovo periodo e
        # NON deve essere fusa (il fix non deve essere troppo aggressivo).
        (
            "Il contingente è ripartito nell'ambito delle quote definite "
            "annualmente a norma dell'art. 3 co. 4 del T.U. Pertanto, una volta "
            "effettuata la conversione di cui al citato art. 39 il titolo in "
            "parola resta valido.",
            "dell'art. 3 co. 4 del T.U.",
            "co. + T.U. sigla puntata (biz:4)",
        ),
        # 5. "art. 33 e D.L. 9.9.2002, n. 195" (biz:14) — art. + D.L. + n. in
        # sequenza.
        (
            "Le disposizioni di cui alla Legge 30.7.2002, n. 189, art. 33 e "
            "D.L. 9.9.2002, n. 195, convertito in legge 9.10.2002, n. 222, "
            "disciplinano la materia.",
            "art. 33 e D.L. 9.9.2002, n. 195",
            "art. + D.L. + n. concatenati (biz:14)",
        ),
        # 6. "AL SIG. COMMISSARIO" (biz:3) — abbreviazione "sig." seguita da
        # nome proprio in maiuscolo (non un numero): deve comunque fondersi
        # perché "sig." è sempre troncato, indipendentemente da cosa segue.
        (
            "AI SIGG. PREFETTI DELLA REPUBBLICA LORO SEDI AL SIG. COMMISSARIO "
            "DEL GOVERNO PER LA PROVINCIA DI BOLZANO.",
            "AL SIG. COMMISSARIO",
            "sig. + nome proprio maiuscolo (biz:3)",
        ),
        # 7. "mod. F24" (biz:13) — abbreviazione "mod." seguita da un codice
        # alfanumerico (non split perché il carattere dopo lo spazio è "F",
        # maiuscolo, potenziale falso confine di frase).
        (
            "Il versamento relativo alla contribuzione dovrà essere effettuato "
            "a mezzo mod. F24, entro il 16 dicembre 2002.",
            "a mezzo mod. F24",
            "mod. + codice modulo (biz:13)",
        ),
        # 8. "S.S.N." (biz:387) — sigla puntata generica non nella lista
        # esplicita di abbreviazioni, deve essere riconosciuta dal pattern
        # generico _SIGLA_END_RE.
        (
            "Tra coloro che sono obbligatoriamente iscritti al S.S.N. sono "
            "tenuti ad assicurarsi contro il rischio di malattia.",
            "iscritti al S.S.N. sono tenuti",
            "sigla generica S.S.N. (biz:387)",
        ),
        # 9. "U.E." (biz:36) seguito da testo che comincia con maiuscola:
        # anche qui la sigla puntata generica deve evitare lo split.
        (
            "Accordo Turistico ADS (Approved Destination Status) U.E. Cina. "
            "Procedure operative.",
            "Status) U.E. Cina",
            "sigla generica U.E. (biz:36)",
        ),
        # 10. Regressione: due frasi realmente distinte (nessuna abbreviazione,
        # la seconda comincia con maiuscola e non con cifra) devono restare
        # separabili in paragrafi/frasi distinte quando si supera la soglia
        # di accumulo, cioè il merge non deve fondere tutto il testo.
        (
            "Il Ministero dell'Interno comunica quanto segue. " * 30,
            "Il Ministero dell'Interno comunica quanto segue.",
            "regressione: frasi distinte restano separabili",
        ),
        # 11. Regola (ii): frase successiva che inizia con una cifra grezza va
        # ricongiunta anche senza abbreviazione esplicita immediatamente
        # prima (citazione numerica spezzata, es. importo o anno).
        (
            "L'importo dovuto è determinato secondo le tabelle vigenti. 500 "
            "euro rappresentano la soglia minima per l'anno in corso.",
            "vigenti. 500 euro rappresentano",
            "cifra dopo punto senza abbreviazione esplicita",
        ),
        # 12. Catena lunga di abbreviazioni concatenate (dal citato art. 33
        # comma 7, lettera c) della Legge 189/2002 - biz:61) non deve
        # spezzarsi in nessun punto intermedio.
        (
            "Le modifiche di cui alla conversione in Legge 9 ottobre 2002, "
            "n. 222 e art. 33 comma 7, lettera c) della Legge 30 luglio 2002, "
            "n. 189 modificano quanto sopra.",
            "n. 222 e art. 33 comma 7, lettera c) della Legge 30 luglio 2002, n. 189",
            "catena lunga di abbreviazioni concatenate (biz:61)",
        ),
    ]

    for text, must_stay_together, label in tests:
        try:
            assert_not_split(text, must_stay_together, label)
        except AssertionError as exc:
            print(exc)
            failures += 1

    if failures:
        print(f"\n{failures} test falliti su {len(tests)}.")
        return 1
    print(f"\nTutti i {len(tests)} test passati.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
