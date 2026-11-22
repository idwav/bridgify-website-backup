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
| Hero, section and closing call-to-action titles | 28px, Chillax Regular (400); one size for all titles (the user chose it on the API page, 16 Nov 2026). Light reads too thin on phones |
| Card and list names | 18–19px, Chillax Medium (500) |
| Body | 15px / 24px |
| Labels above titles | 11px |
| Main buttons | 40px tall, 15px text; tabs and switches stay 44px |
| Section spacing | 64px top and bottom |
| Gutter | 24px; spacing on the 8px scale |

- One title size on every page. A shared rule on `h1` once looked right but did not hold: each page puts its visible
  hero title in a different element (h1, a display h2 when the h1 is hidden, an embedded frame) and its own CSS
  (34, 34.32, 36px) won. The fix is to find the title the reader sees (`patterns.js` tags it `.ad-hero-title`) and to
  measure every title's size and weight on every page (`fit.py` "titleRoles"). The same check found the closing
  call-to-action titles at 30–33px Light on all pages.
- Section label → title: exactly 16px on every section (set in `patterns.js`, checked by `fit.py`). Each page
  brought its own margins and flex gaps (measured 0–26px), so a shared size rule alone did not make them equal.
- Read more appears only when more than two lines would be hidden. It sits right under its paragraph (the last
  visible line fades), at the same distance everywhere; the 44px tap area must not add space.
- Key figures (1M+, 180+, 3%, $280) stay large: at least 28px, 34px in the numbers strip.
- The hero fills the whole first screen (`min-height: 100lvh`) so the next section never shows under it.
- Captions inside demos (such as "Context · Traveler request") are small and quiet, not a second headline.
- Titles break into even lines and paragraphs never end on a single word: `text-wrap: balance` on titles,
  `text-wrap: pretty` on paragraphs, and the coloured phrase in a title stays on one line when it fits.

## 3b · Spacing comes from one table, never from a page (pilot: API page, 16 Nov 2026)

Each page brought its own margins, gaps and paddings (title → text measured 14–26px across ten pages), and fixing
them one selector at a time kept missing cases. The way that held:

- `output/element-lab/adaptive/system/tokens.css`: the one spacing table (8pt scale, one value per pair of roles:
  label → title 16, title → text 24, text → Read more 8, → buttons 32, button ↔ button 12, → tabs 32, tabs → content
  16, → content 32, hero heading → hero visual 48, section top/bottom 64). Only three breakpoints: ≤599 · 600–1023 · ≥1024.
- `system/roles/<page>.js`: the page only says which element plays which role. No spacing values in page files.
- `system/rhythm.js`: clears the page's own spacing between mapped elements and applies the table.
- `system/check.py --page <name>`: reads the same map and fails on any gap off its token (±1px), wrong section
  padding, buttons not 12 apart, heading text or buttons past the side margins, or any visible block with no role.
  Run it on iPhone SE, 13, 15 Pro Max (WebKit) and iPhone 13, Pixel 7 (Chromium); `--shots DIR` writes a marked
  screenshot per section for the eye check.
- Measure what the reader sees: a button row by its buttons (an old divider with 32px padding hid inside one), Read
  more by its text, heading text by its glyphs (a coloured phrase ran 4px past the margin while its box looked fine).
- Button or link (`system/actions.css`): a button moves the visitor forward with Bridgify (book a demo, talk to us,
  get the docs), at most one primary and one secondary per group, all 40px tall, one width per group, side by side
  only when both labels fit half the row, otherwise stacked full width. Anything that sends the visitor to read or
  see more elsewhere ("Read: …", "See the …") is a text link in the Read more style, 16 under its text. The check fails
  on a link drawn as a button, unequal buttons, a second primary, or a button frame missing a side.
- New page: `system/draft-roles.py --page <name> --write` drafts the map from what each element looks like; then
  `check.py` and the marked screenshots correct it by hand. Proven on all ten pages (16 Nov 2026). Patterns found
  on the way, now in the engine: a button and a link in one row are stacked; cards side by side, a scroller and its
  dots are one block; a "Read more" is found next to its paragraph (it exists only on phones where the text folds);
  a demo scaled with `zoom` scales its margin too; art drawn behind content is `deco`; `<button>`s inside demos are
  content, not calls to action. `sh system/check-all.sh` runs every page on the five phones.
- No jump on load (`system/stability.py`). The phone preview used to show the old layout for about 0.8s on a slow
  link, because the lab layer arrived after the page. `phone.html` now keeps the page hidden until the layer has run
  (`--mode lab` passes). The same test with the layer loaded as the live site would carry it (`--mode site`) still
  shows one changed frame: whatever JavaScript sets (spacing, hero title tag, button sizes) arrives after the first
  paint. So before the live site: the system's output must become plain CSS and classes in the markup; JavaScript
  only for behaviour (tabs, Read more).
- Desktop and tablet must stay identical: compare 1440 and 768 with and without the system (rerun once to tell
  animation noise from a real change).

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
- title roles: the visible hero title and each section's title not at 28px / 400 (found on what the reader sees,
  including inside a same-origin frame)

When a rule is meant to be the same everywhere, measure the result on every page, not the selector. Known blind spot: marks drawn with CSS pseudo-elements (such as a "+" painted over a word) are not caught.

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

## 5b · Before/after and a full QA report for every change (owner, 22 Nov 2026)

Every change, by any person or model, ends with a before/after review of every screen it can affect, and the
owner sees it before anything is merged.

1. Run `python3 scripts/qa/review.py` from your branch. It finds the pages your change affects (against
   `origin/main`), opens each one before and after at 390, 768, 1024 and 1440, and photographs every section.
   Add `--full` for 360, 834, 1280 and 1920 as well, `--webkit` for Safari's engine, and `--phone-rules` for the
   MOBILE-RULES.md check. Use `--pages a,b` to name pages, or `--all` for the whole site.
2. Open `output/qa-review/<date-time>/index.html`:
   - Sections that changed are outlined in magenta; unchanged sections are folded away.
   - Each problem is boxed on the screenshot, red for an error and amber for a warning, and marked NEW (your
     change caused it) or "already on main".
   - The checks: sideways scroll, text past the screen edge, text cut by its box or its parent, overlapping text,
     images that fail, tiny text, fonts outside the brand, phone tap targets, headings off the content line,
     duplicate ids, console errors, failed requests and broken internal links.
3. Fix every NEW error. The command exits with 1 while one is left. For a NEW warning, fix it or say in the PR why it
   stays: for example, labels inside a scaled diagram that the owner approved.
4. Look at the before/after pictures yourself, section by section. The checks cannot judge design. A section that
   changed where you did not mean to change anything is a bug.
5. Paste `summary.md` into the PR and send the owner the before/after pictures of what changed, on phone, tablet and
   desktop. Say what was not checked.
