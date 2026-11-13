# CONFIRM: open items awaiting the client

On 2026-11-14 the client confirmed the firm name, "since 1990", the address (Gala No. 24 & 25), phones, emails, machine counts (5 / 8 / 4), Bharat Jain as CEO, and ISO 9001:2015 as valid. Those are no longer open, and the site keeps its current values.

The items below are still open. Each fact lives in one constant at the top of [`src/data/content.js`](src/data/content.js). `public/llms.txt` and the `<noscript>` text in `index.html` repeat some facts by hand, so update those too.

| # | Item | Current value (on the site) | Catalogue value | Where |
|---|------|-----------------------------|-----------------|-------|
| 1 | ISO certificate number and validity | Not shown. The site says only "ISO 9001:2015" (confirmed). | TBD | Add near `ISO_TEXT` once supplied; do not show before then |
| 2 | Customer list | Godrej Interio, IFB, Elica, Crompton Greaves, Belden, SmartLink, Saakshi, CA.BE Springs & Fasteners | TBD | `CUSTOMER_NAMES` (`// CONFIRM`) |
| 3 | Customer logo files | None supplied; customers are shown as text wordmarks | TBD | `customerLogos` in `src/data/products.js` (`logo` field), files in `public/brand/customers/` |
| 4 | PPAP text | PSW; in-process drawing; process flow diagram; control plan; PFMEA; final-cum-PDIR inspection reports; layout inspection; in-process inspection reports; check list; standard packing format; raw material test reports; cross-lab test reports; hardening / plating TC reports | TBD | `PPAP_TEXT` (`// CONFIRM`) |
| 5 | Lean text | Part of Lean Cluster Mumbai. 5S, standard operating process, OEE, value stream mapping, Kaizen blitz, poka-yoke, 7QC, SMED, 3M and seven wastes training | TBD | `LEAN_TEXT` (`// CONFIRM`) |
| 6 | Address spelling: "Agarwal" or "Agrawal" | Agarwal Co-op. Industrial Estate Ltd. (the rest of the address is confirmed) | TBD | `ADDRESS_TEXT` (`// CONFIRM Agarwal vs Agrawal`) |

Items 4 and 5 were not in the client's confirmation, so they stay open. Delete them here and remove their `// CONFIRM` in `content.js` once they are confirmed.

## Logged, not changed (from phase 11)

- **3D card parts vs the new lists.** Some product cards still render parts that are no longer in their category's list: CSK Phillips / combi washer screws (Screws, Bolts & Nuts), star washer (Washers), threaded insert (Furniture Fittings & Cams). To fix, re-pose `categories[].parts` and run `npm run render:products`.
- **Per-category materials.** Plastic Components keeps "PP, LD, ABS, HD-Nylon, EPDM" (EPDM `// CONFIRM`); the catalogue's materials are shown once as a site-wide list on /products.
- **Configurator.** Materials, grades and finish rules are unchanged (`customiser`, `materialFinishes.js`).
- **Drilling / grinding rule.** Replaced in phase 11: the secondary machines list is shown on /manufacturing; the counts are unchanged.
- **Earlier open items** (see CLAUDE.md): heat treatment and plating via approved partners, finishes for high tensile and brass, customiser options, EPDM, industries list, working hours.
