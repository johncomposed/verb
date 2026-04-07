import { createScene, startRenderLoop, addCurve, addMesh } from '../shared/sceneSetup';
import { curveToBufferGeometry, surfaceToBufferGeometry } from '../shared/verbToThree';
import { createSampleSurface } from './surface';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const srf = createSampleSurface();

  srf.boundaries().forEach((boundary) => {
    addCurve(ctx.scene, curveToBufferGeometry(boundary));
  });

  addMesh(ctx.scene, surfaceToBufferGeometry(srf));

  startRenderLoop(ctx);
}
