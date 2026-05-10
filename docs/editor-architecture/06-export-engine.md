# 06 - Export & Rendering Engine

Exporting an architectural canvas to a static image or PDF is complex because the editor interface (grids, dark modes, tool overlays) should not be included in the final output. Planify handles this seamlessly within `EditorApp.tsx`.

## The `exportImage` and `exportPdf` Pipeline

When a user initiates an export, the application follows a strict sequence to guarantee a clean output:

1. **Compliance Validation**: `validateCompliance()` runs first to check if critical ISG elements (e.g., "You Are Here" symbol, Evacuation Routes) are present. It uses a toast to warn the user if anything is missing.
2. **Theme Switching**: The editor switches the `editorTheme` state from its current value (often `dark` or `blueprint`) to `minimal`. This removes grid lines and dark backgrounds.
3. **Focus Reset**: `focusedRegionId` is set to `null` to remove any active borders or UI overlays from template modules.
4. **`waitForPaint` Utility**: The app waits for the next animation frame using `await waitForPaint()` to ensure React has fully committed the `minimal` theme to the DOM before capturing.
5. **Capture & Download**:
   - For Images: Uses the `html-to-image` library (`toCanvas`). It targets the `containerRef` and applies `pixelRatio: 2` (or 3) for high-resolution output.
   - For PDFs: Defers to `exportToPDF` in `lib/editor/export.ts` which uses `html2canvas` and `jspdf` to convert the layout into an A4/A3 physical format.
6. **Reverting State**: Within a `finally` block, the editor restores the user's original `savedEditorTheme`.
7. **Analytics**: Calls `recordProjectExport(projectId, format, fileName)` to log the action in the database.

## Resolution & Canvas Quality

- To prevent blurry outputs, Planify actively manages `pixelRatio`. 
- `stageRef.current.toDataURL({ pixelRatio: 3 })` is used when exporting purely from Konva.
- Thumbnails for the dashboard are generated automatically every 30 seconds during the auto-save loop using a very low `pixelRatio: 0.1` and `quality: 0.5` to save bandwidth.
