# AGENTS.md — FPT ICO Summit 2026

## 1. Mission

Build and maintain the official-style landing website for **FPT ICO Summit 2026** at the working domain `fpticosummit.com`.

The site must balance two goals:

1. **Institutional credibility** for consulates, international universities, education organizations, FPT leaders, and other partners.
2. **Student appeal** for high-school and university students interested in international education, culture, scholarships, workshops, and global opportunities.

## 2. Mandatory reading

Before implementation, read:

- `docs/PROJECT.md`
- `docs/TECH.md`
- `docs/DESIGN.md`
- `docs/CONTENT.md`
- `docs/ASSETS.md`
- `docs/BUILD_PLAN.md`

Treat those files as the project source of truth.

## 3. Non-negotiable agent behavior

- Work in small, reviewable increments.
- Implement only the section/phase explicitly requested by the user.
- Do not rewrite unrelated files.
- Do not install packages unless explicitly approved.
- Do not run `npm install`, `npm run build`, deployment commands, Git history-changing commands, or destructive shell commands unless explicitly asked.
- When a terminal action is required, give the user the exact command and wait for the result.
- Do not repeatedly explain commands unless the user asks.
- Prefer existing dependencies and browser/CSS capabilities over new packages.
- Do not add a backend, database, CMS, authentication, or Cloudinary SDK for the MVP.

## 4. Event-fact safety rules

Never invent or infer:

- confirmed partners;
- partner attendance;
- consulate attendance;
- speakers;
- scholarship amounts;
- booth assignments;
- registration links;
- ticket prices;
- exact detailed agenda times that have not been explicitly locked;
- official logos or brand assets.

Partner entries must support a status such as `confirmed`, `pending`, `invited`, or `hidden`. Public UI must render only entries explicitly marked `confirmed`.

Do not publicly present an invited/pending institution as a confirmed partner.

## 5. Naming rules

Public event name for this website:

**FPT ICO Summit 2026**

Do not use the older working name **FPT Mekong Global Summit 2026** in public headings, metadata, navigation, or footer unless the user explicitly changes the project name.

The Mekong Delta may be used as a location/storytelling theme, e.g. "Mekong experience" or "Discover the Mekong Delta".

## 6. Media rules

- All photographic content should be referenced from `src/data/images.ts` or equivalent centralized data.
- Do not scatter Cloudinary URLs inside components.
- Missing images must gracefully render a designed placeholder; they must not break layout.
- Do not search for, download, fabricate, or trace partner logos.
- Partner/consulate logos must come from official provided assets or verified official media/brand sources.
- Core FPT/ICO branding assets may live locally in `/public/branding/`.
- Use `next/image` for normal website imagery.
- Do not install a Cloudinary SDK unless explicitly requested.
- Cloudinary is the media library/CDN, not the source of event truth.

## 7. 360 campus tour rule

Do not rebuild the FPT Can Tho 360 campus tour.

Use an external CTA linking to:

`https://cantho.fpt.edu.vn/360-tour/`

Open in a new tab with appropriate `rel` attributes. Do not iframe it unless the user explicitly asks and embedding has been tested.

## 8. Design rules

- Academic + global + youthful, not childish.
- Use a restrained orange/blue/navy/warm-white system.
- Avoid excessive gradients, glassmorphism, neon, giant rounded cards everywhere, or gimmicky animations.
- Use generous whitespace and strong typography.
- Prioritize real people, authentic FPT/campus imagery, education, culture, and human interaction.
- No generic corporate handshake photos in prominent areas.
- Use subtle motion only; respect `prefers-reduced-motion`.
- Mobile first.
- WCAG-minded contrast, visible focus states, semantic HTML, alt text, keyboard navigation.

## 9. Architecture rules

For MVP, use a single landing page with anchor navigation.

Suggested component structure:

- `SiteHeader`
- `HeroSection`
- `StatsStrip`
- `PillarsSection`
- `ExperienceGrid`
- `ProgramOverview`
- `ExpoSection`
- `WorkshopSection`
- `PartnersSection`
- `MekongSection`
- `VenueSection`
- `FaqSection`
- `RegistrationCta`
- `SiteFooter`

Keep content/data separate from presentation where practical.

Suggested data modules:

- `src/data/site.ts`
- `src/data/images.ts`
- `src/data/program.ts`
- `src/data/partners.ts`
- `src/data/faq.ts`

## 10. Performance rules

- Avoid unnecessary client components.
- Prefer Server Components unless interactivity genuinely requires `"use client"`.
- Avoid heavy animation libraries for MVP.
- Use responsive images and correct `sizes`.
- Only hero/LCP imagery may use priority/preload behavior.
- Lazy-load noncritical sections/images naturally.
- Do not ship large local photographic assets in the Git repository.

## 11. Definition of done for each change

A change is not done until it:

- works on mobile and desktop layouts;
- has no obvious overflow;
- has semantic headings;
- has accessible buttons/links;
- handles missing image data;
- does not invent event information;
- follows the centralized data approach;
- does not introduce a new package without approval.

At the end of each implementation response, report only:

1. files changed;
2. what was implemented;
3. exact command(s) the user should run to test, if needed;
4. any unresolved content/assets needed from the user.

## Git and Dependency Rules

- Never commit or push `node_modules/`.
- Never commit `.next/`, `out/`, `.vercel/`, or local environment files.
- `package.json` and `package-lock.json` MUST remain version-controlled.
- Do not run `git add`, `git commit`, `git push`, or other Git write operations unless explicitly requested by the user.
- Do not install packages unless explicitly requested.
- If a dependency is required, provide the exact npm command for the user to run manually.
- Do not modify `.gitignore` unless necessary.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
