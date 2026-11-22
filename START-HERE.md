# Start here: working on the Bridgify site

For anyone, person or AI model, who works on this repo (owner, 22 Nov 2026). It covers how to set up, how to see every screen while you work, how to check a change before the owner sees it, and the prompt to give your Claude.

The rule behind all of it: **phone, tablet and desktop are one job.** A fix made while looking only at the desktop breaks the iPad. That happened with Why Bridgify on the upright iPad Pro. So you see every screen while you work, and the check at the end proves that nothing else moved.

## 1 · Set up (once)

You don't need an iPad or a phone. The tools open the site in a real browser at the exact size of each device, including Safari's engine (WebKit), which iPhones and iPads use.

```bash
git clone https://github.com/idwav/bridgify-website-backup.git && cd bridgify-website-backup
pip3 install playwright pillow
python3 -m playwright install chromium webkit
```

To serve the site locally, leave this running in its own terminal:

```bash
python3 -m http.server 8080
```

## 2 · While you work: every screen at once

**The quickest way:** run `bash scripts/qa/open-preview.command <page>`, for example `bash scripts/qa/open-preview.command hotels`. You can also double-click `scripts/qa/open-preview.command` in Finder to open the home page. It finds or starts a small local server for the site folder (from port 8765 up, skipping ports other apps use) and opens the page in the browser.

**For Claude:** when the user asks to "open the five screens", "show me all the screens" or "תפתח לי את 5 המסכים" for a page, run that command with the page name, for example `index-v2`, `hotels` or `airlines`. Then tell the user that it is open in their browser.


Open **http://localhost:8080/scripts/qa/preview.html?page=index-v2**. Change the `page=` part for another page, or pick it from the menu.

- It shows the same page on five screens side by side:
  - phone 390×844
  - iPad upright 834×1194
  - iPad Pro upright 1024×1366
  - iPad or laptop on its side 1024×768
  - desktop 1440×900
- "Section" scrolls every screen to the same section.
- Save a file, come back to the tab, and every screen reloads at the same section.
- Under each screen it says if the page scrolls sideways or has a JavaScript error.

Keep it open the whole time. If something moves on a screen you were not working on, you have found the bug before anyone else.

## 3 · Every task

1. **One bug or change per branch:**
   ```bash
   git switch main && git pull && git switch -c idan/<short-name>
   ```
   Don't fix ten things in one branch: that is where things break without anyone noticing.
2. **Read the rules** for what you touch:
   - `AGENTS.md`: always
   - `DESIGN.md` and `TYPOGRAPHY.md`: for anything visual
   - `MOBILE-RULES.md`: for phones
3. **Limit a fix to the screens it is for**, with a media query.
   - Before you change a breakpoint, a container query or CSS shared by several sections, look at all five screens in the preview.
   - `wide/` (tablet and desktop) and `mobile/` (phone) are generated. Never edit them by hand:
     - tablet/desktop: edit `output/element-lab/grid-plan/`, then run `python3 scripts/build-wide.py --only <page>`
     - phone: edit `output/element-lab/adaptive/`, then run `python3 scripts/sync-mobile.py`
4. **Check:**
   ```bash
   python3 scripts/qa/review.py --full --webkit --phone-rules
   ```
   - It finds the pages your change affects and photographs every section before (main) and after (your branch), at 8 widths and in Safari's engine.
   - Then open `output/qa-review/<date-time>/index.html`:
     - **Magenta** is what changed. Look at every changed section at every width. A section that changed when you didn't mean it to is a bug: fix it.
     - **Red** is an error and **amber** a warning. **NEW** means your change caused it; "already on main" means it was there before.
   - Fix every NEW error (the command fails until there are none). Fix a NEW warning, or write why it stays.
   - If you touched a pinned or scroll-driven section, also check it on the iPad Pro upright and on its side in the preview:
     - it pins centred, with equal space above and below;
     - it doesn't spill into the next section.
5. **Before the PR:**
   ```bash
   python3 scripts/sync-footer.py --check
   python3 scripts/sync-mobile.py --check
   ```
6. **Show the owner:**
   - Send before/after pictures of what changed, on phone, tablet and desktop together.
   - Open a PR into `main` with:
     - what changed and on which pages;
     - `summary.md` from the report;
     - what you did not check.
   - Never merge or deploy. The owner does.

## 4 · Finding bugs: the site audit

```bash
python3 scripts/qa/review.py --audit --all --full --webkit --phone-rules
```

This checks the whole site as it is (no before/after) and lists every problem, by page, width and section, boxed on a screenshot. The owner turns it into a numbered list of tasks, and each task is one branch.

The current list is in `QA-TASKS.md`.

## 5 · The prompt for your Claude

Paste this at the start of every session, with the task at the end:

```
You are working on the Bridgify website (repo idwav/bridgify-website-backup). The owner is Tom: he approves everything that goes into main and onto the site. Answer me in Hebrew.

Before any task:
1. git switch main && git pull, then git switch -c idan/<task-name>. One task per branch. Never work on main, never merge, never upload to Vercel.
2. Read START-HERE.md, AGENTS.md, WORKFLOW.md, DESIGN.md and TYPOGRAPHY.md (and MOBILE-RULES.md for phones), and work exactly by them.
3. Copy only from Copy v4. Don't touch index.html (version 1). Don't edit wide/ or mobile/ by hand: edit the sources and rebuild (AGENTS.md).
4. Phone, tablet and desktop are one job. A change meant for one screen is limited to it with a media query. Before you change a breakpoint, a container query or shared CSS, look at all five screens in scripts/qa/preview.html. Don't undo a design the owner approved.

When the change is done:
5. Run python3 scripts/qa/review.py --full --webkit --phone-rules and open the report. Go through every section outlined in magenta at every width: a change you didn't intend is a bug, fix it. Fix every NEW error; fix a NEW warning or explain why it stays. Run again until there are 0 new errors.
6. For a pinned or scroll-driven section: check the iPad Pro upright and on its side. It pins centred, with equal space above and below, and doesn't spill into the next section.
7. Run sync-footer.py --check and sync-mobile.py --check.
8. Show me before/after pictures of what changed, on phone, tablet and desktop side by side, and wait for my approval. Then open a PR with what changed, on which pages, summary.md, and what was not checked. Don't merge.

Don't say anything works before you have seen it in a screenshot.

The task:
[paste one task from the list]
```
