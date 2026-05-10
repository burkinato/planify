# 05 - UI Layout & Components

The Editor UI is constructed using TailwindCSS and is fully responsive (although primarily designed for desktop use given the complexity of CAD/Drawing).

## `EditorApp.tsx` (The Orchestrator)

This is the root component of the Editor.
- It wraps everything in an `EditorErrorBoundary`.
- Manages global state variables that are not suitable for `useEditorStore` (e.g., `isTemplateModalOpen`, `isExportModalOpen`, `mobileMenu`).
- Contains the `useEffect` hook for Auto-Saving (triggers every 3 seconds if state changes).
- Houses `exportImage` and `exportPdf` functions which use `html-to-image` and external PDF exporters.
- Structures the layout:
  ```tsx
  <div className="flex flex-col h-screen">
    <EditorHeader />
    <div className="flex flex-1 overflow-hidden relative">
       <EditorLeftSidebar />
       <EditorCanvas />
       <TemplateModulePanel />
    </div>
  </div>
  ```

## `EditorLeftSidebar.tsx` (Tools & Library)

The left sidebar has two main tabs:
1. **Tools Tab**: Contains buttons for architectural drawing (Wall, Door, Window) and evacuation routes. Clicking a tool sets `useEditorStore.getState().setTool('...')`.
2. **Library Tab (Symbols)**: Contains the ISO standard ISG symbols (Fire Extinguishers, First Aid, Exits). 
   - `SYMBOLS` array (from `types/editor.ts`) maps `E001`, `F001` IDs to categories.
   - SVGs/Icons are fetched via `ISO_SYMBOLS[sym.id]`.
   - Also includes functionality to upload "Custom Symbols" which are converted to base64 DataURLs.

- **Note on SVGs/Icons**: 
  - Standard UI icons use `lucide-react`.
  - ISG Plan symbols are stored or imported in `lib/editor/isoSymbols.ts` as Base64 strings or SVG paths to prevent CORS issues when rendering to Canvas/PDF.

## `TemplateModulePanel.tsx` & `ModuleEditDrawer.tsx` (Right Sidebar)

The right sidebar architecture has been refactored for a modern, visual experience:

1. **`TemplateModulePanel.tsx` (Module List & Add)**
   - Acts as the main right sidebar displaying a list of currently active modules (`ModuleRow`).
   - Includes rich visual feedback:
     - **Hover Previews (`HoverPreview`)**: When hovering over a module, it renders a live miniature preview of the module's exact layout and text using `ModuleDispatcher` with `compact` mode.
     - **Requirements Badges**: Adding new modules shows visually distinct badges (Zorunlu, Önerilen, Opsiyonel).
   - Drag handles (`GripVertical`) for reordering (planned feature) or dragging items.
   - Clicking "Düzenle" (Edit) or the pencil icon opens the `ModuleEditDrawer`.

2. **`ModuleEditDrawer.tsx` (Slide-out Edit Panel)**
   - A separate panel that slides in from the right when a module is selected for editing.
   - Features:
     - **Live Mini-Preview**: Real-time rendering of the module being edited.
     - **Form Fields**: Title, Body, and Meta text areas that instantly update the `templateState`.
     - **Tone Picker**: A color palette to select the visual theme of the module (`green`, `red`, `blue`, `neutral`, `paper`).
     - **Position & Size**: Manual numeric inputs for `x, y, w, h` coordinates.

## Focus & Visibility
When a user clicks inside a Template Module (like the Header), `EditorLeftSidebar` is intentionally hidden (width 0, opacity 0) to maximize screen space for text editing on the right side. When the user clicks the DrawingArea, the left bar returns, and the right bar can be minimized.
