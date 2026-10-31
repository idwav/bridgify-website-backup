# Capability visuals — Version 2

Updated 31 October 2026 after the completed motion refinement. Surface mode: **Persuade**. This record covers the four live capability scenes in Why Bridgify. They inherit the existing Bridgify identity and `DESIGN.md`; this task made no global design changes. Version 1 was untouched by this request. Nothing was pushed or published.

Canonical local preview: `http://localhost:8080/?version=2`.

## Active implementation

`index-v2.html` now renders native HTML cards, live labels and SVG connectors on an open canvas, without a rectangular image background. Each card, tag and connector can animate independently. Existing travel photographs support the diagrams. The previously approved square PNG concepts remain preserved as source material; they are no longer rendered in the capability story.

| Category | Native scene |
| --- | --- |
| Aggregate | Marketplaces, aggregators and existing direct suppliers connect through Bridgify to one catalog. |
| Normalize | Three duplicate Colosseum listings become one clean record, with content, availability and booking in one schema. |
| Distribute | One experience connects through Bridgify to the business’s branded app, site, booking flow and rewards program. |
| Personalize | Illustrative traveler context—Italy, culture and a trip for two—leads AIyelet to an Ancient Rome tour and a Florence culture walk. |

The surface retains warm cream, deep brown and controlled coral, with Chillax headings and Sofia body/interface text. Each figure has an accessible image role and a descriptive label; its internal decorative scene is hidden from assistive technology. The visible cards are illustrations, not booking controls.

## Desktop composition and motion

At viewport widths above 900px and heights of at least 700px, with reduced motion off and the site animation control unpaused, the story uses a sticky frame inset 24px from the top. The main heading shrinks from scale 1 to .52 over the first 300px of native scroll. During the same motion it moves down by 20% of its unscaled height; the heading slot reserves that displacement so the gap before the chapter title stays clear. During that introduction the scene grows from .92 to 1, anchored to the right, and the heading’s reserved space contracts.

Chapter copy occupies the left column; category tabs align with the lowest visible card or tag in the active right diagram. Layout offsets, excluding entrance transforms, establish that baseline; a minimum copy height prevents collisions with the paragraph and CTA. The larger scene occupies the right column and aligns to the available frame. `homepage-v2.js` shares one active index between chapter copy, category selection and scene visibility. Four successive chapters follow the introduction. Category clicks scroll to the relevant chapter; arrow keys wrap between categories, and Home/End select the first/last. Inactive panels are inert and hidden from assistive technology; only the selected tab participates in the tab order.

Cards enter with a staggered 700ms opacity, translation and scale animation. Tags pop in over 650ms with delayed starts, connectors draw over 1000ms, and small round packets travel along the coral paths in 4.8-second loops. Running state follows the active scene and viewport visibility; offscreen scenes and hidden documents pause animation. Reduced motion and the site pause control remove scene animation.

## Reading and mobile layouts

Smaller or shorter viewports, reduced motion and paused animation use a complete reading layout. The same four figure nodes move into their matching copy panels, one per category; the separate gallery and tabs are hidden. Wide reading layouts place each scene beside its copy, while narrower layouts put it below. Resizing, loaded fonts and motion-preference changes recalculate the mode.

At widths of 600px and below, the diagrams reflow vertically using dedicated SVG connector paths. Sources sit above the hub and results below it; channel and recommendation cards form compact rows. Meaningful labels use 12px text, with selected card headings at 15px. Hub labels sit beside the hub and mobile callouts are offset from the central wires. This preserves the relationships without shrinking the desktop scene’s text into miniature labels.

The HTML defaults to reading mode and keeps all figures within their matching panels. Without JavaScript, the complete content remains visible and scene animations are disabled. Print styles expose all scenes and remove the sticky frame.

## Loading and preserved provenance

The native scenes reuse these existing site photographs: `assets/api-card-colosseum.jpg`, `assets/api-card-florence.jpg`, `assets/api-card-alps.jpg`, `assets/hero-santorini.jpg`, `assets/hero-food.jpg`, and `assets/hero-sailing.jpg`. Photo elements declare dimensions, asynchronous decoding and lazy loading. When the story comes within an 800px intersection margin, all scene photos switch to eager loading and the preload observer disconnects.

The four approved generated concepts remain in `output/capability-visuals/` and `assets/capability-visuals/` as `01-aggregate.png`, `02-normalize.png`, `03-distribute.png`, and `04-personalize.png`. The earlier raster integration verified those copies as byte-identical, without cropping or retouching. Preserve both sets, their exact `prompts.json`, and `distribute-refinement.txt`. Their provenance describes the approved concepts, not the active native scenes. The asset README records their retained reference role; the earlier raster captures are historical evidence of that integration.

## Completion evidence

The implementation workflow verified 1440 × 900 desktop, 1280 × 720 laptop and 390 × 844 mobile layouts, all four chapter states and keyboard navigation. It reported no image errors or horizontal overflow, passing JavaScript syntax and diff whitespace checks, and a single CSS/JavaScript detector run returning no findings (`[]`).

The fresh `capability_motion_reviewer` review initially identified mobile text sizing. After the diagrams were reflowed vertically with readable labels, the reviewer returned **ship/resolved**, with no other fixes required. These results were supplied by the implementation workflow; this documentation pass did not repeat the browser review.

Current motion proof captures:

- `.impeccable/review/capability-motion-desktop.png` — desktop.
- `.impeccable/review/capability-motion-laptop.png` — laptop.
- `.impeccable/review/capability-motion-mobile.png` — mobile Aggregate.
- `.impeccable/review/capability-motion-mobile-normalize.png` — mobile Normalize.
- `.impeccable/review/capability-motion-mobile-distribute.png` — mobile Distribute.
- `.impeccable/review/capability-motion-mobile-personalize.png` — mobile Personalize.

The latest Aggregate and Personalize mobile captures show labels beside the wires. The Distribute capture predates only the final label-offset adjustment. Earlier `capability-{aggregate,normalize,distribute,personalize}.png` and `capability-mobile.png` captures document the former raster implementation and are not proof of the active motion scenes.

Implementation sources: `index-v2.html`, `homepage-v2.js` and `capability-visuals-v2.css`. This record supersedes the earlier raster-serving description here and the older shared-diagram description in `.impeccable/homepage-v2.md` for this capability surface only.

## Alignment refinement — 31 October 2026

The category list now follows the active diagram’s bottom instead of the viewport floor. At 1440 × 900 and 1280 × 720 the Aggregate baseline differed by about 1px (border rounding); Personalize matched within 0.1px. The settled headline-to-chapter gap is approximately 29px. Screenshot: `.impeccable/review/capability-spacing-desktop.png`. JavaScript syntax, diff whitespace and the scoped layout detector passed. These are narrow follow-up measurements, not a new full design review.
