# Compliance report

Generated 16 Nov 2026 18:34 by `system/verify.py` on 10 page(s) in 633s. Rules: `MOBILE-RULES.md`.

| Rule | What | Checked by | Result |
|---|---|---|---|
| S1 | Label → title 16 | check.py | ✓ pass |
| S2 | Title → text 24; paragraph → paragraph 16 | check.py | ✓ pass |
| S3 | Text → Read more 8 (to its visible text) | check.py | ✓ pass |
| S4 | Heading → buttons 32; button ↔ button 12 | check.py | ✓ pass |
| S5 | Text or buttons → text link 16 | check.py | ✓ pass |
| S6 | Heading → tabs 32; tabs → content 16 | check.py | ✓ pass |
| S7 | Heading → content 32; content → content 32; scroller → dots 16 | check.py | ✓ pass |
| S8 | Hero heading → hero visual 48 | check.py | ✓ pass |
| S9 | Section top and bottom 64; header bar → hero label 48 | check.py | ✓ pass |
| S10 | Heading text and buttons stay inside the 24px side margins | check.py | ✓ pass |
| S11 | Tiles of one row start on one line | check.py | ✓ pass |
| S12 | Every visible block has a role (nothing unchecked) | check.py | ✓ pass |
| B1 | Button = action, link = go and read; a link is never drawn as a button | check.py | ✓ pass |
| B2 | At most one primary button per group; every button has a kind | check.py | ✓ pass |
| B3 | Buttons 40px tall, full frame | check.py | ✓ pass |
| B4 | Buttons of one group share one width | check.py | ✓ pass |
| T1 | Hero, section and closing titles 28px Chillax 400 | fit.py titleRoles | ✓ pass |
| T2 | Section label → title measured on every page (16 ±2) | fit.py labelGaps | ✗ 3 on airlines |
| T3 | Key figures at least 28px | fit.py smallFigures | ✗ 39 on airlines, api, hotels, marketplace, otas, super-apps, travel-technology |
| T4 | No single word on a last line; even title lines | fit.py badBreaks | ✗ 40 on airlines, api, hotels, index-v2, loyalty-finance, marketplace, otas, personalization, super-apps, travel-technology |
| T5 | No text under 11px as seen (labels are 11) | fit.py tiny | ✗ 90 on airlines, api, hotels, index-v2, loyalty-finance, marketplace, otas, personalization, super-apps, travel-technology |
| L1 | Tap targets at least 44px | fit.py taps | ✗ 99 on airlines, api, hotels, index-v2, loyalty-finance, marketplace, otas, personalization, super-apps, travel-technology |
| L2 | A demo fits the screen (≤85% of iPhone 13, ≤100% of SE) | fit.py fit | ✗ 31 on airlines, api, hotels, index-v2, loyalty-finance, marketplace, otas, personalization, travel-technology |
| L3 | The hero fills the first screen | fit.py heroFill | ✓ pass |
| L4 | Desktop (1440) and tablet (768) layout unchanged | layout boxes | ✓ pass |
| C1 | No text added or removed by the mobile layer (folding and hiding allowed) | page text | ✗ 2 on marketplace |
| C2 | No Replay / Pause rows unless asked | visible controls | ✗ 2 on personalization |
| C3 | Copy matches Copy v4 | by eye against the content doc | not automated: check by eye |
| C4 | No frames unless asked | by eye | not automated: check by eye |
| M1 | No jump on load: phone preview | stability.py --mode lab | ✓ pass |
| M2 | No jump on load: as the live site would load it | stability.py --mode site | ✗ 10 on airlines, api, hotels, index-v2, loyalty-finance, marketplace, otas, personalization, super-apps, travel-technology |
| M3 | Entrances as on desktop; off with reduced motion | by eye | not automated: check by eye |

## Details

### T2 · Section label → title measured on every page (16 ±2)
- **airlines** (3): iPhone 13: section-1 "AT YOUR DESTINATION" 11px; iPhone SE: section-1 "AT YOUR DESTINATION" 11px; iPhone 15 Pro Max: section-1 "AT YOUR DESTINATION" 11px

### T3 · Key figures at least 28px
- **airlines** (3): iPhone 13: €42 8px; iPhone SE: €42 6px; iPhone 15 Pro Max: €42 9px
- **api** (9): iPhone 13: 1M+ 13px; iPhone 13: 180+ 13px; iPhone 13: 1 13px; iPhone SE: 1M+ 13px; iPhone SE: 180+ 13px; iPhone SE: 1 13px …
- **hotels** (3): iPhone 13: €95 8px; iPhone SE: €95 6px; iPhone 15 Pro Max: €95 9px
- **marketplace** (6): iPhone 13: €39.00 18px; iPhone 13: $280 13px; iPhone SE: €39.00 17px; iPhone SE: $280 13px; iPhone 15 Pro Max: €39.00 18px; iPhone 15 Pro Max: $280 13px
- **otas** (9): iPhone 13: 1M+ 12px; iPhone 13: 1M+ 16px; iPhone 13: €36 8px; iPhone SE: 1M+ 11px; iPhone SE: 1M+ 18px; iPhone SE: €36 6px …
- **super-apps** (6): iPhone 13: €184.20 24px; iPhone 13: €120 8px; iPhone SE: €184.20 24px; iPhone SE: €120 6px; iPhone 15 Pro Max: €184.20 24px; iPhone 15 Pro Max: €120 9px
- **travel-technology** (3): iPhone 13: €39 8px; iPhone SE: €39 6px; iPhone 15 Pro Max: €39 9px

### T4 · No single word on a last line; even title lines
- **airlines** (6): iPhone 13: section-2 p orphan "continues."; iPhone 13: section-2 li orphan "revenue"; iPhone SE: section-2 p orphan "continues."; iPhone SE: section-2 li orphan "revenue"; iPhone 15 Pro Max: section-2 p orphan "continues."; iPhone 15 Pro Max: section-2 li orphan "revenue"
- **api** (4): iPhone 13: customer-experience li orphan "checkout"; iPhone SE: customer-experience li orphan "time"; iPhone SE: customer-experience li orphan "checkout"; iPhone 15 Pro Max: customer-experience li orphan "checkout"
- **hotels** (1): iPhone SE: section-1 li orphan "confirmed"
- **index-v2** (6): iPhone 13: personalization h2 uneven lines (130/230/330); iPhone SE: products h2 orphan "layer."; iPhone SE: audiences h3 orphan "platforms"; iPhone SE: security h2 orphan "security"; iPhone SE: faq summary orphan "infrastructure?"; iPhone 15 Pro Max: security h2 orphan "security"
- **loyalty-finance** (1): iPhone SE: market-signal h2 orphan "options."
- **marketplace** (11): iPhone 13: section-1 h2 orphan "experience."; iPhone 13: section-5 h3 orphan "experience."; iPhone 13: build-or-buy h2 orphan "marketplace?"; iPhone SE: section-1 h2 orphan "needed."; iPhone SE: section-1 h2 orphan "experience."; iPhone SE: section-5 h3 orphan "experience." …
- **otas** (3): iPhone 13: section-2 h2 uneven lines (302/322/106); iPhone SE: faq summary orphan "aggregation?"; iPhone 15 Pro Max: section-2 h2 uneven lines (302/322/106)
- **personalization** (1): iPhone 13: section-3 h2 uneven lines (247/103/301)
- **super-apps** (1): iPhone SE: faq summary orphan "experiences?"
- **travel-technology** (6): iPhone 13: section-3 h3 orphan "packages"; iPhone SE: section-2 h2 orphan "suppliers?"; iPhone SE: section-2 li orphan "source"; iPhone SE: section-3 h3 orphan "software"; iPhone SE: section-3 h3 orphan "packages"; iPhone SE: section-4 h2 orphan "experiences"

### T5 · No text under 11px as seen (labels are 11)
- **airlines** (6): iPhone 13: section-3 div.jp-sticky > div.jp-preview (195 pieces of text); iPhone 13: section-4 div.xc-grid (174 pieces of text); iPhone SE: section-3 div.jp-sticky > div.jp-preview (195 pieces of text); iPhone SE: section-4 div.xc-grid (174 pieces of text); iPhone 15 Pro Max: section-3 div.jp-sticky > div.jp-preview (195 pieces of text); iPhone 15 Pro Max: section-4 div.xc-grid (174 pieces of text)
- **api** (9): iPhone 13: top div.ahc-visual (29 pieces of text); iPhone 13: network div.an-split > div.nz-wrap (762 pieces of text); iPhone 13: customer-experience div.cj > div.cj-stage (43 pieces of text); iPhone SE: top div.ahc-visual (29 pieces of text); iPhone SE: network div.an-split > div.nz-wrap (762 pieces of text); iPhone SE: customer-experience div.cj > div.cj-stage (43 pieces of text) …
- **hotels** (9): iPhone 13: section-1 div.hm-layout (114 pieces of text); iPhone 13: section-3 div.hs-sticky > div.hs-preview (106 pieces of text); iPhone 13: section-4 div.xc-grid (172 pieces of text); iPhone SE: section-1 div.hm-layout (114 pieces of text); iPhone SE: section-3 div.hs-sticky > div.hs-preview (106 pieces of text); iPhone SE: section-4 div.xc-grid (172 pieces of text) …
- **index-v2** (6): iPhone 13: personalization div.intent-stage (7 pieces of text); iPhone 13: products div.pr-grid (88 pieces of text); iPhone SE: personalization div.intent-stage (7 pieces of text); iPhone SE: products div.pr-grid (114 pieces of text); iPhone 15 Pro Max: personalization div.intent-stage (7 pieces of text); iPhone 15 Pro Max: products div.pr-grid (88 pieces of text)
- **loyalty-finance** (9): iPhone 13: section-1 div.lr-demo (43 pieces of text); iPhone 13: section-3 div.lu-layout (120 pieces of text); iPhone 13: section-4 div.xc-grid (210 pieces of text); iPhone SE: section-1 div.lr-demo (71 pieces of text); iPhone SE: section-3 div.lu-layout (120 pieces of text); iPhone SE: section-4 div.xc-grid (210 pieces of text) …
- **marketplace** (12): iPhone 13: section-1 div.market-demo (55 pieces of text); iPhone 13: section-2  (31 pieces of text); iPhone 13: section-3 div.wl-layout (60 pieces of text); iPhone 13: section-5 div.launch-workspace (165 pieces of text); iPhone SE: section-1 div.market-demo (55 pieces of text); iPhone SE: section-2  (31 pieces of text) …
- **otas** (12): iPhone 13: section-1 div.ys-ticket (211 pieces of text); iPhone 13: section-2 div.ms-layout (52 pieces of text); iPhone 13: section-3 div.rc-panel (33 pieces of text); iPhone 13: section-4 div.xc-grid (175 pieces of text); iPhone SE: section-1 div.ys-ticket (249 pieces of text); iPhone SE: section-2 div.ms-layout (52 pieces of text) …
- **personalization** (9): iPhone 13: section-2 div.intent-stage (7 pieces of text); iPhone 13: section-3 div.match-workspace (18 pieces of text); iPhone 13: section-4 div.embed-shell (158 pieces of text); iPhone SE: section-2 div.intent-stage (7 pieces of text); iPhone SE: section-3 div.match-workspace (18 pieces of text); iPhone SE: section-4 div.embed-shell (186 pieces of text) …
- **super-apps** (9): iPhone 13: section-1 div.sc-preview (72 pieces of text); iPhone 13: section-3 div.up-story-track (68 pieces of text); iPhone 13: section-4 div.xc-grid (166 pieces of text); iPhone SE: section-1 div.sc-preview (72 pieces of text); iPhone SE: section-3 div.up-story-track (68 pieces of text); iPhone SE: section-4 div.xc-grid (166 pieces of text) …
- **travel-technology** (9): iPhone 13: section-1 div.te-visual (133 pieces of text); iPhone 13: section-2 div.ti (52 pieces of text); iPhone 13: section-4 div.xc-grid (166 pieces of text); iPhone SE: section-1 div.te-visual (133 pieces of text); iPhone SE: section-2 div.ti (52 pieces of text); iPhone SE: section-4 div.xc-grid (166 pieces of text) …

### L1 · Tap targets at least 44px
- **airlines** (9): iPhone 13: section-1 div.aj-heading (1 small targets); iPhone 13: section-1 ol.aj-journey (2 small targets); iPhone 13: section-3 div.jp-sticky > div.jp-copy (1 small targets); iPhone SE: section-1 div.aj-heading (1 small targets); iPhone SE: section-1 ol.aj-journey (1 small targets); iPhone SE: section-3 div.jp-sticky > div.jp-copy (1 small targets) …
- **api** (9): iPhone 13: top div.hero-copy (2 small targets); iPhone 13: top div.ahc-visual (4 small targets); iPhone 13: integration div.am-actions (1 small targets); iPhone SE: top div.hero-copy (2 small targets); iPhone SE: top div.ahc-visual (4 small targets); iPhone SE: integration div.am-actions (1 small targets) …
- **hotels** (12): iPhone 13: section-1 div.hm-heading (2 small targets); iPhone 13: section-1 div.hm-layout (16 small targets); iPhone 13: section-2 div.hr-columns (1 small targets); iPhone 13: section-3 div.hs-sticky > div.hs-preview (1 small targets); iPhone SE: section-1 div.hm-heading (2 small targets); iPhone SE: section-1 div.hm-layout (16 small targets) …
- **index-v2** (9): iPhone 13: home div.bv2-hero-layout (1 small targets); iPhone 13: personalization div.home-intent-heading (1 small targets); iPhone 13: home-cta div.hc2-box > div.hc2-copy (1 small targets); iPhone SE: home div.bv2-hero-layout (1 small targets); iPhone SE: personalization div.home-intent-heading (1 small targets); iPhone SE: home-cta div.hc2-box > div.hc2-copy (1 small targets) …
- **loyalty-finance** (9): iPhone 13: section-1 div.lf-heading (2 small targets); iPhone 13: section-1 div.lr-demo (2 small targets); iPhone 13: section-2 div.lp-demo (2 small targets); iPhone SE: section-1 div.lf-heading (2 small targets); iPhone SE: section-1 div.lr-demo (2 small targets); iPhone SE: section-2 div.lp-demo (2 small targets) …
- **marketplace** (6): iPhone 13: section-1 div.block-copy (2 small targets); iPhone 13: section-3 div.wl-layout (1 small targets); iPhone SE: section-1 div.block-copy (2 small targets); iPhone SE: section-3 div.wl-layout (1 small targets); iPhone 15 Pro Max: section-1 div.block-copy (2 small targets); iPhone 15 Pro Max: section-3 div.wl-layout (1 small targets)
- **otas** (12): iPhone 13: section-1 div.ys-copy (2 small targets); iPhone 13: section-2 div.ms-layout (2 small targets); iPhone 13: section-3 header.rc-head (1 small targets); iPhone 13: section-3 div.rc-panel (2 small targets); iPhone SE: section-1 div.ys-copy (2 small targets); iPhone SE: section-2 div.ms-layout (2 small targets) …
- **personalization** (12): iPhone 13: section-4 div.embed-shell (1 small targets); iPhone 13: section-4 div.embed-links (2 small targets); iPhone 13: day-itinerary div.day-layout (1 small targets); iPhone 13: day-itinerary footer (4 small targets); iPhone SE: section-4 div.embed-shell (1 small targets); iPhone SE: section-4 div.embed-links (2 small targets) …
- **super-apps** (9): iPhone 13: section-1 div.sc-hero-copy (2 small targets); iPhone 13: section-3 div.up-story-track (2 small targets); iPhone 13: section-3 div.sc-foot (1 small targets); iPhone SE: section-1 div.sc-hero-copy (2 small targets); iPhone SE: section-3 div.up-story-track (2 small targets); iPhone SE: section-3 div.sc-foot (1 small targets) …
- **travel-technology** (12): iPhone 13: section-1 div.te-heading (2 small targets); iPhone 13: section-2 div.th-intro (2 small targets); iPhone 13: section-3 div.ad-columns (4 small targets); iPhone 13: section-3 footer.ad-foot (1 small targets); iPhone SE: section-1 div.te-heading (2 small targets); iPhone SE: section-2 div.th-intro (2 small targets) …

### L2 · A demo fits the screen (≤85% of iPhone 13, ≤100% of SE)
- **airlines** (2): iPhone 13: section-2 div.ar-layout 88% of the screen; iPhone SE: section-2 div.ar-layout 115% of the screen
- **api** (3): iPhone 13: whats-inside div 112% of the screen; iPhone SE: whats-inside div 132% of the screen; iPhone 15 Pro Max: whats-inside div 94% of the screen
- **hotels** (3): iPhone 13: section-1 div.hm-layout 105% of the screen; iPhone SE: section-1 div.hm-layout 120% of the screen; iPhone 15 Pro Max: section-1 div.hm-layout 95% of the screen
- **index-v2** (3): iPhone 13: audiences div.audience-grid 105% of the screen; iPhone SE: audiences div.audience-grid 139% of the screen; iPhone 15 Pro Max: audiences div.audience-grid 86% of the screen
- **loyalty-finance** (3): iPhone 13: section-3 div.lu-layout 123% of the screen; iPhone SE: section-3 div.lu-layout 157% of the screen; iPhone 15 Pro Max: section-3 div.lu-layout 114% of the screen
- **marketplace** (6): iPhone 13: section-3 div.wl-layout 110% of the screen; iPhone 13: section-5 div.launch-workspace 131% of the screen; iPhone SE: section-3 div.wl-layout 143% of the screen; iPhone SE: section-4 div.wo-stack 106% of the screen; iPhone SE: section-5 div.launch-workspace 162% of the screen; iPhone 15 Pro Max: section-5 div.launch-workspace 117% of the screen
- **otas** (3): iPhone 13: section-3 div.rc-panel 96% of the screen; iPhone SE: section-3 div.rc-panel 134% of the screen; iPhone 15 Pro Max: section-3 div.rc-panel 86% of the screen
- **personalization** (5): iPhone 13: section-3 div.match-workspace 91% of the screen; iPhone 13: day-itinerary div.day-layout 152% of the screen; iPhone SE: section-3 div.match-workspace 107% of the screen; iPhone SE: day-itinerary div.day-layout 219% of the screen; iPhone 15 Pro Max: day-itinerary div.day-layout 133% of the screen
- **travel-technology** (3): iPhone 13: section-2 div.ti 120% of the screen; iPhone SE: section-2 div.ti 144% of the screen; iPhone 15 Pro Max: section-2 div.ti 105% of the screen

### C1 · No text added or removed by the mobile layer (folding and hiding allowed)
- **marketplace** (2): added: ◒ HORIZON Light; removed: YOUR ✧ BRAND Dark

### C2 · No Replay / Pause rows unless asked
- **personalization** (2): visible control "Pause animation Ⅱ"; visible control "Start again ↻"

### M2 · No jump on load: as the live site would load it
- **airlines** (1): airlines · site: first content 1.1s · changes after first view until 2.2s (max diff 168.9)
- **api** (1): api · site: first content 2.1s · changes after first view until 2.4s (max diff 32.1)
- **hotels** (1): hotels · site: first content 1.4s · changes after first view until 3.2s (max diff 36.5)
- **index-v2** (1): index-v2 · site: first content 2.8s · changes after first view until 3.6s (max diff 22.7)
- **loyalty-finance** (1): loyalty-finance · site: first content 1.2s · changes after first view until 2.7s (max diff 159.8)
- **marketplace** (1): marketplace · site: first content 1.5s · changes after first view until 9.2s (max diff 160.4)
- **otas** (1): otas · site: first content 1.3s · changes after first view until 2.3s (max diff 32.2)
- **personalization** (1): personalization · site: first content 1.2s · changes after first view until 3.9s (max diff 24.4)
- **super-apps** (1): super-apps · site: first content 1.3s · changes after first view until 2.0s (max diff 21.1)
- **travel-technology** (1): travel-technology · site: first content 1.3s · changes after first view until 2.1s (max diff 28.1)

