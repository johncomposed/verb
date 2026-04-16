import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbSurface } from '../shared/R3FComponents';
import {
  buildNurbsSurface, buildRestCylinder, buildSurfaceData,
  SPHERE_CENTER, SPHERE_RADIUS, type RestCylinder, type Vec3,
} from './_surfaceConformShared';

// Variant B: iterative CP relaxation.
// Each iteration:
//   - sample the current surface on a grid
//   - for each sample inside the sphere, record the radial overshoot
//   - for each CP, accumulate a corrective displacement from samples it
//     influences (basis-function weighted), pushing outward from the sphere
//   - apply a relaxed step (alpha < 1) and repeat

const NUM_SAMPLES_U = 50;
const NUM_SAMPLES_V = 40;
const MAX_ITERS = 25;
const STEP = 0.6;
const MARGIN = 0.02;          // target surface sits MARGIN above the sphere
const CONVERGE_EPS = 1e-3;    // stop when max penetration < this

type Basis = { span: number; N: number[] };

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function relax(rest: RestCylinder): { cps: Vec3[][]; iters: number; finalMaxPen: number } {
  const { degreeU, degreeV, knotsU, knotsV, restCps } = rest;
  const numCpU = restCps.length;
  const numCpV = restCps[0].length;

  // Deep-copy the rest CPs as our working state.
  let cps: Vec3[][] = restCps.map(row => row.map(p => [p[0], p[1], p[2]] as Vec3));

  // Precompute sample params + their basis contributions (knots are fixed).
  const uMin = knotsU[0], uMax = knotsU[knotsU.length - 1];
  const vMin = knotsV[0], vMax = knotsV[knotsV.length - 1];
  const eps = 1e-9;
  const us = Array.from({ length: NUM_SAMPLES_U },
    (_, i) => clamp(uMin + (uMax - uMin) * i / (NUM_SAMPLES_U - 1), uMin + eps, uMax - eps));
  const vs = Array.from({ length: NUM_SAMPLES_V },
    (_, j) => clamp(vMin + (vMax - vMin) * j / (NUM_SAMPLES_V - 1), vMin + eps, vMax - eps));

  const basisU: Basis[] = us.map(u => {
    const span = verb.eval.Eval.knotSpan(degreeU, u, knotsU);
    const N = verb.eval.Eval.basisFunctionsGivenKnotSpanIndex(span, u, degreeU, knotsU);
    return { span, N };
  });
  const basisV: Basis[] = vs.map(v => {
    const span = verb.eval.Eval.knotSpan(degreeV, v, knotsV);
    const N = verb.eval.Eval.basisFunctionsGivenKnotSpanIndex(span, v, degreeV, knotsV);
    return { span, N };
  });

  let finalMaxPen = Infinity;
  let iter = 0;
  for (; iter < MAX_ITERS; iter++) {
    const data = buildSurfaceData(rest, cps);

    // Correction accumulators per CP.
    const dx: number[][] = Array.from({ length: numCpU }, () => new Array(numCpV).fill(0));
    const dy: number[][] = Array.from({ length: numCpU }, () => new Array(numCpV).fill(0));
    const dz: number[][] = Array.from({ length: numCpU }, () => new Array(numCpV).fill(0));
    const wSum: number[][] = Array.from({ length: numCpU }, () => new Array(numCpV).fill(0));

    let maxPen = 0;
    for (let iu = 0; iu < basisU.length; iu++) {
      const bu = basisU[iu];
      for (let iv = 0; iv < basisV.length; iv++) {
        const bv = basisV[iv];
        const p = verb.eval.Eval.rationalSurfacePoint(data, us[iu], vs[iv]) as Vec3;
        const rx = p[0] - SPHERE_CENTER[0];
        const ry = p[1] - SPHERE_CENTER[1];
        const rz = p[2] - SPHERE_CENTER[2];
        const dist = Math.sqrt(rx * rx + ry * ry + rz * rz);
        const target = SPHERE_RADIUS + MARGIN;
        const pen = target - dist;
        if (pen <= 0 || dist < 1e-9) continue;
        if (pen > maxPen) maxPen = pen;

        // Push along outward radial direction from sphere center.
        const invD = 1 / dist;
        const px = rx * invD * pen;
        const py = ry * invD * pen;
        const pz = rz * invD * pen;

        // Distribute to CPs via basis-function weights.
        for (let a = 0; a <= degreeU; a++) {
          const wu = bu.N[a];
          if (wu === 0) continue;
          const ci = bu.span - degreeU + a;
          for (let b = 0; b <= degreeV; b++) {
            const wv = bv.N[b];
            if (wv === 0) continue;
            const cj = bv.span - degreeV + b;
            const w = wu * wv;
            dx[ci][cj] += w * px;
            dy[ci][cj] += w * py;
            dz[ci][cj] += w * pz;
            wSum[ci][cj] += w;
          }
        }
      }
    }

    finalMaxPen = maxPen;
    if (maxPen < CONVERGE_EPS) break;

    // Apply averaged, relaxed displacement.
    for (let i = 0; i < numCpU; i++) {
      for (let j = 0; j < numCpV; j++) {
        const s = wSum[i][j];
        if (s === 0) continue;
        cps[i][j] = [
          cps[i][j][0] + STEP * dx[i][j] / s,
          cps[i][j][1] + STEP * dy[i][j] / s,
          cps[i][j][2] + STEP * dz[i][j] / s,
        ];
      }
    }
  }

  return { cps, iters: iter + 1, finalMaxPen };
}

const solved = (() => {
  // Kick off computation once per module load so the HUD can display stats.
  // (Component body reuses `useMemo`; this is only a cache convenience.)
  let cache: { surface: ReturnType<typeof buildNurbsSurface>; iters: number; maxPen: number } | null = null;
  return () => {
    if (!cache) {
      const rest = buildRestCylinder();
      const { cps, iters, finalMaxPen } = relax(rest);
      cache = { surface: buildNurbsSurface(rest, cps), iters, maxPen: finalMaxPen };
    }
    return cache;
  };
})();

function Scene() {
  const { surface } = useMemo(() => solved(), []);
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

export default function SurfaceConformIterDemo() {
  const { iters, maxPen } = solved();
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute', top: 12, left: 12, padding: '8px 12px',
        background: 'rgba(0,0,0,0.55)', color: '#e0e0e0', borderRadius: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 13, pointerEvents: 'none', zIndex: 10, maxWidth: 360,
      }}>
        <div style={{ fontWeight: 500, marginBottom: 2 }}>Variant B — iterative relaxation</div>
        <div style={{ opacity: 0.75, marginBottom: 4 }}>
          Repeatedly sample the surface, push CPs outward proportional to the basis functions at each penetrating sample, until the surface clears the sphere by a small margin.
        </div>
        <div style={{ opacity: 0.6, fontSize: 12 }}>
          Converged in {iters} iters · max residual penetration {maxPen.toFixed(4)}
        </div>
      </div>
      <R3FLayout>
        <Scene />
      </R3FLayout>
    </div>
  );
}
