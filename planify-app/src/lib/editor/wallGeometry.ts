import type { EditorElement } from '@/types/editor';

export type Point = { x: number; y: number };

export type WallElement = EditorElement & {
  type: 'wall';
  points: number[];
};

export type WallSnapKind = 'endpoint' | 'segment' | 'free';

export interface WallSnapResult {
  point: Point;
  kind: WallSnapKind;
  wallId?: string;
  endpointIndex?: 0 | 1;
}

export interface WallJunctionMask {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export const WALL_ENDPOINT_SNAP = 16;
export const WALL_SEGMENT_SNAP = 18;
export const WALL_CONNECT_THRESHOLD = 18;
export const MIN_WALL_LENGTH = 8;

const EPSILON = 0.0001;

export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export const wallPoints = (wall: Pick<EditorElement, 'points' | 'x' | 'y'>): [number, number, number, number] => {
  const points = wall.points || [0, 0, 0, 0];
  const x = wall.x || 0;
  const y = wall.y || 0;
  return [points[0] + x, points[1] + y, points[2] + x, points[3] + y];
};

export const wallEndpoints = (wall: Pick<EditorElement, 'points' | 'x' | 'y'>): [Point, Point] => {
  const [x1, y1, x2, y2] = wallPoints(wall);
  return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
};

export const moveWallPoints = (points: number[], dx: number, dy: number): [number, number, number, number] => [
  points[0] + dx,
  points[1] + dy,
  points[2] + dx,
  points[3] + dy,
];

export const wallLength = (points: number[]) => Math.hypot(points[2] - points[0], points[3] - points[1]);

export const wallAngleDegrees = (points: number[]) => {
  const angle = Math.atan2(points[3] - points[1], points[2] - points[0]) * 180 / Math.PI;
  return Math.round(((angle % 360) + 360) % 360);
};

export const projectPointToSegment = (point: Point, a: Point, b: Point) => {
  const lengthSquared = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (lengthSquared < EPSILON) {
    return { point: a, t: 0, distance: distance(point, a) };
  }

  const rawT = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / lengthSquared;
  const t = Math.max(0, Math.min(1, rawT));
  const projected = {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  };

  return { point: projected, t, distance: distance(point, projected) };
};

export const findWallSnap = (
  point: Point,
  walls: WallElement[],
  options: {
    excludeId?: string;
    endpointThreshold?: number;
    segmentThreshold?: number;
  } = {}
): WallSnapResult => {
  const endpointThreshold = options.endpointThreshold ?? WALL_ENDPOINT_SNAP;
  const segmentThreshold = options.segmentThreshold ?? WALL_SEGMENT_SNAP;
  let bestEndpoint: WallSnapResult | null = null;
  let bestEndpointDistance = endpointThreshold;
  let bestSegment: WallSnapResult | null = null;
  let bestSegmentDistance = segmentThreshold;

  walls.forEach((wall) => {
    if (wall.id === options.excludeId) return;
    const endpoints = wallEndpoints(wall);

    endpoints.forEach((endpoint, endpointIndex) => {
      const d = distance(point, endpoint);
      if (d < bestEndpointDistance) {
        bestEndpointDistance = d;
        bestEndpoint = {
          point: endpoint,
          kind: 'endpoint',
          wallId: wall.id,
          endpointIndex: endpointIndex as 0 | 1,
        };
      }
    });

    const projection = projectPointToSegment(point, endpoints[0], endpoints[1]);
    if (projection.t > 0.04 && projection.t < 0.96 && projection.distance < bestSegmentDistance) {
      bestSegmentDistance = projection.distance;
      bestSegment = {
        point: projection.point,
        kind: 'segment',
        wallId: wall.id,
      };
    }
  });

  return bestEndpoint ?? bestSegment ?? { point, kind: 'free' };
};

export const connectedEndpointUpdates = (
  walls: WallElement[],
  movedWallId: string,
  originalEndpoints: [Point, Point],
  nextEndpoints: [Point, Point],
  threshold = WALL_CONNECT_THRESHOLD
) => {
  const updates: { id: string; changes: Partial<EditorElement> }[] = [];

  walls.forEach((wall) => {
    if (wall.id === movedWallId) return;
    const endpoints = wallEndpoints(wall);
    const nextPoints = [...wallPoints(wall)];
    let changed = false;

    endpoints.forEach((endpoint, endpointIndex) => {
      originalEndpoints.forEach((originalEndpoint, movedEndpointIndex) => {
        if (distance(endpoint, originalEndpoint) <= threshold) {
          const target = nextEndpoints[movedEndpointIndex];
          nextPoints[endpointIndex * 2] = target.x;
          nextPoints[endpointIndex * 2 + 1] = target.y;
          changed = true;
        }
      });
    });

    if (changed) {
      updates.push({ id: wall.id, changes: { points: nextPoints, x: 0, y: 0 } });
    }
  });

  return updates;
};

export const buildWallMoveUpdates = (wall: WallElement, walls: WallElement[], dx: number, dy: number) => {
  const originalPoints = wallPoints(wall);
  const nextPoints = moveWallPoints(originalPoints, dx, dy);
  const originalEndpoints = wallEndpoints(wall);
  const nextEndpoints: [Point, Point] = [
    { x: nextPoints[0], y: nextPoints[1] },
    { x: nextPoints[2], y: nextPoints[3] },
  ];

  return [
    { id: wall.id, changes: { points: nextPoints, x: 0, y: 0 } },
    ...connectedEndpointUpdates(walls, wall.id, originalEndpoints, nextEndpoints),
  ];
};

export const buildWallEndpointUpdates = (
  wall: WallElement,
  walls: WallElement[],
  endpointIndex: 0 | 1,
  rawPoint: Point
) => {
  const originalPoints = wallPoints(wall);
  const snap = findWallSnap(rawPoint, walls, { excludeId: wall.id });
  const nextPoints = [...originalPoints] as [number, number, number, number];
  nextPoints[endpointIndex * 2] = snap.point.x;
  nextPoints[endpointIndex * 2 + 1] = snap.point.y;

  if (wallLength(nextPoints) < MIN_WALL_LENGTH) {
    return { snap, updates: [] };
  }

  const originalEndpoints: [Point, Point] = [
    { x: originalPoints[0], y: originalPoints[1] },
    { x: originalPoints[2], y: originalPoints[3] },
  ];
  const nextEndpoints: [Point, Point] = [
    { x: nextPoints[0], y: nextPoints[1] },
    { x: nextPoints[2], y: nextPoints[3] },
  ];

  return {
    snap,
    updates: [
      { id: wall.id, changes: { points: nextPoints, x: 0, y: 0 } },
      ...connectedEndpointUpdates(walls, wall.id, originalEndpoints, nextEndpoints),
    ],
  };
};

export const computeRenderPoints = (
  wall: WallElement,
  walls: WallElement[]
): [number, number, number, number] => {
  const pts = wallPoints(wall);
  const t = wall.thickness || 12;
  const len = wallLength(pts);
  if (len < 1) return pts;

  const ux = (pts[2] - pts[0]) / len; // unit direction ep0→ep1
  const uy = (pts[3] - pts[1]) / len;
  const eps: [Point, Point] = [
    { x: pts[0], y: pts[1] },
    { x: pts[2], y: pts[3] },
  ];

  // adjustment[i] > 0 means extend outward, < 0 means retract inward
  const adj = [0, 0];

  for (const endIdx of [0, 1] as const) {
    const ep = eps[endIdx];
    // inward direction: from endpoint INTO the wall
    const inX = endIdx === 0 ? ux : -ux;
    const inY = endIdx === 0 ? uy : -uy;

    const sharingWalls = walls.filter(w => {
      const wEps = wallEndpoints(w);
      return distance(ep, wEps[0]) < 2 || distance(ep, wEps[1]) < 2;
    });

    if (sharingWalls.length === 2) {
      // Exactly 2 walls meet here. It's a simple corner, so we can apply Miter logic
      // to make the outer edge perfectly sharp.
      const other = sharingWalls.find(w => w.id !== wall.id)!;
      const oPts = wallPoints(other);
      const oLen = wallLength(oPts);
      if (oLen >= 1) {
        const oEps = wallEndpoints(other);
        const isStart = distance(ep, oEps[0]) < 2;
        const oInX = isStart ? (oPts[2] - oPts[0]) / oLen : (oPts[0] - oPts[2]) / oLen;
        const oInY = isStart ? (oPts[3] - oPts[1]) / oLen : (oPts[1] - oPts[3]) / oLen;

        const dot = inX * oInX + inY * oInY;
        const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
        const thetaDeg = theta * 180 / Math.PI;

        // Skip orthogonal or straight angles — square caps handle them
        if (thetaDeg >= 8 && Math.abs(thetaDeg - 90) >= 8 && Math.abs(thetaDeg - 180) >= 8) {
          const halfTheta = theta / 2;
          if (halfTheta >= 0.02) {
            const miterExt = (t / 2) / Math.tan(halfTheta);
            const squareExt = t / 2;
            const delta = miterExt - squareExt; // positive = extend, negative = retract

            if (Math.abs(delta) > 0.5 && Math.abs(delta) < t * 2) {
              adj[endIdx] = delta;
            }
          }
        }
      }
    } else {
      // sharingWalls.length > 2 (complex junctions) or 1 (T-junctions or open ends).
      // We calculate the exact retraction needed to ensure the square cap does NOT 
      // protrude past the far edge of ANY intersecting wall.
      let maxRetract = 0;

      for (const other of walls) {
        if (other.id === wall.id) continue;

        let isIntersecting = false;
        const oEps = wallEndpoints(other);
        
        // Check if shares endpoint
        if (distance(ep, oEps[0]) < 2 || distance(ep, oEps[1]) < 2) {
          isIntersecting = true;
        } else {
          // Check if T-junction mid-segment
          const projection = projectPointToSegment(ep, oEps[0], oEps[1]);
          if (projection.t > 0.04 && projection.t < 0.96 && projection.distance < 2) {
            isIntersecting = true;
          }
        }

        if (isIntersecting) {
          const tA = t; // Thickness of this wall
          const tB = other.thickness || 12; // Thickness of intersected wall
          const oPts = wallPoints(other);
          const oLen = wallLength(oPts);
          
          if (oLen >= 1) {
            // Direction of the intersected wall
            const oInX = (oPts[2] - oPts[0]) / oLen;
            const oInY = (oPts[3] - oPts[1]) / oLen;

            // Angle between the walls
            const dot = inX * oInX + inY * oInY;
            const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.abs(Math.cos(theta));

            // Prevent division by zero for nearly parallel walls
            if (sinTheta > 0.01) {
              // Exact mathematical retraction required to make the corner of the 
              // square cap perfectly kiss the far edge of the intersected wall.
              const reqRetract = ((tA / 2) * (sinTheta + cosTheta) - (tB / 2)) / sinTheta;
              
              if (reqRetract > maxRetract) {
                maxRetract = reqRetract;
              }
            }
          }
        }
      }

      if (maxRetract > 0) {
        // Clamp to prevent absurd retractions just in case, though math limits to ~tA/2
        const safeRetract = Math.min(maxRetract, t); 
        const retractDelta = -safeRetract;
        if (Math.abs(retractDelta) > Math.abs(adj[endIdx])) {
          adj[endIdx] = retractDelta;
        }
      }
    }
  }

  // Apply: extend endpoint OUTWARD (away from wall center)
  return [
    pts[0] - ux * adj[0], // ep0 outward = -ux direction
    pts[1] - uy * adj[0],
    pts[2] + ux * adj[1], // ep1 outward = +ux direction
    pts[3] + uy * adj[1],
  ];
};

// Removed WallJunctionCircle logic as it creates artifacts

/** Returns true if the angle (in degrees) is close to 0, 90, 180, or 270/360. */
const isOrthogonalAngle = (angleDeg: number, tolerance = 8) => {
  const a = ((angleDeg % 360) + 360) % 360;
  return (
    a < tolerance ||
    Math.abs(a - 90) < tolerance ||
    Math.abs(a - 180) < tolerance ||
    Math.abs(a - 270) < tolerance ||
    a > 360 - tolerance
  );
};

/** Angle in degrees between two wall direction vectors. */
const angleBetweenWalls = (a: Point, b: Point, c: Point, d: Point): number => {
  const ax = b.x - a.x, ay = b.y - a.y;
  const cx = d.x - c.x, cy = d.y - c.y;
  const dot = ax * cx + ay * cy;
  const mag = Math.hypot(ax, ay) * Math.hypot(cx, cy);
  if (mag < EPSILON) return 0;
  const cos = Math.max(-1, Math.min(1, dot / mag));
  return Math.acos(cos) * 180 / Math.PI;
};

/** Adds a mask to the list, merging with nearby masks to avoid duplicates. */
const addMask = (masks: WallJunctionMask[], center: Point, radius: number, id: string) => {
  const existing = masks.find(m => distance({ x: m.x, y: m.y }, center) < radius * 0.5);
  if (existing) {
    existing.radius = Math.max(existing.radius, radius);
  } else {
    masks.push({ id, x: center.x, y: center.y, radius });
  }
};

export const buildWallJunctionMasks = (walls: WallElement[]): WallJunctionMask[] => {
  const masks: WallJunctionMask[] = [];

  walls.forEach((wall, wallIndex) => {
    const endpoints = wallEndpoints(wall);
    const radius = (wall.thickness || 12) / 2;

    for (let otherIndex = wallIndex + 1; otherIndex < walls.length; otherIndex += 1) {
      const other = walls[otherIndex];
      const a = endpoints[0];
      const b = endpoints[1];
      const c = wallEndpoints(other)[0];
      const d = wallEndpoints(other)[1];
      const denominator = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
      if (Math.abs(denominator) < EPSILON) continue;

      const t = ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / denominator;
      const u = ((a.x - c.x) * (a.y - b.y) - (a.y - c.y) * (a.x - b.x)) / denominator;

      if (t >= 0.04 && t <= 0.96 && u >= 0.04 && u <= 0.96) {
        const intersection = {
          x: a.x + t * (b.x - a.x),
          y: a.y + t * (b.y - a.y),
        };
        // Only mask oblique crossing intersections
        const angle = angleBetweenWalls(a, b, c, d);
        if (!isOrthogonalAngle(angle)) {
          addMask(masks, intersection, Math.max(radius, (other.thickness || 12) * 0.78), `${wall.id}-${other.id}`);
        }
      }
    }
  });

  return masks;
};

