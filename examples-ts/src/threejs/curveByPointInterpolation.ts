import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve, addPoints } from '../shared/sceneSetup';
import { curveToBufferGeometry, pointsToPointsGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const pts = [[-10, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [5, 5, 0]];
  const interpCurve = verb.geom.NurbsCurve.byPoints(pts, 3);

  addCurve(ctx.scene, curveToBufferGeometry(interpCurve));
  addPoints(ctx.scene, pointsToPointsGeometry(pts));

  startRenderLoop(ctx);
}
