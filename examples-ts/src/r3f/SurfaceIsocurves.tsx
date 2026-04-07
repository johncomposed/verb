import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve, VerbSurface } from '../shared/R3FComponents';
import { useSampleSurface } from './Surface';

function Scene() {
  const srf = useSampleSurface();

  const isocurves = useMemo(() => {
    const uValues = verb.core.Vec.span(0, 1.0, 0.025);
    return (uValues as number[]).map((u: number) => srf.isocurve(u, true));
  }, [srf]);

  return (
    <>
      {isocurves.map((iso, i) => (
        <VerbCurve key={i} curve={iso} />
      ))}
      <VerbSurface surface={srf} />
    </>
  );
}

export default function SurfaceIsocurves() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
