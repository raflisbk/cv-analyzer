import type { Group } from "three";
import type { ThreeKit } from "@/lib/three-loader";
import { BASE_HEIGHT, BODY_WIDTH } from "@/lib/landing-laptop-model";
import type { Materials } from "./materials";
import { roundedRect } from "./shapes";

type PortSpec = [
  side: -1 | 1,
  z: number,
  width: number,
  height: number,
  round?: boolean,
];

const PORTS: PortSpec[] = [
  [-1, -3, 1.1, 0.38],
  [-1, -0.4, 1.1, 0.38],
  [-1, 2.2, 1.1, 0.38],
  [1, -4.3, 1.5, 0.5],
  [1, -1.6, 2.5, 0.22],
  [1, 2.2, 0.45, 0, true],
];

function portShape(
  kit: ThreeKit,
  width: number,
  height: number,
  round?: boolean,
) {
  if (!round) {
    return roundedRect(kit, width, height, Math.min(height / 2, 0.15));
  }
  const shape = new kit.THREE.Shape();
  shape.absarc(0, 0, width / 2, 0, Math.PI * 2);
  return shape;
}

export function buildPorts(kit: ThreeKit, materials: Materials, parent: Group) {
  const { THREE } = kit;
  PORTS.forEach(([side, z, width, height, round]) => {
    const shape = portShape(kit, width, height, round);
    [
      { offset: 0, material: materials.rim, scale: 1.18 },
      { offset: 0.012, material: materials.slot, scale: 1 },
    ].forEach(({ offset, material, scale }) => {
      const geometry = new THREE.ShapeGeometry(shape);
      geometry.scale(scale, scale, 1);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.y = (side * Math.PI) / 2;
      mesh.position.set(
        side * (BODY_WIDTH / 2 + 0.006 + offset),
        BASE_HEIGHT / 2,
        z,
      );
      parent.add(mesh);
    });
  });
}
