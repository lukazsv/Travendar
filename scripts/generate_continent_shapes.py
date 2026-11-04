#!/usr/bin/env python3
"""Generate the continent outline icons used in the country picker.

Reads Natural Earth's 1:110m country polygons (public domain), merges them per
continent, drops small islands and lakes, simplifies the outline and fits it into a
32x32 SVG viewBox. Writes ``src/core/continent-shapes.js``.

Usage (from the repository root):

    python3 -m venv .venv && .venv/bin/pip install -r scripts/requirements.txt
    .venv/bin/python scripts/generate_continent_shapes.py            # downloads the data
    .venv/bin/python scripts/generate_continent_shapes.py data.geojson

Which countries belong to which continent is *not* generated; that list is
maintained by hand in ``src/core/continents.js``.
"""

import json
import math
import sys
import urllib.request
from pathlib import Path

import numpy as np
import shapely
from shapely.geometry import MultiPolygon, Polygon, box, shape
from shapely.ops import unary_union

DATA_URL = (
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/"
    "geojson/ne_110m_admin_0_countries.geojson"
)
OUTPUT = Path(__file__).resolve().parent.parent / "src" / "core" / "continent-shapes.js"

VIEWBOX = 32       # output viewBox is 0 0 VIEWBOX VIEWBOX
MARGIN = 2         # empty space around the outline, in viewBox units
SIMPLIFY = 0.011   # simplification tolerance, as a share of the outline size


def load_features(path=None):
    if path:
        return json.loads(Path(path).read_text())["features"]
    with urllib.request.urlopen(DATA_URL) as response:  # noqa: S310 (fixed https URL)
        return json.loads(response.read())["features"]


def parts(geom):
    """All polygons of a (Multi)Polygon or GeometryCollection."""
    if isinstance(geom, Polygon):
        return [geom]
    if isinstance(geom, MultiPolygon):
        return list(geom.geoms)
    return [p for g in getattr(geom, "geoms", []) for p in parts(g)]


def build_specs(features):
    """Per continent: (land geometry, clip box in lon/lat, min island size as share of the largest part).

    Natural Earth assigns all of Russia to Europe, so Russia is split at the Urals (60°E).
    Clip boxes drop overseas territories (e.g. French Guiana under France) and pieces
    that wrap across the 180° meridian.
    """
    def by_continent(name, exclude=()):
        return [shape(f["geometry"]) for f in features
                if f["properties"]["CONTINENT"] == name and f["properties"]["ADM0_A3"] not in exclude]

    def by_country(a3):
        return unary_union([shape(f["geometry"]) for f in features if f["properties"]["ADM0_A3"] == a3])

    russia = by_country("RUS")
    western_new_guinea = by_country("IDN").intersection(box(130.5, -11, 142, 0))
    return {
        "europe": (unary_union(by_continent("Europe", exclude=("RUS",)) + [russia.intersection(box(-30, 30, 60, 90))]),
                   box(-25, 34, 52, 71.5), 0.02),
        "asia": (unary_union(by_continent("Asia") + [russia.intersection(box(60, 30, 180, 90))]),
                 box(26, -11, 180, 77), 0.006),
        "africa": (unary_union(by_continent("Africa")), box(-20, -36, 52, 38), 0.01),
        "namerica": (unary_union(by_continent("North America")), box(-170, 7, -10, 84), 0.03),
        "samerica": (unary_union(by_continent("South America")), box(-90, -57, -30, 14), 0.01),
        # New Guinea is drawn whole, although its western half belongs to Indonesia (Asia).
        "oceania": (unary_union(by_continent("Oceania") + [western_new_guinea]), box(110, -48, 180, 0), 0.01),
        "antarctica": (unary_union(by_continent("Antarctica")), box(-180, -90, 180, -60), 0.02),
    }


# Light buffer-in/buffer-out that closes hairline fjords and straits, per continent.
SMOOTHING = {"europe": 0.08, "namerica": 0.25, "asia": 0.25}


def project(key, geom):
    """Antarctica: south-polar azimuthal view (0° meridian up). Others: equirectangular,
    with longitude scaled by cos(latitude) at the continent's centre to limit stretching."""
    if key == "antarctica":
        def polar(xy):
            lon, lat = np.radians(xy[:, 0]), xy[:, 1]
            r = 90 + lat
            return np.column_stack([r * np.sin(lon), -r * np.cos(lon)])
        return shapely.transform(geom, polar)
    k = math.cos(math.radians(geom.centroid.y))
    return shapely.transform(geom, lambda xy: np.column_stack([xy[:, 0] * k, -xy[:, 1]]))


def outline_path(key, geom, clip, min_share):
    geom = geom.intersection(clip)
    polygons = [Polygon(p.exterior) for p in parts(geom)]            # drop lakes and inland seas
    largest = max(p.area for p in polygons)
    polygons = [p for p in polygons if p.area >= largest * min_share]  # drop small islands
    geom = project(key, unary_union(polygons))

    if key == "antarctica":   # close the seam left by the dateline edge that runs to the pole
        geom = geom.buffer(0.6, join_style="mitre").buffer(-0.6, join_style="mitre")
    if key in SMOOTHING:
        geom = geom.buffer(SMOOTHING[key]).buffer(-SMOOTHING[key])

    minx, miny, maxx, maxy = geom.bounds
    size = max(maxx - minx, maxy - miny)
    geom = geom.simplify(size * SIMPLIFY, preserve_topology=True)

    scale = (VIEWBOX - 2 * MARGIN) / size
    off_x = VIEWBOX / 2 - (minx + maxx) / 2 * scale
    off_y = VIEWBOX / 2 - (miny + maxy) / 2 * scale

    commands = []
    for poly in sorted(parts(geom), key=lambda p: -p.area):
        points = list(poly.exterior.coords)[:-1]
        if len(points) < 3:
            continue
        path, last = [], None
        for i, (x, y) in enumerate(points):
            pt = (round(x * scale + off_x, 1), round(y * scale + off_y, 1))
            if pt == last:
                continue
            path.append(("M" if i == 0 else "L") + f"{pt[0]:g} {pt[1]:g}")
            last = pt
        commands.append("".join(path) + "Z")
    return "".join(commands)


def main():
    features = load_features(sys.argv[1] if len(sys.argv) > 1 else None)
    shapes = {key: outline_path(key, *spec) for key, spec in build_specs(features).items()}

    lines = [
        "/**",
        " * Continent outline icons (SVG path data, viewBox 0 0 32 32).",
        " *",
        " * GENERATED by scripts/generate_continent_shapes.py from Natural Earth 1:110m data",
        " * (public domain). Do not edit by hand; re-run the script instead.",
        " */",
        "",
        "export const CONTINENT_SHAPES = {",
    ]
    lines += [f"  {key}: '{path}'," for key, path in shapes.items()]
    lines += ["};", ""]
    OUTPUT.write_text("\n".join(lines))
    for key, path in shapes.items():
        print(f"{key:<11} {len(path):>5} chars", file=sys.stderr)
    print(f"wrote {OUTPUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
