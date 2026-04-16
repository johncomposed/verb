import { useMemo } from 'react';
import * as THREE from 'three';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbSurface } from '../shared/R3FComponents';
import {
  buildNurbsSurface, buildRestCylinder, snapToSphereIfInside,
  SPHERE_CENTER, SPHERE_RADIUS, type RestCylinder, type Vec3,
} from './_surfaceConformShared';

// Variant A: least-squares CP fit.
// 1. Sample the rest surface on a dense (u,v) grid.
// 2. Snap samples that fall inside the sphere onto its surface.
// 3. Solve for CPs that best interpolate the snapped samples in the
//    least-squares sense, using separable tensor-product normal equations.

const NUM_SAMPLES_U = 40;
const NUM_SAMPLES_V = 30;

type Matrix = number[][];

function basisMatrix(params: number[], degree: number, knots: number[], numCps: number): Matrix {
  const M: Matrix = [];
  for (const u of params) {
    const row = new Array(numCps).fill(0);
    const span = verb.eval.Eval.knotSpan(degree, u, knots);
    const N = verb.eval.Eval.basisFunctionsGivenKnotSpanIndex(span, u, degree, knots);
    for (let k = 0; k <= degree; k++) row[span - degree + k] = N[k];
    M.push(row);
  }
  return M;
}

function transpose(A: Matrix): Matrix {
  return verb.core.Mat.transpose(A);
}

function matmul(A: Matrix, B: Matrix): Matrix {
  return verb.core.Mat.mult(A, B);
}

// Solve A·X = B for X where B has multiple columns — loop Mat.solve per column.
function solveMulti(A: Matrix, B: Matrix): Matrix {
  const n = A.length;
  const m = B[0].length;
  const X: Matrix = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let c = 0; c < m; c++) {
    const rhs = B.map(row => row[c]);
    const x = verb.core.Mat.solve(A, rhs);
    for (let r = 0; r < n; r++) X[r][c] = x[r];
  }
  return X;
}

function fitConformedCps(rest: RestCylinder): Vec3[][] {
  const { degreeU, degreeV, knotsU, knotsV, restCps } = rest;
  const numCpU = restCps.length;
  const numCpV = restCps[0].length;

  // Parameter grids spanning the surface domain.
  const uMin = knotsU[0], uMax = knotsU[knotsU.length - 1];
  const vMin = knotsV[0], vMax = knotsV[knotsV.length - 1];
  const us: number[] = [];
  const vs: number[] = [];
  for (let i = 0; i < NUM_SAMPLES_U; i++) {
    us.push(uMin + (uMax - uMin) * i / (NUM_SAMPLES_U - 1));
  }
  for (let j = 0; j < NUM_SAMPLES_V; j++) {
    vs.push(vMin + (vMax - vMin) * j / (NUM_SAMPLES_V - 1));
  }

  // Clamp param values a hair off the boundary to avoid knot-span edge cases.
  const eps = 1e-9;
  const usSafe = us.map(u => Math.min(uMax - eps, Math.max(uMin + eps, u)));
  const vsSafe = vs.map(v => Math.min(vMax - eps, Math.max(vMin + eps, v)));

  // Sample the rest surface, snap inside-sphere samples to sphere surface.
  const restSrf = buildNurbsSurface(rest, restCps).asNurbs();
  const targetX: Matrix = [];
  const targetY: Matrix = [];
  const targetZ: Matrix = [];
  for (let i = 0; i < usSafe.length; i++) {
    const rowX = new Array(vsSafe.length);
    const rowY = new Array(vsSafe.length);
    const rowZ = new Array(vsSafe.length);
    for (let j = 0; j < vsSafe.length; j++) {
      const p = verb.eval.Eval.rationalSurfacePoint(restSrf, usSafe[i], vsSafe[j]) as Vec3;
      const [snapped] = snapToSphereIfInside(p, SPHERE_CENTER, SPHERE_RADIUS);
      rowX[j] = snapped[0]; rowY[j] = snapped[1]; rowZ[j] = snapped[2];
    }
    targetX.push(rowX); targetY.push(rowY); targetZ.push(rowZ);
  }

  // Basis matrices. Bu: (NU × numCpU), Bv: (NV × numCpV).
  const Bu = basisMatrix(usSafe, degreeU, knotsU, numCpU);
  const Bv = basisMatrix(vsSafe, degreeV, knotsV, numCpV);

  // Normal equations: (Bu^T Bu) X (Bv^T Bv) = Bu^T P Bv.
  // Solve NU · Y = Bu^T P first (Y = X · (Bv^T Bv)), then solve (Bv^T Bv)^T · X^T = Y^T.
  const BuT = transpose(Bu);
  const BvT = transpose(Bv);
  const NU = matmul(BuT, Bu);
  const NV = matmul(BvT, Bv);

  const solveCoord = (P: Matrix): Matrix => {
    // RHS = Bu^T · P · Bv ; dims (numCpU × numCpV)
    const rhs = matmul(matmul(BuT, P), Bv);
    // First solve NU · Y = rhs for Y (numCpU × numCpV).
    const Y = solveMulti(NU, rhs);
    // Then solve X · NV = Y  →  NV^T · X^T = Y^T.
    const Xt = solveMulti(transpose(NV), transpose(Y));
    return transpose(Xt);
  };

  const cpX = solveCoord(targetX);
  const cpY = solveCoord(targetY);
  const cpZ = solveCoord(targetZ);

  const newCps: Vec3[][] = [];
  for (let i = 0; i < numCpU; i++) {
    const row: Vec3[] = [];
    for (let j = 0; j < numCpV; j++) {
      row.push([cpX[i][j], cpY[i][j], cpZ[i][j]]);
    }
    newCps.push(row);
  }
  return newCps;
}

function Scene() {
  const { surface } = useMemo(() => {
    const rest = buildRestCylinder();
    const cps = fitConformedCps(rest);
    return { surface: buildNurbsSurface(rest, cps) };
  }, []);

  return (
    <>
      <VerbSurface surface={surface} opacity={0.85} />
      <mesh position={SPHERE_CENTER}>
        <sphereGeometry args={[SPHERE_RADIUS, 48, 48]} />
        <meshStandardMaterial color="#ff6b6b" roughness={0.4} />
      </mesh>
    </>
  );
}

export default function SurfaceConformFitDemo() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute', top: 12, left: 12, padding: '8px 12px',
        background: 'rgba(0,0,0,0.55)', color: '#e0e0e0', borderRadius: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 13, pointerEvents: 'none', zIndex: 10, maxWidth: 360,
      }}>
        <div style={{ fontWeight: 500, marginBottom: 2 }}>Variant A — least-squares fit</div>
        <div style={{ opacity: 0.75 }}>
          Sample cylinder, snap inside-sphere samples onto the sphere, solve for CPs via tensor-product normal equations.
        </div>
      </div>
      <R3FLayout>
        <Scene />
      </R3FLayout>
    </div>
  );
}

