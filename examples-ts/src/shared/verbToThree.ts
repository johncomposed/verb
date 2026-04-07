import * as THREE from 'three';
import type { geom, core, eval as verb_eval } from 'verb-nurbs';

/**
 * Converts a verb NurbsSurface into a THREE.BufferGeometry.
 * Tessellates the NURBS surface into a triangle mesh for three.js rendering.
 */
export function surfaceToBufferGeometry(
  verbSurface: geom.NurbsSurface,
  options?: verb_eval.AdaptiveRefinementOptions
): THREE.BufferGeometry {
  const tessellated: core.MeshData = verbSurface.tessellate(options);
  const geometry = new THREE.BufferGeometry();

  if (tessellated.points && tessellated.points.length > 0) {
    const positions = new Float32Array(tessellated.points.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  }

  if (tessellated.normals && tessellated.normals.length > 0) {
    const normals = new Float32Array(tessellated.normals.flat());
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  }

  if (tessellated.faces && tessellated.faces.length > 0) {
    const indices = tessellated.faces.flat();
    geometry.setIndex(indices);
  }

  return geometry;
}

/**
 * Converts a verb NurbsCurve into a THREE.BufferGeometry for rendering as a line.
 */
export function curveToBufferGeometry(
  verbCurve: geom.NurbsCurve,
  tolerance?: number
): THREE.BufferGeometry {
  const points: core.Point[] = verbCurve.tessellate(tolerance);
  const threePoints: THREE.Vector3[] = points.map(
    (p: core.Point) => new THREE.Vector3(p[0], p[1], p[2])
  );
  return new THREE.BufferGeometry().setFromPoints(threePoints);
}

/**
 * Converts an array of raw verb points to a THREE.BufferGeometry for rendering as a line.
 */
export function pointsToLineGeometry(pts: core.Point[]): THREE.BufferGeometry {
  const threePoints = pts.map(
    (p) => new THREE.Vector3(p[0], p[1], p[2])
  );
  return new THREE.BufferGeometry().setFromPoints(threePoints);
}

/**
 * Converts raw verb points to a THREE.BufferGeometry for point cloud rendering.
 */
export function pointsToPointsGeometry(pts: core.Point[]): THREE.BufferGeometry {
  const positions = new Float32Array(pts.flat());
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

/**
 * Helper to convert a THREE.Matrix4 to a 4x4 number array for verb-nurbs.
 */
export function matrix4ToNumberArray(m: THREE.Matrix4): core.Matrix {
  const e = m.elements;
  return [
    [e[0], e[4], e[8], e[12]],
    [e[1], e[5], e[9], e[13]],
    [e[2], e[6], e[10], e[14]],
    [e[3], e[7], e[11], e[15]],
  ];
}

/**
 * Projects a UV point on a NURBS surface to a THREE.Vector3.
 */
export function projectPointToSurface(
  surface: geom.NurbsSurface,
  u: number,
  v: number
): THREE.Vector3 {
  const pt = surface.point(u, v);
  return new THREE.Vector3(pt[0], pt[1], pt[2]);
}

/**
 * Computes the surface normal at a UV point via finite differences.
 */
export function computeNormal(
  surface: geom.NurbsSurface,
  u: number,
  v: number,
  epsilon = 0.0001
): THREE.Vector3 {
  const p = surface.point(u, v);
  const pu = surface.point(u + epsilon, v);
  const pv = surface.point(u, v + epsilon);

  const du = new THREE.Vector3().subVectors(
    new THREE.Vector3(pu[0], pu[1], pu[2]),
    new THREE.Vector3(p[0], p[1], p[2])
  );
  const dv = new THREE.Vector3().subVectors(
    new THREE.Vector3(pv[0], pv[1], pv[2]),
    new THREE.Vector3(p[0], p[1], p[2])
  );

  return new THREE.Vector3().crossVectors(du, dv).normalize();
}
