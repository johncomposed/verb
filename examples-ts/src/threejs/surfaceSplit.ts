import * as THREE from 'three';
import { createScene, startRenderLoop, addMesh } from '../shared/sceneSetup';
import { surfaceToBufferGeometry } from '../shared/verbToThree';
import { createSampleSurface } from './surface';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const srf = createSampleSurface();
  const split = srf.split(0.75, true);

  const mat1 = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  addMesh(ctx.scene, surfaceToBufferGeometry(split[0]), mat1);

  const mat2 = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true,
  });
  addMesh(ctx.scene, surfaceToBufferGeometry(split[1]), mat2);

  startRenderLoop(ctx);
}
