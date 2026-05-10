import { TemplateModuleInstance } from '@/types/editor';

const SNAP_THRESHOLD = 0.8; // percentage

export function calculateModuleSnap(
  action: 'drag' | 'resize',
  direction: string, // 'e', 'se', 's', etc. only used for resize
  x: number, y: number, w: number, h: number,
  allModules: TemplateModuleInstance[],
  skipId: string
) {
  const snapXs = new Set<number>([0, 50, 100]);
  const snapYs = new Set<number>([0, 50, 100]);

  allModules.forEach(m => {
    if (m.id === skipId) return;
    snapXs.add(m.x);
    snapXs.add(m.x + m.w);
    snapXs.add(m.x + m.w / 2);
    
    snapYs.add(m.y);
    snapYs.add(m.y + m.h);
    snapYs.add(m.y + m.h / 2);
  });

  let newX = x;
  let newY = y;
  let newW = w;
  let newH = h;
  const lines: Array<{ axis: 'x' | 'y', pos: number }> = [];

  const checkSnap = (val: number, snapSet: Set<number>, axis: 'x' | 'y') => {
    let snappedVal = val;
    let found = false;
    for (const s of snapSet) {
      if (Math.abs(val - s) < SNAP_THRESHOLD) {
        snappedVal = s;
        lines.push({ axis, pos: s });
        found = true;
        break;
      }
    }
    return { snappedVal, found };
  };

  if (action === 'drag') {
    // Snap X
    let snappedX = false;
    const targetXs = [
      { val: x, offset: 0 },
      { val: x + w, offset: -w },
      { val: x + w / 2, offset: -w / 2 }
    ];
    for (const t of targetXs) {
      if (snappedX) break;
      const res = checkSnap(t.val, snapXs, 'x');
      if (res.found) {
        newX = res.snappedVal + t.offset;
        snappedX = true;
      }
    }

    // Snap Y
    let snappedY = false;
    const targetYs = [
      { val: y, offset: 0 },
      { val: y + h, offset: -h },
      { val: y + h / 2, offset: -h / 2 }
    ];
    for (const t of targetYs) {
      if (snappedY) break;
      const res = checkSnap(t.val, snapYs, 'y');
      if (res.found) {
        newY = res.snappedVal + t.offset;
        snappedY = true;
      }
    }
  } else if (action === 'resize') {
    // Snap X edges
    if (direction.includes('e')) {
      const res = checkSnap(x + w, snapXs, 'x');
      if (res.found) newW = res.snappedVal - x;
    }
    if (direction.includes('w')) {
      const res = checkSnap(x, snapXs, 'x');
      if (res.found) {
        newW = w + (x - res.snappedVal);
        newX = res.snappedVal;
      }
    }
    // Snap Y edges
    if (direction.includes('s')) {
      const res = checkSnap(y + h, snapYs, 'y');
      if (res.found) newH = res.snappedVal - y;
    }
    if (direction.includes('n')) {
      const res = checkSnap(y, snapYs, 'y');
      if (res.found) {
        newH = h + (y - res.snappedVal);
        newY = res.snappedVal;
      }
    }
  }

  return { x: newX, y: newY, w: newW, h: newH, lines };
}
