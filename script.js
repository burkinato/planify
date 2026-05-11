const fs = require('fs');
const file = 'C:/Users/pixor/Desktop/planify/planify-app/src/components/editor/EditorCanvas.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { GridRenderer } from './canvas/GridRenderer';",
  "import { GridRenderer } from './canvas/GridRenderer';\nimport { CanvasElementsRenderer } from './canvas/CanvasElementsRenderer';"
);

const startMarker = '  const selectOrErase = ';
const startIdx = content.indexOf(startMarker);
const endMarker = '  return (\n    <main';
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
} else {
  console.log("Could not find start/end markers for removal.");
  process.exit(1);
}

const jsxStartMarker = '{/* Wall Rendering Passes (CAD-like) */}';
const jsxEndMarker = '{renderedOtherElements}';
const jsxStartIdx = content.indexOf(jsxStartMarker);
const jsxEndIdx = content.indexOf(jsxEndMarker, jsxStartIdx) + jsxEndMarker.length;

if (jsxStartIdx !== -1 && jsxEndIdx > jsxStartIdx) {
  const newJsx = `<CanvasElementsRenderer
                          elements={elements}
                          layers={layers}
                          selectedIds={selectedIds}
                          themeConfig={themeConfig}
                          editorTheme={editorTheme}
                          tool={tool}
                          isSpacePressed={isSpacePressed}
                          customSymbols={customSymbols}
                          updateElement={updateElement}
                          updateElementsBatch={updateElementsBatch}
                          removeElements={removeElements}
                          setSelectedIds={setSelectedIds}
                          calculateSnapToWall={calculateSnapToWall}
                        />`;
  content = content.substring(0, jsxStartIdx) + newJsx + content.substring(jsxEndIdx);
} else {
  console.log("Could not find JSX markers.");
  process.exit(1);
}

fs.writeFileSync(file, content);
console.log("Success");
