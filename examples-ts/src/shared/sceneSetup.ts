import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
}

/**
 * Creates a standard three.js scene with camera, renderer, lights, and OrbitControls.
 */
export function createScene(container: HTMLElement): SceneContext {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(30, -30, 10);
  camera.up.set(0, 0, 1);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xbbbbbb);
  scene.add(ambientLight);

  const lights = [
    new THREE.PointLight(0xececec, 0.25),
    new THREE.PointLight(0xececec, 0.25),
    new THREE.PointLight(0xececec, 0.25),
  ];
  lights[0].position.set(0, 100, 0);
  lights[1].position.set(100, 200, 100);
  lights[2].position.set(-100, -200, -100);
  lights.forEach((l) => scene.add(l));

  const controls = new OrbitControls(camera, renderer.domElement);

  // Handle resize
  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', onResize);

  return { scene, camera, renderer, controls };
}

/**
 * Starts the animation loop.
 */
export function startRenderLoop(ctx: SceneContext): void {
  const { scene, camera, renderer, controls } = ctx;
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

/**
 * Adds a NURBS curve geometry to the scene as a line.
 */
export function addCurve(
  scene: THREE.Scene,
  geometry: THREE.BufferGeometry,
  color: number = 0xdcdcdc
): THREE.Line {
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  return line;
}

/**
 * Adds a NURBS surface geometry to the scene as a mesh.
 */
export function addMesh(
  scene: THREE.Scene,
  geometry: THREE.BufferGeometry,
  material?: THREE.Material,
  wireframe = false
): THREE.Mesh {
  const mat =
    material ??
    new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
  const mesh = new THREE.Mesh(geometry, mat);
  scene.add(mesh);

  if (wireframe) {
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const wireMesh = new THREE.Mesh(geometry, wireMat);
    scene.add(wireMesh);
  }

  return mesh;
}

/**
 * Adds points to the scene as a point cloud.
 */
export function addPoints(
  scene: THREE.Scene,
  geometry: THREE.BufferGeometry,
  color: number = 0xffffff,
  size: number = 6.5
): THREE.Points {
  const material = new THREE.PointsMaterial({
    size,
    sizeAttenuation: false,
    color,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points;
}
