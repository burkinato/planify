# Planify Codex Agent Guide

This repository is the live Planify application. Keep this file short and use
the `.codex/` folder for durable project context.

## Product
- Planify is a Turkish emergency evacuation plan editor for ISG/OHS experts,
  architects, and facility operators.
- Core promise: create ISO 7010 / ISO 23601 aligned evacuation plans with
  templates, symbols, routes, antet regions, PDF/PNG exports, and project
  archive tracking.
- Dashboard direction: official inspection portal, not a marketing dashboard.

## Stack
- App path: `planify-app/`
- Framework: Next.js 16 app router, React 19, TypeScript, Tailwind CSS 4
- State: Zustand stores in `src/store/`
- Data: Supabase Postgres via `@supabase/ssr` and `@supabase/supabase-js`
- Editor: Konva / react-konva, `html2canvas`, `jspdf`
- Runtime: PM2 process `planify`, cwd `/var/www/planify/planify-app`

## Working Rules
- Preserve user changes. The server worktree may already be dirty.
- Before editing, inspect the relevant files and local patterns.
- For UI, keep the style serious, official, dense, and work-focused.
- Do not make dashboard navigation point to sections that are not real pages.
- Run `npm run lint` and `npm run build` before deploy/restart.
- After production build, restart with `pm2 restart planify` and verify HTTP.

## Source of Truth
- Read `.codex/PROJECT.md` for product and architecture context.
- Read `.codex/TESTING.md` for test credentials and verification flow.
- Read `.codex/DEPLOYMENT.md` for live server/deploy commands.
