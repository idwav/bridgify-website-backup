# Homepage V2 — local surface context

This records the completed narrow homepage correction. `DESIGN.md` remains the normative brand and design direction; this local metadata does not replace it. The work inherits the existing Bridgify world: warm cream, deep brown, controlled coral, Chillax headings and Sofia body/interface text. It establishes no new visual world and is not a general drift repair.

Canonical local preview: `http://localhost:8080/?version=2`. The active homepage is `index-v2.html`; preserve `index.html` as the V1 reference. Preserve `version=2` through internal navigation and return-home links using the existing version routing.

## Corrected surfaces

- **Opportunity (`#opportunity-study`):** uses `--home-gutter` for the shared page alignment. The inner container, heading, comparison panels and footer use the available content width without a separate maximum-width wrapper. Headings use Chillax; body, facts and links use Sofia. The comparison remains “Building it yourself” beside “With Bridgify”; below 761px the introduction and panels stack, with a readable wrapping footer link. Diagram artwork retains its own bounded width within each panel.
- **Partners (`#partners`):** confirmed names remain live text: AMEX Israel, Isracard, Max, Moovit and Pango. Five equal columns give them balanced presence, separated by quiet rules. At 600px and below the grid becomes two columns, with Pango spanning the final row. No logo artwork or partner claims were invented.
- **Why Bridgify (`#why-bridgify`):** replaces four independent tiles with the reference-native architecture already expressed in Bridgify’s language. On a fitting desktop stage, active copy sits left above a compact category list; one persistent diagram sits right. The four chapters are Aggregate, Normalize, Distribute and Personalize. The diagram connects global supply through Bridgify to App, Site, Booking flow and Rewards, with AIyelet alongside the core path. Existing section/alias anchors remain available.

## Why interaction and complete reading path

Native page scroll selects the current chapter and synchronizes its text, category state and diagram emphasis. Aggregate and Distribute also trace their respective wires as their chapter progresses. Category clicks scroll to the matching chapter. Arrow keys move between categories with wrapping; Home and End select the first and last. Scroll mode uses a vertical tablist with one selected focusable tab; inactive panels are inert and hidden from assistive technology.

The sticky sequence is enabled only above 900px width, at least 640px viewport height, with reduced motion off, the site animation control unpaused, and the measured stage fitting with its top/bottom clearance. Otherwise it becomes natural reading: no sticky height, category controls hidden, and all four panels available in document flow. At 900px and below the diagram appears above the copy. Reduced motion removes Why animation/transitions and wire tracing; pausing the site animation also switches to full reading. Resizing, loaded fonts and motion-preference changes recalculate the mode. Without JavaScript, all chapter copy remains present and the category controls stay hidden. Print styling presents all chapters without the sticky sequence.

## Completion record

The independent finish review returned **Ship**, with no material issues within this correction’s scope. This brief records that result and the current source behavior; it adds no broader approval or new content claims. Implementation context: `index-v2.html`, `homepage-v2.css`, `homepage-v2.js` and `opportunity-v2.css`, with inherited architecture styling in `opportunity-study.css`.
