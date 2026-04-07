import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve, VerbPoints } from '../shared/R3FComponents';

function Scene() {
  const { curve, queryPts, lines } = useMemo(() => {
    const controlPts = [[0, 0, -5], [10, 0, 0], [10, 10, -5], [0, 10, 5], [5, 5, 0]];
    const c = verb.geom.NurbsCurve.byPoints(controlPts, 3);

    const qPts: number[][] = [];
    const ls: InstanceType<typeof verb.geom.Line>[] = [];

    for (let i = -10; i < 20; i += 4) {
      for (let j = -10; j < 20; j += 4) {
        for (let k = -10; k < 20; k += 4) {
          const p0 = [i, j, k];
          qPts.push(p0);
          const closest = c.closestPoint(p0);
          ls.push(new verb.geom.Line(closest, p0));
        }
      }
    }

    return { curve: c, queryPts: qPts, lines: ls };
  }, []);

  return (
    <>
      <VerbCurve curve={curve} />
      {lines.map((line, i) => (
        <VerbCurve key={i} curve={line} color="#aaaaaa" />
      ))}
      <VerbPoints points={queryPts} />
    </>
  );
}

export default function CurveClosestPoint() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
