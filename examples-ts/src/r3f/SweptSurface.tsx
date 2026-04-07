import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve, VerbSurface } from '../shared/R3FComponents';

function Scene() {
  const { rail, prof, srf } = useMemo(() => {
    const r = new verb.geom.BezierCurve([[0, 0, 0], [10, 5, 10], [20, 10, 10]]);
    const p = new verb.geom.BezierCurve([[0, 0, 0], [10, 10, 0], [20, 0, 0]]);
    const s = new verb.geom.SweptSurface(p, r);
    return { rail: r, prof: p, srf: s };
  }, []);

  return (
    <>
      <VerbCurve curve={rail} />
      <VerbCurve curve={prof} />
      <VerbSurface surface={srf} />
    </>
  );
}

export default function SweptSurfaceDemo() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
