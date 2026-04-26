# Frontend Skills (Optimized)

## Konva Canvas Patterns
- **Memory Management**: Reuse `hatchPattern` or large assets via refs or singleton helpers.
- **Batched Updates**: Use `updateElementsBatch` for multiple changes to avoid multiple history snapshots.
- **Snapping**: Implement magnetic guides using `findSnapPoint` and `findWallSnap`.
- **Z-Index**: Order elements by their `layerId` and index within the `elements` array.

## Zustand Optimization
- **Shallow Selectors**: Always use `useShallow` when selecting multiple state pieces to prevent unnecessary re-renders.
- **Selector Pattern**: `const { x, y } = useEditorStore(useShallow(s => ({ x: s.x, y: s.y })));`

## UI/UX Rules
- **Typography**: Use standard weights (400, 600, 900) for professional CAD feel.
- **Colors**: Follow `THEME_CONFIGS` (blueprint, dark, light).
- **Animations**: Use Tailwind's `animate-*` for micro-interactions.
