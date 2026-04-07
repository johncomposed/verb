import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbSurface, VerbPolyline } from '../shared/R3FComponents';

function Scene() {
  const { srf1, srf2, polylines } = useMemo(() => {
    const profile = new verb.geom.Circle([5, 0, 0], [1, 0, 0], [0, 0, 1], 2);
    const s1 = new verb.geom.RevolvedSurface(profile, [0, 0, 0], [0, 0, 1], 2 * Math.PI);
    const s2 = new verb.geom.CylindricalSurface([-1, 0, 0], [0, 0, 1], [8, 0, 0], 16, 2);

    const tess1 = s1.tessellate();
    const tess2 = s2.tessellate();
    const res = verb.eval.Intersect.meshes(tess1, tess2);

    const pls = res.map((polyline) => polyline.map((x) => x.point));
    return { srf1: s1, srf2: s2, polylines: pls };
  }, []);

  return (
    <>
      <VerbSurface surface={srf1} wireframe />
      <VerbSurface surface={srf2} wireframe />
      {polylines.map((pts, i) => (
        <VerbPolyline key={i} points={pts} />
      ))}
    </>
  );
}

export default function MeshIntersectionDemo() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
