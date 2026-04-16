import { useMemo } from 'react';
import * as THREE from 'three';
import verb from 'verb-nurbs';
import type { geom } from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import {
  CYLINDER_AXIS, CYLINDER_BASE, CYLINDER_HEIGHT, CYLINDER_RADIUS, CYLINDER_XAXIS,
  SPHERE_CENTER, SPHERE_RADIUS, type Vec3,
} from './_surfaceConformShared';

// Variant C: trim + patch.
// We keep cylinder and sphere as two separate NurbsSurface objects — verb has
// no trimmed-surface representation, so we fake trim visually by tessellating
// each surface and dropping triangles whose centroid lies on the wrong side
// of the other surface. The intersection curves are drawn as bright loops to
// show they actually share an edge.

const TESS_TOLERANCE = 0.05;
const INTERSECT_TOL = 1e-3;

type Tri = [number, number, number];

function centroid(points: Vec3[], tri: Tri): Vec3 {
  const a = points[tri[0]], b = points[tri[1]], c = points[tri[2]];
  return [
    (a[0] + b[0] + c[0]) / 3,
    (a[1] + b[1] + c[1]) / 3,
    (a[2] + b[2] + c[2]) / 3,
  ];
}

function insideSphere(p: Vec3, center: Vec3, radius: number): boolean {
  const dx = p[0] - center[0], dy = p[1] - center[1], dz = p[2] - center[2];
  return dx * dx + dy * dy + dz * dz < radius * radius;
}

// Z-axis cylinder test since our cylinder axis is [0,0,1].
function insideCylinder(p: Vec3, base: Vec3, height: number, radius: number): boolean {
  const z = p[2];
  if (z < base[2] || z > base[2] + height) return false;
  const dx = p[0] - base[0], dy = p[1] - base[1];
  return dx * dx + dy * dy < radius * radius;
}

function meshFromSurface(surface: geom.NurbsSurface, tolerance: number) {
  const opts = new verb.eval.AdaptiveRefinementOptions();
  opts.normTol = tolerance;
  return surface.tessellate(opts);
}

function buildTrimmedGeometry(
  mesh: { points: number[][]; normals: number[][]; faces: number[][] },
  keepTri: (centroidPt: Vec3) => boolean,
): THREE.BufferGeometry {
  const points = mesh.points as Vec3[];
  const keptFaces: Tri[] = [];
  for (const face of mesh.faces) {
    const tri = face as Tri;
    if (keepTri(centroid(points, tri))) keptFaces.push(tri);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(points.flat()), 3),
  );
  if (mesh.normals?.length) {
    geom.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(mesh.normals.flat()), 3),
    );
  }
  geom.setIndex(keptFaces.flat());
  return geom;
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

    const cylMesh = meshFromSurface(cyl, TESS_TOLERANCE);
    const sphereMesh = meshFromSurface(sphere, TESS_TOLERANCE);

    // Keep cylinder triangles that are OUTSIDE the sphere (punch a hole).
    const cylGeom = buildTrimmedGeometry(cylMesh, (c) => !insideSphere(c, SPHERE_CENTER, SPHERE_RADIUS));
    // Keep sphere triangles that are INSIDE the cylinder (cap that fills the hole).
    const sphereGeom = buildTrimmedGeometry(sphereMesh, (c) =>
      insideCylinder(c, CYLINDER_BASE, CYLINDER_HEIGHT, CYLINDER_RADIUS),
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
        <div style={{ fontWeight: 500, marginBottom: 2 }}>Variant C — trim + patch</div>
        <div style={{ opacity: 0.75 }}>
          Keep both surfaces unchanged as NurbsSurface objects. Drop cylinder triangles inside the sphere, drop sphere triangles outside the cylinder. Yellow lines are the actual surface–surface intersection curves.
        </div>
      </div>
      <R3FLayout>
        <Scene />
      </R3FLayout>
    </div>
  );
}
