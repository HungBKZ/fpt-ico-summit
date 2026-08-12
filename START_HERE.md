# FPT ICO Summit 2026 — Agent Starter Pack

This repository is a lightweight, single-page event website for **FPT ICO Summit 2026**.

## Before writing code

Read these files in order:

1. `AGENTS.md`
2. `docs/PROJECT.md`
3. `docs/TECH.md`
4. `docs/DESIGN.md`
5. `docs/CONTENT.md`
6. `docs/ASSETS.md`
7. `docs/BUILD_PLAN.md`

If using GitHub Copilot, also keep `.github/copilot-instructions.md` in the repository.

## Main instruction to the coding agent

> Read all project instruction files before coding. Implement only the requested phase/component. Do not run install/build/deploy/destructive terminal commands unless explicitly asked. If a command is needed, output the exact command for the user to run. Do not invent event facts, partner confirmations, logos, speakers, scholarship details, or registration URLs.

## MVP goal

Build a polished, responsive, accessible landing page that feels:

- academic and institutionally credible;
- international and modern;
- energetic enough to attract high-school and university students;
- easy to maintain when partner logos and event photos arrive later.

## Deployment model

- Frontend: Next.js + TypeScript + Tailwind CSS
- Hosting: Vercel
- Images: Cloudinary URLs referenced from data files
- Core FPT/ICO logos and favicon: local `/public/branding`
- Campus 360 tour: external link to `https://cantho.fpt.edu.vn/360-tour/`
- Registration: external URL later; until confirmed, show a non-dead "Registration opens soon" state
- Database: none for MVP
- CMS: none for MVP
- Cloudinary SDK: do not install for MVP
