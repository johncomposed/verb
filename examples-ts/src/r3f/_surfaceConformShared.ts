import verb from 'verb-nurbs';

export type Vec3 = [number, number, number];

export const CYLINDER_BASE: Vec3 = [0, 0, -10];
export const CYLINDER_AXIS: Vec3 = [0, 0, 1];
export const CYLINDER_XAXIS: Vec3 = [1, 0, 0];
export const CYLINDER_HEIGHT = 20;
export const CYLINDER_RADIUS = 4;

export const SPHERE_CENTER: Vec3 = [5, 0, 2];
export const SPHERE_RADIUS = 3;

// Refine knots evenly so the surface has enough DOFs near the sphere.
const REFINE_U = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
const REFINE_V = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

export type RestCylinder = {
  degreeU: number;
  degreeV: number;
  knotsU: number[];
  knotsV: number[];
  weights: number[][];
  restCps: Vec3[][];
};

export function buildRestCylinder(): RestCylinder {
  const cyl = new verb.geom.CylindricalSurface(
    CYLINDER_AXIS, CYLINDER_XAXIS, CYLINDER_BASE, CYLINDER_HEIGHT, CYLINDER_RADIUS,
  );
  let data = cyl.asNurbs();
  data = verb.eval.Modify.surfaceKnotRefine(data, REFINE_U, false);
  data = verb.eval.Modify.surfaceKnotRefine(data, REFINE_V, true);
  return {
    degreeU: data.degreeU,
    degreeV: data.degreeV,
    knotsU: data.knotsU.slice(),
    knotsV: data.knotsV.slice(),
    weights: verb.eval.Eval.weight2d(data.controlPoints),
    restCps: verb.eval.Eval.dehomogenize2d(data.controlPoints) as Vec3[][],
  };
}

export function buildSurfaceData(rest: RestCylinder, cps: Vec3[][]) {
  const homo = verb.eval.Eval.homogenize2d(cps, rest.weights);
  return new verb.core.NurbsSurfaceData(
    rest.degreeU, rest.degreeV, rest.knotsU, rest.knotsV, homo,
  );
}

export function buildNurbsSurface(rest: RestCylinder, cps: Vec3[][]) {
  return new verb.geom.NurbsSurface(buildSurfaceData(rest, cps));
}

// Project point p to the sphere surface if inside; otherwise return as-is.
// Returns [newPoint, wasProjected].
export function snapToSphereIfInside(
  p: Vec3, center: Vec3, radius: number,
): [Vec3, boolean] {
  const dx = p[0] - center[0], dy = p[1] - center[1], dz = p[2] - center[2];
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist >= radius || dist < 1e-9) return [p, false];
  const s = radius / dist;
  return [[center[0] + dx * s, center[1] + dy * s, center[2] + dz * s], true];
}
