import type { Scene } from "three";
import type { ThreeKit } from "@/lib/three-loader";

export const SHADOW_OPACITY = 0.34;

export function buildLighting(kit: ThreeKit, scene: Scene, compact: boolean) {
  const { THREE } = kit;
  const sun = new THREE.DirectionalLight(0xfff1e6, 1.6);
  sun.position.set(-26, 46, 30);
  sun.castShadow = true;
  const size = compact ? 1024 : 2048;
  sun.shadow.mapSize.set(size, size);
  Object.assign(sun.shadow.camera, {
    left: -30,
    right: 30,
    top: 30,
    bottom: -30,
    near: 20,
    far: 120,
  });
  sun.shadow.radius = 9;
  sun.shadow.blurSamples = 20;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.12;
  scene.add(sun);
  const screenLight = new THREE.PointLight(0xffe6cc, 0, 70, 1.6);
  screenLight.position.set(0, 10, -3);
  scene.add(screenLight);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 260),
    new THREE.ShadowMaterial({ opacity: SHADOW_OPACITY }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  return { sun, screenLight, ground };
}

export function buildEnvironment(
  kit: ThreeKit,
  renderer: import("three").WebGLRenderer,
  scene: Scene,
) {
  const pmrem = new kit.THREE.PMREMGenerator(renderer);
  const room = new kit.RoomEnvironment();
  const target = pmrem.fromScene(room, 0.04);
  scene.environment = target.texture;
  scene.environmentIntensity = 0.55;
  room.traverse((object) => {
    const mesh = object as import("three").Mesh;
    mesh.geometry?.dispose();
    (mesh.material as import("three").Material | undefined)?.dispose();
  });
  pmrem.dispose();
  return target;
}
