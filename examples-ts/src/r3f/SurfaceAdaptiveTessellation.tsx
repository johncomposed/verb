import { R3FLayout } from '../shared/R3FLayout';
import { VerbSurface } from '../shared/R3FComponents';
import { useSampleSurface } from './Surface';

function Scene() {
  const srf = useSampleSurface();
  return <VerbSurface surface={srf} useNormalMaterial={false} color="#ffffff" wireframe />;
}

export default function SurfaceAdaptiveTessellation() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
