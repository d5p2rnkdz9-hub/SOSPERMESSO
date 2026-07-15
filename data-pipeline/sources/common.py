"""Shared utilities for source scrapers."""

from __future__ import annotations

import re
import time
import unicodedata
from dataclasses import dataclass
from typing import Optional

import httpx

USER_AGENT = (
    "SOSPermesso-Bot/0.1 (+mailto:alberto.pasquero@studiolegaleoltre.org; "
    "data aggregation for legal info portal)"
)

DEFAULT_TIMEOUT = 15.0
DEFAULT_DELAY = 1.0  # seconds between requests to the same source

MESI_IT = {
    "gennaio": 1, "febbraio": 2, "marzo": 3, "aprile": 4,
    "maggio": 5, "giugno": 6, "luglio": 7, "agosto": 8,
    "settembre": 9, "ottobre": 10, "novembre": 11, "dicembre": 12,
}

# Regex helpers
_RE_DATE_TEXTUAL = re.compile(
    r"(\d{1,2})[°º]?\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|"
    r"agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})",
    re.IGNORECASE,
)
_RE_DATE_NUMERIC = re.compile(r"(\d{1,2})/(\d{1,2})/(\d{4})")
_RE_PROTOCOLLO = re.compile(
    r"(?:circolare|nota|messaggio|prot(?:ocollo)?)\.?\s*n\.?\s*([A-Za-z0-9./\-]+)",
    re.IGNORECASE,
)
_RE_WS = re.compile(r"\s+")


def make_client() -> httpx.Client:
    """Build a configured httpx client. Caller is responsible for closing."""
    return httpx.Client(
        headers={"User-Agent": USER_AGENT},
        timeout=DEFAULT_TIMEOUT,
        follow_redirects=True,
    )


@dataclass
class RateLimiter:
    """Simple rate limiter: sleeps so requests are at least `delay` seconds apart."""

    delay: float = DEFAULT_DELAY
    _last: float = 0.0

    def wait(self) -> None:
        now = time.monotonic()
        elapsed = now - self._last
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)
        self._last = time.monotonic()


def fetch(
    client: httpx.Client,
    url: str,
    limiter: RateLimiter,
    retries: int = 2,
) -> httpx.Response:
    """GET with rate limit + exponential backoff retry on 5xx / timeout."""
    backoffs = [2.0, 5.0]
    last_exc: Optional[Exception] = None
    for attempt in range(retries + 1):
        limiter.wait()
        try:
            response = client.get(url)
            if response.status_code >= 500 and attempt < retries:
                time.sleep(backoffs[attempt])
                continue
            return response
        except (httpx.TimeoutException, httpx.TransportError) as exc:
            last_exc = exc
            if attempt < retries:
                time.sleep(backoffs[attempt])
                continue
            raise
    if last_exc:
        raise last_exc
    return response  # type: ignore[return-value]


def normalize_ws(text: Optional[str]) -> Optional[str]:
    if text is None:
        return None
    # Unify curly/straight apostrophes and remove spaces around them.
    text = text.replace("’", "'").replace("ʼ", "'").replace("`", "'")
    text = re.sub(r"\s*'\s*", "'", text)
    return _RE_WS.sub(" ", text).strip()


def normalize_for_hash(text: Optional[str]) -> str:
    if not text:
        return ""
    # NFKD strip accents
    decomposed = unicodedata.normalize("NFKD", text)
    no_accents = "".join(c for c in decomposed if not unicodedata.combining(c))
    # lower + strip non-alphanumeric
    return re.sub(r"[^a-z0-9]+", "", no_accents.lower())


def parse_italian_date(text: str) -> Optional[str]:
    """Parse 'gg mese aaaa' or 'gg/mm/aaaa' from arbitrary text. Return ISO yyyy-mm-dd."""
    if not text:
        return None
    text = text.replace(" ", " ")
    m = _RE_DATE_TEXTUAL.search(text)
    if m:
        day, mese, year = int(m.group(1)), m.group(2).lower(), int(m.group(3))
        month = MESI_IT.get(mese)
        if month:
            return f"{year:04d}-{month:02d}-{day:02d}"
    m = _RE_DATE_NUMERIC.search(text)
    if m:
        day, month, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if 1 <= month <= 12 and 1 <= day <= 31:
            return f"{year:04d}-{month:02d}-{day:02d}"
    return None


def extract_protocollo(text: Optional[str]) -> Optional[str]:
    if not text:
        return None
    m = _RE_PROTOCOLLO.search(text)
    if m:
        return m.group(1).rstrip(".,;:")
    return None


# Dictionary used to detect ente from a free-text title.
ENTI = [
    "Ministero dell'Interno",
    "Ministero del Lavoro",
    "Ministero degli Affari Esteri",
    "Ministero della Salute",
    "Ministero della Giustizia",
    "Ministero dell'Istruzione",
    "Ministero delle Infrastrutture",
    "Ministero dell'Economia",
    "Ministero dello Sviluppo Economico",
    "Presidenza del Consiglio dei Ministri",
    "Agenzia delle Entrate",
    "INPS",
    "INAIL",
    "ANCI",
    "Polizia di Stato",
    "Corte di Cassazione",
    "Corte Costituzionale",
    "Consiglio di Stato",
    "Tribunale di Roma",
    "Corte di Appello di Roma",
    "Consiglio dell'Unione Europea",
    "Commissione Europea",
    "Parlamento Europeo",
    "Corte di Giustizia dell'Unione Europea",
    "Corte Europea dei Diritti dell'Uomo",
    "Garante Privacy",
    "Banca d'Italia",
]


def detect_ente(text: Optional[str]) -> Optional[str]:
    if not text:
        return None
    lower = text.lower()
    for ente in ENTI:
        if ente.lower() in lower:
            return ente
    return None
