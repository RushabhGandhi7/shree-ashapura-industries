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

| 7 | Unnamed "new solutions" parts (names are ours) | Cream nylon ring, Brown 2-hole plate, Cream nylon disc, Black moulded part (Plastic Components); Metal cup, Zinc cam housing (Furniture Fittings & Cams) | TBD | `catalogueItems` in `content.js` (`// CONFIRM name`) |
| 8 | Fibre / coloured washer | Listed under Washers | TBD | `catalogueItems` `fibre-washer` (`// CONFIRM`) |

| 9 | Traub A25 accuracy | "0.02 mm accuracy" (turning step, Machining) and the 1.6 – 25 mm range | TBD | `content.js` `machining.steps[0].spec`, `machineTypes.cards` turning (`// CONFIRM`) |
| 10 | Machine videos and posters | None yet; cards show "Video coming" | TBD | `content.js` `machineTypes.cards[].video` / `.poster` → files in `public/videos/` |

| 11 | Company history milestones | 1990 founded (Dahisar East) and Today only | TBD | `content.about.milestones` (`// CONFIRM milestones`) |
| 12 | Gallery videos and photos, home furniture photos | Placeholders ("Video coming" / "Photo coming") | TBD | `content.gallery.videos` / `.photos`, `content.furniture.cards[].photo` |

Items 4 and 5 were not in the client's confirmation, so they stay open. Delete them here and remove their `// CONFIRM` in `content.js` once they are confirmed.

## Logged, not changed (from phase 11)

- **3D card parts vs the new lists.** Some product cards still render parts that are no longer in their category's list: CSK Phillips / combi washer screws (Screws, Bolts & Nuts), star washer (Washers), threaded insert (Furniture Fittings & Cams). To fix, re-pose `categories[].parts` and run `npm run render:products`.
- **Per-category materials.** Plastic Components keeps "PP, LD, ABS, HD-Nylon, EPDM" (EPDM `// CONFIRM`); the catalogue's materials are shown once as a site-wide list on /products.
- **Configurator.** Materials, grades and finish rules are unchanged (`customiser`, `materialFinishes.js`).
- **Drilling / grinding rule.** Replaced in phase 11: the secondary machines list is shown on /manufacturing; the counts are unchanged.
- **Earlier open items** (see CLAUDE.md): heat treatment and plating via approved partners, finishes for high tensile and brass, customiser options, EPDM, industries list, working hours.

## Assumptions logged in phase 12B (not asked; raise when reviewing)

1. No per-item pages: items are anchors on their category page (`/products/<line>#<item>`), so the sitemap and prerender list are unchanged.
2. Placement of the unnamed parts: cream nylon ring, cream nylon disc, black moulded part and brown 2-hole plate → Plastic Components; metal cup and zinc cam housing → Furniture Fittings & Cams.
3. "Rectangular and square tube end caps" are two items.
4. Item names live in `content.js` (`catalogueItems`); their 3D part parameters in `products.js` (`itemModels`).
5. "Brass nut", "Leveller" (as opposed to "Leveller bolt") and every item outside the 19-item priority list are line drawings, not 3D.
6. Line drawings are generic shape families, not per-item technical drawings. "Metal cup / ferrule" and the unnamed "Metal cup" share one drawing.
7. Washers show "Zinc / steel / black" as their spec line, not separate items.
8. "Philips" is spelled "Phillips" (the drive's name).
9. The list on /products shows text rows (no 3D) so the page stays light; 3D is on the category pages.

## Assumptions logged in phase 12C

1. Phones now get the pinned side-scroll (it used to be a stacked list) so sideways swipes can move it; reduced motion keeps the stacked list. Panels don't snap.
2. Step 06's carton / caliper animation is replaced by the Go / No-Go story; packing and dispatch stay in its spec line.
3. Capability's "Also on the shop floor" list stays alongside the new Machining section.
4. The hint chip keeps your exact copy, "Scroll up / down to continue"; on touch screens it also shows ←→ arrows.
5. Machine-type placeholders reuse the gallery's machine-area drawings (header, roller, slotter) and the Machining drawings (turning, drilling, grinding).

## Assumptions logged in phase 12D

1. The timeline's "Today" points use confirmed facts only (units 24 & 25, ISO 9001:2015, Lean Cluster Mumbai, made to drawing).
2. The slotted and Phillips drives are marked "In catalogue" (the slotted countersunk and Phillips pan screws are in it).
3. The machine-area drawings left the gallery but stay as /manufacturing placeholders.
4. The home furniture cards show our renders / drawings, tagged "Photo coming", until real shots arrive.
5. Hero lead now leads with household furniture; lock and appliance parts follow in the same sentence.
