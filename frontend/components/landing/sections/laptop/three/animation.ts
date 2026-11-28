import type {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PointLight,
  ShadowMaterial,
} from "three";
import { BASE_HEIGHT } from "@/lib/landing-laptop-model";
import { legendGlow, screenState } from "@/lib/landing-laptop-screen-state";
import {
  clickState,
  lidAngleDegrees,
  lightAmount,
  seg,
  typingState,
  TYPED_TEXT,
  zoomAmount,
} from "@/lib/landing-laptop-timeline";
import type { KeyEntry } from "./keyboard";
import { SHADOW_OPACITY } from "./lighting";

const KEY_TRAVEL = 0.13;
const TRACKPAD_TRAVEL = 0.05;

export interface AnimatedParts {
  lid: Group;
  keys: KeyEntry[];
  legendMaterials: MeshBasicMaterial[];
  ledMaterial: MeshBasicMaterial;
  trackpad: Mesh;
  screenLight: PointLight;
  ground: Mesh;
  drawScreen: (state: ReturnType<typeof screenState>) => void;
}

export function keysForText(keys: KeyEntry[]) {
  const space = keys.find((key) => key.label === " ");
  return TYPED_TEXT.split("").map(
    (char) => (char !== " " && keys.find((key) => key.label === char)) || space,
  );
}

function pressKeys(pressKeyEntries: (KeyEntry | undefined)[], held: number) {
  pressKeyEntries.forEach((key, index) => {
    if (key) {
      key.group.position.y = BASE_HEIGHT - (index === held ? KEY_TRAVEL : 0);
    }
  });
}

function pressTrackpad(trackpad: Mesh, pressed: boolean) {
  trackpad.position.y = BASE_HEIGHT + 0.008 - (pressed ? TRACKPAD_TRAVEL : 0);
  const material = trackpad.material as MeshPhysicalMaterial;
  material.emissive.setRGB(pressed ? 0.25 : 0, pressed ? 0.06 : 0, 0);
}

export function applyProgress(
  parts: AnimatedParts,
  textKeys: (KeyEntry | undefined)[],
  progress: number,
) {
  const zoom = zoomAmount(progress);
  const light = lightAmount(progress);
  parts.lid.rotation.x = (lidAngleDegrees(progress) * Math.PI) / 180;
  (parts.ground.material as ShadowMaterial).opacity =
    SHADOW_OPACITY * (1 - zoom);
  parts.screenLight.intensity = 170 * light * (1 - zoom * 0.6);
  parts.legendMaterials.forEach((material) => {
    material.opacity = legendGlow(progress);
  });
  parts.ledMaterial.opacity = seg(progress, 0.47, 0.5);
  pressKeys(textKeys, typingState(progress).held);
  pressTrackpad(parts.trackpad, clickState(progress).pressed);
  parts.drawScreen(screenState(progress));
}
