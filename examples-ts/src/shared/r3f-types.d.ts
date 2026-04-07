import { Object3DNode } from '@react-three/fiber';
import { Line as ThreeLine, Points as ThreePoints } from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    line_: Object3DNode<ThreeLine, typeof ThreeLine>;
    points_: Object3DNode<ThreePoints, typeof ThreePoints>;
  }
}
