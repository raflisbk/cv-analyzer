import type { Group, MeshBasicMaterial } from "three";
import type { ThreeKit } from "@/lib/three-loader";
import { BASE_HEIGHT, BODY_DEPTH } from "@/lib/landing-laptop-model";
import { createLegendCache, type LegendKind } from "./legend-textures";
import { KEYBOARD_WIDTH, KEY_ROWS, UNIT } from "./keyboard-layout";
import type { Materials } from "./materials";

export const KEYBOARD_START_Z = -BODY_DEPTH / 2 + 1.95;
const CAP_LIFT = -0.03;
const LEGEND_LIFT = 0.222;

export interface KeyEntry {
  group: Group;
  label: string;
}

type KeyKind = LegendKind | "touch";
type AddKey = (
  label: string,
  kind: KeyKind,
  x: number,
  z: number,
  width: number,
  depth: number,
) => void;

function createKeyFactory(kit: ThreeKit, materials: Materials, parent: Group) {
  const { THREE, RoundedBoxGeometry } = kit;
  const legend = createLegendCache(kit);
  const capGeometries = new Map<
    string,
    InstanceType<typeof RoundedBoxGeometry>
  >();
  const keys: KeyEntry[] = [];
  const legendMaterials: MeshBasicMaterial[] = [];

  const capGeometry = (width: number, depth: number) => {
    const id = `${width.toFixed(2)}x${depth.toFixed(2)}`;
    if (!capGeometries.has(id)) {
      capGeometries.set(
        id,
        new RoundedBoxGeometry(width, 0.46, depth, 3, 0.15),
      );
    }
    return capGeometries.get(id)!;
  };

  const addLegend = (
    group: Group,
    label: string,
    kind: LegendKind,
    width: number,
    depth: number,
  ) => {
    const material = new THREE.MeshBasicMaterial({
      map: legend(label, kind, width, depth),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.4,
      color: new THREE.Color(1, 0.9, 0.78),
    });
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      material,
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = LEGEND_LIFT;
    group.add(plane);
    legendMaterials.push(material);
  };

  const addTouchId = (group: Group) => {
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.62, 0.12, 28),
      materials.touchRing,
    );
    ring.position.y = 0.18;
    group.add(ring);
  };

  const addKey: AddKey = (label, kind, x, z, width, depth) => {
    const group = new THREE.Group();
    group.position.set(x, BASE_HEIGHT, z);
    parent.add(group);
    const cap = new THREE.Mesh(capGeometry(width, depth), materials.cap);
    cap.position.y = CAP_LIFT;
    cap.castShadow = true;
    group.add(cap);
    keys.push({ group, label });
    if (kind === "touch") {
      addTouchId(group);
    } else {
      addLegend(group, label, kind, width, depth);
    }
  };
  return { addKey, keys, legendMaterials };
}

function layoutKeys(addKey: AddKey) {
  let rowZ = KEYBOARD_START_Z;
  KEY_ROWS.forEach((row) => {
    const centerZ = rowZ + row.depth / 2;
    let x = -KEYBOARD_WIDTH / 2;
    row.keys.forEach(([label, span, kind = "key", shrink = 1]) => {
      const width = span * UNIT;
      const centerX = x + width / 2;
      const keyWidth = width - 0.22;
      if (kind === "ud") {
        const half = (row.cap - 0.12) / 2;
        addKey(
          "▲",
          "arrow",
          centerX,
          centerZ - half / 2 - 0.03,
          keyWidth,
          half,
        );
        addKey(
          "▼",
          "arrow",
          centerX,
          centerZ + half / 2 + 0.03,
          keyWidth,
          half,
        );
      } else {
        const offset = kind === "arrow" ? (1 - shrink) * 0.3 : 0;
        addKey(
          label,
          kind,
          centerX,
          centerZ + offset,
          keyWidth,
          row.cap * shrink,
        );
      }
      x += width;
    });
    rowZ += row.depth;
  });
}

export function buildKeyboard(
  kit: ThreeKit,
  materials: Materials,
  parent: Group,
) {
  const { addKey, keys, legendMaterials } = createKeyFactory(
    kit,
    materials,
    parent,
  );
  layoutKeys(addKey);
  return { keys, legendMaterials };
}
