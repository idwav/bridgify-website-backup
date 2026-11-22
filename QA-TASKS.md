# QA tasks (site audit, 22 Nov 2026)

These tasks come from `python3 scripts/qa/review.py --audit --all --full --webkit --phone-rules`, which covered 21 pages at 8 widths in both Chromium and WebKit. Each bug was checked by eye in a screenshot.

The owner's kit page has the screenshots. Do one task per branch, in this order, and follow the process in START-HERE.md §3.

Why Bridgify on the upright iPad Pro is already handled in PR #100. Don't change the upright version of that section.

1. **Home at 1024 landscape: tiny text in the diagrams** (`idan/home-1024-diagrams`)
   - **Where:** `index-v2` Opportunity, and the Why Bridgify steps on landscape screens 900–1100.
   - **Problem:** diagram labels are 6–9px.
   - **Fix:** the text should be at least 11px (MOBILE-RULES T5) and the section must still fit the screen, for example by putting the diagram under the text at full width in that range.
   - **Must not change:** 1280+, phones, or the upright iPad.
2. **Personalization: "Romantic" cut off, and the boxes overlap** (`idan/personalization-intent`)
   - **Where:** `personalization` #section-2.
   - **Problem:** at 768–834 "Romantic" is cut inside the Intent box. From 768 up, the Context box overlaps the Intent and Destination boxes.
   - **Fix:** three separate boxes, with every word inside its own box.
3. **Product cards on phones: the title overlaps the button** (`idan/xc-card-phone`)
   - **Where:** the shared `.xc` cards in #section-4 on hotels, super-apps and travel-technology, at 360–390.
   - **Problem:** the card title sits on top of its "See the …" button.
   - **Fix:** use the spacing table. Fix it in the phone layer (`output/element-lab/adaptive/`, then `sync-mobile.py`) and check all three pages.
4. **Hotels map pins too small to tap** (`idan/hotels-map-pins`)
   - **Where:** the `hotels` hero map on phones.
   - **Problem:** each pin is 32×36. MOBILE-RULES L1 needs a 44px tap area.
   - **Fix:** a 44px tap area. The icon can stay the same size.
5. **Press: images hot-linked from news sites** (`idan/press-images`)
   - **Where:** `press`, the coverage cards.
   - **Problem:** about 20 images load from news sites. Safari blocks the Hotel Business image, so the card shows only the name. WebKit also requests three missing `/_next/static/css/…` files.
   - **Fix:** serve the images from `assets/press/`, and find and remove the `_next` requests.
6. **Airlines: Arial inside the mock-up** (`idan/airlines-mock-fonts`)
   - **Where:** `airlines` #section-3, the confirmation mock-up.
   - **Problem:** the URL bar, "Booking confirmed" and the flight row are in Arial.
   - **Fix:** brand fonts only (TYPOGRAPHY.md).
7. **Travel technology: two links run together** (`idan/tt-links-gap`)
   - **Where:** `travel-technology` #section-3.
   - **Problem:** "Experiences for hotels ↗" and "Experiences for super apps ↗" touch with no gap.
   - **Fix:** a gap between them, or stack them.
8. **Phone role maps out of date** (`idan/phone-role-maps`)
   - **Where:** api #integration, loyalty-finance #section-2, travel-technology #section-3, marketplace #section-4 and personalization #day-itinerary.
   - **Problem:** `check.py` reports false gaps or missing elements there, so the phone check cannot protect these sections.
   - **Fix:** update `output/element-lab/adaptive/system/roles/<page>.js` until `check.py` shows 0 issues on iPhone 13 and Pixel 7, with no visual change.
9. **Duplicate `id="section-5"`** (`idan/duplicate-ids`)
   - **Where:** contact, blog-aggregation and blog-infrastructure.
   - **Problem:** the shared footer gets `id="section-5"`, which is already used on these pages.
   - **Fix:** give the footer a unique id at the source (the partial or `sync-footer.py`), run `sync-footer.py`, and check that the footer links still work.
10. **Tiny text in demos across the site** (`idan/tiny-text-home`)
    - **Problem:** 746 texts under 11px. Home has 69, Airlines 28, OTAs 26, and Hotels, Loyalty and Super apps 23 each.
    - **First:** agree the minimum with the owner.
    - **Then:** one page per branch, starting with Home.
