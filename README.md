# Artifacts Archive · 文物档案库

An interactive **10-museum** 3D spatial provenance & chronology archive mapping **45,008 catalogued artifacts** across **101 origin homelands**—including **The British Museum**, **The Metropolitan Museum of Art**, **The State Hermitage Museum**, **Musée du Louvre**, **Pergamon & Neues Museum (Berlin)**, **Tokyo National Museum**, **Smithsonian National Museum of Asian Art**, **Musée du Quai Branly**, **Rijksmuseum**, and **Vatican Museums**—with **332 Ultra-HD studio plates**, **325 curated bilingual masterpieces**, direct official museum object links, `English | 中文` localization, and one-click global repatriation choreography.

## Three Exhibition Pages

1. **Provenance & Repatriation Globe (`/index.html`)** — Sunlit vellum 60 FPS 3D globe with `By Museum (10)` and `By Homeland (101)` reverse-provenance lenses, historical acquisition timeline playback (`1506–2023`), curated 325-masterpiece gallery, and 10-museum domestic vs. international comparison.
2. **Creation Age Chronicle (`/creation-age.html`)** — Strict historical creation-age explorer (`6000 BC – AD 2023`) across 8 canonical eras, 8,000-year density histogram, dual time-slice sliders, 3D Civilizations Globe, and chronological *World Synchrony* masterpiece gallery.
3. **Complete 45,008-Artifact Master Catalogue (`/catalog.html`)** — Searchable, multi-facet filterable, sortable, and CSV-exportable registrar ledger of all 45,008 records, photo card grid, archival record sheets, and interactive `101 Homelands × 10 Museums` cross-tabulation matrix.

## Project Structure

```text
artifacts-archive/
├── render.yaml            # Render Static Site Blueprint (CDN + strict CSP & security headers)
├── server.py              # Hardened local Python HTTP server (strict CSP, nosniff, path jail, rate limit)
├── README.md              # Documentation & deployment guide
└── public/                # Zero-build static bundle
    ├── index.html         # Page 1: 3D Provenance & Repatriation Globe
    ├── creation-age.html  # Page 2: Creation Age Chronicle (6000 BC – AD 2023)
    ├── catalog.html       # Page 3: Complete 45,008-Artifact Master Catalogue & 101×10 Matrix
    ├── favicon.svg        # Custom archival astrolabe vector icon
    ├── css/
    │   ├── styles.css         # Warm vellum design tokens & shared editorial layout
    │   ├── creation-age.css   # Creation Age Chronicle styles
    │   └── catalog.css        # Full 45,008-Artifact Master Catalogue styles
    └── js/
        ├── assets.js          # Natural Earth 110m borders + 10 museum atlases (332 Ultra-HD plates, 45,008 items)
        ├── app.js             # 60 FPS 3D globe engine, By Museum / By Homeland lens & acquisition timeline
        ├── creation-age.js    # Strict historical creation-age filter, histogram & 3D civilizations globe
        └── catalog.js         # Instant 45,008-record ledger, photo grid, 101×10 matrix & safe CSV export
```

## Run Locally

```bash
python3 server.py --port 8765
# Open http://127.0.0.1:8765 in your browser
```

## Deploy on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/verse404/artifacts-archive)

This repository includes a ready-to-use `render.yaml` Blueprint configured as a **Render Static Site** (`staticPublishPath: ./public` — free global CDN with zero cold-start spin-down and strict CSP / clickjacking / MIME-sniffing headers):

1. Click **[Deploy to Render](https://render.com/deploy?repo=https://github.com/verse404/artifacts-archive)** above (or open **New → Blueprint** at `https://dashboard.render.com/blueprints` and select `verse404/artifacts-archive`).
2. Click **Apply** — Render will publish `./public` immediately to `https://artifacts-archive.onrender.com` (with all three pages at `/`, `/creation-age.html`, and `/catalog.html`).
