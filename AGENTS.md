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
5. Before opening a PR: run `python3 scripts/qa/review.py` (before/after of every affected section at 390, 768, 1024 and
   1440, plus the full QA checks; see WORKFLOW.md §5b), fix every NEW error, paste its `summary.md` into the PR and
   show the owner the before/after pictures. Also check the pages you changed in the browser at 390, 768, 834, 1024 and 1440 (no horizontal
   scroll, no cut text, no console errors); run `python3 scripts/sync-footer.py --check` and
   `python3 scripts/sync-mobile.py --check`; for phone work run
   `python3 output/element-lab/adaptive/system/verify.py --pages <changed pages>` and include the result.
6. Push the branch and open a Pull Request into `main` that says what changed, which pages, how it was checked and
   what was not checked. Never merge your own PR; the owner reviews and merges.
7. Never deploy to Vercel or change hosting, domains or settings. The owner deploys.
8. Commit only your own changes: leave files changed by someone else (or another session) out of your commit.

## The responsive layers: where tablet, desktop and phone styling lives (every person and every AI model)

Added at the owner's request on 19 November 2026, after hand edits to built files undid approved designs.

1. Phones (up to 599px) are styled by the `mobile/` layer; tablets and desktops (600px and up) by the `wide/` layer.
   Both are **generated**. Never edit `wide/` or `mobile/` by hand: the next build overwrites them and the edit is lost.
   - Tablet/desktop: edit the sources in `output/element-lab/grid-plan/` (`<page>-trial.css`, `shared-wide.css`,
     `roles-<page>.js`), then rebuild with `python3 scripts/build-wide.py --only <page>` and bump that page's
     `wide/pages/<page>.css?v=` link.
   - Phone: edit `output/element-lab/adaptive/`, then run `python3 scripts/sync-mobile.py`.
2. Do not fix a tablet or desktop layout in the old page CSS (`otas.css`, `hotels-mail-hero.css`,
   `experience-choice-v2.css` and the like). That CSS is only the base the layers sit on.
3. When you change a page's HTML structure (move, add or remove elements, rebuild a section), update that page's role
   map `output/element-lab/grid-plan/roles-<page>.js` and rebuild. The baked spacing finds elements by position, so a
   stale map puts spacing on the wrong elements (this broke Loyalty's Market signal on tablets).
4. The content line and its cap (approved 17 November 2026, `SPACING-GRID-PLAN.md`): every section's content starts and
   ends on one line, `--try-margin` from `wide/grid.css`. Tablet 600-1023: 32px. Desktop: `max(clamp(40px, 4vw, 64px),
   (100vw - 1560px) / 2)`, so content is at most 1560px wide and centred on large screens (58px margin at 1440,
   180 at 1920, 500 at 2560). Phone: 24px (mobile layer). Never give a section its own side padding or max width;
   use `var(--try-margin)`. Check 1920 as well when a change affects width.
5. Follow the rules that exist; do not invent new ones. Spacing only from the spacing table and tokens; type only from
   `brand-typography.css`; copy only from Copy v4. On tablets (600-1023px) split headings and heroes stack: title,
   then intro, then buttons.
6. Never undo a design the owner approved (for example the centred OTAs hero with its two-line desktop title).
   If you think it should change, say so in the PR and let the owner decide.

