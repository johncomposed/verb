import { useMemo } from 'react';
import verb from 'verb-nurbs';
import { R3FLayout } from '../shared/R3FLayout';
import { VerbCurve } from '../shared/R3FComponents';

function Scene() {
  const { c, cr, crr } = useMemo(() => {
    const original = new verb.geom.Arc([0, 0, 0], [1, 0, 0], [0, 1, 0], 20, 0, Math.PI / 2);
    const reversed = original.reverse();
    const reversedAgain = reversed.reverse();
    return { c: original, cr: reversed, crr: reversedAgain };
  }, []);

  return (
    <>
      <VerbCurve curve={c} color="#ff0000" />
      <VerbCurve curve={cr} color="#00ff00" />
      <VerbCurve curve={crr} color="#0000ff" />
    </>
  );
}

export default function CurveReverse() {
  return (
    <R3FLayout>
      <Scene />
    </R3FLayout>
  );
}
