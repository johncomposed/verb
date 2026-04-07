import { useMemo } from 'react';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve, VerbSurface } from '../shared/R3FComponents';
import { useSampleSurface } from './Surface';

function Scene() {
  const srf = useSampleSurface();
  const boundaries = useMemo(() => srf.boundaries(), [srf]);

  return (
    <>
      {boundaries.map((boundary, i) => (
        <VerbCurve key={i} curve={boundary} />
      ))}
      <VerbSurface surface={srf} />
    </>
  );
}

export default function SurfaceBoundaries() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
