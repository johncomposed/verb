import * as THREE from 'three';
import verb from 'verb-nurbs';
import { createScene, startRenderLoop, addMesh } from '../shared/sceneSetup';
import { surfaceToBufferGeometry } from '../shared/verbToThree';
import { createSampleSurface } from './surface';

// Inverse of surfaceSplit: join two NurbsSurface pieces that share a seam
// along the `useV` direction back into one surface.
//
// Preconditions (true for any pair returned by surfaceSplit):
//   - the two surfaces share degrees in both directions
//   - the perpendicular knot vector and control-point row length match
//   - the seam row of `a` coincides with the first row of `b`
export function mergeSplitSurfaces(
  a: ReturnType<typeof createSampleSurface>,
  b: ReturnType<typeof createSampleSurface>,
  useV: boolean = false,
): ReturnType<typeof createSampleSurface> {
  const da = a.asNurbs();
  const db = b.asNurbs();

  const degreeU = da.degreeU;
  const degreeV = da.degreeV;
  const seamDegree = useV ? degreeV : degreeU;

  // Homogeneous control points — operate on these directly so weights survive.
  const cpA = da.controlPoints;
  const cpB = db.controlPoints;

  let mergedCps: number[][][];
  let mergedKnotsU: number[];
  let mergedKnotsV: number[];

  // surfaceSplit leaves (degree+1) copies of the seam parameter at the end of A
  // and the start of B. A valid re-joined knot vector keeps interior
  // multiplicity at most `degree`, so we drop one seam copy from A and all
  // (degree+1) leading seam copies from B.
  if (useV) {
    // Rows are indexed by U, columns by V. Seam lies along the last V column
    // of A / first V column of B. Drop the duplicated seam column from B.
    mergedCps = cpA.map((row, i) => row.concat(cpB[i].slice(1)));
    mergedKnotsU = da.knotsU.slice();
    mergedKnotsV = da.knotsV.slice(0, -1).concat(db.knotsV.slice(seamDegree + 1));
  } else {
    // Seam lies along the last U row of A / first U row of B.
    mergedCps = cpA.concat(cpB.slice(1));
    mergedKnotsU = da.knotsU.slice(0, -1).concat(db.knotsU.slice(seamDegree + 1));
    mergedKnotsV = da.knotsV.slice();
  }

  const merged = new verb.core.NurbsSurfaceData(
    degreeU, degreeV, mergedKnotsU, mergedKnotsV, mergedCps,
  );
  return new verb.geom.NurbsSurface(merged);
}

export function init(container: HTMLElement) {
  const ctx = createScene(container);

  const srf = createSampleSurface();
  const [left, right] = srf.split(0.75, true);
  const merged = mergeSplitSurfaces(left, right, true);

  // Left half: solid, translucent.
  const mat1 = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  addMesh(ctx.scene, surfaceToBufferGeometry(left), mat1);

  // Right half: wireframe, drawn in the same spot to show the seam.
  const mat2 = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true,
  });
  addMesh(ctx.scene, surfaceToBufferGeometry(right), mat2);

  // Merged surface: offset along +X so you can compare the re-joined result.
  const mergedGeom = surfaceToBufferGeometry(merged);
  mergedGeom.translate(70, 0, 0);
  const mat3 = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
  addMesh(ctx.scene, mergedGeom, mat3);

  startRenderLoop(ctx);
}
