# SETUP_COMMANDS_WINDOWS.md

These commands assume Windows Command Prompt or PowerShell and npm.

## 1. Check Node/npm

```bat
node -v
npm -v
```

Current Next.js documentation requires Node.js 20.9 or newer. If `node -v` is older, update Node.js before creating the project.

## 2. Create the project

Run this from the folder where you want the project directory to be created:

```bat
npx create-next-app@latest fpt-ico-summit --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Then:

```bat
cd fpt-ico-summit
```

## 3. Copy the agent pack into the project root

After downloading/extracting the provided agent pack, copy these into `fpt-ico-summit`:

```text
AGENTS.md
START_HERE.md
.github/
docs/
```

Do not put the pack inside another nested folder such as `fpt-ico-summit/fpt-ico-summit-agent-pack/`.

## 4. Run locally

```bat
npm run dev
```

Open:

```text
http://localhost:3000
```

Stop the dev server with:

```text
Ctrl + C
```

## 5. Optional Git checkpoint

After the starter pack is copied in:

```bat
git status
git add AGENTS.md START_HERE.md .github docs
git commit -m "docs: add summit agent instructions"
```

## 6. First prompt for the coding agent

```text
Read AGENTS.md, START_HERE.md, and all docs/*.md before coding. Inspect the current Next.js project. Implement Phase 1 from docs/BUILD_PLAN.md only. Do not run terminal commands, install packages, deploy, or modify unrelated files. If a command is needed, give me the exact command to run.
```
