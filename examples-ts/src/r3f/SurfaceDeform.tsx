import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { SURFACE_DEGREE, SURFACE_KNOTS, SURFACE_CONTROL_POINTS } from '../threejs/surface';

const SPHERE_RADIUS = 8;
const INFLUENCE = 14;
const PUSH_STRENGTH = 10;
const TESS_DIVS = 32;

type Vec3 = [number, number, number];

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Build a denser rest surface once, so deformation has resolution to work with.
// Returns degrees, knots, weights, and the dehomogenized rest control points.
function buildRestSurface() {
  const base = verb.geom.NurbsSurface.byKnotsControlPointsWeights(
    SURFACE_DEGREE, SURFACE_DEGREE,
    SURFACE_KNOTS, SURFACE_KNOTS,
    SURFACE_CONTROL_POINTS,
  );
  const extraU = [0.1, 0.2, 0.45, 0.55, 0.8, 0.9];
  const extraV = [0.1, 0.2, 0.45, 0.55, 0.8, 0.9];
  let data = base.asNurbs();
  data = verb.eval.Modify.surfaceKnotRefine(data, extraU, false);
  data = verb.eval.Modify.surfaceKnotRefine(data, extraV, true);

  return {
    degreeU: data.degreeU,
    degreeV: data.degreeV,
    knotsU: data.knotsU.slice(),
    knotsV: data.knotsV.slice(),
    weights: verb.eval.Eval.weight2d(data.controlPoints),
    restCps: verb.eval.Eval.dehomogenize2d(data.controlPoints) as Vec3[][],
  };
}

function deformCps(restCps: Vec3[][], sphere: Vec3): Vec3[][] {
  const [sx, sy, sz] = sphere;
  const out: Vec3[][] = new Array(restCps.length);
  for (let i = 0; i < restCps.length; i++) {
    const row = restCps[i];
    const newRow: Vec3[] = new Array(row.length);
    for (let j = 0; j < row.length; j++) {
      const [x, y, z] = row[j];
      const dx = x - sx, dy = y - sy, dz = z - sz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const falloff = 1 - smoothstep(SPHERE_RADIUS, SPHERE_RADIUS + INFLUENCE, dist);
      if (falloff <= 0 || dist < 1e-6) {
        newRow[j] = [x, y, z];
      } else {
        const push = PUSH_STRENGTH * falloff / dist;
        newRow[j] = [x + dx * push, y + dy * push, z + dz * push];
      }
    }
    out[i] = newRow;
  }
  return out;
}

function spherePath(t: number): Vec3 {
  // Lissajous-ish sweep across the surface region.
  return [
    25 + 20 * Math.sin(t * 0.7),
    -25 + 20 * Math.cos(t * 0.5),
    5 + 6 * Math.sin(t * 1.1),
  ];
}

function Scene({ running }: { running: boolean }) {
  const rest = useMemo(() => buildRestSurface(), []);
  const elapsedRef = useRef(0);

  const geomRef = useRef(new THREE.BufferGeometry());
  const sphereRef = useRef<THREE.Mesh>(null);
  const initialSphere = useMemo<Vec3>(() => spherePath(0), []);

  const updateGeometry = useMemo(() => (sphere: Vec3) => {
    const cps = deformCps(rest.restCps, sphere);
    const homo = verb.eval.Eval.homogenize2d(cps, rest.weights);
    const data = new verb.core.NurbsSurfaceData(
      rest.degreeU, rest.degreeV, rest.knotsU, rest.knotsV, homo,
    );
    const mesh = verb.eval.Tess.rationalSurfaceNaive(data, TESS_DIVS, TESS_DIVS);
    const g = geomRef.current;
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mesh.points.flat()), 3));
    if (mesh.normals?.length) {
      g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(mesh.normals.flat()), 3));
    }
    g.setIndex(mesh.faces.flat());
    g.attributes.position.needsUpdate = true;
    if (g.attributes.normal) g.attributes.normal.needsUpdate = true;
  }, [rest]);

  // Initial geometry build.
  useEffect(() => {
    updateGeometry(initialSphere);
    if (sphereRef.current) sphereRef.current.position.set(...initialSphere);
  }, [updateGeometry, initialSphere]);

  useFrame((_, delta) => {
    if (!running) return;
    elapsedRef.current += delta;
    const sphere = spherePath(elapsedRef.current);
    if (sphereRef.current) sphereRef.current.position.set(...sphere);
    updateGeometry(sphere);
  });

  return (
    <>
      <mesh geometry={geomRef.current}>
        <meshNormalMaterial side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[SPHERE_RADIUS, 24, 24]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#441111" roughness={0.4} />
      </mesh>
    </>
  );
}

function HUD({ running }: { running: boolean }) {
  return (
    <div style={{
      position: 'absolute', top: 12, left: 12, padding: '8px 12px',
      background: 'rgba(0,0,0,0.55)', color: '#e0e0e0', borderRadius: 6,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 13, pointerEvents: 'none', zIndex: 10,
    }}>
      <div>Spacebar: {running ? 'pause' : 'play'}</div>
      <div style={{ opacity: 0.7, marginTop: 2 }}>Status: {running ? 'running' : 'paused'}</div>
    </div>
  );
}

export default function SurfaceDeformDemo() {
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setRunning((r) => !r);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <HUD running={running} />
      <R3FLayout>
        <Scene running={running} />
      </R3FLayout>
    </div>
  );
}
