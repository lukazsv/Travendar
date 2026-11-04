#!/usr/bin/env python3
"""Check that the PRECACHE list in sw.js matches the app's files.

Every file the app needs to start offline must be listed; flag images, licence texts and
the share image are deliberately left out (they are cached on use or not needed offline).
Exit code 1 when the list is out of date. Standard library only:

    python3 scripts/check_precache.py
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ROOT_FILES = {"./", "index.html", "manifest.webmanifest"}
SKIP_DIRS = {"src/assets/flags"}
SKIP_SUFFIXES = {".txt", ".md"}
SKIP_FILES = {"src/assets/og-image.png"}


def expected():
    files = set(ROOT_FILES)
    for path in (ROOT / "src").rglob("*"):
        rel = path.relative_to(ROOT).as_posix()
        if not path.is_file() or path.name.startswith("."):
            continue
        if any(rel.startswith(d + "/") for d in SKIP_DIRS) or path.suffix in SKIP_SUFFIXES or rel in SKIP_FILES:
            continue
        files.add(rel)
    return files


def listed():
    source = (ROOT / "sw.js").read_text()
    block = source[source.index("const PRECACHE = ["):]
    block = block[:block.index("];")]
    return set(re.findall(r"'([^']+)'", block))


def main():
    want, have = expected(), listed()
    missing, extra = sorted(want - have), sorted(have - want)
    for path in missing:
        print(f"missing from PRECACHE: {path}")
    for path in extra:
        print(f"listed but not found:  {path}")
    if missing or extra:
        sys.exit(1)
    print(f"sw.js PRECACHE is up to date ({len(have)} entries)")


if __name__ == "__main__":
    main()
