import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve, addMesh } from '../shared/sceneSetup';
import { curveToBufferGeometry, surfaceToBufferGeometry } from '../shared/verbToThree';
import { createSampleSurface } from './surface';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const srf = createSampleSurface();

  const uValues = verb.core.Vec.span(0, 1.0, 0.025);
  uValues.forEach((u: number) => {
    const iso = srf.isocurve(u, true);
    addCurve(ctx.scene, curveToBufferGeometry(iso));
  });

  addMesh(ctx.scene, surfaceToBufferGeometry(srf));

  startRenderLoop(ctx);
}
