"""Scraper for permessidisoggiorno.info — Normativa.aspx?nid=N.

The site mixes Circolari + Leggi + Decreti + Sentenze. We save everything (so the
nid is not re-fetched later), but flag `included_in_corpus = 0` for types outside
the MVP scope (Legge, Decreto Legge, Decreto Legislativo, Sentenza).
"""

from __future__ import annotations

import re
import sqlite3
from typing import Optional
from urllib.parse import urljoin

import httpx
from selectolax.parser import HTMLParser

from . import common

SOURCE = "permessidisoggiorno.info"
BASE = "https://www.permessidisoggiorno.info"
PAGE_URL = BASE + "/Normativa.aspx?nid={id}"

# Types kept in the MVP corpus.
INCLUDED_TYPES = {
    "circolare",
    "nota",
    "dpcm",
    "decreto ministeriale",
    "decreto presidenziale",
    "direttiva",
}

# Phrases that mean "page is a not-found stub".
_NOT_FOUND_PHRASES = (
    "normativa non trovata",
    "permesso negato",
    "non &egrave; pi&ugrave; presente",
    "non e' piu' presente",
)


def url_for(source_id: int) -> str:
    return PAGE_URL.format(id=source_id)


def is_not_found(html: str) -> bool:
    lower = html.lower()
    return any(p in lower for p in _NOT_FOUND_PHRASES)


def _build_label_map(tree: HTMLParser) -> dict[str, str]:
    """Read the 'dati Normativa' label/value sequence.

    The site renders pairs as adjacent spans:
        <span class="newslabeldati">Tipo: </span>
        <span class="newsdati">Circolare</span>

    We collect labels and values in document order and zip them.
    """
    labels = [
        common.normalize_ws(n.text(separator=" ", strip=True))
        for n in tree.css("span.newslabeldati")
    ]
    values = [
        common.normalize_ws(n.text(separator=" ", strip=True))
        for n in tree.css("span.newsdati")
    ]
    out: dict[str, str] = {}
    for label, value in zip(labels, values):
        if not label or not value:
            continue
        key = label.rstrip(":").rstrip().lower()
        out[key] = value
    return out


def _label_value(label_map: dict[str, str], *candidates: str) -> Optional[str]:
    for key in candidates:
        v = label_map.get(key.lower())
        if v:
            return v
    return None


def _first_pdf_link(tree: HTMLParser) -> Optional[str]:
    for a in tree.css("a[href]"):
        href = a.attributes.get("href", "")
        if href and href.lower().endswith(".pdf"):
            return urljoin(BASE + "/", href)
    return None


def _synthesize_title(
    tipo: Optional[str],
    numero: Optional[str],
    data_iso: Optional[str],
    ente: Optional[str],
) -> str:
    """Build a readable title from the structured metadata.

    permessidisoggiorno.info has no inline circolare title — the page <h1> is
    always the site banner. We compose from the data block instead.
    """
    parts: list[str] = []
    if tipo:
        parts.append(tipo)
    if numero:
        # Avoid "Circolare Circolare 400/..." when the number already encodes the tipo.
        if tipo and numero.lower().startswith(tipo.lower()):
            parts[-1] = numero
        elif numero.lower().startswith(("n.", "n ", "nota", "decreto", "circolare", "legge")):
            parts.append(numero)
        else:
            parts.append(f"n. {numero}")
    if data_iso:
        parts.append(f"del {data_iso}")
    if ente:
        parts.append(f"— {ente}")
    return " ".join(parts) if parts else "Normativa"


def parse(html: str, source_id: int) -> Optional[dict]:
    if is_not_found(html):
        return None

    tree = HTMLParser(html)

    # Strip menu/footer noise for "main" capture.
    main_text = common.normalize_ws(
        tree.body.text(separator="\n", strip=True) if tree.body else ""
    )
    if not main_text or len(main_text) < 50:
        return None

    label_map = _build_label_map(tree)
    tipo = _label_value(label_map, "Tipo")
    if not tipo:
        # If we cannot detect a "Tipo:" field, the page may not be a real Normativa.
        return None

    # Will be synthesized after we have all metadata.
    titolo = None  # type: ignore[assignment]
    data_raw = _label_value(label_map, "Data")
    data_iso = common.parse_italian_date(data_raw or "") if data_raw else None
    ente = _label_value(
        label_map, "Autorità Emittente", "Autorita Emittente", "Autorit"
    )
    if ente:
        match = common.detect_ente(ente)
        if match:
            ente = match
    numero = _label_value(label_map, "Numero")
    titolo = _synthesize_title(tipo, numero, data_iso, ente)

    # Oggetto: the descriptive paragraph after the data block, if recognizable.
    oggetto: Optional[str] = None
    # Heuristic: first <p> with > 30 chars that does NOT start with one of the field labels.
    for p in tree.css("p"):
        t = common.normalize_ws(p.text(separator=" ", strip=True))
        if not t or len(t) < 30:
            continue
        low = t.lower()
        if any(low.startswith(lbl) for lbl in ("ambito", "tipo:", "numero:", "data:", "autorit")):
            continue
        oggetto = t[:400]
        break

    pdf_url = _first_pdf_link(tree)

    tipo_norm = (tipo or "").lower().strip()
    included = 1 if any(t in tipo_norm for t in INCLUDED_TYPES) else 0

    return {
        "source": SOURCE,
        "source_id": str(source_id),
        "source_url": url_for(source_id),
        "titolo": (titolo or "")[:500],
        "data_pubblicazione": data_iso,
        "ente_emittente": ente,
        "tipo_documento": tipo,
        "numero_protocollo": numero,
        "oggetto": oggetto,
        "testo_html": None,  # only abstract is inline; full text is in PDF
        "testo_plain": oggetto,
        "pdf_url": pdf_url,
        "included_in_corpus": included,
        "raw_html": html,
    }


def scrape_range(
    conn: sqlite3.Connection,
    client: httpx.Client,
    limiter: common.RateLimiter,
    start: int,
    end: int,
    insert_fn,
    log_fn,
    already_seen_fn,
    on_progress=None,
) -> dict:
    counters = {"saved": 0, "not_found": 0, "errors": 0, "skipped": 0, "filtered": 0}

    for sid in range(start, end + 1):
        if already_seen_fn(conn, SOURCE, str(sid)):
            counters["skipped"] += 1
            if on_progress:
                on_progress(sid, "skip", counters)
            continue

        url = url_for(sid)
        try:
            r = common.fetch(client, url, limiter)
        except Exception as exc:
            counters["errors"] += 1
            log_fn(conn, SOURCE, str(sid), "error", str(exc)[:200])
            conn.commit()
            if on_progress:
                on_progress(sid, "error", counters)
            continue

        if r.status_code == 404:
            counters["not_found"] += 1
            log_fn(conn, SOURCE, str(sid), "404", None)
            conn.commit()
            if on_progress:
                on_progress(sid, "404", counters)
            continue

        if r.status_code != 200:
            counters["errors"] += 1
            log_fn(conn, SOURCE, str(sid), f"http_{r.status_code}", None)
            conn.commit()
            if on_progress:
                on_progress(sid, f"http_{r.status_code}", counters)
            continue

        record = parse(r.text, sid)
        if record is None:
            counters["not_found"] += 1
            log_fn(conn, SOURCE, str(sid), "empty", None)
            conn.commit()
            if on_progress:
                on_progress(sid, "empty", counters)
            continue

        insert_fn(conn, record)
        if record["included_in_corpus"] == 0:
            counters["filtered"] += 1
        else:
            counters["saved"] += 1
        conn.commit()
        if on_progress:
            on_progress(sid, "saved", counters)

    return counters
