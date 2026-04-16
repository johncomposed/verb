import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { ThreeJSExample } from './ThreeJSExample';

// R3F examples (lazy loaded)
const Conics = React.lazy(() => import('./r3f/Conics'));
const CurveByPointInterpolation = React.lazy(() => import('./r3f/CurveByPointInterpolation'));
const CurveClosestPoint = React.lazy(() => import('./r3f/CurveClosestPoint'));
const CurveDivide = React.lazy(() => import('./r3f/CurveDivide'));
const CurveIntersection = React.lazy(() => import('./r3f/CurveIntersection'));
const CurveReverse = React.lazy(() => import('./r3f/CurveReverse'));
const CurveSplit = React.lazy(() => import('./r3f/CurveSplit'));
const CylindricalSurface = React.lazy(() => import('./r3f/CylindricalSurface'));
const ExtrudedSurface = React.lazy(() => import('./r3f/ExtrudedSurface'));
const LoftedSurface = React.lazy(() => import('./r3f/LoftedSurface'));
const MeshIntersection = React.lazy(() => import('./r3f/MeshIntersection'));
const MeshSlicing = React.lazy(() => import('./r3f/MeshSlicing'));
const RevolvedSurface = React.lazy(() => import('./r3f/RevolvedSurface'));
const Surface = React.lazy(() => import('./r3f/Surface'));
const SurfaceAdaptiveTessellation = React.lazy(() => import('./r3f/SurfaceAdaptiveTessellation'));
const SurfaceBoundaries = React.lazy(() => import('./r3f/SurfaceBoundaries'));
const SurfaceConformFit = React.lazy(() => import('./r3f/SurfaceConformFit'));
const SurfaceConformIter = React.lazy(() => import('./r3f/SurfaceConformIter'));
const SurfaceConformTrim = React.lazy(() => import('./r3f/SurfaceConformTrim'));
const SurfaceDeform = React.lazy(() => import('./r3f/SurfaceDeform'));
const SurfaceClosestPoint = React.lazy(() => import('./r3f/SurfaceClosestPoint'));
const SurfaceIntersection = React.lazy(() => import('./r3f/SurfaceIntersection'));
const SurfaceIsocurves = React.lazy(() => import('./r3f/SurfaceIsocurves'));
const SurfaceMerge = React.lazy(() => import('./r3f/SurfaceMerge'));
const SurfaceSplit = React.lazy(() => import('./r3f/SurfaceSplit'));
const SweptSurface = React.lazy(() => import('./r3f/SweptSurface'));

const THREEJS_EXAMPLES = [
  'conics', 'curveByPointInterpolation', 'curveClosestPoint', 'curveDivide',
  'curveIntersection', 'curveReverse', 'curveSplit', 'cylindricalSurface',
  'extrudedSurface', 'loftedSurface', 'meshIntersection', 'meshSlicing',
  'revolvedSurface', 'surface', 'surfaceAdaptiveTessellation', 'surfaceBoundaries',
  'surfaceClosestPoint', 'surfaceIntersection', 'surfaceIsocurves', 'surfaceMerge',
  'surfaceSplit', 'sweptSurface',
] as const;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <React.Suspense fallback={<div style={{ padding: 20, color: '#fff', background: '#1a1a2e', height: '100%' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<App />} />
          {/* Three.js examples */}
          {THREEJS_EXAMPLES.map((name) => (
            <Route
              key={`threejs-${name}`}
              path={`/threejs/${name}`}
              element={<ThreeJSExample name={name} />}
            />
          ))}
          {/* R3F examples */}
          <Route path="/r3f/conics" element={<Conics />} />
          <Route path="/r3f/curveByPointInterpolation" element={<CurveByPointInterpolation />} />
          <Route path="/r3f/curveClosestPoint" element={<CurveClosestPoint />} />
          <Route path="/r3f/curveDivide" element={<CurveDivide />} />
          <Route path="/r3f/curveIntersection" element={<CurveIntersection />} />
          <Route path="/r3f/curveReverse" element={<CurveReverse />} />
          <Route path="/r3f/curveSplit" element={<CurveSplit />} />
          <Route path="/r3f/cylindricalSurface" element={<CylindricalSurface />} />
          <Route path="/r3f/extrudedSurface" element={<ExtrudedSurface />} />
          <Route path="/r3f/loftedSurface" element={<LoftedSurface />} />
          <Route path="/r3f/meshIntersection" element={<MeshIntersection />} />
          <Route path="/r3f/meshSlicing" element={<MeshSlicing />} />
          <Route path="/r3f/revolvedSurface" element={<RevolvedSurface />} />
          <Route path="/r3f/surface" element={<Surface />} />
          <Route path="/r3f/surfaceAdaptiveTessellation" element={<SurfaceAdaptiveTessellation />} />
          <Route path="/r3f/surfaceBoundaries" element={<SurfaceBoundaries />} />
          <Route path="/r3f/surfaceConformFit" element={<SurfaceConformFit />} />
          <Route path="/r3f/surfaceConformIter" element={<SurfaceConformIter />} />
          <Route path="/r3f/surfaceConformTrim" element={<SurfaceConformTrim />} />
          <Route path="/r3f/surfaceDeform" element={<SurfaceDeform />} />
          <Route path="/r3f/surfaceClosestPoint" element={<SurfaceClosestPoint />} />
          <Route path="/r3f/surfaceIntersection" element={<SurfaceIntersection />} />
          <Route path="/r3f/surfaceIsocurves" element={<SurfaceIsocurves />} />
          <Route path="/r3f/surfaceMerge" element={<SurfaceMerge />} />
          <Route path="/r3f/surfaceSplit" element={<SurfaceSplit />} />
          <Route path="/r3f/sweptSurface" element={<SweptSurface />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
