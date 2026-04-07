import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve, VerbSurface } from '../shared/R3FComponents';

function Scene() {
  const { prof, srf } = useMemo(() => {
    const p = new verb.geom.BezierCurve([[0, 0, 0], [5, 10, 0], [10, 0, 0], [15, 20, 0]]);
    const s = new verb.geom.ExtrudedSurface(p, [0, 0, 10]);
    return { prof: p, srf: s };
  }, []);

  return (
    <>
      <VerbCurve curve={prof} />
      <VerbSurface surface={srf} />
    </>
  );
}

export default function ExtrudedSurfaceDemo() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
