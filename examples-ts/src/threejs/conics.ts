import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve } from '../shared/sceneSetup';
import { curveToBufferGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const arc = new verb.geom.Arc([0, 0, 0], [1, 0, 0], [0, 1, 0], 5, 0, (3 * Math.PI) / 2);
  const circle = new verb.geom.Circle([12, 0, 0], [1, 0, 0], [0, 1, 0], 5);
  const ellipse = new verb.geom.Ellipse([24, 0, 0], [5, 0, 0], [0, 2, 0]);
  const ellipseArc = new verb.geom.EllipseArc([36, 0, 0], [5, 0, 0], [0, 2, 0], 0, (3 * Math.PI) / 2);
  const parabola = new verb.geom.BezierCurve([[43, 5, 0], [48, -10, 0], [51, 5, 0]]);

  addCurve(ctx.scene, curveToBufferGeometry(circle));
  addCurve(ctx.scene, curveToBufferGeometry(arc));
  addCurve(ctx.scene, curveToBufferGeometry(ellipse));
  addCurve(ctx.scene, curveToBufferGeometry(ellipseArc));
  addCurve(ctx.scene, curveToBufferGeometry(parabola));

  startRenderLoop(ctx);
}
