#!/usr/bin/env python3
"""Download the Twemoji flag images bundled with the app into src/assets/flags/<CODE>.png.

They are used on systems that cannot draw emoji flags (e.g. Windows). Bundling them
means the site makes no requests to a CDN.

The country list is read from src/core/countries.js, so run this again after adding
a country there. Uses only the Python standard library:

    python3 scripts/download_flags.py

If it fails with CERTIFICATE_VERIFY_FAILED (python.org builds on macOS ship without
CA certificates), point it at the system bundle:

    SSL_CERT_FILE=/etc/ssl/cert.pem python3 scripts/download_flags.py

Twemoji graphics: (c) Twitter, Inc and other contributors, CC-BY 4.0
(https://creativecommons.org/licenses/by/4.0/). Keep the attribution in
src/assets/flags/LICENSE.md and in the app footer.
"""

import re
import sys
import urllib.request
from pathlib import Path

TWEMOJI_VERSION = "15.1.0"   # pinned: https://github.com/jdecked/twemoji/releases
BASE_URL = f"https://cdn.jsdelivr.net/gh/jdecked/twemoji@{TWEMOJI_VERSION}/assets/72x72/"

ROOT = Path(__file__).resolve().parent.parent
COUNTRIES_JS = ROOT / "src" / "core" / "countries.js"
OUT_DIR = ROOT / "src" / "assets" / "flags"
EXTRA_CODES = ["GB"]   # flags used outside the country list (language menu)


def country_codes():
    source = COUNTRIES_JS.read_text()
    block = source[source.index("COUNTRY_CODES"):source.index(").split(' ')")]
    codes = re.findall(r"\b[A-Z]{2}\b", block)
    return sorted(set(codes) | set(EXTRA_CODES))


def twemoji_name(code):
    """'PL' -> '1f1f5-1f1f1' (regional indicator code points)."""
    return "-".join(f"{0x1F1E6 + ord(ch) - ord('A'):x}" for ch in code)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    codes = country_codes()
    failed = []
    for code in codes:
        url = f"{BASE_URL}{twemoji_name(code)}.png"
        try:
            with urllib.request.urlopen(url) as response:  # noqa: S310 (fixed https URL)
                data = response.read()
            if not data.startswith(b"\x89PNG"):
                raise ValueError("not a PNG")
            (OUT_DIR / f"{code}.png").write_bytes(data)
        except Exception as err:  # noqa: BLE001 - report and continue
            failed.append(f"{code}: {err}")
    print(f"downloaded {len(codes) - len(failed)}/{len(codes)} flags to {OUT_DIR}", file=sys.stderr)
    for line in failed:
        print("  FAILED", line, file=sys.stderr)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
