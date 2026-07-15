"""Scraper for immigrazione.biz — single page circolari at circolare.php?id=N."""

from __future__ import annotations

import re
import sqlite3
from typing import Iterator, Optional

import httpx
from selectolax.parser import HTMLParser

from . import common

SOURCE = "immigrazione.biz"
BASE = "https://www.immigrazione.biz"
PAGE_URL = BASE + "/circolare.php?id={id}"

# Heuristics for detecting "not found" pages.
_NOT_FOUND_PHRASES = (
    "articolo non trovato",
    "pagina non trovata",
    "circolare non trovata",
    "non &egrave; presente",
    "non e' presente",
)


def url_for(source_id: int) -> str:
    return PAGE_URL.format(id=source_id)


def is_not_found(html: str) -> bool:
    lower = html.lower()
    return any(p in lower for p in _NOT_FOUND_PHRASES)


def _first_meaningful(tree: HTMLParser, selector: str, min_len: int = 10) -> Optional[str]:
    """Return text of the first node matching `selector` whose stripped text has
    at least `min_len` chars. The page has multiple empty h1 placeholders
    before the real article header."""
    for node in tree.css(selector):
        text = common.normalize_ws(node.text(separator=" ", strip=True))
        if text and len(text) >= min_len:
            return text
    return None


def _extract_main_content(tree: HTMLParser) -> Optional[HTMLParser]:
    """Best-effort: return the node that wraps the article body.

    immigrazione.biz uses fairly classic markup. We try common selectors in order.
    """
    for sel in ("article", "#content", ".content", "#main", "main", "td.contenuto"):
        node = tree.css_first(sel)
        if node:
            return node
    return tree.body


def parse(html: str, source_id: int) -> Optional[dict]:
    """Parse a single circolare page. Return record dict, or None if page is invalid."""
    if is_not_found(html):
        return None

    tree = HTMLParser(html)

    titolo = _first_meaningful(tree, "h1") or _first_meaningful(tree, "h2")
    if not titolo:
        # Pages without a real title are most likely error / empty stubs.
        return None

    main = _extract_main_content(tree)
    main_html = main.html if main else html
    main_text = (
        common.normalize_ws(main.text(separator="\n", strip=True)) if main else ""
    )

    # Date is extracted ONLY from the title. The body fallback was unreliable
    # because pages include the site's "today" header date.
    data_iso = common.parse_italian_date(titolo)

    ente = common.detect_ente(titolo)
    if not ente and main_text:
        # Look in the first ~500 chars of body
        ente = common.detect_ente(main_text[:500])

    protocollo = common.extract_protocollo(titolo)
    if not protocollo and main_text:
        protocollo = common.extract_protocollo(main_text[:500])

    # Tipo documento — immigrazione.biz mixes circolari + note + messaggi under the same path.
    # Default to "Circolare" but detect "Nota" / "Messaggio" from the title.
    tipo = "Circolare"
    lower_title = titolo.lower()
    if "messaggio" in lower_title[:30]:
        tipo = "Messaggio"
    elif "nota" in lower_title[:30]:
        tipo = "Nota"

    # Oggetto: try to find a paragraph starting with "Oggetto:"
    oggetto: Optional[str] = None
    if main:
        for p in main.css("p"):
            t = common.normalize_ws(p.text(separator=" ", strip=True))
            if t and t.lower().startswith("oggetto"):
                oggetto = t[: 400]
                break

    return {
        "source": SOURCE,
        "source_id": str(source_id),
        "source_url": url_for(source_id),
        "titolo": titolo[:500],
        "data_pubblicazione": data_iso,
        "ente_emittente": ente,
        "tipo_documento": tipo,
        "numero_protocollo": protocollo,
        "oggetto": oggetto,
        "testo_html": main_html,
        "testo_plain": main_text,
        "pdf_url": None,  # immigrazione.biz inlines content, no PDF
        "included_in_corpus": 1,
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
    """Iterate ids start..end (inclusive), persist records, skip already-seen.

    Returns counters dict.
    """
    counters = {"saved": 0, "not_found": 0, "errors": 0, "skipped": 0}

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
        counters["saved"] += 1
        conn.commit()
        if on_progress:
            on_progress(sid, "saved", counters)

    return counters
