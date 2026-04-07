import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addMesh } from '../shared/sceneSetup';
import { surfaceToBufferGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const srf = new verb.geom.CylindricalSurface(
    [-1, 0, 0],  // axis
    [0, 0, 1],   // xaxis
    [8, 0, 1],   // base
    16,           // height
    2             // radius
  );

  addMesh(ctx.scene, surfaceToBufferGeometry(srf));

  startRenderLoop(ctx);
}
