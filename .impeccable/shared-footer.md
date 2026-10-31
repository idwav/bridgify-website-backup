---
name: Bridgify shared footer
description: Implemented Persuade surface within the existing Bridgify visual identity.
colors:
  footer-ground: "#160f0d"
  cream: "#eee9de"
  coral: "#f46649"
  heading-accent: "#f88260"
  label-accent: "#ff956e"
  focus: "#ffae87"
typography:
  headline:
    fontFamily: "Chillax, sans-serif"
    fontSize: "clamp(28px, 2.7vw, 44px)"
    fontWeight: 300
    lineHeight: 1.25
    letterSpacing: "-.025em"
  cta-headline:
    fontFamily: "Chillax, sans-serif"
    fontSize: "clamp(32px, 3.2vw, 52px)"
    fontWeight: 300
    lineHeight: 1.18
    letterSpacing: "-.025em"
  body:
    fontFamily: "Sofia, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  footer: "30px"
  button: "9px"
---

# Shared footer implementation record

## Overview

Updated 31 October 2026 from the current code after the user's content revision. This scoped **Persuade** footer inherits `DESIGN.md`: warm brown, cream, controlled coral, Chillax display type, Sofia interface text and approved Bridgify artwork. It combines a recurring CTA where appropriate, the user-supplied tagline, five navigation groups, the Bridgify/HBX signature and the user-supplied business clarification. No separate visual world is introduced. No `PRODUCT.md` was present.

The footer covers all 17 public pages, including the explicitly authorized Version 1 homepage. This document does not replace global design guidance. The latest content instruction establishes the navigation structure below. The former footer email form and its email/session-storage handoff have been removed; current CTAs are direct navigation links.

## Colors

The ground is warm dark brown with cream text and coral emphasis. Tagline/CTA spans and numbered navigation labels use the local accent variants above. A radial wash (`#3b180e55`, transparent at 48%, centered at 50% 88%) sits behind the lower brand area. The primary CTA runs from `#ff965c` to `#f55b38` with dark `#24110d` text. The secondary CTA uses cream text and a `#c06a4b` border. Navigation brightens to `#ffab86` on hover. The footer ground is its actual local value, not the global dark token.

## Typography

Both families load locally in `shared-footer.css`, with `font-display: swap`: Chillax Light from `Chillax_Complete/Fonts/OTF/Chillax-Light.otf`, and Sofia Sans under the family name `Sofia` from `Sofia_Sans/SofiaSans-VariableFont_wght.ttf` (weights 100–900).

The tagline and larger CTA headline use the frontmatter specifications and balanced wrapping, with maximum widths of 850px and 760px. Navigation headings are small, tracked uppercase Sofia; numerals are coral and tabular. Navigation links use `clamp(16px,1.25vw,21px)`, weight 400 and line height 1.4. CTA links use 17px Sofia at weight 600. Business small print is 14px/1.65, constrained to 86ch. Attribution and the bottom strip are smaller than navigation.

## Layout

The shell has 16px top, 14px side and bottom padding. The footer uses horizontal gutters of `clamp(24px,4.5vw,80px)` and top padding of `clamp(40px,4vw,64px)`. Where included, the CTA appears first in a two-column grid (`minmax(0,1.5fr) minmax(270px,1fr)`), with a 48px gap and lower divider separated by 48px padding and margin. Its action links wrap and align right. The tagline follows, then five numbered navigation columns (`1.1fr 1.45fr .8fr .8fr .7fr`) with 30px gaps.

The brand container sits below navigation at 100% of the inner content width with no maximum width, using desktop margins of 40px auto 24px. Its left and right edges align with the shared inner content. The SVG is 107.53% wide with a -3.765% left margin, aligning the visible glyph edges with the content while allowing the surrounding glow to extend slightly. Business small print follows the signature. A ruled bottom row distributes copyright and Back to top. Height follows content.

- At 1100px and below, CTA gap becomes 32px and actions stack. Navigation becomes three columns (`1.1fr 1.4fr 1fr`) with 32px gaps. The wordmark uses full width.
- At 760px and below, shell padding is 10px, gutters 24px, top padding 32px and footer radius 22px. The CTA becomes one column with a 24px gap, 32px bottom padding/margin and headline size `clamp(30px,6vw,42px)`. Actions return to a wrapping row aligned left, with 16px type and 50px minimum height. The tagline is 28px with ordinary wrapping. Navigation becomes two columns with 30px vertical/24px horizontal gaps and 16px links. The brand container remains 100% wide with no maximum width and margins of 32px 0 24px; its edges remain aligned with the inner content. Small print becomes 13px; the bottom row remains flex with smaller type and spacing.
- At 420px and below, CTA actions stack again; navigation's horizontal gap becomes 18px and it remains two columns.

Print styling uses white with dark primary text and hides the recurring CTA, wordmark and Back to top.

## Elevation & Depth

Warm gradients and thin borders carry depth without box shadows. The shell and CTA divider use `#aa604647`; the bottom rule uses `#9e512a42`. Hover raises CTA links by 2px; the secondary CTA gains translucent coral (`#f4664914`).

## Shapes

The footer is a large rounded container; action links use smaller rounded corners. Desktop action links have a minimum height of 54px with 14px vertical/20px horizontal padding. Arrows are inline stroked SVG. The supplied raster wordmark is cropped through an SVG viewBox and feathered with intersecting horizontal and vertical CSS masks.

## Components

**Recurring CTA.** The exact headline is “Tell us who your customers are. We'll show you what they'd book.” The second sentence is coral. “Book a demo” links to `contact.html`; “Read the API docs” links to `developers.html`. These regular links work without JavaScript. The band appears on 15 public pages. Contact is excluded because it already has its enquiry form; Press is excluded because it already closes with a media-enquiry CTA. The shared footer remains on both pages.

**Approved copy.** The exact tagline is “Bridgify. The infrastructure behind travel experiences.” The words after “Bridgify.” are coral. The exact small print is “Bridgify works with businesses. Looking to book an experience for your own trip? You'll find our supply inside the apps, sites and rewards programs of our partners.” Both are live HTML supplied by the user.

**Navigation.** Five numbered groups match the main navigation labels and destinations:

- **Products:** heading and “All products” → `index.html#products`; “Experiences API” → `api.html`; “White-Label Marketplace” → `marketplace.html`; “AIyelet: AI personalization” → `personalization.html`.
- **Solutions:** heading → `index.html#audiences`; “OTAs and travel platforms” → `otas.html`; “Airlines” → `airlines.html`; “Hotels” → `hotels.html`; “Loyalty, rewards and financial services” → `loyalty-finance.html`; “Travel technology companies” → `travel-technology.html`; “Super apps and consumer platforms” → `super-apps.html`.
- **Developers:** standalone linked heading → `developers.html`, without a child list.
- **Resources:** “Insights” → `insights.html`; “Press” → `press.html`.
- **Company:** “About” → `about-us.html`; “Careers” → `careers.html`; “Contact” → `contact.html`.

The shared footer no longer generates additional page-specific email or careers-anchor list items. Press retains its existing media CTA outside this shared navigation. Existing `homepage-version.js` routing handles version-aware links, including CTA destinations. Hover adds underline and accent color; keyboard focus uses a 2px outline with 5px offset. The footer sits outside the main landmark and explicitly labels navigation and heading.

**Brand signature.** `assets/footer-wordmark-reference.png` is byte-identical to the user-supplied `/Users/tomwininger/Downloads/Slimmed Bridgify footer wordmark (1).png`, supplied on 31 October 2026. Both SHA-256 hashes were confirmed as `472efa0b63d4fe6308a33bb60fbc5bb8329818c6065cd86b1547a4a112851258`. The image dimensions are represented as 1716 × 916; SVG viewBox `350 510 1000 280` displays the wordmark region without rewriting the artwork. Automatic height preserves its aspect ratio; horizontal mask stops at 3% and 97% feather the outer glow, while the vertical mask retains its 12% and 92% stops. “Part of HBX Group” is separate live text. The signature links home. Further provenance is in `assets/footer-wordmark-source.md`.

**Motion and utility.** At first observed intersection (threshold 0.05), the wordmark enters from opacity .65 and a 12px downward offset over 1000ms with `cubic-bezier(.16,1,.3,1)`. Observation then disconnects. Reduced motion and the existing hero's `paused` class suppress entrance through `bf-motion-paused`. Content remains visible without the observer or JavaScript. CTA transitions are 220ms; navigation color transitions are 180ms. Reduced motion removes footer animations/transitions and uses instant scrolling. Back to top scrolls to zero, attempts to focus the first matching header link/top link/heading, and clears the hash while retaining path/query. The copyright year updates at runtime with 2026 as static fallback. No footer form handling remains in `shared-footer.js`.

**Source and synchronization.** `partials/site-footer.html` owns footer markup; `partials/recurring-cta.html` owns the reusable CTA. `shared-footer.css` owns scoped styling; `shared-footer.js` supplies enhancement. `scripts/sync-footer.py` preserves footer IDs, inserts the band except on Contact and Press, embeds crawlable static HTML between shared-footer markers, and includes the stylesheet/script on 17 explicitly listed public documents. Edit the partials and run `python3 scripts/sync-footer.py` from the project root. Run `python3 scripts/sync-footer.py --check` before publishing; the current documentation pass confirmed “17 public pages checked; 0 need sync.” Do not hand-edit generated copies.

**Current verification.** The implementation/review handoff reports copy checks on all 17 pages, passing JavaScript and diff checks, verified CTA exception counts, preserved Version 2 context on both CTA destinations, and a verified browser click through to Contact. The fresh `footer_copy_reviewer` returned no material findings. The content revision was captured in `.impeccable/review/desktop.png` (1440 × 1200), `mobile.png` and `mobile-bottom.png` (390 × 844). The subsequent wordmark alignment revision has fresh bottom-region proof in `.impeccable/review/wordmark-desktop.png` (1280 × 720) and `wordmark-mobile.png` (390 × 844); these are the current wordmark evidence. Its fresh reviewer returned **SHIP**. The implementation handoff confirms exact DOM matches between brand-container and inner-content left/right edges, no overflow, a passing diff check, and 17 synchronized pages with zero drift. Earlier laptop captures remain stale; the newly named wordmark desktop capture is current. The detector returned `[]` in degraded parser-fallback mode: limited evidence, not a full detector pass. Earlier email-handoff tests concern the removed implementation and do not validate current functionality. No publish was performed.

## Do's and Don'ts

- Do preserve current approved copy, full navigation labels and destinations, including homepage version context.
- Do keep supplied wordmark artwork/proportions, live interface text and HBX attribution.
- Do retain Contact and Press CTA exceptions when synchronizing all 17 pages, including both homepage versions.
- Do recheck responsive layouts, keyboard focus, reduced motion and links before publishing.
- Don't reintroduce the removed footer email form or describe direct CTA navigation as an email handoff.
- Don't use stale laptop captures for this revision or imply deployment from local verification.
- Don't promote footer-specific styling into a replacement global design system.
