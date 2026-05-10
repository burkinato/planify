# 02 - Canvas Engine & Events

The visual rendering and interaction handling occurs in `src/components/editor/EditorCanvas.tsx`. It relies on the `react-konva` library to map the `useEditorStore` state to a high-performance HTML5 Canvas.

## The "Infinite Canvas" Model

Planify uses a dual-coordinate approach to provide a smooth, infinite workspace while maintaining strict paper dimensions for exporting.

1. **Outer Space (HTML/CSS)**
   - Managed by `zoom` and `pan` state variables.
   - Applied via CSS Transform (`transform: translate(...) scale(...)`) on the `infiniteHostRef` `div`.
   - Used for navigating the entire application workspace. Panning is done via Middle-Mouse drag. Zooming is done via Mouse Wheel *when the mouse is outside the DrawingArea module*.

2. **Inner Space (Konva Space)**
   - Managed by `innerZoom` and `innerPan` state variables.
   - Applied directly inside the Konva `<Stage>` and its layers.
   - Used to zoom and pan *inside* the paper's drawing region.
   - Zooming is done via Mouse Wheel *only when the mouse is hovering over the focused `DrawingArea`*.

**Coordinate Translation**:
Because of the dual-zoom logic, raw mouse coordinates cannot be used directly. We use `getRelativePointerPosition(stage)` to convert screen coordinates to the actual canvas drawing space:
```typescript
// Calculation inside getRelativePointerPosition
x = (stage.getPointerPosition().x - innerPan.x) / innerZoom;
y = (stage.getPointerPosition().y - innerPan.y) / innerZoom;
```

## Core Interaction Loops

All drawing and selection logic is routed through three massive event handlers attached to the `<Stage>`:

### `handleStageMouseDown`
- **Goal**: Start a tool action.
- Resolves the snap point using `findSnapPoint(pos)`.
- If a line tool (`wall`, `door`, `route`) is active, it flags `isDrawing = true` and sets `currentLine` to start and end at the clicked coordinate.
- If a click tool (`symbol`, `text`, `rect`) is active, it immediately dispatches an `addElement` action to the store and reverts the tool to `select`.

### `handleStageMouseMove`
- **Goal**: Provide real-time feedback.
- Updates the end coordinates of `currentLine`.
- Calculates **Magnetic Alignment** (Smart Guides) against existing walls, displaying green/red alignment lines (`alignLine`).
- Calculates **Ortho Snap** (holding `Shift` or snapping to near 0/90/180/270 degrees) to force straight lines (`orthoLine`).

### `handleStageMouseUp`
- **Goal**: Commit the drawing action.
- If drawing a wall/route/door/window, it validates length (must be > 6px).
- **Dimension Input Overlay**: Instead of immediately saving a wall/door, it calculates the screen position of the drawn line, freezes the coordinates, and displays a temporary HTML `<input>` (`dimInput`). 
- When the user types an exact length (e.g., 500) and hits Enter, `commitDimInput` recalculates the vector and finally calls `addElement`.
- Reverts tool to `select` (unless drawing continuous walls).

## Rendering Pipeline

Inside the `<Layer>` of the Konva stage, elements are mapped and rendered. Currently, they are rendered using a combination of specific components (`<WallRenderer>`, `<GridRenderer>`) and generic `react-konva` shapes based on the `element.type`.

Always remember to use the `layerId` and Z-index properly, respecting the `visible` and `locked` properties defined in `useEditorStore`.
