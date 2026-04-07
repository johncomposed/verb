import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve, VerbSurface } from '../shared/R3FComponents';

function Scene() {
  const { srf1, srf2, intersections } = useMemo(() => {
    const degree = 3;
    const knots = [0, 0, 0, 0, 0.333, 0.666, 1, 1, 1, 1];
    const pts = [
      [[0, 0, -10],  [10, 0, 0],    [20, 0, 0],   [30, 0, 0],   [40, 0, 0],    [50, 0, 9]],
      [[0, -10, 0],  [10, -10, 10], [20, -10, 10], [30, -10, 0], [40, -10, 0],  [50, -10, 0]],
      [[0, -20, 0],  [10, -20, 10], [20, -20, 10], [30, -20, 0], [40, -20, -2], [50, -20, 0]],
      [[0, -30, 0],  [10, -30, 0],  [20, -30, 0],  [30, -30, 0], [40, -30, 0],  [50, -30, 0]],
      [[0, -40, 0],  [10, -40, 0],  [20, -40, 0],  [30, -40, 4], [40, -40, -20],[50, -40, 0]],
      [[0, -50, 12], [10, -50, 0],  [20, -50, 0],  [30, -50, 0], [50, -50, 0],  [50, -50, 15]],
    ];
    const s1 = verb.geom.NurbsSurface.byKnotsControlPointsWeights(degree, degree, knots, knots, pts);
    const s2 = verb.geom.NurbsSurface.byCorners(
      [50, -50, 3], [50, 0, 3], [0, 0, 3], [0, -50, 5]
    );
    const ix = verb.geom.Intersect.surfaces(s1, s2, 1e-6);
    return { srf1: s1, srf2: s2, intersections: ix };
  }, []);

  return (
    <>
      <VerbSurface surface={srf1} />
      <VerbSurface surface={srf2} />
      {intersections.map((curve, i) => (
        <VerbCurve key={i} curve={curve} />
      ))}
    </>
  );
}

export default function SurfaceIntersectionDemo() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
