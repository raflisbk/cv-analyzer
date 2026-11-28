import type {
  Mesh,
  Shape,
  ExtrudeGeometry,
  BufferGeometry,
  Material,
} from "three";
import type { ThreeKit } from "@/lib/three-loader";
import { BEVEL } from "@/lib/landing-laptop-model";

export function roundedRect(
  { THREE }: ThreeKit,
  width: number,
  height: number,
  radius: number,
): Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const half = Math.PI / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.absarc(x + width - radius, y + radius, radius, -half, 0);
  shape.lineTo(x + width, y + height - radius);
  shape.absarc(x + width - radius, y + height - radius, radius, 0, half);
  shape.lineTo(x + radius, y + height);
  shape.absarc(x + radius, y + height - radius, radius, half, Math.PI);
  shape.lineTo(x, y + radius);
  shape.absarc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
  return shape;
}

export function extrudeBevelled(
  { THREE }: ThreeKit,
  shape: Shape,
  depth: number,
): ExtrudeGeometry {
  return new THREE.ExtrudeGeometry(shape, {
    depth: depth - 2 * BEVEL,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelOffset: -BEVEL,
    bevelSegments: 5,
    curveSegments: 32,
  });
}

export function flatMesh(
  { THREE }: ThreeKit,
  geometry: BufferGeometry,
  material: Material,
  y: number,
  x = 0,
  z = 0,
): Mesh {
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  return mesh;
}
