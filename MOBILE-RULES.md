# Bridgify mobile rules (for development)

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
| S2 | title → text · paragraph → paragraph | 24 · 16 | `--bf-gap-title-text` · `--bf-gap-text-text` |
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
