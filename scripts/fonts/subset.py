#!/usr/bin/env python3
"""Subsets the site's web font and writes it, with its @font-face rules.

Run by hand; the build doesn't run it. Its output is committed:
  public/fonts/spec-mono-<weight>-core.woff2   preloaded on every page
  public/fonts/spec-mono-<weight>-ext.woff2    loaded only for its characters
  index.html, between <!-- fonts:start --> and <!-- fonts:end -->
  scripts/fonts/manifest.json                  what each file holds

Setup, once:
  python3 -m venv scripts/fonts/.venv
  scripts/fonts/.venv/bin/pip install fonttools brotli

Usage:
  scripts/fonts/.venv/bin/python scripts/fonts/subset.py           rebuild
  scripts/fonts/.venv/bin/python scripts/fonts/subset.py --check   report drift

Rerun it when the site starts using:
  - a character outside the files that Google Fonts serves for IBM Plex Mono
    (rare: the files already hold all of ASCII, Latin-1 and Latin Extended-A),
  - a new font weight below 200 or between the four faces is fine (CSS maps
    it to the nearest face, as before), but a new face, an italic, or a new
    OpenType feature (font-feature-settings, font-variant-*) needs one,
  - `hyphens: auto` (it may need U+2010, which the files already include).
`--check` scans the source for these and exits 1 when a rebuild is due.

Why each choice keeps the site looking the same:
  - Sources are IBM Plex Mono 2.3 from google/fonts, the files Google Fonts
    cuts its served slices from: identical outlines, advances and vertical
    metrics. They're pinned by SHA-256.
  - The character set is limited to what Google Fonts serves today. A
    character it doesn't serve (like U+2192 →) renders in the fallback font
    now; keeping it out keeps it there.
  - Only the default-on features ccmp and mark are kept; the site turns none
    of the others on. Hinting is dropped, as Google Fonts does too, but the
    gasp table (per-size smoothing) stays, as it does in Google's files.
  - Glyph names and the full font's bounding box stay too: without either,
    small text renders slightly differently (both found by pixel diffs).
  - The faces stay 200, 300, 400 and 500 upright, so 550-700 still map to 500
    with browser-synthesized bold, and italics stay browser-slanted.
  - The OFL reserves the name "Plex", so the subset is renamed "Spec Mono".
"""

import hashlib
import json
import re
import sys
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "scripts/fonts/.venv/sources"
OUT = ROOT / "public/fonts"
INDEX = ROOT / "index.html"
MANIFEST = ROOT / "scripts/fonts/manifest.json"

FAMILY = "Spec Mono"
FILE_STEM = "spec-mono"
SOURCE_URL = "https://github.com/google/fonts/raw/main/ofl/ibmplexmono/IBMPlexMono-{}.ttf"
FACES = {
    200: ("ExtraLight", "826b765bd5173b97d521053330a66277edc224f8cc5f1e0035df1d995d5f003c"),
    300: ("Light", "780bcf65509d72a35ec114b57bcbe220dc6b77d8ea2e9b25e294be3c570c5025"),
    400: ("Regular", "6a3412f058c7d8dfd9170c41e85ade48e5156ecb89356110ca57a0a27734af46"),
    500: ("Medium", "a9b4c49bb299e05b5f6c481e7fb5e78943d2793249a0c8874ab574a2d1ea6755"),
}
# Kept OpenType features: the default-on ones the font has. The site turns
# no others on (its only switch, tabular-nums, has no feature in this font).
FEATURES = ["ccmp", "mark"]

# What Google Fonts serves for IBM Plex Mono, all its slices together
# (latin, latin-ext, vietnamese, cyrillic, cyrillic-ext, symbols2), from
# fonts.googleapis.com/css2 in November 2026. Characters outside this render
# in the fallback font today, so the subset leaves them out too.
SERVED = """
U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304,
U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
U+FEFF, U+FFFD, U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7,
U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB,
U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF, U+0102-0103, U+0110-0111,
U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303,
U+0309, U+0323, U+1EA0-1EF9, U+20AB, U+0301, U+0400-045F, U+0490-0491,
U+04B0-04B1, U+2116, U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF,
U+A640-A69F, U+FE2E-FE2F, U+2000-2001, U+2004-2008, U+200A, U+23B8-23BD,
U+2500-259F
"""

# Always kept, used or not: printable ASCII, Latin-1 and Latin Extended-A.
BASE = set(range(0x20, 0x7F)) | set(range(0xA0, 0x100)) | set(range(0x100, 0x180))

# The preloaded core: ASCII and the punctuation pages commonly print.
# U+00B7 (·) is the site's separator, printed on the landing page.
CORE = set(range(0x20, 0x7F)) | {
    0x2018, 0x2019, 0x201C, 0x201D,  # ‘ ’ “ ”
    0x2013, 0x2014,  # – —
    0x2026,  # …
    0x00B7,  # ·
}


def parse_ranges(text):
    out = set()
    for part in re.findall(r"U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?", text):
        a = int(part[0], 16)
        b = int(part[1], 16) if part[1] else a
        out |= set(range(a, b + 1))
    return out


def format_ranges(codepoints):
    cps = sorted(codepoints)
    parts, i = [], 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and cps[j + 1] == cps[j] + 1:
            j += 1
        parts.append(f"U+{cps[i]:04X}" if i == j else f"U+{cps[i]:04X}-{cps[j]:04X}")
        i = j + 1
    return ", ".join(parts)


def source_files():
    files = [p for d in ("src", "registry") for p in (ROOT / d).rglob("*")]
    return [p for p in files if p.suffix in {".ts", ".tsx", ".css"} and "textures" not in p.name] + [INDEX]


def site_characters():
    chars = set()
    for p in source_files():
        text = p.read_text(encoding="utf-8")
        if p == INDEX:
            text = re.sub(r"<!-- fonts:start -->.*?<!-- fonts:end -->", "", text, flags=re.S)
        chars |= {ord(c) for c in text}
    return chars


def site_usage():
    """The weights, styles and feature switches the stylesheets use."""
    css = "\n".join(p.read_text(encoding="utf-8") for p in source_files())
    weights = {int(w) for w in re.findall(r"font-weight:\s*(\d{3})", css)}
    weights |= {int(w) for w in re.findall(r"\bfont:\s*(?:italic\s+|oblique\s+)?(\d{3})\s", css)}
    italics = re.findall(r"font(?:-style)?:\s*[^;]*\b(italic|oblique)\b[^;]*", css)
    features = sorted(set(re.findall(r"(font-feature-settings|font-variant-[a-z-]+|fontFeatureSettings|fontVariant\w*)\s*[:=]\s*([^;}\n]+)", css)))
    hyphens = bool(re.search(r"hyphens:\s*auto", css))
    return weights, italics, features, hyphens


def fetch(weight):
    style, digest = FACES[weight]
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f"IBMPlexMono-{style}.ttf"
    if not path.exists():
        urllib.request.urlretrieve(SOURCE_URL.format(style), path)
    got = hashlib.sha256(path.read_bytes()).hexdigest()
    if got != digest:
        path.unlink()
        sys.exit(f"{path.name}: SHA-256 {got} doesn't match the pinned {digest}. Check the new upstream file before updating the pin.")
    return path


def rename(font, style):
    """Renames the font away from the reserved name "Plex" (OFL 1.1 §3)."""
    name = font["name"]
    full = FAMILY if style == "Regular" else f"{FAMILY} {style}"
    values = {
        1: full,
        2: "Regular",
        3: f"{FAMILY.replace(' ', '')}-{style};subset",
        4: f"{FAMILY} {style}",
        6: f"{FAMILY.replace(' ', '')}-{style}",
    }
    # No typographic family records (16, 17), like Google's files: with them,
    # macOS groups the weights into one family, and WebKit then draws
    # synthesized bold and some sizes differently in a page with all weights.
    for record in list(name.names):
        if record.nameID in values:
            record.string = values[record.nameID]
    for nid, value in values.items():
        if not name.getName(nid, 3, 1, 0x409):
            name.setName(value, nid, 3, 1, 0x409)
    # Any other name that still carries "Plex", apart from the copyright and
    # license notices the OFL requires to stay, is dropped.
    keep = {0, 13, 14}
    name.names = [r for r in name.names if r.nameID in keep or "Plex" not in r.toUnicode()]


def build(weight, codepoints, part):
    style = FACES[weight][0]
    options = subset.Options()
    options.layout_features = FEATURES
    options.hinting = False
    # Glyph names stay (post format 2). Dropping them (format 3) saves about
    # 140 bytes a file but measurably changes small text in Chromium and
    # WebKit; found by bisecting the subsetter's options against Google's file.
    options.glyph_names = True
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
    options.name_languages = [0x409]
    options.name_legacy = False
    # gasp stays: it isn't hinting but the rasterizer's per-size smoothing
    # table, Google Fonts ships it, and dropping it changes small text.
    options.drop_tables += ["DSIG", "meta"]
    options.flavor = "woff2"
    # recalcBBoxes=False keeps the full font's head bounding box and hhea
    # extremes, as Google's files do. Some engines place text from them, so
    # recalculating them for the subset shifts text by a fraction of a pixel.
    font = TTFont(fetch(weight), recalcBBoxes=False)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=sorted(codepoints))
    subsetter.subset(font)
    rename(font, style)
    path = OUT / f"{FILE_STEM}-{weight}-{part}.woff2"
    font.flavor = "woff2"
    font.save(path)
    return path


def verify(path, weight, expected):
    """Reopens a written file and checks what font tools sometimes get wrong."""
    font = TTFont(path)
    source = TTFont(fetch(weight))
    got = set(font.getBestCmap())
    problems = []
    if got != expected:
        problems.append(f"codepoints differ: missing {format_ranges(expected - got) or '-'}, extra {format_ranges(got - expected) or '-'}")
    for table in ("fpgm", "prep", "cvt "):
        if table in font:
            problems.append(f"still has hinting table {table!r}")
    feats = set()
    for tag in ("GSUB", "GPOS"):
        if tag in font and font[tag].table.FeatureList:
            feats |= {r.FeatureTag for r in font[tag].table.FeatureList.FeatureRecord}
    if not feats <= set(FEATURES):
        problems.append(f"unexpected features {sorted(feats - set(FEATURES))}")
    for record in font["name"].names:
        if record.nameID not in (0, 13, 14) and "Plex" in record.toUnicode():
            problems.append(f"name {record.nameID} still says {record.toUnicode()!r}")
    metrics = lambda f: (f["head"].unitsPerEm, f["head"].xMin, f["head"].yMin, f["head"].xMax, f["head"].yMax,
                         f["hhea"].minLeftSideBearing, f["hhea"].minRightSideBearing, f["hhea"].xMaxExtent, f["hhea"].ascent, f["hhea"].descent, f["hhea"].lineGap,
                         f["OS/2"].sTypoAscender, f["OS/2"].sTypoDescender, f["OS/2"].sTypoLineGap,
                         f["OS/2"].usWinAscent, f["OS/2"].usWinDescent, f["OS/2"].fsSelection & 0x80, f["OS/2"].usWeightClass)
    if font["post"].formatType != 2.0:
        problems.append(f"post format {font['post'].formatType}, not 2 (glyph names dropped)")
    if "gasp" not in font:
        problems.append("gasp table missing")
    if metrics(font) != metrics(source):
        problems.append(f"vertical metrics changed: {metrics(font)} vs {metrics(source)}")
    scmap, cmap = source.getBestCmap(), font.getBestCmap()
    for cp in sorted(got):
        if font["hmtx"][cmap[cp]][0] != source["hmtx"][scmap[cp]][0]:
            problems.append(f"advance of U+{cp:04X} changed")
            break
        a = font["glyf"][cmap[cp]].getCoordinates(font["glyf"])[0]
        b = source["glyf"][scmap[cp]].getCoordinates(source["glyf"])[0]
        if list(a) != list(b):
            problems.append(f"outline of U+{cp:04X} changed")
            break
    if problems:
        sys.exit(f"{path.name}:\n  " + "\n  ".join(problems))
    return len(font.getGlyphOrder())


def plan():
    served = parse_ranges(SERVED)
    plex = set(TTFont(fetch(400)).getBestCmap())
    used = site_characters()
    keep = (BASE | CORE | used) & served & plex
    core = CORE & keep
    return used, served, plex, keep, core, keep - core


def html_block(manifest):
    lines = ["<!-- fonts:start -->", "    <!-- Written by scripts/fonts/subset.py; rerun it rather than editing. -->"]
    for f in manifest["files"]:
        if f["part"] == "core":
            lines.append(f'    <link rel="preload" href="/fonts/{f["file"]}" as="font" type="font/woff2" crossorigin />')
    lines.append("    <style>")
    for f in manifest["files"]:
        lines += [
            "      @font-face {",
            f'        font-family: "{FAMILY}";',
            "        font-style: normal;",
            f'        font-weight: {f["weight"]};',
            "        font-display: block;",
            f'        src: url("/fonts/{f["file"]}") format("woff2");',
            f'        unicode-range: {f["unicode_range"]};',
            "      }",
        ]
    lines += ["    </style>", "    <!-- fonts:end -->"]
    return "\n".join(lines)


def check():
    used, served, plex, keep, core, ext = plan()
    manifest = json.loads(MANIFEST.read_text())
    have = set()
    for f in manifest["files"]:
        have |= parse_ranges(f["unicode_range"])
    due = []
    missing = (used & served & plex) - have
    if missing:
        due.append(f"characters the site now uses that the files lack: {format_ranges(missing)}")
    weights, italics, features, hyphens = site_usage()
    if [list(x) for x in features] != manifest["usage"]["features"]:
        due.append(f"font feature switches changed: {features}")
    if italics != manifest["usage"]["italics"]:
        due.append(f"italic usage changed: {italics}")
    if hyphens != manifest["usage"]["hyphens"]:
        due.append("hyphens: auto usage changed")
    if sorted(weights) != manifest["usage"]["weights"]:
        due.append(f"font weights changed: {sorted(weights)} (was {manifest['usage']['weights']})")
    if due:
        print("Rebuild the fonts (scripts/fonts/subset.py):\n  " + "\n  ".join(due))
        sys.exit(1)
    print("Fonts are up to date with the site's text and styles.")


def main():
    if "--check" in sys.argv:
        return check()
    used, served, plex, keep, core, ext = plan()
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob(f"{FILE_STEM}-*.woff2"):
        old.unlink()
    weights, italics, features, hyphens = site_usage()
    files = []
    for weight in FACES:
        for part, cps in (("core", core), ("ext", ext)):
            path = build(weight, cps, part)
            glyphs = verify(path, weight, cps)
            files.append({"weight": weight, "part": part, "file": path.name, "bytes": path.stat().st_size,
                          "glyphs": glyphs, "unicode_range": format_ranges(cps)})
    manifest = {
        "family": FAMILY,
        "source": "IBM Plex Mono 2.3, google/fonts (OFL 1.1, Reserved Font Name \"Plex\")",
        "features": FEATURES,
        "usage": {"weights": sorted(weights), "italics": italics, "features": [list(x) for x in features], "hyphens": hyphens},
        "left_to_fallback": format_ranges({c for c in used if c > 0x7E} - keep),
        "files": files,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n")
    html = INDEX.read_text()
    block = html_block(manifest)
    if "<!-- fonts:start -->" in html:
        html = re.sub(r"<!-- fonts:start -->.*?<!-- fonts:end -->", lambda m: block, html, flags=re.S)
    else:
        sys.exit("index.html has no <!-- fonts:start --> / <!-- fonts:end --> markers")
    INDEX.write_text(html)
    for f in files:
        print(f'{f["file"]:<28} {f["bytes"]:>6} bytes {f["glyphs"]:>4} glyphs  {f["unicode_range"][:70]}')
    print(f"left to the fallback font (not served by Google Fonts today): {manifest['left_to_fallback'] or 'none'}")


if __name__ == "__main__":
    main()
