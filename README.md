# Bridgify website

Static HTML, CSS and JavaScript website.

## Design guidance

Read [DESIGN.md](DESIGN.md) before designing or changing sections. It defines the Bridgify brand, the Stōkt and EnduroSat reference standard, layout, materials, motion, and visual verification. [AGENTS.md](AGENTS.md) directs coding agents to this guidance.

## Preview locally

Run `python3 dev.py` from this directory and open `http://localhost:8080`.
Python 3 is the only requirement; no packages, build step, or environment variables
are needed. The preview server supports the aliases and redirects in `_redirects`
and listens on this computer only. Stop it with Ctrl+C. To use another port, run
`python3 dev.py --port 8081`.

## Homepage versions

Version 2 is the single active homepage for ongoing work. Use
`http://localhost:8080/?version=2` for every review. The local server normalizes
`?v=2`, `index.html?version=2` and `index-v2.html` to this entry point.

The V2 homepage is `index-v2.html`. Its active additions are:

- `hero-v2.css` / `hero-v2.js`: compact connected hero and orange CTA.
- `supply-count-v2.js`: supply metrics roll into their final values on entry.
- `homepage-v2.css` / `homepage-v2.js`: wide benefit tiles, paired entrances,
  smooth expansion and bronze hover borders.
- `opportunity-study.css`: the Opportunity comparison section.
- `scroll-entrances.css` / `scroll-entrances.js`: section entrances.

`homepage-version.js` keeps `version=2` on internal navigation, including product
pages, demo links, and links back home. Other query parameters and section anchors
are preserved. Version selection uses `version`; asset parameters such as
`hero-v2.css?v=2` only control caching. Local preview disables browser caching.

`index.html` remains the V1 reference at `/` or `/?version=1`. On a plain static
host the shared routing script resolves V2 to `index-v2.html?version=2`.

## Netlify

No build command or dependency installation is needed. Publish the repository root (`.`). The included `netlify.toml` sets this directory. For manual deployment, upload the release ZIP with `index.html` at its root.

## Current content status

The page headings and supporting copy follow the supplied Bridgify content document. Experience cards and animation results are illustrative. Team portraits and names are placeholders, clearly marked. Press/articles, job listings, and the API documentation link require approved final content. The contact form prepares an email draft; sending happens in the visitor’s email application.

Experimental design studies and the Thomas Gertenbach reconstruction are excluded from this repository release.
