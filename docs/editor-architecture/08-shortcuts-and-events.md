# 08 - Keyboard Shortcuts & DOM Events

Because the canvas overrides standard HTML behavior, keyboard and pointer events must be meticulously tracked.

## Global Keyboard Traps

Inside the `useEffect` of `EditorCanvas.tsx`, standard `keydown` and `keyup` listeners are attached to the `window`:

- **Spacebar (`Space`)**: Used for the panning tool. 
  - Pressing Space sets `isSpacePressedRef.current = true` and changes the cursor to `grab`.
  - Mouse down + Space initiates inner or outer panning instead of drawing.
- **`Delete` / `Backspace`**:
  - Trapped to delete elements.
  - If `selectedIds.length > 0`, it calls `removeElements(selectedIds)`.
  - If a template module is selected (`selectedTemplateModuleId`), it calls `removeTemplateModule()`.
  - *Exception*: It explicitly ignores the event if the user is typing inside an `INPUT`, `TEXTAREA`, or `SELECT`.
- **`Escape`**:
  - Drops current selections. `setSelectedIds([])` and `setSelectedTemplateModuleId(null)`.

## `useKeyboardShortcuts` Hook

For global actions outside of the Konva stage, a custom hook `useKeyboardShortcuts` is used (often initialized in `EditorApp.tsx`). It can bind application-level shortcuts such as:
- Triggering Image Export.
- (Potentially) Undo/Redo (`Ctrl+Z`, `Ctrl+Y`), delegating calls directly to `useEditorStore.getState().undo()`.

## Infinite Scroll & Wheel Traps

Scroll events are trapped at the HTML wrapper (`infiniteHostRef`).
- When `wheel` is fired, the app checks if the mouse is over a native scrollable element (like a textarea or an overflowing div). If so, it allows natural scrolling.
- If the mouse is over the `drawing-region-wrapper`, it calls `e.preventDefault()` and delegates zoom to Konva (`innerZoom`).
- If the mouse is anywhere else on the canvas, it scales the outer HTML `transform` (`zoom`).
