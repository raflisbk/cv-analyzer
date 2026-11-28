import type { CanvasTexture, Group, MeshBasicMaterial } from "three";
import type { ThreeKit } from "@/lib/three-loader";
import {
  BODY_WIDTH,
  DISPLAY_BOTTOM,
  DISPLAY_CENTER_Y,
  DISPLAY_HEIGHT,
  DISPLAY_WIDTH,
  HINGE_Y,
  HINGE_Z,
  LID_HEIGHT,
  LID_THICKNESS,
  BEVEL,
} from "@/lib/landing-laptop-model";
import { crispTexture } from "./legend-textures";
import type { Materials } from "./materials";
import { extrudeBevelled, roundedRect } from "./shapes";

const FRONT = 0.004;

function logoTexture(kit: ThreeKit) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#fff";
    context.lineWidth = 30;
    context.beginPath();
    context.moveTo(50, 205);
    context.bezierCurveTo(85, 195, 90, 150, 125, 140);
    context.bezierCurveTo(165, 128, 150, 92, 192, 72);
    context.stroke();
    context.fillStyle = "#f2ff00";
    context.beginPath();
    context.arc(204, 58, 28, 0, 7);
    context.fill();
  }
  return crispTexture(kit, canvas);
}

function buildCamera(kit: ThreeKit, materials: Materials, lid: Group) {
  const { THREE } = kit;
  const top = DISPLAY_BOTTOM + DISPLAY_HEIGHT;
  const centerY = (top + LID_HEIGHT) / 2;
  const notch = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(kit, 5.4, 0.95, 0.4)),
    materials.notch,
  );
  notch.position.set(0, centerY, FRONT * 3);
  lid.add(notch);
  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(0.14, 20),
    materials.lens,
  );
  lens.position.set(0, centerY, FRONT * 4);
  lid.add(lens);
  const ledMaterial = new THREE.MeshBasicMaterial({
    color: 0x54ff7a,
    transparent: true,
    opacity: 0,
    toneMapped: false,
  });
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), ledMaterial);
  led.position.set(0.55, centerY, FRONT * 4);
  lid.add(led);
  return ledMaterial;
}

export function buildLid(
  kit: ThreeKit,
  materials: Materials,
  parent: Group,
  screenTexture: CanvasTexture,
): { lid: Group; ledMaterial: MeshBasicMaterial } {
  const { THREE } = kit;
  const lid = new THREE.Group();
  lid.position.set(0, HINGE_Y, HINGE_Z);
  parent.add(lid);
  const shell = extrudeBevelled(
    kit,
    roundedRect(kit, BODY_WIDTH, LID_HEIGHT, 1.35),
    LID_THICKNESS,
  );
  shell.translate(0, LID_HEIGHT / 2, -(LID_THICKNESS - BEVEL));
  const shellMesh = new THREE.Mesh(shell, materials.body);
  shellMesh.castShadow = true;
  lid.add(shellMesh);
  const glassShape = roundedRect(
    kit,
    BODY_WIDTH - 0.34,
    LID_HEIGHT - 0.34,
    1.0,
  );
  const glassGeometry = new THREE.ShapeGeometry(glassShape);
  glassGeometry.translate(0, LID_HEIGHT / 2, 0);
  const glass = new THREE.Mesh(glassGeometry, materials.blackGlass);
  glass.position.z = FRONT;
  lid.add(glass);
  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(DISPLAY_WIDTH, DISPLAY_HEIGHT),
    new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false }),
  );
  display.position.set(0, DISPLAY_CENTER_Y, FRONT * 2);
  lid.add(display);
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 4.6),
    new THREE.MeshStandardMaterial({
      map: logoTexture(kit),
      transparent: true,
      metalness: 0.5,
      roughness: 0.18,
    }),
  );
  logo.rotation.y = Math.PI;
  logo.position.set(0, LID_HEIGHT / 2, -LID_THICKNESS - FRONT);
  lid.add(logo);
  return { lid, ledMaterial: buildCamera(kit, materials, lid) };
}
