---
name: planify-core
description: Core Planify project intelligence. Contains deep knowledge of the business logic, ISO standards (7010/23601), and the Turkish OHS (ISG) ecosystem.
version: 1.0.0
---

# Planify Core Intelligence

## Project Essence
Planify is not just a drawing tool; it is a **compliance engine** for emergency evacuation plans in Turkey. Every feature must serve the goal of creating an "official inspection-ready" document.

## Domain Knowledge: ISO Standards
When designing or auditing plans, apply these ISO principles:
- **ISO 7010**: Standardized safety signs (Fire, Rescue, Warning, Mandatory, Prohibition).
- **ISO 23601**: Safety identification and escape plan signs.
- **Key Requirements**:
  - "You are here" (Buradasınız) markers are mandatory.
  - Primary and secondary evacuation routes must be clearly distinguished.
  - Scale bars and North arrows must be present.
  - Legend (Lejant) must match the symbols used on the plan exactly.

## Turkish OHS (İSG) Context
- Plans are audited by **AFAD**, **Municipalities**, or **Ministry of Labour**.
- Layouts must follow the "Antet" (Title Block) standards common in Turkish architecture.
- Terminology should be strictly Turkish in the UI:
  - `Tahliye Planı` (Evacuation Plan)
  - `Acil Durum` (Emergency)
  - `Toplanma Alanı` (Assembly Point)
  - `Yangın Butonu` (Fire Alarm Button)

## Project Modules (The "Where is What" Map)
- **Editor Entry**: `planify-app/src/app/editor/page.tsx`
- **Main Canvas**: `planify-app/src/components/editor/EditorCanvas.tsx` (130k+ lines, the engine).
- **Library (Logic)**:
  - `src/lib/editor/templateLayouts.ts`: Template definitions and region building.
  - `src/lib/editor/isoSymbols.ts`: ISO 7010 symbol database.
  - `src/lib/editor/export.ts`: PDF/PNG export logic (jspdf/html2canvas).
  - `src/lib/editor/wallGeometry.ts`: Drawing logic for walls and routes.
- **Components**:
  - `src/components/editor/TemplatePaperRenderer.tsx`: Renders the borders and antet regions.
  - `src/components/editor/EditorRightSidebar.tsx`: Configuration and property panels.
  - `src/components/editor/EditorLeftSidebar.tsx`: Tool selection and symbols.

## Data Architecture (Supabase)
- **`projects` table**: 
  - `canvas_json`: Stores the Konva stage data.
  - `compliance_status`: JSON object tracking missing ISO elements.
- **`profiles` table**: Tracks `company_name` and `is_premium` status.
- **`project_exports`**: Stores versioned links to generated PDFs/PNGs.

## UI/UX Principles (The "Serious" Rule)
- **Visual Tone**: Dense, data-driven, and official. Use Slate/Blue tones.
- **No Fluff**: Avoid generic SaaS illustrations. Use real technical cards and tables.
- **Accessibility**: Ensure high contrast for emergency symbols.
- **UI Stability & Synchronization (CRITICAL)**:
  - Every sidebar field **MUST** map directly to a visible canvas element.
  - **Header Region**: `title` maps to the main large text. `body` and `meta` map to the subtitle area (joined by `|`). Fallback to `projectMetadata` only if these are empty.
  - **Font Sizing**: Headers must use `clamp` with high minimums (e.g., 20px) to ensure readability at all zoom levels.

## Intelligence Routing Integration
- Always use `planify-core` when:
  - Modifying the Editor UI.
  - Changing Database schemas.
  - Designing export layouts.
  - Discussing product features.
