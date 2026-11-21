# Bridgify mobile rules (for development)

> **Developer handoff (21 Nov 2026):** the design system in `design-system/` (tokens.json, the guide) is the source of
> truth for the rebuild. Where this file differs, the design system wins. Changed by the owner's decisions: L2 (demos at
> most 85% of the screen) is replaced by "a demo may be taller than the screen if it scrolls with the page"; card and list
> names are Chillax 300 (24 cards, 18 lists), not Chillax 500 18–19; body text is 16px; buttons are 40px with a 44px
> tap area; step buttons on phones are boxes; Why Bridgify is scroll-driven on phones.


Status, 16 November 2026: agreed in the lab (`output/element-lab/adaptive/`), not on the live site. This file is the
handoff: what the phone layout must do, why, and how to prove it does. Every rule has an ID; `system/verify.py` checks
each one and writes the result to `output/element-lab/adaptive/system/compliance.md`.

Read with `DESIGN.md` (brand), `TYPOGRAPHY.md` (type roles) and `WORKFLOW.md` (how the work is done). Where they
disagree on phone values, this file is newer and wins.

## 1 · Ground rules

| ID | Rule |
|---|---|
| G1 | One component per element. One markup and one copy on every screen; only the arrangement changes. No "mobile versions". |
| G2 | Copy comes from Copy v4 only. On phones text may be folded (Read more) or hidden, never cut, rewritten or added. Checked as C1 (the phone layer adds or removes no text) and C3 (copy against Copy v4, by eye). |
| G3 | No frames and no Replay / Pause rows unless the design asks for them. Checked as C2 (no visible Replay / Pause control) and C4 (frames, by eye). |
| G4 | Desktop and tablet stay exactly as they are. Every phone rule lives inside the phone breakpoint. Checked as L4. |
| G5 | Styling is CSS. JavaScript only for behaviour (tabs, Read more, menus). Anything JavaScript sets after the first paint makes the page jump (rule M2). |

## 2 · Breakpoints: three, never more

| Name | Range | Reference widths |
|---|---|---|
| Phone | ≤ 599px | 320 (iPhone SE), 390 (iPhone 13), 412 (Pixel 7), 430 (iPhone 15 Pro Max) |
| Tablet | 600–1023px | 768 |
| Desktop | ≥ 1024px | 1440 |

The current site uses 49 different widths. New code uses these three only; inside a component, use container queries.

## 3 · Type on phones

| Role | Size / line | Font and weight |
|---|---|---|
| Hero title, section title, closing call-to-action title (T1) | 28 / 32 | Chillax 400 |
| Card and list names | 18–19 | Chillax 500 |
| Body and intro text | 15 / 24 | Sofia 400 |
| Label above a title | 11 | Sofia, uppercase |
| FAQ question | 18 / 25 | Sofia 500 |
| Buttons and links | 15 / 20 (links 15 / 24) | Sofia 550 |
| Key figures (1M+, 180+, 3%, $280) (T3) | at least 28; 34 in the numbers strip | |

Titles break into even lines and a paragraph never ends on one word (T4): `text-wrap: balance` on titles,
`text-wrap: pretty` on text, and a coloured phrase in a title stays on one line when it fits inside the margins.

## 4 · Spacing: one table, by role

Spacing is never chosen per page. A page only says which element plays which role; the value comes from the pair of
roles. Scale: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64. The tokens are in `system/tokens.css`.

**Roles:** `label` · `title` · `text` · `more` (Read more) · `actions` (buttons) · `link` · `control` (tabs) ·
`content` (cards, demo, list, table) · `visual` (the hero's demo) · `dots` (a scroller's position dots) · `deco` (art
behind content).

| ID | Between | Phone | Token |
|---|---|---|---|
| S1 | label → title | 16 | `--bf-gap-label-title` |
| S2 | title → text · paragraph → paragraph · title → its one-line subtitle (role `sub`, e.g. "Part of HBX Group.") | 24 · 16 · 8 | `--bf-gap-title-text` · `--bf-gap-text-text` · `--bf-gap-title-sub` |
| S2b | figures or cards → the closing lines under them (role `foot`: sentence, link, note) | 24 | `--bf-gap-to-foot` |
| S3 | text → Read more (to its visible text) | 8 | `--bf-gap-text-more` |
| S4 | text or title → buttons · button ↔ button | 32 · 12 | `--bf-gap-to-actions` · `--bf-gap-actions-inner` |
| S5 | text or buttons → text link | 16 | `--bf-gap-to-link` |
| S6 | heading → tabs · tabs → content | 32 · 16 | `--bf-gap-to-control` · `--bf-gap-control-content` |
| S7 | heading → content · content → content · scroller → dots | 32 · 32 · 16 | `--bf-gap-to-content` |
| S8 | hero heading → hero visual | 48 | `--bf-gap-to-visual` |
| S9 | section top and bottom · header bar → hero label | 64 · 48 | `--bf-section-y` · `--bf-hero-top` |
| S10 | side margins: heading text and buttons inside them | 24 | `--bf-gutter` |
| S11 | tiles of one row start on one line | | |
| S12 | every visible block has a role | | |

How it is measured, so the numbers mean what the eye sees: a button row by its buttons (not its box), a text link and
Read more by their text (their 44px tap area does not count), heading text by its letters. A hero that fills the screen
keeps its content at the top; the extra height goes below it.

## 5 · Buttons and links

| ID | Rule |
|---|---|
| B1 | A **button** moves the visitor forward with Bridgify: book a demo, talk to us, get the docs. A **link** sends them to read or see more elsewhere ("Read: …", "See the …", "Prefer not to …"): coral text, no frame, no background, the same style as Read more. A filled primary stays a button whatever its words. |
| B2 | At most one primary (filled) and one secondary (outlined) button per group. |
| B3 | Buttons are 40px tall with 15px text and a full frame. Tabs and switches stay 44px. |
| B4 | Buttons in one group share one width: side by side when both labels fit half the row, otherwise stacked at full width. |

## 6 · Layout and motion

| ID | Rule |
|---|---|
| L1 | Tap targets at least 44px. |
| L2 | A demo fits the screen: at most 85% of an iPhone 13's visible area, 100% of an iPhone SE's. Measured against the visible area (390×664), not the full device height. |
| L3 | The hero fills the first screen (`min-height: 100lvh`); the next section never shows under it. |
| L4 | Desktop and tablet layout do not move. |
| M1, M2 | Nothing jumps after the first paint, in the phone preview (M1) and the way the live site loads (M2). |
| M3 | Entrances as on desktop: the hero copy arrives in sequence (rise 20px and fade, 750ms, 100ms apart); section parts rise 40px as they enter. Off when the visitor asks for reduced motion. |
| M4 | A sequence of stations (a trip, a passenger journey) is pinned: the stage stays on screen and the page's scroll moves one station at a time; the stop you are on is marked (lit label, filled ringed dot) and the screens move with it. The page grows by half a screen per station, so scrolling past the last one carries on. Off with reduced motion. Shared helper: `pin()` in `output/element-lab/adaptive/patterns.js`. |
| M5 | A comparison that opens (Travel Technology, "How do I avoid integrating"): the dark stage rises over the copy and grows from the column width to the screen's edges, then holds full-screen while the scroll turns the first state into the second; scrolling back turns it back, and a tap still works. It ends at the section's edge (class `ad-bleed`, 0 below), the hold is a spacer after it (`ad-hold-space`). Off with reduced motion. |

## 7 · Building it on the live site

The lab applies these rules with JavaScript on top of the old CSS (`system/rhythm.js`), so they can be reviewed
without touching the site. The site itself must not work that way (G5). The route:

1. Load the tokens first, in cascade layers, so order decides and `!important` is not needed:
   `@layer reset, tokens, base, components, pages, legacy;` with the current CSS moved into `legacy`.
2. Turn each page's role map (`system/roles/<page>.js`) into classes in the markup: `bf-section`, `bf-label`,
   `bf-title`, `bf-text`, `bf-actions`, `bf-link`, `bf-control`, `bf-content`, `bf-visual`.
3. Write the spacing table as plain CSS on those classes, for example:
   ```css
   @layer components {
     @media (max-width: 599px) {
       .bf-section { padding-block: var(--bf-section-y); padding-inline: var(--bf-gutter); }
       .bf-section > * { margin-block: 0; }
       .bf-label + .bf-title { margin-top: var(--bf-gap-label-title); }
       .bf-title + .bf-text { margin-top: var(--bf-gap-title-text); }
       .bf-text + .bf-text { margin-top: var(--bf-gap-text-text); }
       :is(.bf-title, .bf-text) + .bf-actions { margin-top: var(--bf-gap-to-actions); }
       .bf-actions { display: flex; flex-direction: column; gap: var(--bf-gap-actions-inner); }
     }
   }
   ```
4. Remove the old page-specific spacing and `!important` from the `legacy` layer, page by page, and run the checks
   after each page.
5. Add a stylelint rule set: no `!important` outside utilities, media queries only at 599 / 1023, spacing only from
   tokens.

## 8 · How we know the rules are kept

From `output/element-lab/adaptive/system/` with the lab server running (`localhost:8081`):

| Command | What it proves |
|---|---|
| `python3 verify.py` | Every rule above, every page, five phones. Writes `compliance.md`. Exit code 1 if any rule has findings. |
| `python3 verify.py --quick --pages api` | The same on one page and one phone, in about 30 seconds. |
| `python3 check.py --page api --shots DIR` | Spacing, roles, grid and buttons with a marked screenshot per section. |
| `sh check-all.sh` | `check.py` on every page and phone. |
| `python3 stability.py --page api --mode site` | Load film on a slow 4G-like link. |
| `python3 draft-roles.py --page <name> --write` | Drafts the role map for a new page; the checks and screenshots correct it. |

What no tool checks, and must be looked at: copy against Copy v4 (C3), frames (C4) and the entrance motion (M3). A passing report is not the
end: every change is also looked at in screenshots at phone size before it is reported. The checks have passed
several times while the eye still found a problem; each such case became a new check.

## 9 · Status (16 November 2026, full run on ten pages)

Full report: `output/element-lab/adaptive/system/compliance.md`.

- **Pass (20):** all spacing and role rules (S1–S12), all button rules (B1–B4), titles (T1), hero fills the screen
  (L3), desktop and tablet unchanged (L4), no jump in the phone preview (M1).
- **Findings inside the demos:** small figures (T3), text under 11px (T5), small tap targets (L1) and demos taller
  than the screen (L2) come almost entirely from shrunk demos. The plan per demo is in
  `output/element-lab/demos.html`.
- **Line breaks (T4):** 40 places with one word on a last line or uneven title lines.
- **T2 (airlines):** the "At your destination" label sits 11px above its title.
- **C1 (marketplace):** the hero store cycles its theme (Light / Dark) while it is measured; not a text change, but
  the check cannot tell yet.
- **C2 (AIyelet):** the live page has "Pause animation" and "Start again" controls. They are against G3 and wait for
  the owner's decision.
- **M2:** expected until the CSS route in §7 is built: the lab styles with JavaScript after the first paint.

## Publishing a page (from the lab to the live site)

The lab (`output/element-lab/adaptive/`) is the one source; Vercel does not deploy `output/`. To publish a page:
1. Add it to `PAGES` in `scripts/sync-mobile.py` and run `python3 scripts/sync-mobile.py` (copies to `mobile/`).
2. In the page's HTML: the five stylesheets before `</head>` with `media="(max-width:599px)"`, and
   `<script src="mobile/load.js?v=N" data-page="<page>" data-v="N"></script>` before `</body>` (after the page's own
   scripts). On wider screens nothing loads, so desktop and tablet stay exactly as they were.
3. Check the real page (no injection) on a phone width and at 768 and 1440; run `verify.py` on the page.
4. Before publishing: `python3 scripts/sync-mobile.py --check`. After any lab edit, sync again and raise `v`.
Never hide with `display:none` an element the page's own scripts measure (it throws in Safari when the CSS loads
first): hide it with zero size and `visibility:hidden` instead.
