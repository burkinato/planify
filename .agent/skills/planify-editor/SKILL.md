---
name: planify-editor
description: Specialized skill for the Planify Konva-based editor. Handles canvas logic, layer management, symbol manipulation, and export rendering.
version: 1.0.0
---

# Planify Editor Intelligence

## Template Logic (Şablon Mantığı)
- **Coordinate System**: Regions are defined using **percentage-based** coordinates (0-100) in `templateLayouts.ts`. This ensures responsiveness across different paper sizes (A3, A4).
- **Region Types**: `header`, `drawing`, `instruction`, `legend`, `assembly`, `emergency`, `approval`.
- **Style Mapping**: `buildRegions(style)` maps a family style to its physical layout.
- **Rendering**: `TemplatePaperRenderer.tsx` uses these coordinates to render Konva Rects and Texts that form the "Antet".
- **Default State**: `getDefaultTemplateState()` provides the default Turkish content for all text-based regions.
- **Validation**: `clampRegion` ensures regions don't bleed outside the 98% paper margin.
- **Family Slugs**: Examples include `classic-composite`, `right-equipment`, `premium-audit`.

## Konva / Canvas Architecture
The editor is built on `react-konva`. The mental model is:
- **Stage**: The main container (`EditorApp.tsx`).
- **Layers**: 
  - `BaseLayer`: Floor plan image/SVG.
  - `DrawingLayer`: Lines, routes, shapes.
  - `SymbolLayer`: ISO 7010 symbols.
  - `TemplateLayer`: Paper borders and Antet (Title Block).

## Store Management (`useEditorStore`)
- Located at `src/store/useEditorStore.ts`.
- **Key Actions**:
  - `addElement`: Adds symbols/shapes.
  - `updateElement`: Handles transforms (resize/rotate).
  - `setTemplate`: Changes paper size (A3, A4) and layout.
- **Computed State**: `isCompliant` derived from presence of specific symbol IDs (e.g., `iso-7010-e001`).

## Symbol & Route Logic
- **Symbols**: Must snap to grid if enabled. Should be SVGs rendered as Konva Images.
- **Routes**: Polyline or Arrow components. Must support "Evacuation Path" styling (dashed/solid colors).
- **Antet Regions**: Dynamic text fields in the template that pull data from `useProjectStore`.

## Export Engine
- Uses `html2canvas` for preview and `jspdf` for high-quality vector-like PDF generation.
- **Resolution**: Always export at 300 DPI equivalent for professional printing.
- **Watermarking**: Apply "Free Version" watermark if `is_premium` is false.

## Performance Optimization
- Use `Konva.Cache` for complex shapes.
- Avoid unnecessary re-renders of the entire Stage; only update affected layers.
- Debounce `autoSave` to Supabase (standard is 3000ms).

## Implementation Checklist
- [ ] Is the symbol ISO 7010 compliant?
- [ ] Does the route have the correct directional arrow?
- [ ] Is the Antet updated with the latest project name?
- [ ] Is the Stage scale/zoom preserved after saving?
