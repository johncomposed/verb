import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve, VerbPoints } from '../shared/R3FComponents';

function Scene() {
  const { curve, divPoints } = useMemo(() => {
    const pts = [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [5, 5, 0]];
    const c = verb.geom.NurbsCurve.byPoints(pts, 3);
    const dp = c.divideByEqualArcLength(20).map((u) => c.point(u.u));
    return { curve: c, divPoints: dp };
  }, []);

  return (
    <>
      <VerbCurve curve={curve} />
      <VerbPoints points={divPoints} />
    </>
  );
}

export default function CurveDivide() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
