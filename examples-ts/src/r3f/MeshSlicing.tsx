import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbSurface, VerbPolyline } from '../shared/R3FComponents';

function Scene() {
  const { srf, slicePolylines } = useMemo(() => {
    const degree = 3;
    const knots = [0, 0, 0, 0, 0.333, 0.666, 1, 1, 1, 1];
    const pts = [
      [[0, 0, -10],  [10, 0, 0],    [20, 0, 0],    [30, 0, 0],   [40, 0, 0],     [50, 0, 10]],
      [[0, -10, 0],  [10, -10, 10], [20, -10, 10],  [30, -10, 0], [40, -10, 0],   [50, -10, 0]],
      [[0, -20, 0],  [10, -20, 10], [20, -20, 10],  [30, -20, 0], [40, -20, -2],  [50, -20, -12]],
      [[0, -30, 0],  [10, -30, 0],  [20, -30, -23], [30, -30, 0], [40, -30, 0],   [50, -30, 0]],
      [[0, -40, 0],  [10, -40, 0],  [20, -40, 0],   [30, -40, 4], [40, -40, -20], [50, -40, 0]],
      [[0, -50, 12], [10, -50, 0],  [20, -50, 20],  [30, -50, 0], [50, -50, -10], [50, -50, -15]],
    ];
    const s = verb.geom.NurbsSurface.byKnotsControlPointsWeights(degree, degree, knots, knots, pts);

    const mesh = s.tessellate();
    const slices = verb.eval.Intersect.meshSlices(mesh, -15, 15, 1);

    const allPolylines: number[][][] = [];
    slices.forEach((slice) => {
      slice.forEach((polyline) => {
        allPolylines.push(polyline.map((x) => x.point));
      });
    });

    return { srf: s, slicePolylines: allPolylines };
  }, []);

  return (
    <>
      <VerbSurface surface={srf} wireframe />
      {slicePolylines.map((pts, i) => (
        <VerbPolyline key={i} points={pts} />
      ))}
    </>
  );
}

export default function MeshSlicingDemo() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
