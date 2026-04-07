import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve, addMesh } from '../shared/sceneSetup';
import { curveToBufferGeometry, surfaceToBufferGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const prof = new verb.geom.BezierCurve([[0, 0, 0], [5, 10, 0], [10, 0, 0], [15, 20, 0]]);
  const srf = new verb.geom.RevolvedSurface(prof, [0, 0, 0], [1, 0, 0], 2 * Math.PI);

  addCurve(ctx.scene, curveToBufferGeometry(prof));
  addMesh(ctx.scene, surfaceToBufferGeometry(srf));

  startRenderLoop(ctx);
}
