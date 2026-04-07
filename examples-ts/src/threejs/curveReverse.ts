import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve } from '../shared/sceneSetup';
import { curveToBufferGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const c = new verb.geom.Arc([0, 0, 0], [1, 0, 0], [0, 1, 0], 20, 0, Math.PI / 2);
  const cr = c.reverse();
  const crr = cr.reverse();

  addCurve(ctx.scene, curveToBufferGeometry(c), 0xff0000);
  addCurve(ctx.scene, curveToBufferGeometry(cr), 0x00ff00);
  addCurve(ctx.scene, curveToBufferGeometry(crr), 0x0000ff);

  startRenderLoop(ctx);
}
