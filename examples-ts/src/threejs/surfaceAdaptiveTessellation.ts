import * as THREE from 'three';
import { createScene, startRenderLoop, addMesh } from '../shared/sceneSetup';
import { surfaceToBufferGeometry } from '../shared/verbToThree';
import { createSampleSurface } from './surface';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const srf = createSampleSurface();
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true,
  });

  addMesh(ctx.scene, surfaceToBufferGeometry(srf), mat);

  startRenderLoop(ctx);
}
