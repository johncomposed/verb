import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbSurface } from '../shared/R3FComponents';
import { SURFACE_DEGREE, SURFACE_KNOTS, SURFACE_CONTROL_POINTS } from '../threejs/surface';

export function useSampleSurface() {
  return useMemo(
    () =>
      verb.geom.NurbsSurface.byKnotsControlPointsWeights(
        SURFACE_DEGREE, SURFACE_DEGREE,
        SURFACE_KNOTS, SURFACE_KNOTS,
        SURFACE_CONTROL_POINTS
      ),
    []
  );
}

function Scene() {
  const srf = useSampleSurface();
  return <VerbSurface surface={srf} />;
}

export default function SurfaceDemo() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
