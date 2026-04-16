import { useMemo } from 'react';
import * as THREE from 'three';
import verb from 'verb-nurbs';
import type { core, geom } from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import {
  CYLINDER_AXIS, CYLINDER_BASE, CYLINDER_HEIGHT, CYLINDER_RADIUS, CYLINDER_XAXIS,
  SPHERE_CENTER, SPHERE_RADIUS, type Vec3,
} from './_surfaceConformShared';

// Variant C: trim + patch with localized refinement.
// Two NurbsSurfaces are kept unchanged. We build each render mesh by walking a
// uniform parametric grid, and whenever a cell straddles the seam (its corners
// land on both sides of the "other" surface's inside/outside test) we subdivide
// that cell into a finer micro-grid before applying the centroid keep/drop
// test. Far from the seam we stay at the base resolution — cheap.

const BASE_DIV_U = 48;   // cylinder/sphere u grid
const BASE_DIV_V = 96;   // v grid (matches the more-variable circumferential direction for the cylinder)
const REFINE_STEPS = 4;  // 2^REFINE_STEPS subdivisions per straddle cell
const SEAM_PAD = 0.4;    // 3D distance threshold that also flags near-seam cells
const INTERSECT_TOL = 1e-3;

type Inside = (p: Vec3) => boolean;

function insideSphere(p: Vec3): boolean {
  const dx = p[0] - SPHERE_CENTER[0];
  const dy = p[1] - SPHERE_CENTER[1];
  const dz = p[2] - SPHERE_CENTER[2];
  return dx * dx + dy * dy + dz * dz < SPHERE_RADIUS * SPHERE_RADIUS;
}

function insideCylinder(p: Vec3): boolean {
  const z = p[2];
  if (z < CYLINDER_BASE[2] || z > CYLINDER_BASE[2] + CYLINDER_HEIGHT) return false;
  const dx = p[0] - CYLINDER_BASE[0];
  const dy = p[1] - CYLINDER_BASE[1];
  return dx * dx + dy * dy < CYLINDER_RADIUS * CYLINDER_RADIUS;
}

// Signed distance-ish metric: positive outside, negative inside. We don't need
// exact SDF, just something whose sign matches `inside` and whose magnitude is
// a reasonable 3D distance so SEAM_PAD is meaningful.
function signedSphereDist(p: Vec3): number {
  const dx = p[0] - SPHERE_CENTER[0];
  const dy = p[1] - SPHERE_CENTER[1];
  const dz = p[2] - SPHERE_CENTER[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - SPHERE_RADIUS;
}

function signedCylinderDist(p: Vec3): number {
  // Distance to the lateral surface of the finite cylinder (ignoring caps —
  // our surfaces never approach the caps in this setup).
  const dx = p[0] - CYLINDER_BASE[0];
  const dy = p[1] - CYLINDER_BASE[1];
  return Math.sqrt(dx * dx + dy * dy) - CYLINDER_RADIUS;
}

function surfacePoint(data: core.NurbsSurfaceData, u: number, v: number): Vec3 {
  return verb.eval.Eval.rationalSurfacePoint(data, u, v) as Vec3;
}

function surfaceNormal(data: core.NurbsSurfaceData, u: number, v: number): Vec3 {
  const n = verb.eval.Eval.rationalSurfaceNormal(data, u, v) as number[];
  const len = Math.hypot(n[0], n[1], n[2]) || 1;
  return [n[0] / len, n[1] / len, n[2] / len];
}

// Emit triangles for a single parametric cell [(u0,v0), (u1,v1)], subdividing
// `depth` more times if any sub-cell is near the seam. Points are appended to
// `points`/`normals`; kept triangles are appended to `faces` as index triples.
function emitCell(
  data: core.NurbsSurfaceData,
  u0: number, v0: number, u1: number, v1: number,
  depth: number,
  signedSeam: (p: Vec3) => number,
  keep: Inside,
  padScale: number,  // grows the pad slightly with depth to avoid near-zero misses
  points: number[][],
  normals: number[][],
  faces: number[][],
) {
  const p00 = surfacePoint(data, u0, v0);
  const p10 = surfacePoint(data, u1, v0);
  const p01 = surfacePoint(data, u0, v1);
  const p11 = surfacePoint(data, u1, v1);

  const s00 = signedSeam(p00);
  const s10 = signedSeam(p10);
  const s01 = signedSeam(p01);
  const s11 = signedSeam(p11);

  const minSign = Math.min(s00, s10, s01, s11);
  const maxSign = Math.max(s00, s10, s01, s11);
  const straddles = minSign < 0 && maxSign > 0;
  const nearSeam = Math.min(Math.abs(minSign), Math.abs(maxSign)) < SEAM_PAD * padScale;

  if (depth > 0 && (straddles || nearSeam)) {
    const um = (u0 + u1) * 0.5;
    const vm = (v0 + v1) * 0.5;
    emitCell(data, u0, v0, um, vm, depth - 1, signedSeam, keep, padScale, points, normals, faces);
    emitCell(data, um, v0, u1, vm, depth - 1, signedSeam, keep, padScale, points, normals, faces);
    emitCell(data, u0, vm, um, v1, depth - 1, signedSeam, keep, padScale, points, normals, faces);
    emitCell(data, um, vm, u1, v1, depth - 1, signedSeam, keep, padScale, points, normals, faces);
    return;
  }

  // Emit the two triangles of this (now leaf) cell, centroid-tested.
  const i00 = points.length;
  points.push(p00); normals.push(surfaceNormal(data, u0, v0));
  const i10 = points.length;
  points.push(p10); normals.push(surfaceNormal(data, u1, v0));
  const i01 = points.length;
  points.push(p01); normals.push(surfaceNormal(data, u0, v1));
  const i11 = points.length;
  points.push(p11); normals.push(surfaceNormal(data, u1, v1));

  const triA: [number, number, number] = [i00, i10, i11];
  const triB: [number, number, number] = [i00, i11, i01];
  for (const t of [triA, triB]) {
    const a = points[t[0]], b = points[t[1]], c = points[t[2]];
    const cx = (a[0] + b[0] + c[0]) / 3;
    const cy = (a[1] + b[1] + c[1]) / 3;
    const cz = (a[2] + b[2] + c[2]) / 3;
    if (keep([cx, cy, cz])) faces.push(t);
  }
}

function buildTrimmedSurface(
  surface: geom.NurbsSurface,
  signedSeam: (p: Vec3) => number,
  keep: Inside,
  baseDivU: number,
  baseDivV: number,
): THREE.BufferGeometry {
  const data = surface.asNurbs();
  const [uMin, uMax] = [data.knotsU[0], data.knotsU[data.knotsU.length - 1]];
  const [vMin, vMax] = [data.knotsV[0], data.knotsV[data.knotsV.length - 1]];
  const du = (uMax - uMin) / baseDivU;
  const dv = (vMax - vMin) / baseDivV;

  const points: number[][] = [];
  const normals: number[][] = [];
  const faces: number[][] = [];

  for (let iu = 0; iu < baseDivU; iu++) {
    const u0 = uMin + iu * du;
    const u1 = iu === baseDivU - 1 ? uMax : u0 + du;
    for (let iv = 0; iv < baseDivV; iv++) {
      const v0 = vMin + iv * dv;
      const v1 = iv === baseDivV - 1 ? vMax : v0 + dv;
      emitCell(data, u0, v0, u1, v1, REFINE_STEPS, signedSeam, keep, 1, points, normals, faces);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points.flat()), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals.flat()), 3));
  g.setIndex(faces.flat());
  return g;
}

function curveToLineGeometry(curve: geom.NurbsCurve): THREE.BufferGeometry {
  const pts = curve.tessellate();
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array((pts as number[][]).flat()), 3),
  );
  return g;
}

function Scene() {
  const { cylGeom, sphereGeom, seamGeoms } = useMemo(() => {
    const cyl = new verb.geom.CylindricalSurface(
      CYLINDER_AXIS, CYLINDER_XAXIS, CYLINDER_BASE, CYLINDER_HEIGHT, CYLINDER_RADIUS,
    );
    const sphere = new verb.geom.SphericalSurface(SPHERE_CENTER, SPHERE_RADIUS);

    // Cylinder: seam = sphere surface; keep everything outside the sphere.
    const cylGeom = buildTrimmedSurface(
      cyl, signedSphereDist, (p) => !insideSphere(p), BASE_DIV_U, BASE_DIV_V,
    );
    // Sphere cap: seam = cylinder lateral surface; keep everything inside the cylinder.
    // Use a denser base grid because the sphere's uniform parameterization wastes
    // resolution on regions we'll throw away, and the kept cap is small.
    const sphereGeom = buildTrimmedSurface(
      sphere, signedCylinderDist, insideCylinder, 64, 64,
    );

    const seams = verb.geom.Intersect.surfaces(cyl, sphere, INTERSECT_TOL);
    const seamGeoms = seams.map(curveToLineGeometry);

    return { cylGeom, sphereGeom, seamGeoms };
  }, []);

  return (
    <>
      <mesh geometry={cylGeom}>
        <meshStandardMaterial color="#6ec6ff" side={THREE.DoubleSide} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh geometry={sphereGeom}>
        <meshStandardMaterial color="#ff6b6b" side={THREE.DoubleSide} roughness={0.4} />
      </mesh>
      {seamGeoms.map((g, i) => (
        <line key={i}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial color="#fff176" linewidth={2} />
        </line>
      ))}
    </>
  );
}

export default function SurfaceConformTrimDemo() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute', top: 12, left: 12, padding: '8px 12px',
        background: 'rgba(0,0,0,0.55)', color: '#e0e0e0', borderRadius: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 13, pointerEvents: 'none', zIndex: 10, maxWidth: 380,
      }}>
        <div style={{ fontWeight: 500, marginBottom: 2 }}>Variant C — trim + patch (localized refinement)</div>
        <div style={{ opacity: 0.75 }}>
          Both surfaces stay as NurbsSurface objects. Parametric grid with cells near the seam recursively subdivided {REFINE_STEPS} times before the centroid keep/drop test. Yellow lines are the true surface–surface intersection.
        </div>
      </div>
      <R3FLayout>
        <Scene />
      </R3FLayout>
    </div>
  );
}
