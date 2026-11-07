# Client facts: Shree Ashapura Industries

Source of truth for all real content on the site, saved verbatim from the client brief (Phase 7A).
Where the OVERRIDES section at the bottom disagrees with the facts above it, the OVERRIDES win.
Items marked CONFIRM carry a `// CONFIRM` comment in code.

---

## RULES
- Do not invent numbers, certifications or claims. Anything marked CONFIRM gets a // CONFIRM comment in code and stays easy to change.
- Fix the client's typos: Cotter pin, Fasteners, Industries, Leveller, EPDM (confirm).
- Light theme and design rules in CLAUDE.md stay. Logo is black with a red dot; red remains the accent. Keep the placeholder logo until I add public/brand/.
- All copy in src/data/content.js, all products in src/data/products.js.

## CLIENT FACTS
Brand: Shree Ashapura Industries. Established 1990 (years in business = computed from 1990). ISO 9001:2015 (CONFIRM certificate details). Tagline to use: "Your trust, our mission." Positioning: manufacturer and supplier of fasteners and machine components for the lock and furniture industry, plus precision turned parts, press parts and plastic moulded parts; also develops and produces special-purpose products to customer requirement and design. Strengths from their own text: quality, quantity and on-time delivery; understanding customer needs and expectations; cost reduction through new approaches; continuous improvement of quality systems.

Address: Gala No. 24 & 25, Agarwal Co-op. Industrial Estate Ltd., 121 S.V. Road, near Dahisar Petrol Pump, Dahisar (East), Mumbai 400068 (CONFIRM wording).
Phone/WhatsApp: +91 70215 80583. Landline 022-2089 1665. Emails: ashapura56@gmail.com, b_jaan@hotmail.com.

PRODUCT CATEGORIES (8 cards)
1 Screws & Fasteners: CSK Phillips chipboard, PHHD chipboard, Allen flat, Allen button head, combi head, Phillips combi washer screw, male-female screw, rivet, pan head slotted, hex head screw, hex nut, wood screw, self-tapping screw, machine screw, hex flange head, locking screw, umbrella screw, high-tensile items.
2 Washers: plain, spring, circlip, star, cap.
3 Plastic Components: leveller, leg tube cap, male-female parts. Materials PP, LD, ABS, HD-Nylon, EPDM (CONFIRM). Colour as required.
4 Brackets & Press Parts: L bracket, door bracket, T bracket, square, hook.
5 Brass Parts: pins, knurling inserts. Size as required.
6 Studs, Pins & Turned Parts: stud, cotter pin, machine parts, precision turned parts.
7 Castors: plate castor with wheel, threaded-stem castor.
8 Furniture Fittings & Cams: cam, furniture fitting kits, cam lock, threaded insert, ferrule/bush, locks. Plus a "Custom products made to your drawing" call-out across the site.

INDUSTRIES (derived from customer list, CONFIRM): Furniture & Interiors, Home & Kitchen Appliances, Electrical, Locks & Hardware, Networking & Cables.

CAPABILITY (CONFIRM all numbers)
Cold heading machines: about 12 across two units, capacity range 1.6 to 10 mm. Thread rolling: 8 machines, 3 to 50 mm. Slotting and BT machines: 4, 4 to 55 mm. Also hand slotting, drilling, tool grinding, length machines, calibrated weighing scales in packing. AutoCAD 2D and 3D.
Inspection: calibrated vernier and micrometers; calibrated thread ring gauges (external) and plug gauges (internal); hardness (HRC) testing; in-house jigs, fixtures and tools for critical dimensions; raw-material test reports (supplier chemical + third-party lab); plating supplier and third-party lab reports; hardening/plating TC reports.
In-process checks: first-piece approval, then every 2 hours.
PPAP documents: PSW, in-process drawing, process flow diagram, control plan, PFMEA, final-cum-PDIR inspection reports, layout inspection, in-process inspection reports, check list, standard packing format, raw material test reports, cross-lab test reports, hardening/plating TC reports.
Lean: part of Lean Cluster Mumbai. Practices: 5S, standard operating process, OEE, value stream mapping, Kaizen blitz, poka-yoke, 7QC, SMED, 3M and seven wastes training.
Customers (text only, behind SHOW_CUSTOMERS flag, CONFIRM permission): Godrej Interio, IFB, Elica, Crompton Greaves, Belden, SmartLink, Saakshi, CA.BE Springs & Fasteners, and other customers.

---

## OVERRIDES (these win over anything above)
- Capability numbers, units 24 & 25 ONLY: 5 cold-heading machines (1.6 to 7.5 mm), 8 thread-rolling machines (3 to 50 mm), 4 slotting and BT machines (4 to 55 mm). Ignore units 31, 35 and Sarita. Do not mention drilling, grinding or length machines.
- Address (final): Gala No. 24 & 25, Agarwal Co-op. Industrial Estate Ltd., 121 S.V. Road, near Dahisar Petrol Pump, Dahisar (East), Mumbai 400068. Remove the CONFIRM on it.
- Customers are approved: SHOW_CUSTOMERS = true, no CONFIRM comment. Render as styled text wordmarks, with a logo field in the data so real logo files can be added later.
- Heat treatment and plating: "via approved partners", keep the // CONFIRM comment.
- Bharat Jain, Chief Executive Officer, may be named in the quality section.
- DO NOT use any image extracted from the catalogue on the site. Skip the image-extraction step. Use the catalogue only as visual reference for part shapes.
- Create our own product images: add a script (scripts/render-products) that uses Playwright to capture each part from /lab on a clean light background, saved to public/products/ as optimised WebP, to be used in drawers, SEO and Open Graph.
