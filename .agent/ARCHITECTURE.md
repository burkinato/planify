# Planify System Architecture

## Product Overview
Planify is a Turkish emergency evacuation plan editor for ISG/OHS experts, architects, and facility operators.
- **Core Promise**: Create ISO 7010 / ISO 23601 aligned evacuation plans with templates, symbols, routes, antet regions, and PDF/PNG exports.
- **Dashboard**: Official inspection portal focusing on compliance status and project archive tracking.

## Tech Stack
- **App**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.
- **State**: Zustand stores in `src/store/`.
- **Data**: Supabase Postgres via `@supabase/ssr`.
- **Editor**: Konva / react-konva, `html2canvas`, `jspdf`.
- **Runtime**: PM2 process `planify` at `/var/www/planify/planify-app`.

## Project Modules
- `planify-app/src/app/editor/`: Core editor page.
- `planify-app/src/components/editor/`: Editor UI components.
- `planify-app/src/lib/editor/`: Editor logic and layout definitions.
- `planify-app/src/app/dashboard/`: User portal (Denetim Merkezi).
- `planify-app/src/store/`: Zustand stores (`useEditorStore`, `useProjectStore`).

## Data Model
- `profiles`: Identity, company info, and subscription state.
- `projects`: Canvas JSON, metadata, and audit fields.
- `project_exports`: History of generated files.
- `template_layouts`: Definitions for paper sizes and antet regions.

## Compliance & Export Flow
1. **Real-time Audit**: `useEditorStore` computes compliance based on ISO 7010 symbols present in the canvas.
2. **Preview**: `html2canvas` generates a low-res preview for the dashboard.
3. **Production Export**: `jspdf` reconstructs the Konva layers as a high-quality PDF, applying the `template_layouts` as the background and title block.
4. **Archiving**: Every export is recorded in `project_exports` with a permanent link to the Supabase storage bucket.
