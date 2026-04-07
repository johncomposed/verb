import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { geom, core, eval as verb_eval } from 'verb-nurbs';

/**
 * R3F component that renders a verb NurbsCurve as a line using a primitive.
 */
export function VerbCurve({
  curve,
  color = '#dcdcdc',
  tolerance,
}: {
  curve: geom.NurbsCurve;
  color?: string;
  tolerance?: number;
}) {
  const lineRef = useRef<THREE.Line>(null);

  const geometry = useMemo(() => {
    const points: core.Point[] = curve.tessellate(tolerance);
    const threePoints = points.map(
      (p) => new THREE.Vector3(p[0], p[1], p[2])
    );
    return new THREE.BufferGeometry().setFromPoints(threePoints);
  }, [curve, tolerance]);

  const material = useMemo(() => new THREE.LineBasicMaterial({ color }), [color]);

  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <primitive ref={lineRef} object={line} />;
}

/**
 * R3F component that renders a verb NurbsSurface as a mesh.
 */
export function VerbSurface({
  surface,
  options,
  color,
  wireframe = false,
  opacity = 0.4,
  transparent = true,
  useNormalMaterial = true,
}: {
  surface: geom.NurbsSurface;
  options?: verb_eval.AdaptiveRefinementOptions;
  color?: string;
  wireframe?: boolean;
  opacity?: number;
  transparent?: boolean;
  useNormalMaterial?: boolean;
}) {
  const geometry = useMemo(() => {
    const tessellated: core.MeshData = surface.tessellate(options);
    const bufferGeom = new THREE.BufferGeometry();

    if (tessellated.points?.length) {
      bufferGeom.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(tessellated.points.flat()), 3)
      );
    }
    if (tessellated.normals?.length) {
      bufferGeom.setAttribute(
        'normal',
        new THREE.BufferAttribute(new Float32Array(tessellated.normals.flat()), 3)
      );
    }
    if (tessellated.faces?.length) {
      bufferGeom.setIndex(tessellated.faces.flat());
    }
    return bufferGeom;
  }, [surface, options]);

  return (
    <>
      <mesh geometry={geometry}>
        {useNormalMaterial ? (
          <meshNormalMaterial
            side={THREE.DoubleSide}
            transparent={transparent}
            opacity={opacity}
          />
        ) : (
          <meshBasicMaterial
            color={color ?? '#ffffff'}
            side={THREE.DoubleSide}
            wireframe={wireframe}
          />
        )}
      </mesh>
      {wireframe && useNormalMaterial && (
        <mesh geometry={geometry}>
          <meshBasicMaterial
            color="#000000"
            side={THREE.DoubleSide}
            wireframe
          />
        </mesh>
      )}
    </>
  );
}

/**
 * R3F component that renders an array of points as a point cloud.
 */
export function VerbPoints({
  points,
  color = '#ffffff',
  size = 6.5,
}: {
  points: core.Point[];
  color?: string;
  size?: number;
}) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(points.flat());
    const bufferGeom = new THREE.BufferGeometry();
    bufferGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return bufferGeom;
  }, [points]);

  const material = useMemo(
    () => new THREE.PointsMaterial({ size, sizeAttenuation: false, color }),
    [size, color]
  );

  const pointsObj = useMemo(() => new THREE.Points(geometry, material), [geometry, material]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <primitive object={pointsObj} />;
}

/**
 * R3F component that renders a polyline from raw points.
 */
export function VerbPolyline({
  points,
  color = '#dcdcdc',
}: {
  points: core.Point[];
  color?: string;
}) {
  const geometry = useMemo(() => {
    const threePoints = points.map(
      (p) => new THREE.Vector3(p[0], p[1], p[2])
    );
    return new THREE.BufferGeometry().setFromPoints(threePoints);
  }, [points]);

  const material = useMemo(() => new THREE.LineBasicMaterial({ color }), [color]);

  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <primitive object={line} />;
}
