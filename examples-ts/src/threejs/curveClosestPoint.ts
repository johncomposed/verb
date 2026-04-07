import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve, addPoints } from '../shared/sceneSetup';
import { curveToBufferGeometry, pointsToPointsGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const controlPts = [[0, 0, -5], [10, 0, 0], [10, 10, -5], [0, 10, 5], [5, 5, 0]];
  const interpCurve = verb.geom.NurbsCurve.byPoints(controlPts, 3);

  addCurve(ctx.scene, curveToBufferGeometry(interpCurve));

  const queryPts: number[][] = [];
  for (let i = -10; i < 20; i += 4) {
    for (let j = -10; j < 20; j += 4) {
      for (let k = -10; k < 20; k += 4) {
        const p0 = [i, j, k];
        queryPts.push(p0);
        const closest = interpCurve.closestPoint(p0);
        const line = new verb.geom.Line(closest, p0);
        addCurve(ctx.scene, curveToBufferGeometry(line), 0xaaaaaa);
      }
    }
  }

  addPoints(ctx.scene, pointsToPointsGeometry(queryPts));

  startRenderLoop(ctx);
}
