# Airlines — local surface context

This brief records the completed Airlines page on branch `codex/airlines-experiences`. `DESIGN.md` remains the normative brand direction. This page inherits the existing Bridgify identity, grid and typography; this record establishes no new identity or business claims.

Canonical local preview: `http://localhost:8080/airlines.html?version=2`. Implementation: `airlines.html`, `airlines.css` and `airlines.js`, with the existing logo, navigation motion and `homepage-version.js` helpers. The version helper preserves `version=2` through internal links and return-home navigation, including existing query parameters and fragment destinations. `index.html` remains the V1 reference.

## Layout and inherited language

- The shared content rail uses `--al-gutter: calc(3vw + 10px)`, matching the existing site gutter, with 24px at 600px and below. Navigation, hero, section content and footer align to this rail.
- Headings use local Chillax Light 300; body and interface text use local Sofia Sans (`Sofia` in CSS). Warm cream `#EEE9DE`, deep brown `#180F10` and controlled coral `#F46649` inherit the site palette. The approved Bridgify / Part of HBX Group lockup is reused.
- The dark hero pairs the headline and two actions with one live airline experience stack. Global marketplaces, aggregators and suppliers feed the Bridgify infrastructure layer, which connects to an illustrative airline booking confirmation with Seine and Louvre cards. Interface text, layers, wires and controls are live HTML/SVG; only the photographic regions are raster assets.
- The remaining page follows the long reference's section sequence: a cream ancillary-revenue passage; a passenger-journey section with touchpoints, phone preview and loyalty context inside one dark panel; dark API and White-Label Marketplace options with a shared-infrastructure strip; a cream FAQ; and a dark demo invitation/footer. Existing content and destination links supply the page's claims.

## Earn beyond the flight — narrow replacement

`#section-2 .al-earn` now follows `/Users/tomwininger/Downloads/Beyond the flight, experiences that earn.png`. Its cream surface, shared gutters, Chillax heading and Sofia copy retain the page's existing language. The desktop layout has two columns: the heading above a native SVG seat/bag → gate → ticket → temple/boat diagram and live caption on the left; the supplier paragraph, warm coral ticket/coins revenue note, API paragraph and Site/App/Email row on the right. The supplier phrase “no supplier network to build” and revenue phrases receive bold emphasis. At 800px and below the columns stack. The revenue note's 2px left border is intentional reference fidelity; the detector's side-tab warning did not prompt an unrelated style change.

On first intersection, persistent `has-connected` starts the diagram's 1600ms connection trace once per page visit. The separate `is-visible` state pauses/resumes that same animation when the section leaves/re-enters the viewport, avoiding replay. Hidden-document handling also pauses it. Reduced motion suppresses the trace and retains the complete static diagram and text; no animation is required to understand the section.

The narrow replacement was checked at CSS viewports 1440×900, 1280×720 and 390×844 with no overflow. Supplied-color contrast checks recorded 6.30:1 for body text, 4.83:1 for captions, 4.87:1 for the revenue callout and 3.41:1 for diagram strokes. The independent reviewer confirmed the replay finding resolved and returned **Ship** for this narrowed scope, with no visual findings.

## Motion and interaction

The first hero entrance arrives in supply → Bridgify → airline order, with 120ms offsets and a 760ms translate/opacity transition. Small round warm-white data dots travel upward along coral connections. Their continuous animation runs only while the hero intersects the viewport and pauses while the document is hidden. Other marked content enters once with a restrained translate/opacity animation. Hidden-document handling pauses the tracked Web Animations; reduced motion bypasses those animations, finishes running ones and hides flowing dots. Base content remains visible without entrance animation, and native navigation/FAQ disclosures remain available without JavaScript.

The four passenger touchpoints are semantic button tabs with associated tabpanels, one selected tab stop, and Arrow/Home/End keyboard selection. The selected preview changes with a short transition; inactive panels become hidden/inert. Arrival is the initial state. Experience cards open a native modal `dialog` with an illustrative-content note, close control, backdrop dismissal and native Escape behavior. FAQ and navigation groups use native `details`/`summary`; FAQ height/opacity transitions defer to native disclosure behavior with reduced motion.

At 900px and below the hero stacks, desktop line breaks relax, navigation moves into a toggle-controlled panel, and the touchpoints become a horizontal row. At 600px and below actions and content columns stack, touchpoints form a 2×2 grid, loyalty follows the phone, and footer/FAQ become single-column. The mobile menu maintains `aria-expanded`, makes closed navigation inert, and supports Escape, outside-click and link dismissal. Short desktop viewport rules reduce hero spacing and constrain the illustration to available height.

## Sources and completion record

- Standalone hero reference: `/Users/tomwininger/Downloads/Bridgify’s integrated airline experience stack (1).png`.
- Long-page reference: `/Users/tomwininger/Downloads/Bridgify_ Destination experiences for airlines (1).png`.
- Photo provenance and precise crops: `assets/airlines-photo-sources.md`. It records the unchanged reference copy at `assets/airlines-reference-photos.png`, the Seine and Louvre SVG crop coordinates, and the pre-existing approved `assets/paris-romantic-experience.png` used in the destination background and phone preview.

The independent finish reviewer returned **Ship**, with no material findings after inspecting the reference and screenshot evidence. The main implementation review verified runtime behavior at 1440×900, 1280×720 and 390×844, including keyboard operation, touchpoint selection, FAQ, dialog and menu. This brief records that bounded completion result and the current source behavior; it adds no broader approval.

## Hero supplier icon refinement

The hero supplier row follows `/Users/tomwininger/Downloads/Bridgify hero with delicate supplier icons.png`: inline database, three-node network and gift outlines use delicate cream strokes (`#EEE9DE`, stroke width 0.9). Tiny warm-white filled, coral outlined accent dots sit at the database's lower right, the network's upper right and the gift's bow center. These variants are limited to `.al-suppliers`; shared `al-database`/`al-gift` symbols, layout, typography and motion remain unchanged. The stylesheet cache query is `3`.

The refinement was checked at CSS viewports 1280×720 and 390×844 with no overflow; evidence is saved in `.impeccable/review/desktop.png` and `.impeccable/review/mobile.png` (browser-scaled physical pixels). The finish reviewer returned **Ship**, with no fixes required.
