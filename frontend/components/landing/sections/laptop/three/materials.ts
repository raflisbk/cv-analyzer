import type { ThreeKit } from "@/lib/three-loader";

export function createMaterials({ THREE }: ThreeKit) {
  return {
    body: new THREE.MeshPhysicalMaterial({
      color: 0xf2330a,
      metalness: 0.78,
      roughness: 0.4,
      clearcoat: 0.35,
      clearcoatRoughness: 0.35,
      envMapIntensity: 1.1,
    }),
    darkMetal: new THREE.MeshStandardMaterial({
      color: 0x1a0d0a,
      metalness: 0.9,
      roughness: 0.38,
    }),
    blackGlass: new THREE.MeshPhysicalMaterial({
      color: 0x050506,
      roughness: 0.12,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
    cap: new THREE.MeshStandardMaterial({
      color: 0x120d0d,
      roughness: 0.5,
      metalness: 0.1,
    }),
    well: new THREE.MeshStandardMaterial({
      color: 0x08060a,
      roughness: 0.7,
      metalness: 0.2,
    }),
    trackRing: new THREE.MeshStandardMaterial({
      color: 0x7a1300,
      metalness: 0.6,
      roughness: 0.5,
    }),
    trackpad: new THREE.MeshPhysicalMaterial({
      color: 0xea3512,
      metalness: 0.4,
      roughness: 0.8,
      clearcoat: 0,
    }),
    thumbNotch: new THREE.MeshStandardMaterial({
      color: 0x8a1800,
      roughness: 0.6,
      metalness: 0.5,
    }),
    slot: new THREE.MeshStandardMaterial({
      color: 0x050303,
      metalness: 0.8,
      roughness: 0.3,
    }),
    rim: new THREE.MeshStandardMaterial({
      color: 0xffb8a0,
      metalness: 1,
      roughness: 0.25,
    }),
    touchRing: new THREE.MeshStandardMaterial({
      color: 0x3a2a26,
      metalness: 1,
      roughness: 0.3,
    }),
    notch: new THREE.MeshBasicMaterial({ color: 0x050506 }),
    lens: new THREE.MeshBasicMaterial({ color: 0x23201f }),
  };
}

export type Materials = ReturnType<typeof createMaterials>;
