import { useMemo } from 'react';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbSurface } from '../shared/R3FComponents';
import { useSampleSurface } from './Surface';
import { mergeSplitSurfaces } from '../threejs/surfaceMerge';

function Scene() {
  const srf = useSampleSurface();
  const { left, right, merged } = useMemo(() => {
    const [l, r] = srf.split(0.75, true);
    return { left: l, right: r, merged: mergeSplitSurfaces(l, r, true) };
  }, [srf]);

  return (
    <>
      <VerbSurface surface={left} opacity={0.8} />
      <VerbSurface surface={right} useNormalMaterial={false} color="#ffffff" wireframe />
      <group position={[70, 0, 0]}>
        <VerbSurface surface={merged} opacity={1} transparent={false} />
      </group>
    </>
  );
}

export default function SurfaceMergeDemo() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
