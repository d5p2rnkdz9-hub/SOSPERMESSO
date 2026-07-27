"""Esporta le circolari immigrazione.biz per il sito self-hosted (fase non pubblicata).

Legge:
  - data/circolari.db          (tabella circolari, source='immigrazione.biz')
  - data/classificazione.json  (chiave "biz:{source_id}" -> permessi[]/trasversale/fuori_ambito/tema)
  - data/circolari-meta/out-*.json  (SE presenti: metadati oggetto/ente/numero rifiniti da subagent;
                                      lo script funziona anche senza, usando solo i dati del DB)

Scrive:
  - _cache/circolari-site.json  (nella root del progetto Sito_Nuovo, letto da _data/circolari.js)

Uso:
    python3 export_circolari_site.py
"""

from __future__ import annotations

import json
import re
import sqlite3
from pathlib import Path

HERE = Path(__file__).parent
DB_PATH = HERE / "data" / "circolari.db"
CLASSIFICAZIONE_PATH = HERE / "data" / "classificazione.json"
META_DIR = HERE / "data" / "circolari-meta"
OUT_PATH = HERE.parent / "_cache" / "circolari-site.json"

# immigrazione.biz scraping ha decodificato alcuni testi come latin-1 anziché
# cp1252: i caratteri di punteggiatura tipografica (virgolette curve, en-dash, ...)
# finiscono come singoli codepoint nel range 0x80-0x9F. Li rimappiamo ai
# corrispondenti caratteri Unicode corretti.
_CP1252_FIX = {
    0x82: "‚", 0x83: "ƒ", 0x84: "„", 0x85: "…",
    0x86: "†", 0x87: "‡", 0x88: "ˆ", 0x89: "‰",
    0x8a: "Š", 0x8b: "‹", 0x8c: "Œ", 0x8e: "Ž",
    0x91: "‘", 0x92: "’", 0x93: "“", 0x94: "”",
    0x95: "•", 0x96: "–", 0x97: "—", 0x98: "˜",
    0x99: "™", 0x9a: "š", 0x9b: "›", 0x9c: "œ",
    0x9e: "ž", 0x9f: "Ÿ",
}


_UTF8_AS_LATIN1_CHARS = (
    "àèéìíòóùúÀÈÉÌÒÙ"          # vocali accentate italiane
    "áâãäåæçðñõöøüýþß"          # altri accentati/latini estesi che possono comparire
    "’‘“”–—…•‚„†‡ˆ‰Š‹ŒŽšœžŸ"    # punteggiatura tipografica cp1252
    "€£"
)
# Stesse righe della tabella spesso mescolano testo correttamente codificato
# (già UTF-8 valido) con frammenti ri-decodificati due volte come Latin-1
# ("â€™" al posto di "’", "Ã " al posto di "à"): un round-trip sull'intera
# stringa fallirebbe su qualunque carattere già corretto. Si sostituiscono
# quindi le sequenze mojibake note, calcolate a runtime cifra per cifra.
_UTF8_AS_LATIN1_MAP = {
    c.encode("utf-8").decode("latin-1"): c for c in _UTF8_AS_LATIN1_CHARS
}
# Le chiavi più lunghe prima, per evitare sostituzioni parziali che
# lascerebbero residui (nessuna in pratica con questo set, ma per sicurezza).
_UTF8_AS_LATIN1_KEYS = sorted(_UTF8_AS_LATIN1_MAP, key=len, reverse=True)


def fix_mojibake(s: str | None) -> str | None:
    """Ripara due pattern di mojibake distinti visti nello scraping immigrazione.biz,
    che possono anche convivere nella stessa stringa:
    (1) UTF-8 doppiamente decodificato come Latin-1 (es. "â€™" al posto di "’",
        "Ã " al posto di "à") — sostituzione mirata delle sequenze note;
    (2) singoli byte di controllo cp1252 (0x80-0x9F) rimasti come codepoint
        Latin-1 isolati (es. "\\x92" al posto di "’") — mappa di fallback.
    """
    if not s:
        return s
    for key in _UTF8_AS_LATIN1_KEYS:
        if key in s:
            s = s.replace(key, _UTF8_AS_LATIN1_MAP[key])
    return "".join(_CP1252_FIX.get(ord(c), c) for c in s)


HEADER_MARKER = "push({});"
# Widget "News" di sidebar (notizie correlate, contenuto variabile per data di
# scraping): sempre introdotto da un adsense seguito da "News " + titolo del
# giorno. Pattern verificato su tutte le 1272 righe, sempre una sola occorrenza,
# mai prima del carattere ~666 (ben oltre il chrome di testa).
FOOTER_MARKER_RE = re.compile(r"\(adsbygoogle[^)]*\)\.push\(\{\}\);\s*News\s")
# Subito prima dell'adsense che introduce il widget News c'è quasi sempre un
# timbro "Giorno della settimana, DD Mese YYYY" (data dell'articolo, ripetuta
# come didascalia): non è parte del corpo del testo, va rimosso insieme al resto.
DATE_STAMP_TAIL_RE = re.compile(
    r"(?:Lunedì|Martedì|Mercoledì|Gioved[iì]|Venerdì|Sabato|Domenica),?\s+"
    r"\d{1,2}\s+\w+\s+\d{4}\s*$"
)


def clean_body(raw: str | None) -> str:
    """Rimuove il chrome del sito immigrazione.biz (nav/login/ads in testa,
    widget di sidebar e footer di navigazione in coda) e normalizza gli spazi,
    preservando gli a-capo per la successiva paragrafazione.

    Euristiche verificate su tutte le 1272 righe immigrazione.biz:
    - Header: sempre >= 3 occorrenze di "push({});" nei primi ~1200 caratteri
      (nav/login, poi due adsense che affiancano il titolo); il contenuto
      vero inizia subito dopo la TERZA occorrenza. Alcuni articoli molto
      corti hanno una quarta occorrenza subito dopo (adsense prima della
      sidebar "News") che va ignorata: usare sempre la terza, non l'ultima.
    - Footer: il widget "News" di sidebar (notizie correlate) è sempre
      introdotto da un adsense seguito da "News " + titolo del giorno;
      pattern presente su tutte le righe, contenuto variabile ma marker
      stabile, non prima del carattere ~666 (ben oltre il chrome di testa).
    """
    if not raw:
        return ""
    text = fix_mojibake(raw)

    matches = [m.end() for m in re.finditer(re.escape(HEADER_MARKER), text[:1200])]
    if len(matches) >= 3:
        stripped = text[matches[2]:].lstrip()
        if len(stripped) >= 50:
            text = stripped

    footer_match = FOOTER_MARKER_RE.search(text)
    if footer_match and footer_match.start() > 0:
        text = text[:footer_match.start()].rstrip()

    text = DATE_STAMP_TAIL_RE.sub("", text).rstrip()

    return text.strip()


# Abbreviazioni giuridiche/burocratiche italiane che nel testo grezzo terminano
# con un punto ma non chiudono la frase: la sentence-split regex (basata su
# [.!?] seguito da maiuscola/cifra) le tratta erroneamente come fine periodo,
# spezzando ad es. "previste dall'art." | "35 del Decreto legislativo...".
# Catalogo verificato su un campione di _cache/circolari-site.json (vedi
# data/normalize-report.md): ~3200 paragrafi su 11132 (~29%) terminavano con
# una di queste abbreviazioni troncate.
_ABBREV_WORDS = [
    "art", "artt", "n", "nn", "co", "commi", "d.lgs", "d.l", "d.p.r", "d.p.c.m",
    "d.m", "l", "lett", "all", "cap", "par", "pag", "prot", "dott", "dott.ssa",
    "avv", "on", "sig", "sig.ra", "ecc", "v", "cfr", "ss", "succ", "mod", "reg",
    "delib", "circ", "sez", "ord", "sent",
]
# Le più lunghe prima, per evitare che una forma più corta (es. "d.l") mangi
# il match di una più lunga e specifica (es. "d.lgs") nella stessa alternanza.
_ABBREV_ALT = "|".join(re.escape(w) for w in sorted(_ABBREV_WORDS, key=len, reverse=True))
_ABBREV_END_RE = re.compile(rf"(?i)\b(?:{_ABBREV_ALT})\.$")
# Sigle puntate generiche non elencate sopra (es. "U.E.", "S.S.N.", "T.U.",
# "D.P.R." è già coperta ma resta innocuo un doppio match): due o più lettere
# singole separate da punto, fino alla fine della frase candidata.
_SIGLA_END_RE = re.compile(r"\b(?:[A-Za-z]\.){2,}$")


def _ends_with_truncated_abbrev(sentence: str) -> bool:
    s = sentence.rstrip()
    return bool(_ABBREV_END_RE.search(s) or _SIGLA_END_RE.search(s))


def _starts_with_digit(sentence: str) -> bool:
    s = sentence.lstrip()
    return bool(s) and s[0].isdigit()


def _merge_false_sentence_splits(sentences: list[str]) -> list[str]:
    """Ricongiunge frasi separate erroneamente dalla sentence-split regex:
    (1) la frase precedente termina con un'abbreviazione troncata (es. "art.",
        "D.P.R.", "n."): non era mai fine periodo, solo un punto abbreviativo;
    (2) la frase successiva inizia con una cifra: in italiano giuridico
        formale un nuovo periodo non inizia quasi mai con un numero grezzo,
        è quasi sempre il proseguimento di una citazione numerica (numero di
        legge, articolo, anno) troncata dal punto abbreviativo precedente."""
    merged: list[str] = []
    for sentence in sentences:
        if merged and (_ends_with_truncated_abbrev(merged[-1]) or _starts_with_digit(sentence)):
            merged[-1] = f"{merged[-1]} {sentence}"
        else:
            merged.append(sentence)
    return merged


def paragraphize(text: str) -> list[str]:
    """Spezza il testo ripulito (senza a-capo affidabili, lo scraping li ha
    appiattiti) in paragrafi ragionevoli usando la punteggiatura come euristica:
    fine frase seguita da maiuscola/numero che introduce un nuovo periodo lungo
    non basta da sola, quindi raggruppiamo un numero massimo di frasi per
    paragrafo per evitare un muro di testo unico."""
    text = re.sub(r"[ \t]+", " ", text).strip()
    if not text:
        return []

    # Se il testo ha già a-capo doppi, rispettali come separatori di paragrafo.
    if "\n\n" in text:
        parts = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        return parts

    text = text.replace("\n", " ")
    # Spezza in frasi mantenendo la punteggiatura finale.
    sentences = re.split(r"(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9\"«])", text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return [text]
    sentences = _merge_false_sentence_splits(sentences)

    paragraphs: list[str] = []
    current: list[str] = []
    current_len = 0
    for sentence in sentences:
        current.append(sentence)
        current_len += len(sentence)
        # Chiudi il paragrafo ogni ~500 caratteri o 4 frasi, quello che arriva prima.
        if current_len >= 500 or len(current) >= 4:
            paragraphs.append(" ".join(current))
            current = []
            current_len = 0
    if current:
        paragraphs.append(" ".join(current))
    return paragraphs


def norm_date(raw) -> str | None:
    if raw is None:
        return None
    s = str(raw).strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        return s
    if re.fullmatch(r"\d{4}", s):
        return f"{s}-01-01"
    m = re.fullmatch(r"(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})", s)
    if m:
        return f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}"
    return None


_MONTHS_IT = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
]


def format_date_it(iso_date: str | None) -> str | None:
    if not iso_date:
        return None
    m = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", iso_date)
    if not m:
        return None
    year, month, day = m.groups()
    month_name = _MONTHS_IT[int(month) - 1]
    if day == "01" and month == "01":
        # Data ricostruita solo dall'anno: non mostrare "1 gennaio" fuorviante.
        return year
    return f"{int(day)} {month_name} {year}"


def load_meta_overrides() -> dict[str, dict]:
    overrides: dict[str, dict] = {}
    if not META_DIR.exists():
        return overrides
    for path in sorted(META_DIR.glob("out-*.json")):
        try:
            records = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            print(f"[export_circolari_site] WARN: skip {path.name}: {exc}")
            continue
        for rec in records:
            rid = rec.get("id")
            if rid:
                overrides[rid] = rec
    return overrides


# Normalizzazione varianti dello stesso ente emittente (stesso ente, denominazione
# diversa nel tempo o refuso di scraping). Verificato con una query di conteggio
# sul campo `ente` di _cache/circolari-site.json (1272 righe). Non tocca gli enti
# "doppi" (es. "Ministero dell'Interno e Ministero del Lavoro...") né altre varianti
# non elencate: quelle restano come sono nel DB.
ENTE_NORMALIZZAZIONE = {
    "Istituto Nazionale Previdenza Sociale": "INPS",
    "INPS - Istituto Nazionale Previdenza Sociale": "INPS",
    "Istituto Nazionale della Previdenza Sociale": "INPS",
    "Istituto Nazionale di Previdenza Sociale": "INPS",
    "Ministero del Lavoro e delle Politiche Sociali": "Ministero del Lavoro",
    "Ministero del Lavoro e della Previdenza Sociale": "Ministero del Lavoro",
    "Ministero del Lavoro, della Salute e delle Politiche Sociali": "Ministero del Lavoro",
    "Ministero delle Infrastrutture": "Ministero delle Infrastrutture e dei Trasporti",
    "Ministero dell'Istruzione, dell'Università e della Ricerca": "Ministero dell'Istruzione",
    "Ministero della Pubblica Istruzione": "Ministero dell'Istruzione",
    "Ministero della Sanità": "Ministero della Salute",
    "Ministero di Grazia e Giustizia": "Ministero della Giustizia",
}


def normalize_ente(ente: str | None) -> str | None:
    if not ente:
        return ente
    return ENTE_NORMALIZZAZIONE.get(ente.strip(), ente)


def build_titolo_pubblico(ente: str | None, numero: str | None, data_it: str | None, oggetto: str | None) -> str:
    ente_clean = (ente or "").strip()
    numero_clean = (numero or "").strip()
    data_clean = (data_it or "").strip()

    if ente_clean:
        head = ente_clean
    else:
        head = "Circolare"

    detail_bits = []
    if numero_clean:
        detail_bits.append(f"n. {numero_clean}")
    if data_clean:
        detail_bits.append(f"del {data_clean}")

    if ente_clean and detail_bits:
        title = f"{head} — Circolare {' '.join(detail_bits)}"
    elif ente_clean:
        title = f"{head} — Circolare"
    elif detail_bits:
        title = f"Circolare {' '.join(detail_bits)}"
    else:
        title = "Circolare"

    oggetto_clean = (oggetto or "").strip()
    if oggetto_clean:
        # L'oggetto grezzo del DB a volte contiene già "Oggetto: ..." e il corpo intero
        # (vedi PROMPT.md dei metadati): teniamo solo la prima frase/riga come titolo.
        oggetto_clean = re.sub(r"^Oggetto:\s*", "", oggetto_clean, flags=re.I)
        first_line = re.split(r"\s-\s|\n", oggetto_clean)[0].strip()
        first_line = first_line[:160].rstrip(" .")
        if first_line:
            title = f"{title}: {first_line}"

    return title


def main() -> int:
    if not DB_PATH.exists():
        print(f"[export_circolari_site] DB non trovato: {DB_PATH}")
        return 1

    classificazione = {}
    if CLASSIFICAZIONE_PATH.exists():
        classificazione = json.loads(CLASSIFICAZIONE_PATH.read_text(encoding="utf-8"))

    meta_overrides = load_meta_overrides()
    print(f"[export_circolari_site] Metadata overrides disponibili per {len(meta_overrides)} circolari")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT source_id, titolo, ente_emittente, numero_protocollo, data_pubblicazione, "
        "oggetto, testo_plain FROM circolari WHERE source = 'immigrazione.biz' ORDER BY id"
    ).fetchall()
    conn.close()

    records = []
    for row in rows:
        source_id = row["source_id"]
        biz_key = f"biz:{source_id}"
        override = meta_overrides.get(biz_key, {})
        classif = classificazione.get(biz_key, {})

        ente = normalize_ente(fix_mojibake(override.get("ente") or row["ente_emittente"]))
        numero = override.get("numero") or row["numero_protocollo"]
        oggetto = fix_mojibake(override.get("oggetto") or row["oggetto"])

        data_iso = norm_date(row["data_pubblicazione"])
        data_it = format_date_it(data_iso)

        titolo_pubblico = build_titolo_pubblico(ente, numero, data_it, oggetto)

        body = clean_body(row["testo_plain"])
        paragrafi = paragraphize(body)

        records.append({
            "id": biz_key,
            "slug": f"circolare-{source_id}",
            "titolo_pubblico": titolo_pubblico,
            "ente": ente or None,
            "numero": numero or None,
            "data": data_iso,
            "dataLeggibile": data_it,
            "oggetto": oggetto or None,
            "tema": classif.get("tema") or None,
            "permessi": classif.get("permessi", []),
            "trasversale": bool(classif.get("trasversale", False)),
            "fuori_ambito": bool(classif.get("fuori_ambito", False)),
            "testo": paragrafi,
        })

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[export_circolari_site] Scritte {len(records)} circolari in {OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
