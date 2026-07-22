"""CLI entrypoint for data-pipeline scrapers.

Usage:
    python cli.py init
    python cli.py scrape immigrazione_biz --start 1 --end 1300
    python cli.py scrape permessidisoggiorno --start 1 --end 1500
    python cli.py stats
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import db
from sources import common, immigrazione_biz, permessidisoggiorno

SCRAPERS = {
    "immigrazione_biz": immigrazione_biz,
    "permessidisoggiorno": permessidisoggiorno,
}


def cmd_init(_args) -> int:
    db.init_schema()
    print(f"Schema initialized at {db.DEFAULT_DB_PATH}")
    return 0


def cmd_scrape(args) -> int:
    scraper = SCRAPERS.get(args.source)
    if scraper is None:
        print(f"Unknown source: {args.source}. Choices: {list(SCRAPERS)}", file=sys.stderr)
        return 2

    db.init_schema()
    limiter = common.RateLimiter(delay=args.delay)
    started = time.monotonic()

    def on_progress(sid: int, outcome: str, counters: dict) -> None:
        if sid % 25 == 0 or outcome == "error":
            elapsed = time.monotonic() - started
            print(
                f"[{args.source}] id={sid} {outcome}  "
                f"saved={counters['saved']} "
                f"not_found={counters.get('not_found',0)} "
                f"filtered={counters.get('filtered',0)} "
                f"errors={counters['errors']} "
                f"skipped={counters['skipped']} "
                f"elapsed={elapsed:.1f}s",
                flush=True,
            )

    with common.make_client() as client, db.connect() as conn:
        counters = scraper.scrape_range(
            conn,
            client,
            limiter,
            args.start,
            args.end,
            insert_fn=db.insert_circolare,
            log_fn=db.log_skip,
            already_seen_fn=db.already_seen,
            on_progress=on_progress,
        )

    print(f"\nDone: {counters}")
    return 0


def cmd_sync_biz(args) -> int:
    """Incremental sync for immigrazione.biz: fetch any id newer than the last
    saved circolare, up to the site's current max (auto-detected by probing).

    Unlike `scrape`, this clears stale `fetch_log` rows in the probed range
    before fetching: immigrazione.biz publishes ids progressively, so an id
    that looked "empty"/not-found on a previous run may have real content now.
    `scrape` alone would skip it forever because `already_seen` also checks
    fetch_log.
    """
    import sources.immigrazione_biz as ib

    db.init_schema()
    with db.connect() as conn:
        row = conn.execute(
            "SELECT MAX(CAST(source_id AS INTEGER)) AS m FROM circolari WHERE source = ?",
            (ib.SOURCE,),
        ).fetchone()
        last_saved = row["m"] or 0

    start = args.start if args.start is not None else last_saved + 1
    print(f"Last saved id: {last_saved}. Probing forward from {start}...")

    limiter = common.RateLimiter(delay=args.delay)
    with common.make_client() as client:
        end = start - 1
        misses = 0
        probe = start
        max_probe = start + args.max_probe
        while probe <= max_probe and misses < args.stop_after_misses:
            url = ib.url_for(probe)
            try:
                r = common.fetch(client, url, limiter)
            except Exception as exc:
                print(f"  probe {probe}: error {exc}")
                misses += 1
                probe += 1
                continue
            # Empty stub pages return HTTP 200 without a not-found phrase,
            # so probe with the full parser: only a parseable page counts.
            if r.status_code != 200 or ib.parse(r.text, probe) is None:
                misses += 1
            else:
                end = probe
                misses = 0
            probe += 1

    if end < start:
        print(f"No new ids found beyond {last_saved} (probed up to {probe - 1}).")
        return 0

    print(f"Detected new content up to id={end}. Clearing stale fetch_log rows "
          f"[{start}, {end}] and (re)scraping...")

    with db.connect() as conn:
        conn.execute(
            "DELETE FROM fetch_log WHERE source = ? AND CAST(source_id AS INTEGER) BETWEEN ? AND ?",
            (ib.SOURCE, start, end),
        )

    started = time.monotonic()

    def on_progress(sid: int, outcome: str, counters: dict) -> None:
        elapsed = time.monotonic() - started
        print(
            f"[sync-biz] id={sid} {outcome}  saved={counters['saved']} "
            f"not_found={counters.get('not_found',0)} errors={counters['errors']} "
            f"skipped={counters['skipped']} elapsed={elapsed:.1f}s",
            flush=True,
        )

    with common.make_client() as client, db.connect() as conn:
        before_ids = {
            r["source_id"]
            for r in conn.execute(
                "SELECT source_id FROM circolari WHERE source = ?", (ib.SOURCE,)
            )
        }
        counters = ib.scrape_range(
            conn,
            client,
            limiter,
            start,
            end,
            insert_fn=db.insert_circolare,
            log_fn=db.log_skip,
            already_seen_fn=db.already_seen,
            on_progress=on_progress,
        )
        after_ids = {
            r["source_id"]
            for r in conn.execute(
                "SELECT source_id FROM circolari WHERE source = ?", (ib.SOURCE,)
            )
        }

    new_ids = sorted(int(i) for i in (after_ids - before_ids))
    print(f"\nDone: {counters}")
    print(f"New ids added: {new_ids}")
    return 0


def cmd_stats(_args) -> int:
    s = db.stats()
    print("Circolari per source:")
    for src, n in sorted(s["circolari"].items()):
        print(f"  {src}: {n}")
    print("\nFetch log status:")
    for (src, status), n in sorted(s["fetch_log"].items()):
        print(f"  {src} / {status}: {n}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="SOSPermesso data-pipeline CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("init", help="Initialize SQLite schema")

    sp = sub.add_parser("scrape", help="Run a scraper over an id range")
    sp.add_argument("source", choices=list(SCRAPERS))
    sp.add_argument("--start", type=int, required=True)
    sp.add_argument("--end", type=int, required=True)
    sp.add_argument("--delay", type=float, default=1.0, help="Seconds between requests")

    sub.add_parser("stats", help="Print row counts per source")

    syb = sub.add_parser(
        "sync-biz",
        help="Incremental sync of immigrazione.biz: fetch ids newer than the last saved one",
    )
    syb.add_argument(
        "--start", type=int, default=None,
        help="Override start id (default: last saved id + 1)",
    )
    syb.add_argument("--delay", type=float, default=1.5, help="Seconds between requests")
    syb.add_argument(
        "--max-probe", type=int, default=200,
        help="Max ids to probe forward looking for new content",
    )
    syb.add_argument(
        "--stop-after-misses", type=int, default=10,
        help="Stop probing after this many consecutive not-found ids",
    )

    args = parser.parse_args(argv)

    if args.cmd == "init":
        return cmd_init(args)
    if args.cmd == "scrape":
        return cmd_scrape(args)
    if args.cmd == "stats":
        return cmd_stats(args)
    if args.cmd == "sync-biz":
        return cmd_sync_biz(args)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
