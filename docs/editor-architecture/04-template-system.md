# 04 - ISG Template System

Planify is not just a drawing tool; it is a professional Evacuation Plan (ISG) generator. The layout is determined by templates and modules.

## Terminology

- **ProjectTemplate**: The overarching theme/style (e.g., `modern`, `classic`, `blueprint`).
- **PagePreset**: The physical paper dimensions (A4 Landscape, A3 Portrait).
- **TemplateModule**: A rectangular bounding box on the paper reserved for specific content (e.g., `Header`, `Legend`, `DrawingArea`, `EmergencyTeams`).
- **TemplateRegionState**: The textual content inside a module (Title, Body, Meta, Background Color, Tone).

## Template Layout Logic (`lib/editor/templateLayouts.ts`)

A template is defined by an array of `TemplateModuleDefinition`. 
When a template is selected, `useEditorStore` creates `TemplateModuleInstance`s. These instances represent the live, movable blocks on the paper.

- **`DrawingArea`**: This is the most critical module. All `<EditorCanvas>` drawing interactions (walls, doors, symbols) are visually clipped and mapped to this specific module's coordinates.
- **Other Modules**: Rendered as HTML overlays or Konva shapes. 

## Focusing Mechanism (`focusedRegionId`)

To prevent accidental drawing when the user wants to type in the Header, Planify uses a focus system.
- In `EditorCanvas.tsx`, interaction is blocked if `focusedRegionId` is NOT the `DrawingArea` (unless you are clicking outside to deselect).
- Double-clicking a module (handled in `ModuleOverlay.tsx` or `TemplateModulePanel.tsx`) sets `focusedRegionId = module.id`.

## Right Sidebar (`TemplateModulePanel.tsx`)

This UI panel specifically manages templates. It reads `templateModules` and `templateState` from the store.
- Displays a list of active modules.
- Allows the user to add new modules (e.g., adding an `EmergencyCall` block).
- When a module is selected, it shows input fields tied to `updateTemplateRegion(id, { title, body })` to modify the textual content.
- Handles visual tones (Red, Green, Blue) and variants (Grid, List, Standard layout).

## Compliance Auditing (`validateCompliance`)

Evacuation plans must meet ISO standards.
Located in `EditorApp.tsx` and `lib/projects/compliance.ts`, the `validateCompliance` function checks:
1. Is there an "E004" (You Are Here) symbol on the canvas?
2. Is there at least one Evacuation Route (`evacuation-route`) drawn?
3. Is the Legend module present or are there symbols to define?

This audit calculates a compliance score and warns the user via `toast` if crucial elements are missing before exporting.
