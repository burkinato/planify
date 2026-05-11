const fs = require('fs');
let code = fs.readFileSync('planify-app/src/components/editor/EditorCanvas.tsx', 'utf8');

const mousedownStart = code.indexOf('  const handleStageMouseDown = (e: CanvasStageEvent) => {');
const calculateSnapStart = code.indexOf('  const calculateSnapToWall = (el: EditorElement');
const mouseUpStart = code.indexOf('  const handleStageMouseUp = (e: CanvasStageEvent) => {');
const handleWheelStart = code.indexOf('  // handleWheel is called by the Konva Stage');

if (mousedownStart > -1 && calculateSnapStart > -1 && mouseUpStart > -1 && handleWheelStart > -1) {
  const hookCall = `  const {
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    isDrawing,
    currentLine,
    setCurrentLine,
    orthoLine,
    alignLine,
  } = useCanvasInteraction({
    stageRef,
    infiniteHostRef,
    isSpacePressedRef,
    isInnerPanningRef,
    innerPanStartRef,
    tool,
    toolOptions,
    wallElements,
    zoom,
    innerZoom,
    innerPan,
    setInnerPan,
    scaleConfig,
    setDimInput,
    setScaleModal,
    findSnapPoint,
    getRelativePointerPosition,
    calculateSnapToWall,
    toDisplayUnit,
  });

`;
  
  const part1 = code.substring(0, mousedownStart);
  const part2 = code.substring(calculateSnapStart, mouseUpStart);
  const part3 = code.substring(handleWheelStart);

  code = part1 + part2 + hookCall + part3;

  fs.writeFileSync('planify-app/src/components/editor/EditorCanvas.tsx', code);
  console.log('Success');
} else {
  console.log('Error finding indices');
}
