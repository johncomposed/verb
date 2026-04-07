import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve, addMesh } from '../shared/sceneSetup';
import { curveToBufferGeometry, surfaceToBufferGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const rail = new verb.geom.BezierCurve([[0, 0, 0], [10, 5, 10], [20, 10, 10]]);
  const prof = new verb.geom.BezierCurve([[0, 0, 0], [10, 10, 0], [20, 0, 0]]);

  const srf = new verb.geom.SweptSurface(prof, rail);

  addCurve(ctx.scene, curveToBufferGeometry(rail));
  addCurve(ctx.scene, curveToBufferGeometry(prof));
  addMesh(ctx.scene, surfaceToBufferGeometry(srf));

  startRenderLoop(ctx);
}
