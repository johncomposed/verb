import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addMesh } from '../shared/sceneSetup';
import { surfaceToBufferGeometry } from '../shared/verbToThree';

/** Common NURBS surface data used across several examples. */
export const SURFACE_DEGREE = 3;
export const SURFACE_KNOTS = [0, 0, 0, 0, 0.333, 0.666, 1, 1, 1, 1];
export const SURFACE_CONTROL_POINTS = [
  [[0, 0, -10],  [10, 0, 0],    [20, 0, 0],    [30, 0, 0],   [40, 0, 0],     [50, 0, 0]],
  [[0, -10, 0],  [10, -10, 10], [20, -10, 10],  [30, -10, 0], [40, -10, 0],   [50, -10, 0]],
  [[0, -20, 0],  [10, -20, 10], [20, -20, 10],  [30, -20, 0], [40, -20, -2],  [50, -20, -12]],
  [[0, -30, 0],  [10, -30, 0],  [20, -30, -23], [30, -30, 0], [40, -30, 0],   [50, -30, 0]],
  [[0, -40, 0],  [10, -40, 0],  [20, -40, 0],   [30, -40, 4], [40, -40, -20], [50, -40, 0]],
  [[0, -50, 12], [10, -50, 0],  [20, -50, 20],  [30, -50, 0], [50, -50, -10], [50, -50, -15]],
];

export function createSampleSurface() {
  return verb.geom.NurbsSurface.byKnotsControlPointsWeights(
    SURFACE_DEGREE, SURFACE_DEGREE,
    SURFACE_KNOTS, SURFACE_KNOTS,
    SURFACE_CONTROL_POINTS
  );
}

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const srf = createSampleSurface();
  addMesh(ctx.scene, surfaceToBufferGeometry(srf));

  startRenderLoop(ctx);
}
