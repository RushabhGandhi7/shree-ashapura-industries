# CONFIRM: catalogue conflicts awaiting the client

The client's new catalogue (phase 11, 2026-11-14) disagrees with the live site on the items below. The site keeps its **current value** until the client confirms. Each value is one `// CONFIRM` constant at the top of [`src/data/content.js`](src/data/content.js); every string on the site (copy, SEO, JSON-LD, WhatsApp messages, footer, seal) reads it from there, so changing it there changes the whole site. Two exceptions repeat facts by hand: `public/llms.txt` and the `<noscript>` text in `index.html`, so update those too.

The new catalogue is not in the repo, so the catalogue column is **TBD**. Fill it in when the PDF is added to `client-assets/`.

| # | Item | Current value (on the site) | Catalogue value | Constant |
|---|------|-----------------------------|-----------------|----------|
| 1 | Firm name | Shree Ashapura Industries | TBD | `FIRM_NAME` |
| 2 | Since / established | 1990 | TBD | `FOUNDED` |
| 3 | Address | Gala No. 24 & 25, Agarwal Co-op. Industrial Estate Ltd., 121 S.V. Road, near Dahisar Petrol Pump, Dahisar (East), Mumbai 400068 | TBD | `ADDRESS` |
| 4 | Mobile / WhatsApp | +91 70215 80583 | TBD | `PHONES.mobile` |
| 5 | Landline | 022-2089 1665 | TBD | `PHONES.landline` |
| 6 | Emails | ashapura56@gmail.com, b_jaan@hotmail.com | TBD | `EMAILS` |
| 7 | Machine counts (units 24 & 25) | Cold heading 5 (1.6 – 7.5 mm) · Thread rolling 8 (3 – 50 mm) · Slotting & BT 4 (4 – 55 mm) | TBD | `MACHINE_COUNTS` |
| 8 | Customer names | Godrej Interio, IFB, Elica, Crompton Greaves, Belden, SmartLink, Saakshi, CA.BE Springs & Fasteners | TBD | `CUSTOMER_NAMES` |
| 9 | Bharat Jain's title | Chief Executive Officer | TBD | `LEADER.title` |
| 10 | ISO text | ISO 9001:2015 (certificate number, body, validity not supplied) | TBD | `ISO_TEXT` |
| 11 | PPAP text | PSW; in-process drawing; process flow diagram; control plan; PFMEA; final-cum-PDIR inspection reports; layout inspection; in-process inspection reports; check list; standard packing format; raw material test reports; cross-lab test reports; hardening / plating TC reports | TBD | `PPAP_TEXT` |
| 12 | Lean text | Part of Lean Cluster Mumbai. 5S, standard operating process, OEE, value stream mapping, Kaizen blitz, poka-yoke, 7QC, SMED, 3M and seven wastes training | TBD | `LEAN_TEXT` |

## Logged, not changed

- **3D card parts vs the new lists.** The product cards, posters and category stages still show the procedural parts chosen in Phase 7A (3D left untouched). Some of these parts are no longer in their category's new list: CSK Phillips / combi washer screws (Screws, Bolts & Nuts), star washer (Washers), knurled insert (Brass Parts), threaded insert (Furniture Fittings & Cams). Plastic Components shows a leveller, which is still listed. Re-pose the cards in `categories[].parts` and run `npm run render:products` if the client wants them to match.
- **Per-category materials.** Plastic Components keeps "PP, LD, ABS, HD-Nylon, EPDM" (EPDM was already `// CONFIRM`) and Brass Parts keeps "Brass". The new catalogue's material list (M.S., S.S., brass, aluminium, copper, EN8 high tensile, plastic) is shown once as a site-wide text list on /products.
- **Configurator.** Materials, grades and finish rules (`customiser`, `materialFinishes.js`) are unchanged. The catalogue's materials (aluminium, copper, EN8) aren't added there.
- **Drilling / grinding rule.** The Phase 7A override "do not mention drilling, grinding or length machines" is replaced by the user's phase 11 instruction: a secondary list (Traub A25 1.6 – 25 mm, drilling and tapping, grinding, milling, lathe, drum polish, welding) is shown on /manufacturing. Length machines and units 31 / 35 / Sarita are still not mentioned.
- **Earlier open items** (unchanged, see CLAUDE.md): heat treatment and plating via approved partners, finishes for high tensile and brass, customiser options, EPDM, industries list, working hours.
