# BUILD_PLAN.md — Low-token implementation plan

The agent should implement one phase at a time. Do not try to build the whole website in one response.

## Phase 0 — Scaffold review

Goal:

- confirm Next.js App Router project exists;
- inspect existing files;
- do not redesign yet;
- create only minimal folders needed.

Agent response should be short and list commands for the user rather than executing them.

## Phase 1 — Foundation

Implement:

- global CSS variables / design tokens;
- base layout metadata;
- site container utilities;
- `src/data/site.ts`;
- `src/data/images.ts` with null placeholders;
- reusable section heading;
- media placeholder;
- accessible header/footer shell.

Do not build every homepage section yet.

## Phase 2 — Hero + Stats

Implement only:

- Header
- Hero
- Stats Strip

Requirements:

- responsive;
- no broken media if hero is null;
- 360 tour link available;
- registration state not fake.

## Phase 3 — About + Experience

Implement:

- Pillars/About
- Bento-style Experience grid

Use centralized content and images.

## Phase 4 — Program + Expo + Workshop

Implement:

- high-level program narrative;
- International Expo overview;
- Workshop section.

Do not add unverified detailed times or speakers.

## Phase 5 — Partners + Mekong + Venue

Implement:

- confirmed-only partner logic;
- Mekong storytelling section;
- venue photo slot;
- external 360-tour CTA.

If no confirmed partners exist, use the approved empty/announcement state.

## Phase 6 — FAQ + Registration + Footer polish

Implement:

- accessible FAQ;
- registration CTA state;
- contact/footer details.

## Phase 7 — Media integration

User uploads assets to Cloudinary.

Agent only:

- receives supplied URLs;
- updates centralized data files;
- adjusts crop/sizes if necessary.

Agent must not search or fabricate partner assets.

## Phase 8 — QA

Check:

- mobile 360/390/430 widths;
- tablet;
- desktop;
- no horizontal overflow;
- Lighthouse-minded image sizing;
- keyboard navigation;
- focus states;
- reduced motion;
- all external links;
- metadata;
- no stale event name;
- no pending partner displayed publicly.

## Phase 9 — Deploy

User runs deployment/linking commands.

Agent should provide exact commands only when requested.

Connect `fpticosummit.com` after the domain is purchased and the Vercel project is deployed.

# Reusable low-token prompts

## Prompt A — Start project

`Read AGENTS.md and all docs/*.md. Inspect the existing repo. Do Phase 1 only. Do not run terminal commands; give me exact commands if needed. Do not install packages.`

## Prompt B — Next phase

`Read the project instructions. Implement Phase 2 only. Reuse existing tokens/components/data. Do not modify unrelated sections. Do not run commands.`

Replace `Phase 2` with the desired phase number.

## Prompt C — Add supplied Cloudinary image

`Update only the centralized image data for asset AXX using this Cloudinary URL: <URL>. Do not redesign the component. Verify alt text and responsive crop assumptions.`

## Prompt D — Add confirmed partner

`Add this confirmed partner to the centralized partner data and public confirmed-only section. Name: <NAME>. Country: <COUNTRY>. Type: <TYPE>. Logo URL: <URL>. Website: <URL or blank>. Do not modify other partners.`

## Prompt E — Fix a visual issue

`Fix only this issue: <ISSUE>. Do not refactor unrelated files, install packages, or change event content. Tell me which files you changed.`

## Prompt F — Pre-deploy QA

`Review the current site against AGENTS.md and docs/*.md. Do not redesign. Report only concrete bugs, accessibility issues, responsive issues, content conflicts, and deployment blockers. Do not run deployment commands.`
