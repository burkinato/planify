# 03 - Tools & Geometry Engine

This document details how mathematical calculations, snapping algorithms, and geometry (especially for walls, doors, and windows) are structured in Planify.

## Snapping Logic (`findSnapPoint`)

Located inside `EditorCanvas.tsx`, `findSnapPoint(pos, excludeWallId)` evaluates the mouse position and returns the closest "magnetized" coordinate.

1. **Grid Snapping**: If the grid is visible, it rounds `x` and `y` to the nearest `GRID_SIZE` (50px).
2. **Endpoint Snapping**: It iterates through `visibleElements` and checks distances to endpoints.
3. **Wall Intersection Snapping**: It calls `findWallSnap` (from `wallGeometry.ts`) to calculate orthogonal projections onto existing wall segments, allowing users to start a new wall perfectly perpendicular from an existing wall.

## Wall Geometry (`lib/editor/wallGeometry.ts`)

Walls are stored as line segments `[x1, y1, x2, y2]`. Because doors and windows must reside "on" walls, the geometry engine handles complex calculations:

- `calculateSnapToWall(el, newX, newY)`: When a door or window is drawn, this function iterates through all wall elements, projects the mouse position onto the wall segment, and recalculates the rotation/angle of the door/window so it aligns perfectly with the wall.
- `buildWallMoveUpdates`: If a user selects a wall and moves it, this function automatically finds any attached doors and windows and translates their coordinates identically, ensuring the plan doesn't break apart.
- `wallAngleDegrees`, `wallLength`: Simple helper math functions.

## Dimension Input Overlay (`dimInput`)

When drawing an architectural line (Wall, Window, Door, Route), users expect precise measurements. 

Instead of showing a modal, the system uses a floating HTML `<input>` directly over the canvas.
1. On `handleStageMouseUp`, the vector `frozenLine` `[x1, y1, x2, y2]` is temporarily stored in `dimInput` state.
2. The exact screen coordinates `screenX` and `screenY` are calculated using `stageRect` and `cssScaleX`/`cssScaleY` to position the input field exactly where the mouse was released.
3. The user types a number (e.g., `120` cm).
4. `commitDimInput(overridePixels)` recalculates the vector. It uses the angle of `frozenLine` but overrides the length to match `overridePixels`. 
5. It then finally calls `addElement` to persist the drawing to the store.

## Modifying Tool Options

When modifying a tool (e.g., adding a new wall style), ensure:
- The property is added to `ToolOptions` in `types/editor.ts`.
- The UI controller is added to `EditorLeftSidebar.tsx` or a related properties panel.
- The state update uses `updateToolOptions(tool, { ...updates })` in `useEditorStore.ts`.
