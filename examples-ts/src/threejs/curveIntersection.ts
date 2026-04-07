import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve, addPoints } from '../shared/sceneSetup';
import { curveToBufferGeometry, pointsToPointsGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const pts1 = [[-5, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [5, 5, 0]];
  const interpCurve = verb.geom.NurbsCurve.byPoints(pts1, 3);

  const pts2 = [[-5, 0, 0], [5, -1, 0], [15, 5, 0], [3, 10, 0], [5, 12, 0]];
  const interpCurve2 = verb.geom.NurbsCurve.byPoints(pts2, 3);

  addCurve(ctx.scene, curveToBufferGeometry(interpCurve));
  addCurve(ctx.scene, curveToBufferGeometry(interpCurve2));

  const intersections = verb.geom.Intersect.curves(interpCurve, interpCurve2, 1e-5);
  const ixPts = intersections.map((x) => x.point0);

  addPoints(ctx.scene, pointsToPointsGeometry(ixPts));

  startRenderLoop(ctx);
}
