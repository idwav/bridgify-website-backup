# Bridgify typography hierarchy

Scale approved by the user on 14 November 2026: headings in Chillax at the approved light weight (300), running text in Sofia Sans regular; section 36–44px, inner headings 24–28px, body 16px, secondary 14–16px, buttons 16px, labels 12–14px.

Single source: `brand-typography.css`. Applies to V2 and public inner pages; V1 remains unchanged.

## Scale and roles
| Role | Desktop | Mobile | Family / weight | Line height |
|---|---|---|---|---|
| Page hero | fluid 40–60px | 34–42px | Chillax 300 | 1.16 |
| Section heading | fluid 36–44px | 30–34px | Chillax 300 | 1.20 |
| Inner heading (cards, FAQ questions, timeline) | fluid 24–28px | 22–24px | Chillax 300 | 1.25 |
| Body and lead paragraphs | 16px | 16px | Sofia 400 | 1.55 |
| Secondary text (card descriptions, notes, captions) | 14–16px | 14–16px | Sofia 400 | 1.5 |
| Buttons / CTA | 16px | 16px | Sofia 550 | 1.25 |
| Eyebrow / label | 12px (max 14px) | 12px | Sofia 550 | 1.40 |
| Navigation | 12px | existing mobile menu scale | Sofia 550 | 1.30 |
| Diagram / mock UI | existing container-relative scale | existing responsive scale | existing | existing |

*Use 300 for Chillax when a regular face is unavailable. Never synthesize bold display text.

## Rules
- Use hierarchy by editorial role, not blindly by HTML heading tag. A mock browser h2 is not a section heading.
- Preserve section height/min-height, padding, grid, gaps, width and illustration dimensions. No transform scaling, fixed text heights or clipping to force text into a box.
- Preserve the diagrams' cqw-based text and numerical metrics. Apply only explicit editorial selectors.
- Headings use slight tracking (-0.025em); body normal tracking. Eyebrows uppercase with 0.15em tracking.
- No Arial overrides in editorial copy. Use locally hosted Chillax and Sofia.
- Keep existing deliberate line breaks. If a new line causes overflow, adjust the role mapping or local exception; do not shrink the whole section.
- Body and CTA text remain at least 16px at mobile size; decorative mock UI can be smaller because it is illustrative.
- Validate at 1440×900 and 390×844. Check horizontal overflow, complete text, CTA visibility, and unchanged section geometry where content fits.
- Future pages must reuse these tokens. Page CSS may adjust composition, but should not invent another editorial type scale.

## Scope and exceptions
The shared layer intentionally leaves full visual simulations, code samples, labels inside tickets, diagram nodes, statistics, and footer navigation groups at their designed scale. The V1 homepage and archived/concept pages are excluded.

Marketplace exception: its visible primary SEO h1 receives the hero scale; the adjacent branded-store promise uses the card scale. The embedded AIyelet hero also loads the shared typography layer.

## Approved body-copy reference (8 November)
About / Our mission is the reference for running text: Sofia Sans (CSS family `Sofia`), weight 400, desktop 17–20px / mobile 17px, line-height 1.55. Nested paragraphs in company history and timeline use the same body token; never the former 32px paragraph scale. Timeline dates use the card-heading token, and the timeline title uses the section-heading token. Section dimensions remain unchanged.

## Inner-page reading size (14 November 2026)

Public inner pages use `brand-inner-page` to hold editorial body and lead copy at 16px on desktop and mobile, with weight 400 and line-height 1.55. Do not enlarge prose with viewport width. The homepage uses the same 16px body and lead tokens. Headings, statistics, and mock product UI retain their own scales.
