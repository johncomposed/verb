import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve, VerbPoints } from '../shared/R3FComponents';

function Scene() {
  const { curve1, curve2, ixPts } = useMemo(() => {
    const c1 = verb.geom.NurbsCurve.byPoints(
      [[-5, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [5, 5, 0]], 3
    );
    const c2 = verb.geom.NurbsCurve.byPoints(
      [[-5, 0, 0], [5, -1, 0], [15, 5, 0], [3, 10, 0], [5, 12, 0]], 3
    );
    const ix = verb.geom.Intersect.curves(c1, c2, 1e-5);
    return { curve1: c1, curve2: c2, ixPts: ix.map((x) => x.point0) };
  }, []);

  return (
    <>
      <VerbCurve curve={curve1} />
      <VerbCurve curve={curve2} />
      <VerbPoints points={ixPts} />
    </>
  );
}

export default function CurveIntersection() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
