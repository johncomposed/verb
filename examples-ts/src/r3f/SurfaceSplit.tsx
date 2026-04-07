import { useMemo } from 'react';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbSurface } from '../shared/R3FComponents';
import { useSampleSurface } from './Surface';

function Scene() {
  const srf = useSampleSurface();
  const split = useMemo(() => srf.split(0.75, true), [srf]);

  return (
    <>
      <VerbSurface surface={split[0]} opacity={0.8} />
      <VerbSurface surface={split[1]} useNormalMaterial={false} color="#ffffff" wireframe />
    </>
  );
}

export default function SurfaceSplitDemo() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
