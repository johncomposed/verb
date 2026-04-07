import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addCurve, addMesh } from '../shared/sceneSetup';
import { surfaceToBufferGeometry, pointsToLineGeometry } from '../shared/verbToThree';

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  // Torus: revolve a circle around the Z axis
  const profile = new verb.geom.Circle([5, 0, 0], [1, 0, 0], [0, 0, 1], 2);
  const srf1 = new verb.geom.RevolvedSurface(profile, [0, 0, 0], [0, 0, 1], 2 * Math.PI);

  // Cylinder passing through the torus
  const srf2 = new verb.geom.CylindricalSurface(
    [-1, 0, 0], [0, 0, 1], [8, 0, 0], 16, 2
  );

  addMesh(ctx.scene, surfaceToBufferGeometry(srf1), undefined, true);
  addMesh(ctx.scene, surfaceToBufferGeometry(srf2), undefined, true);

  // Mesh-level intersection
  const tess1 = srf1.tessellate();
  const tess2 = srf2.tessellate();
  const res = verb.eval.Intersect.meshes(tess1, tess2);

  res.forEach((polyline) => {
    const pts = polyline.map((x) => x.point);
    addCurve(ctx.scene, pointsToLineGeometry(pts));
  });

  startRenderLoop(ctx);
}
