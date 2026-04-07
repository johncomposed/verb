import { Link } from 'react-router-dom';

const EXAMPLES = [
  { name: 'conics', label: 'Conics (Arc, Circle, Ellipse)' },
  { name: 'curveByPointInterpolation', label: 'Curve by Point Interpolation' },
  { name: 'curveClosestPoint', label: 'Curve Closest Point' },
  { name: 'curveDivide', label: 'Curve Divide by Arc Length' },
  { name: 'curveIntersection', label: 'Curve Intersection' },
  { name: 'curveReverse', label: 'Curve Reverse' },
  { name: 'curveSplit', label: 'Curve Split' },
  { name: 'cylindricalSurface', label: 'Cylindrical Surface' },
  { name: 'extrudedSurface', label: 'Extruded Surface' },
  { name: 'loftedSurface', label: 'Lofted Surface' },
  { name: 'meshIntersection', label: 'Mesh Intersection' },
  { name: 'meshSlicing', label: 'Mesh Slicing' },
  { name: 'revolvedSurface', label: 'Revolved Surface' },
  { name: 'surface', label: 'NURBS Surface' },
  { name: 'surfaceAdaptiveTessellation', label: 'Surface Adaptive Tessellation' },
  { name: 'surfaceBoundaries', label: 'Surface Boundaries' },
  { name: 'surfaceClosestPoint', label: 'Surface Closest Point' },
  { name: 'surfaceIntersection', label: 'Surface Intersection' },
  { name: 'surfaceIsocurves', label: 'Surface Isocurves' },
  { name: 'surfaceSplit', label: 'Surface Split' },
  { name: 'sweptSurface', label: 'Swept Surface' },
];

export function App() {
  return (
    <div style={{
      minHeight: '100%',
      background: '#1a1a2e',
      color: '#e0e0e0',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ color: '#fff', marginBottom: 8, fontSize: 28 }}>
          verb-nurbs Examples
        </h1>
        <p style={{ color: '#aaa', marginBottom: 32, fontSize: 14 }}>
          TypeScript demos using Three.js and React Three Fiber. Each example is available in both plain Three.js and R3F versions.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
          {EXAMPLES.map(({ name, label }) => (
            <div
              key={name}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: '14px 18px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                {label}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link
                  to={`/threejs/${name}`}
                  style={{
                    color: '#6ec6ff',
                    textDecoration: 'none',
                    fontSize: 13,
                    padding: '4px 10px',
                    background: 'rgba(110,198,255,0.1)',
                    borderRadius: 4,
                    border: '1px solid rgba(110,198,255,0.2)',
                  }}
                >
                  Three.js
                </Link>
                <Link
                  to={`/r3f/${name}`}
                  style={{
                    color: '#a5d6a7',
                    textDecoration: 'none',
                    fontSize: 13,
                    padding: '4px 10px',
                    background: 'rgba(165,214,167,0.1)',
                    borderRadius: 4,
                    border: '1px solid rgba(165,214,167,0.2)',
                  }}
                >
                  React Three Fiber
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
