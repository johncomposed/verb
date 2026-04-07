import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve, VerbPoints } from '../shared/R3FComponents';

function Scene() {
  const pts = useMemo(() => [[-10, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [5, 5, 0]], []);
  const curve = useMemo(() => verb.geom.NurbsCurve.byPoints(pts, 3), [pts]);

  return (
    <>
      <VerbCurve curve={curve} />
      <VerbPoints points={pts} />
    </>
  );
}

export default function CurveByPointInterpolation() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
