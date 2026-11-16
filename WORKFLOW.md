# Bridgify · how we work

The user asked for this on 16 November 2026 so mistakes are not repeated. Only steps that were tried and proved
in practice are written here. Anything not yet proven stays out until it is.

## 1 · Before touching anything

1. Read `AGENTS.md`, `DESIGN.md` (brand, colours, layout standard) and `TYPOGRAPHY.md` (type roles).
2. Copy comes only from the company content doc (Copy v4). No new lines, no reworded lines. Hiding or folding text
   on small screens is allowed; deleting it is not.
3. No frames and no Replay/Pause rows unless the user asks.
4. Work on a copy or a lab layer first. The live site changes only after the user approves what they saw.

## 2 · One component, every screen

- One markup and one copy per element. Only the arrangement changes per breakpoint
  (mobile ≤ 599 · tablet 600–1023 · desktop ≥ 1024). Never a second "mobile version" of an element.
- Prefer re-arranging an element over shrinking it. Shrinking a desktop demo with zoom made labels unreadable.
- Do not remove a visual on mobile without asking. When a visual is too small, first look for its own
  narrow layout or a larger part of it to keep (the Why Bridgify stages already had one).
- Desktop must stay identical: compare 1440 with and without the change.

## 3 · Mobile proportions (reference: linear.app, measured at 390×664)

Agreed with the user for the homepage; apply the same numbers to other pages unless told otherwise.

| Part | Mobile |
|---|---|
| Header bar | 52px floating bar, 8px from the top, 10px from the sides |
| Logo | 24px tall |
| Header action | 32px tall, 11px text |
| Hero title | 34px |
| Section titles | 28px, Chillax Regular (400); Light reads too thin on phones |
| Card and list names | 18–19px, Chillax Medium (500) |
| Body | 15px / 24px |
| Labels above titles | 11px |
| Main buttons | 40px tall, 15px text; tabs and switches stay 44px |
| Section spacing | 64px top and bottom |
| Gutter | 24px; spacing on the 8px scale |

- Section label → title: exactly 16px on every section (set in `patterns.js`, checked by `fit.py`). Each page
  brought its own margins and flex gaps (measured 0–26px), so a shared size rule alone did not make them equal.
- Read more appears only when more than two lines would be hidden. It sits right under its paragraph (the last
  visible line fades), at the same distance everywhere; the 44px tap area must not add space.
- Key figures (1M+, 180+, 3%, $280) stay large: at least 28px, 34px in the numbers strip.
- The hero fills the whole first screen (`min-height: 100lvh`) so the next section never shows under it.
- Captions inside demos (such as "Context · Traveler request") are small and quiet, not a second headline.
- Titles break into even lines and paragraphs never end on a single word: `text-wrap: balance` on titles,
  `text-wrap: pretty` on paragraphs, and the coloured phrase in a title stays on one line when it fits.

## 4 · Measure against the real screen, never the full device height

A phone browser never gives the page the whole screen. Measure with Playwright's device profiles, whose viewport
is the visible area:

| Device | Visible area |
|---|---|
| iPhone 13 | 390 × 664 |
| iPhone SE | 320 × 568 |
| iPhone 15 Pro Max | 430 × 739 |
| Pixel 7 | 412 × 839 |

Run in both engines: WebKit (Safari's engine, installed) and Chromium. Sizes matched between them in every test so
far; differences seen were mid-animation states.

Tool: `output/element-lab/adaptive/tools/fit.py` (`--engine webkit|chromium`, `--pages`). It flags:

- a demo taller than 85% of the iPhone 13 screen or 100% of the SE screen
- effective text under 12px (font size × zoom)
- text covered by a positioned element (some of these are text on photos by design; check by eye)
- tap targets under 44px
- a hero shorter than the tallest visible area
- key figures under 28px
- labels in one row that do not start on one line
- line breaks: a single word on a last line, or title lines very uneven

Known blind spot: marks drawn with CSS pseudo-elements (such as a "+" painted over a word) are not caught.

Grid tool: `scripts/grid-audit.py` checks start lines, column lines, spacing multiples, line breaks and tap targets
at seven widths. Its raw output is noisy (403 raw hits came down to about 15 real issues on the homepage), so read
its findings before acting on them.

## 5 · Look at real screenshots before saying anything works

- Scroll to each section and screenshot the visible screen, as a reader sees it. Full-page screenshots miss
  sections whose animations start only when scrolled into view.
- The site uses smooth scrolling: scroll with `behavior: 'instant'`, or screenshots stay at the top of the page.
- Review typography at phone scale, one screen at a time. A 0px gap between a label and its title was missed
  in a contact sheet shrunk to a third of its size; the user found it on the phone.
- When a size rule is shared, also measure the spacing between neighbours (label → title, title → text,
  text → link). Sizes can match while the gaps between them do not.
- Check every fix in the screenshot, not only in the numbers: the numbers passed several times while the eye
  still found a problem (cut demo, figures too small, uneven icon gaps).
- Report to the user with the screenshot, the measured numbers and a link they can open on the phone
  (`output/element-lab/qr.html` lists one per page). Say what was not checked (for example: not on a real phone).
