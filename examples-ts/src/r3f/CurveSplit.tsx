import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve } from '../shared/R3FComponents';

function Scene() {
  const parts = useMemo(() => {
    const pts = [[-10, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [5, 5, 0]];
    const interpCurve = verb.geom.NurbsCurve.byPoints(pts, 3);
    return interpCurve.split(0.4);
  }, []);

  return (
    <>
      <VerbCurve curve={parts[0]} color="#00aaaa" />
      <VerbCurve curve={parts[1]} color="#aaaa00" />
    </>
  );
}

export default function CurveSplit() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
