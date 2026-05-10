# 01 - State Management & Types

Planify relies entirely on `zustand` for state management, specifically in `src/store/useEditorStore.ts`. Do not use local React state (`useState`) to manage canvas objects or tool settings; always use the store.

## The `EditorState` Interface

The store state is vast but logical. Key areas include:

### 1. Canvas Elements
```typescript
elements: EditorElement[];
layers: LayerDef[];
activeLayerId: string;
```
- `elements` is the source of truth for the entire drawn plan. It is an array of `EditorElement` objects.
- `EditorElement` (defined in `types/editor.ts`) describes every item drawn. It includes fields like `id`, `type`, `layerId`, `x`, `y`, and specific fields depending on type (e.g., `thickness` for walls, `doorSwing` for doors).

### 2. Tools & Selection
```typescript
tool: EditorTool; // 'select' | 'wall' | 'window' | 'door' | 'symbol' | ...
toolOptions: ToolOptions; // Record of tool-specific configurations
selectedIds: string[]; // Currently selected element IDs
```
- `toolOptions` hold persistent settings like wall thickness or symbol color, so when a user re-selects a tool, their last preferences are remembered.
- `selectedIds` drive the properties panel on the left sidebar.

### 3. Templates & ISG Regions
```typescript
projectTemplate: ProjectTemplate;
templateLayoutId: string | null;
activeTemplateLayout: TemplateLayout | null;
templateModules: TemplateModuleInstance[];
templateState: TemplateState; // Text, titles, and meta info for modules
```
- These properties define the "paper" layout around the drawing area.
- `templateModules` dictate the geometry and Z-index of regions (e.g., Legend, Header).
- `templateState` stores the user-editable text inside those regions.

### 4. Undo/Redo System
```typescript
past: HistorySnapshot[];
future: HistorySnapshot[];
```
- `HistorySnapshot` records `{ elements, layers, templateModules }`.
- Mutative actions (like `addElement`, `updateElement`, `removeElements`) automatically push the current state to `past` before updating.

## Updating Elements (Best Practices)

When creating or modifying features that change elements:
- Use `updateElement(id, updates)` for single modifications. This utilizes a `Map` internally for performance.
- Use `updateElementsBatch(updates)` when modifying multiple elements at once (e.g., moving a wall and its attached doors/windows simultaneously).

## Persistence Layer
Changes to the store are written to `localStorage` using a debounce mechanism (500ms delay) to prevent UI freezing.
In `EditorApp.tsx`, an auto-save loop periodically (every 3s) serializes the store and pushes it to Supabase via `updateProject(projectId, ...)`.

Always ensure any new state property that needs persistence is added to the `loadProject` and initialization logics within `useEditorStore.ts`.
