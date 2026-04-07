import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve, VerbSurface } from '../shared/R3FComponents';

function Scene() {
  const { curves, srf } = useMemo(() => {
    const c0 = verb.geom.NurbsCurve.byKnotsControlPointsWeights(
      2, [0, 0, 0, 1, 1, 1], [[0, 0, 0], [10, 0, 0], [40, 0, 0]], [1, 1, 1]
    );
    const c1 = verb.geom.NurbsCurve.byKnotsControlPointsWeights(
      3, [0, 0, 0, 0, 1, 1, 1, 1], [[0, 10, 10], [10, 5, 10], [20, -5, 10], [40, 10, 10]], [1, 1, 1, 1]
    );
    const c2 = verb.geom.NurbsCurve.byKnotsControlPointsWeights(
      3, [0, 0, 0, 0, 1, 1, 1, 1], [[0, 0, 20], [10, 0, 20], [20, 5, 20], [40, 0, 20]], [1, 1, 1, 1]
    );
    const c3 = verb.geom.NurbsCurve.byKnotsControlPointsWeights(
      3, [0, 0, 0, 0, 1, 1, 1, 1], [[0, 3, 30], [10, -4, 30], [20, 10, 30], [40, 0, 30]], [1, 1, 1, 1]
    );
    const cs = [c0, c1, c2, c3];
    const s = verb.geom.NurbsSurface.byLoftingCurves(cs, 3);
    return { curves: cs, srf: s };
  }, []);

  return (
    <>
      <VerbSurface surface={srf} />
      {curves.map((c, i) => (
        <VerbCurve key={i} curve={c} />
      ))}
    </>
  );
}

export default function LoftedSurface() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
