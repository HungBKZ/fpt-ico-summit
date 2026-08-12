# DESIGN.md — Visual direction and page wireframe

## 1. Design statement

The site should feel like an **international university summit**, not a student-club festival and not a corporate SaaS landing page.

Keywords:

**Academic · Global · Warm · Credible · Youthful · Editorial · Human**

## 2. Working visual system

Use CSS variables/tokens so colors can be replaced later with official brand values.

Working palette:

- FPT-inspired orange: warm, energetic accent
- ICO-inspired blue: international/education accent
- deep navy: institutional credibility and main text
- warm white/off-white: primary background
- light blue/soft neutral: alternate section backgrounds

Do not hardcode hex values repeatedly inside components.

## 3. Typography

Use a clean modern sans-serif system. Prefer one or two families maximum.

Recommended direction:

- headings: `Space Grotesk` or similarly modern but restrained
- body/UI: `Inter`

If font setup creates friction, use `Inter` for everything rather than adding unnecessary complexity.

Typography behavior:

- strong, concise H1;
- large section headings with short eyebrow labels;
- body copy should remain readable and not become tiny brochure text;
- avoid all-caps paragraphs.

## 4. Shape language

- medium-radius cards, not excessive pills everywhere;
- fine borders and subtle shadows;
- rounded imagery where appropriate;
- editorial asymmetry/bento composition in high-energy sections;
- large whitespace between major sections.

## 5. Motion

Use CSS transitions and simple reveal effects only if needed.

Allowed:

- hover lift of 2–4px;
- subtle image scale on hover;
- underline/arrow motion on links;
- small fade/translate on entry if implemented lightly.

Avoid:

- constant floating objects;
- parallax everywhere;
- large 3D effects;
- scroll-jacking;
- autoplay audio;
- excessive animated gradients.

Respect `prefers-reduced-motion`.

## 6. Homepage wireframe

### A. Header

Desktop:

- FPT University logo + ICO identity on left
- anchors: About / Experience / Program / Partners / Venue / FAQ
- primary CTA on right: `Register` or `Registration opens soon`

Mobile:

- compact identity
- accessible menu button
- simple vertical menu

Sticky header is allowed if it remains lightweight.

### B. Hero

Goal: immediately establish an international education event.

Layout:

- left: event identity, date, location, short description, CTA(s)
- right/background: one strong authentic image
- optional small stats or country/global motif, but keep hierarchy clean

Working marketing headline:

**Connecting Cultures. Creating Global Opportunities.**

Treat this as website marketing copy, not a formally locked event theme. It may be replaced by the organizer later.

Suggested CTAs:

- primary: `Explore the Summit`
- secondary: `Explore Campus in 360°` or `View Program`

### C. Stats strip

No photos.

Display carefully worded planned/expected figures:

- 4,000+ expected students
- 42 planned booths/areas
- international universities & consulates
- 3-day event

### D. About / Pillars

Three or four editorial cards:

1. Connect Cultures
2. Global Study Opportunities
3. Global Partnerships
4. Global Competence in the AI Era

Use 2–3 supporting photos, not a photo for every small icon.

### E. Experience grid

This is a high-energy student-facing section.

Use a bento grid with image-backed cards such as:

- International Expo
- Cultural Village
- Study Abroad & Scholarships
- Cross-Cultural Workshop
- Live Performances
- Mekong Discovery

Keep cards readable and not overly busy.

### F. Program overview

Use a narrative timeline rather than a dense timetable.

Show high-level phases only until final detailed agenda is locked.

Possible structure:

- Cultural Discovery Journey
- Official Summit & Opening
- Expo + consultation + workshop
- Cultural exchange + networking + closing

If showing Day 1 / Day 2–3, do not invent exact date mapping beyond confirmed data.

### G. International Expo

Explain the planned ecosystem with visually clear category blocks:

- International Partner Zone
- Cultural Experience Zone
- Consulate Zone
- FPT Showcase
- Main Stage / networking / visitor experience

Use icons/diagram + 1–2 strong photos. Do not try to display all booth data on the homepage.

### H. Workshop

Academic-looking section with one strong workshop/lecture image and concise copy around:

- cross-cultural communication;
- global adaptability;
- AI in multicultural study and work.

Do not invent speaker names.

### I. Partners

Title direction: `Global Community` or `Participating Partners`.

Render only confirmed entries.

Use a clean logo grid grouped by type/country only when enough confirmed assets exist.

If there are no confirmed partners yet, hide the logo grid and show a neutral statement such as:

`Partner announcements will be updated as participation is confirmed.`

### J. Mekong section

A visually rich storytelling section connecting the summit with Can Tho / Mekong Delta culture.

Use authentic/local imagery where possible.

Do not make tourist claims not supported by current program information.

### K. Venue / 360 Tour

Use an actual FPT University Can Tho campus photo when available.

Content:

- venue name
- address
- short visitor sentence
- CTA: `Explore Campus in 360° ↗`

External URL: `https://cantho.fpt.edu.vn/360-tour/`

### L. FAQ

No photos needed.

Use accordion only if it is simple and accessible.

Initial FAQ topics may include:

- Who can attend?
- Where is the event held?
- When does registration open?
- What can students experience?
- Is the event open to international partners?

Do not provide answers that have not been confirmed; use controlled placeholder wording where needed.

### M. Registration CTA

High-contrast, simple, not over-designed.

If no URL exists:

**Registration opens soon**

Do not create a fake form.

### N. Footer

Include:

- FPT University Can Tho / International Cooperation Office
- event email
- campus address
- 360 tour link
- social links only when provided
- copyright/year

## 7. Responsive priorities

On mobile:

- H1 should wrap intentionally;
- bento grid becomes a vertical sequence;
- stats become 2x2 or stacked;
- timeline becomes vertical;
- partner logos remain consistent and legible;
- no horizontal scrolling;
- buttons should be thumb-friendly.
