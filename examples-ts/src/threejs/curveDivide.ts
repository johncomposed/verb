import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve, addPoints } from '../shared/sceneSetup';
import { curveToBufferGeometry, pointsToPointsGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const pts = [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [5, 5, 0]];
  const interpCurve = verb.geom.NurbsCurve.byPoints(pts, 3);

  addCurve(ctx.scene, curveToBufferGeometry(interpCurve));

  const divPoints = interpCurve
    .divideByEqualArcLength(20)
    .map((u) => interpCurve.point(u.u));

  addPoints(ctx.scene, pointsToPointsGeometry(divPoints));

  startRenderLoop(ctx);
}
