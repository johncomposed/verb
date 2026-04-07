import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve } from '../shared/sceneSetup';
import { curveToBufferGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const pts = [[-10, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [5, 5, 0]];
  const interpCurve = verb.geom.NurbsCurve.byPoints(pts, 3);

  const parts = interpCurve.split(0.4);

  addCurve(ctx.scene, curveToBufferGeometry(parts[0]), 0x00aaaa);
  addCurve(ctx.scene, curveToBufferGeometry(parts[1]), 0xaaaa00);

  startRenderLoop(ctx);
}
