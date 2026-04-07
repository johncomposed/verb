import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve } from '../shared/R3FComponents';

function Scene() {
  const curves = useMemo(() => ({
    arc: new verb.geom.Arc([0, 0, 0], [1, 0, 0], [0, 1, 0], 5, 0, (3 * Math.PI) / 2),
    circle: new verb.geom.Circle([12, 0, 0], [1, 0, 0], [0, 1, 0], 5),
    ellipse: new verb.geom.Ellipse([24, 0, 0], [5, 0, 0], [0, 2, 0]),
    ellipseArc: new verb.geom.EllipseArc([36, 0, 0], [5, 0, 0], [0, 2, 0], 0, (3 * Math.PI) / 2),
    parabola: new verb.geom.BezierCurve([[43, 5, 0], [48, -10, 0], [51, 5, 0]]),
  }), []);

  return (
    <>
      <VerbCurve curve={curves.circle} />
      <VerbCurve curve={curves.arc} />
      <VerbCurve curve={curves.ellipse} />
      <VerbCurve curve={curves.ellipseArc} />
      <VerbCurve curve={curves.parabola} />
    </>
  );
}

export default function Conics() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
