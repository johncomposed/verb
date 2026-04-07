import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve, addMesh } from '../shared/sceneSetup';
import { curveToBufferGeometry, surfaceToBufferGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const c0 = verb.geom.NurbsCurve.byKnotsControlPointsWeights(
    2, [0, 0, 0, 1, 1, 1],
    [[0, 0, 0], [10, 0, 0], [40, 0, 0]],
    [1, 1, 1]
  );
  const c1 = verb.geom.NurbsCurve.byKnotsControlPointsWeights(
    3, [0, 0, 0, 0, 1, 1, 1, 1],
    [[0, 10, 10], [10, 5, 10], [20, -5, 10], [40, 10, 10]],
    [1, 1, 1, 1]
  );
  const c2 = verb.geom.NurbsCurve.byKnotsControlPointsWeights(
    3, [0, 0, 0, 0, 1, 1, 1, 1],
    [[0, 0, 20], [10, 0, 20], [20, 5, 20], [40, 0, 20]],
    [1, 1, 1, 1]
  );
  const c3 = verb.geom.NurbsCurve.byKnotsControlPointsWeights(
    3, [0, 0, 0, 0, 1, 1, 1, 1],
    [[0, 3, 30], [10, -4, 30], [20, 10, 30], [40, 0, 30]],
    [1, 1, 1, 1]
  );

  const curves = [c0, c1, c2, c3];
  const srf = verb.geom.NurbsSurface.byLoftingCurves(curves, 3);

  addMesh(ctx.scene, surfaceToBufferGeometry(srf));
  curves.forEach((c) => addCurve(ctx.scene, curveToBufferGeometry(c)));

  startRenderLoop(ctx);
}
