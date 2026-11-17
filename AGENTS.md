# Bridgify project guidance

The active homepage is Version 2: edit `index-v2.html` and its V2 assets for future homepage work. Preview it at `http://localhost:8080/?version=2`. The user requested that `index.html` remain the Version 1 reference; only change V1 when explicitly requested. Routing maintenance shared by both versions is allowed. `/?version=2` is the canonical local review URL; `?v=2` and direct V2 document links are aliases. Preserve `version=2` through internal pages and return-home links using `homepage-version.js`. Do not create another homepage copy for routine edits.

Before designing or changing any visual section, read `DESIGN.md` in this directory. It records the user's brand decisions and the Stōkt / EnduroSat reference standard. Apply it to layout, typography, illustration and motion; do not interpret “at their level” as merely changing a background or adding glow.

Explicit newer user instructions take precedence. Keep work within the requested scope: image concepts when asked for visual proposals, working site changes when asked to implement. Preserve existing unrelated changes. Verify implemented visual changes in the browser and provide a screenshot and the tested page link. Do not claim a concept image is implemented.

Before every publish or upload of visual changes, verify brand typography and colors, shared grid alignment, spacing, responsive layouts and working links in the browser. The user explicitly requested this as a standing rule on 31 October 2026. The shared footer lives in `partials/site-footer.html`, `partials/recurring-cta.html`, `shared-footer.css` and `shared-footer.js`; run `python3 scripts/sync-footer.py` after markup edits and `python3 scripts/sync-footer.py --check` before publishing. The global footer replacement is explicitly authorized on both homepage versions; preserve all other V1 content.

Workflow: follow `WORKFLOW.md` for every visual or responsive task. It records the proven way of working the user asked to keep (16 November 2026): one component per element, the agreed mobile proportions, measuring against the visible phone screen in WebKit and Chromium, and screenshot review before reporting. Add to it only what has been proven.

Mobile rules: `MOBILE-RULES.md` is the developer handoff for phones (rule IDs, spacing table, buttons and links, how to verify). `python3 output/element-lab/adaptive/system/verify.py` checks every rule and writes `compliance.md`; run it before reporting phone work as done.

Typography: read `TYPOGRAPHY.md` before changing text styles. Reuse `brand-typography.css` tokens for editorial roles. Preserve section geometry and diagram-relative typography; do not add arbitrary page-specific font scales.

## Working together (git): applies to every person and every AI model in this repo

The repository owner approves everything that reaches `main`; `main` is what the live site is deployed from.

1. Never commit or push to `main`. Every task starts on its own branch from an up-to-date `main`:
   `git switch main && git pull && git switch -c <your-name>/<task>` (e.g. `dana/about-page`).
2. One task per branch. Do not work on someone else's branch, and do not edit files another open branch is changing
   without agreeing it first; if in doubt, ask the owner.
3. Before any visual change, read `DESIGN.md`, `TYPOGRAPHY.md`, `WORKFLOW.md` and, for phones, `MOBILE-RULES.md`.
   Copy comes only from Copy v4. Do not change `index.html` (Version 1) unless asked.
4. Small commits with a clear message. Keep the branch current with `git pull origin main` before opening a PR.
5. Before opening a PR: check the pages you changed in the browser at 390, 768 and 1440; for phone work run
   `python3 output/element-lab/adaptive/system/verify.py --pages <changed pages>` and include the result.
6. Push the branch and open a Pull Request into `main` that says what changed, which pages, how it was checked and
   what was not checked. Never merge your own PR; the owner reviews and merges.
7. Never deploy to Vercel or change hosting, domains or settings. The owner deploys.
8. Commit only your own changes: leave files changed by someone else (or another session) out of your commit.
