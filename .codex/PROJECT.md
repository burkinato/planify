# Planify Project Context

## What This App Is
Planify is a Turkish SaaS tool for creating emergency evacuation plans. The
main user is an ISG/OHS professional who needs inspection-ready floor plans,
official symbols, route drawings, templates, and clean exports.

## Current Product Modules
- Landing pages under `src/components/landing/`
- Auth pages under `src/app/(auth)/`
- User portal under `src/app/dashboard/`
- Editor under `src/app/editor/page.tsx` and `src/components/editor/`
- Admin panel under `src/app/pxadmin/`
- Supabase stores under `src/store/`

## Important User Portal Direction
The dashboard should feel like an official inspection workspace:
- primary page: `Denetim Merkezi`
- secondary pages: profile/company info and subscription
- project list, export archive, and templates may appear inside the dashboard,
  but should not be sidebar items unless they become real pages/routes.
- avoid empty SaaS cards; prefer compliance status, file identity, last export,
  missing checks, and operational next actions.

## Data Model Highlights
- `profiles`: user identity, company, phone, marketing consent, subscription.
- `projects`: plan files, canvas JSON, template state, thumbnail, audit fields.
- `template_layouts`: official paper/antet layouts.
- `subscriptions`, `plans`, `payment_history`, `exchange_rates`: paid access.
- `project_exports`: export archive for PDF/PNG/JPEG records.

## Editor Mental Model
- `useEditorStore` owns canvas elements, layers, template state, metadata,
  tools, zoom/pan, undo/redo, and export context.
- `useProjectStore` persists project records to Supabase.
- `EditorApp` loads a project, autosaves debounced state, computes compliance,
  and records exports.
- Compliance checks currently derive from canvas data:
  `E004` here marker, evacuation route, `E007` assembly point, fire symbol,
  and template/antet presence.

## UI Taste
- Official, serious, inspection-oriented.
- Use restrained whites, slate, blue, emerald, amber; avoid playful gradients
  except where already established.
- Prefer tables, file cards, badges, status panels, and audit checklists over
  hero/marketing layouts.
- Cards should be purposeful; do not nest decorative cards.
