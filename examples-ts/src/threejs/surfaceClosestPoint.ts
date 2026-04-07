import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve, addMesh, addPoints } from '../shared/sceneSetup';
import { curveToBufferGeometry, surfaceToBufferGeometry, pointsToPointsGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const degree = 3;
  const knots = [0, 0, 0, 0, 0.333, 0.666, 1, 1, 1, 1];
  const pts = [
    [[0, 0, -5],   [10, 0, 0],    [20, 0, 0],    [30, 0, 0],   [40, 0, 0],    [50, 0, 0]],
    [[0, -10, 0],  [10, -10, 10], [20, -10, 10],  [30, -10, 0], [40, -10, 0],  [50, -10, 0]],
    [[0, -20, 0],  [10, -20, 10], [20, -20, 10],  [30, -20, 0], [40, -20, -2], [50, -20, -12]],
    [[0, -30, 0],  [10, -30, 0],  [20, -30, -23], [30, -30, 0], [40, -30, 0],  [50, -30, 0]],
    [[0, -40, 0],  [10, -40, 0],  [20, -40, 0],   [30, -40, 4], [40, -40, -20],[50, -40, 0]],
    [[0, -50, 12], [10, -50, 0],  [20, -50, 10],  [30, -50, 0], [50, -50, -3], [50, -50, -5]],
  ];

  const srf = verb.geom.NurbsSurface.byKnotsControlPointsWeights(degree, degree, knots, knots, pts);

  const queryPts: number[][] = [];
  const c = 5;
  for (let i = 0; i < c; i++) {
    for (let j = 0; j < c; j++) {
      const p0 = [(60 * i) / (c - 1) - 10, (-60 * j) / (c - 1) + 10, 7];
      queryPts.push(p0);
      const closest = srf.closestPoint(p0);
      const line = new verb.geom.Line(closest, p0);
      addCurve(ctx.scene, curveToBufferGeometry(line), 0xaaaaaa);
    }
  }

  addPoints(ctx.scene, pointsToPointsGeometry(queryPts));
  addMesh(ctx.scene, surfaceToBufferGeometry(srf));

  startRenderLoop(ctx);
}
