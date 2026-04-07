import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbSurface } from '../shared/R3FComponents';

function Scene() {
  const srf = useMemo(
    () => new verb.geom.CylindricalSurface([-1, 0, 0], [0, 0, 1], [8, 0, 1], 16, 2),
    []
  );

  return <VerbSurface surface={srf} />;
}

export default function CylindricalSurfaceDemo() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
