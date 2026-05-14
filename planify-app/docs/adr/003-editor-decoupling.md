# ADR 003: Editor Decoupling and Atomic Rendering

## Status
In-Progress

## Context
`EditorCanvas.tsx` has grown to over 2000 lines, making it difficult to maintain and prone to performance regressions.

## Decision
1. **Atomic Renderers**: Every element type (Stairs, Doors, Walls, Symbols) must have its own functional component in `src/components/editor/canvas/renderers/`.
2. **Central Dispatcher**: Use `ElementDispatcher.tsx` to iterate over elements and delegate rendering to the specific type renderer.
3. **Logic Segregation**: Geometry calculations (intersection, snapping, angles) MUST reside in `lib/editor/wallGeometry.ts` or `lib/editor/moduleSnapping.ts`, never inside React components.
4. **Zustand Selectors**: Components MUST use `useShallow` with specific selectors to prevent re-rendering the entire canvas when a single element changes.

## Consequences
- Significantly cleaner `EditorCanvas.tsx`.
- Improved testability of individual renderers.
- Better performance via fine-grained React memoization.
