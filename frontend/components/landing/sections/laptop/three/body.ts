import type { Group, Mesh } from "three";
import type { ThreeKit } from "@/lib/three-loader";
import {
  BASE_HEIGHT,
  BEVEL,
  BODY_DEPTH,
  BODY_WIDTH,
  HINGE_Z,
} from "@/lib/landing-laptop-model";
import { createGrilleTexture } from "./legend-textures";
import { KEYBOARD_WIDTH, ROWS_DEPTH } from "./keyboard-layout";
import { KEYBOARD_START_Z } from "./keyboard";
import type { Materials } from "./materials";
import { buildPorts } from "./ports";
import { extrudeBevelled, flatMesh, roundedRect } from "./shapes";

const TRACK_WIDTH = 13.6;
const TRACK_DEPTH = 8.4;

function buildTrackpad(kit: ThreeKit, materials: Materials, parent: Group) {
  const z = KEYBOARD_START_Z + ROWS_DEPTH + 0.75 + TRACK_DEPTH / 2;
  const ring = roundedRect(kit, TRACK_WIDTH + 0.22, TRACK_DEPTH + 0.22, 0.6);
  parent.add(
    flatMesh(
      kit,
      new kit.THREE.ShapeGeometry(ring),
      materials.trackRing,
      BASE_HEIGHT + 0.004,
      0,
      z,
    ),
  );
  const pad = roundedRect(kit, TRACK_WIDTH, TRACK_DEPTH, 0.55);
  const trackpad = flatMesh(
    kit,
    new kit.THREE.ShapeGeometry(pad),
    materials.trackpad.clone(),
    BASE_HEIGHT + 0.008,
    0,
    z,
  );
  parent.add(trackpad);
  return trackpad;
}

function buildGrilles(kit: ThreeKit, parent: Group) {
  const texture = createGrilleTexture(kit);
  [-1, 1].forEach((side) => {
    const material = new kit.THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const grille = flatMesh(
      kit,
      new kit.THREE.PlaneGeometry(1.5, 9.8),
      material,
      BASE_HEIGHT + 0.006,
      side * (KEYBOARD_WIDTH / 2 + 1.28),
      KEYBOARD_START_Z + 4.8,
    );
    parent.add(grille);
  });
}

function buildHinge(kit: ThreeKit, materials: Materials, parent: Group) {
  const bar = new kit.THREE.Mesh(
    new kit.RoundedBoxGeometry(BODY_WIDTH - 5.5, 0.5, 1.05, 3, 0.18),
    materials.darkMetal,
  );
  bar.position.set(0, BASE_HEIGHT + 0.05, HINGE_Z + 0.07);
  parent.add(bar);
  const barrel = new kit.THREE.Mesh(
    new kit.THREE.CylinderGeometry(0.34, 0.34, BODY_WIDTH - 7, 28),
    materials.darkMetal,
  );
  barrel.rotation.z = Math.PI / 2;
  barrel.position.set(0, BASE_HEIGHT + 0.26, HINGE_Z - 0.08);
  parent.add(barrel);
}

export function buildBody(
  kit: ThreeKit,
  materials: Materials,
  parent: Group,
): Mesh {
  const geometry = extrudeBevelled(
    kit,
    roundedRect(kit, BODY_WIDTH, BODY_DEPTH, 1.35),
    BASE_HEIGHT,
  );
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, BEVEL, 0);
  const base = new kit.THREE.Mesh(geometry, materials.body);
  base.castShadow = true;
  base.receiveShadow = true;
  parent.add(base);
  const wellShape = roundedRect(
    kit,
    KEYBOARD_WIDTH + 0.9,
    ROWS_DEPTH + 0.5,
    0.55,
  );
  parent.add(
    flatMesh(
      kit,
      new kit.THREE.ShapeGeometry(wellShape),
      materials.well,
      BASE_HEIGHT + 0.004,
      0,
      KEYBOARD_START_Z + ROWS_DEPTH / 2 - 0.1,
    ),
  );
  const notch = roundedRect(kit, 3.6, 0.55, 0.25);
  parent.add(
    flatMesh(
      kit,
      new kit.THREE.ShapeGeometry(notch),
      materials.thumbNotch,
      BASE_HEIGHT + 0.006,
      0,
      BODY_DEPTH / 2 - 0.5,
    ),
  );
  buildGrilles(kit, parent);
  buildHinge(kit, materials, parent);
  buildPorts(kit, materials, parent);
  return buildTrackpad(kit, materials, parent);
}
