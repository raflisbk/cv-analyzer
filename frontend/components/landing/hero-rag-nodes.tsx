"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

/* RAG personalization graph — monochrome editorial style (ink on cream).
   Structure: central "You" node inside faint orbital rings; six labeled
   primary nodes (alternating ink/cream chips) connected to the center by
   dashed lines carrying retrieval pulses; each primary node has three small
   satellite dots (knowledge chunks) that slowly orbit it, tethered by
   hairlines. Mouse tilts the constellation; hovering a chip scales it and
   speeds up its pulse. Flat/unlit rendering, no color.
   Decorative only (aria-hidden); static SVG fallback for reduced-motion /
   no-WebGL. */

const INK = "#141414";
const CREAM = "#F5F2D8";

// ---------- canvas-texture helpers ----------

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeChipTexture(
  text: string,
  inverted: boolean,
): { texture: THREE.CanvasTexture; aspect: number } {
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = "900 34px Arial, sans-serif";
  const textWidth = measure.measureText(text).width;

  const w = Math.ceil(textWidth + 76);
  const h = 78;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = inverted ? INK : CREAM;
  roundedRectPath(ctx, 3, 3, w - 6, h - 6, (h - 6) / 2);
  ctx.fill();
  ctx.strokeStyle = inverted ? "rgba(245,242,216,0.25)" : "rgba(17,17,17,0.45)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = inverted ? CREAM : INK;
  ctx.font = "900 34px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, aspect: w / h };
}

function makeMiniChipTexture(text: string): {
  texture: THREE.CanvasTexture;
  aspect: number;
} {
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = "800 26px Arial, sans-serif";
  const textWidth = measure.measureText(text).width;

  const w = Math.ceil(textWidth + 48);
  const h = 54;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = CREAM;
  roundedRectPath(ctx, 2, 2, w - 4, h - 4, (h - 4) / 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(17,17,17,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(17,17,17,0.75)";
  ctx.font = "800 26px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, aspect: w / h };
}

function makeCenterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(128, 128, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(245,242,216,0.3)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = CREAM;
  ctx.font = "900 62px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("You", 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ---------- graph definition ----------

interface PrimarySpec {
  label: string;
  inverted: boolean;
  pos: [number, number, number];
  pulseSpeed: number;
}

const PRIMARY_SPECS: PrimarySpec[] = [
  {
    label: "CV Sections",
    inverted: false,
    pos: [-1.9, 1.2, -0.2],
    pulseSpeed: 0.3,
  },
  {
    label: "Job Memory",
    inverted: true,
    pos: [0.2, 1.8, 0.25],
    pulseSpeed: 0.22,
  },
  { label: "Skills", inverted: false, pos: [2.0, 1.15, 0.2], pulseSpeed: 0.26 },
  {
    label: "JD Match",
    inverted: true,
    pos: [2.1, -0.75, -0.2],
    pulseSpeed: 0.32,
  },
  {
    label: "Knowledge",
    inverted: true,
    pos: [-1.75, -1.1, 0.3],
    pulseSpeed: 0.24,
  },
  {
    label: "AI Score",
    inverted: false,
    pos: [0.5, -1.85, 0.1],
    pulseSpeed: 0.28,
  },
];

const SATELLITES_PER_NODE = 3;
const SATELLITE_COUNT = PRIMARY_SPECS.length * SATELLITES_PER_NODE;

// Deterministic pseudo-random in [0, 1)
function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface SatelliteSpec {
  parent: number;
  baseAngle: number;
  radius: number;
  orbitSpeed: number;
  scale: number;
  z: number;
}

const SATELLITE_SPECS: SatelliteSpec[] = Array.from(
  { length: SATELLITE_COUNT },
  (_, i) => {
    const parent = Math.floor(i / SATELLITES_PER_NODE);
    return {
      parent,
      baseAngle: seeded(i * 3 + 1) * Math.PI * 2,
      radius: 0.42 + seeded(i * 3 + 2) * 0.34,
      orbitSpeed: (0.06 + seeded(i * 3 + 3) * 0.14) * (i % 2 === 0 ? 1 : -1),
      scale: 0.55 + seeded(i * 7 + 5) * 0.9,
      z: (seeded(i * 5 + 4) - 0.5) * 0.3,
    };
  },
);

// Labeled sub-nodes: two concrete children per primary node, placed on the
// side of the parent facing away from the center so they never cross a spoke
const SUB_LABELS: string[][] = [
  ["Experience", "Education"], // CV Sections
  ["Edits", "Chats"], // Job Memory
  ["Python", "Figma"], // Skills
  ["Keywords", "Gaps"], // JD Match
  ["Guides", "Patterns"], // Knowledge
  ["Impact", "Clarity"], // AI Score
];

interface SubSpec {
  parent: number;
  label: string;
  pos: [number, number, number];
  phase: number;
}

const SUB_SPECS: SubSpec[] = SUB_LABELS.flatMap((labels, p) =>
  labels.map((label, k) => {
    const parent = PRIMARY_SPECS[p].pos;
    const outward = Math.atan2(parent[1], parent[0]);
    const angle =
      outward +
      (k === 0 ? 0.75 : -0.75) +
      (seeded(p * 9 + k * 4 + 13) - 0.5) * 0.4;
    const radius = 0.62 + seeded(p * 7 + k * 3 + 5) * 0.22;
    return {
      parent: p,
      label,
      // Clamp to the camera frustum so labels never clip at the edges
      pos: [
        Math.max(-2.15, Math.min(2.15, parent[0] + Math.cos(angle) * radius)),
        Math.max(
          -1.95,
          Math.min(1.95, parent[1] + Math.sin(angle) * radius * 0.85),
        ),
        parent[2] + (seeded(p + k * 11) - 0.5) * 0.2,
      ] as [number, number, number],
      phase: seeded(p * 3 + k) * Math.PI * 2,
    };
  }),
);
const SUB_COUNT = SUB_SPECS.length;

// Curved cross-links between primary nodes (knowledge-graph edges)
const CROSS_LINKS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 5],
  [5, 4],
  [4, 0],
  [1, 4],
];
const CROSS_PULSE_COUNT = 4;

// Faint background dust field with counter-parallax drift
const DUST_COUNT = 36;
const DUST_SPECS = Array.from({ length: DUST_COUNT }, (_, i) => ({
  x: (seeded(i * 11 + 3) - 0.5) * 5.4,
  y: (seeded(i * 13 + 7) - 0.5) * 4.4,
  z: -0.6 - seeded(i * 17 + 9) * 0.5,
  scale: 0.5 + seeded(i * 19 + 2),
}));

// ---------- scene ----------

function RagScene() {
  const group = useRef<THREE.Group>(null);
  const centerRef = useRef<THREE.Mesh>(null);
  const outerArcRef = useRef<THREE.Mesh>(null);
  const innerArcRef = useRef<THREE.Mesh>(null);
  const chipsRef = useRef<THREE.Group>(null);
  const pulsesRef = useRef<THREE.Group>(null);
  const crossPulsesRef = useRef<THREE.Group>(null);
  const satellitesRef = useRef<THREE.InstancedMesh>(null);
  const subsRef = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.InstancedMesh>(null);
  const dustGroupRef = useRef<THREE.Group>(null);
  const hairlinesRef = useRef<THREE.LineSegments>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const burstRef = useRef(0);
  const { viewport } = useThree();

  // The mascot waves at the graph when it walks by → everything gets excited
  useEffect(() => {
    const onGreet = () => {
      burstRef.current = 1;
    };
    window.addEventListener("pathkr:mascot-greet", onGreet);
    return () => window.removeEventListener("pathkr:mascot-greet", onGreet);
  }, []);

  const centerTexture = useMemo(() => makeCenterTexture(), []);
  const subChips = useMemo(
    () =>
      SUB_SPECS.map((spec) => ({
        ...spec,
        ...makeMiniChipTexture(spec.label),
      })),
    [],
  );
  const chips = useMemo(
    () =>
      PRIMARY_SPECS.map((spec) => ({
        ...spec,
        ...makeChipTexture(spec.label, spec.inverted),
      })),
    [],
  );

  // Static dashed spokes: primary → center (built imperatively so we can
  // call computeLineDistances(), required by LineDashedMaterial)
  const spokes = useMemo(
    () =>
      PRIMARY_SPECS.map((spec) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...spec.pos),
          new THREE.Vector3(0, 0, 0),
        ]);
        const material = new THREE.LineDashedMaterial({
          color: INK,
          transparent: true,
          opacity: 0.32,
          dashSize: 0.07,
          gapSize: 0.05,
        });
        const spokeLine = new THREE.Line(geometry, material);
        spokeLine.computeLineDistances();
        return spokeLine;
      }),
    [],
  );

  // Curved cross-links between primary nodes (static beziers bowing away
  // from the center)
  const crossCurves = useMemo(
    () =>
      CROSS_LINKS.map(([a, b], i) => {
        const start = new THREE.Vector3(...PRIMARY_SPECS[a].pos);
        const end = new THREE.Vector3(...PRIMARY_SPECS[b].pos);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const control = mid.clone().add(
          mid
            .clone()
            .normalize()
            .multiplyScalar(0.5 + seeded(i + 40) * 0.4),
        );
        control.z += (seeded(i + 60) - 0.5) * 0.6;
        return new THREE.QuadraticBezierCurve3(start, control, end);
      }),
    [],
  );
  const crossLines = useMemo(
    () =>
      crossCurves.map((curve) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(32),
        );
        const material = new THREE.LineBasicMaterial({
          color: INK,
          transparent: true,
          opacity: 0.09,
        });
        return new THREE.Line(geometry, material);
      }),
    [crossCurves],
  );

  // One shared buffer for ALL hairlines — satellite edges + sub-node edges
  // (2 vertices per edge)
  const hairlineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array((SATELLITE_COUNT + SUB_COUNT) * 2 * 3),
        3,
      ),
    );
    return geometry;
  }, []);

  useEffect(() => {
    return () => {
      centerTexture.dispose();
      chips.forEach((chip) => chip.texture.dispose());
      subChips.forEach((chip) => chip.texture.dispose());
      spokes.forEach((spokeLine) => {
        spokeLine.geometry.dispose();
        (spokeLine.material as THREE.Material).dispose();
      });
      crossLines.forEach((crossLine) => {
        crossLine.geometry.dispose();
        (crossLine.material as THREE.Material).dispose();
      });
      hairlineGeometry.dispose();
    };
  }, [centerTexture, chips, subChips, spokes, crossLines, hairlineGeometry]);

  // Static dust field transforms, set once
  useEffect(() => {
    const dust = dustRef.current;
    if (!dust) {
      return;
    }
    const dustDummy = new THREE.Object3D();
    DUST_SPECS.forEach((spec, i) => {
      dustDummy.position.set(spec.x, spec.y, spec.z);
      dustDummy.scale.setScalar(spec.scale);
      dustDummy.updateMatrix();
      dust.setMatrixAt(i, dustDummy.matrix);
    });
    dust.instanceMatrix.needsUpdate = true;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { pointer } = state;
    burstRef.current = THREE.MathUtils.damp(burstRef.current, 0, 0.7, delta);
    const burst = burstRef.current;

    if (group.current) {
      // Fit the constellation to the available column width
      const fit = THREE.MathUtils.clamp(viewport.width / 5.8, 0.55, 1);
      group.current.scale.setScalar(
        THREE.MathUtils.damp(group.current.scale.x, fit, 4, delta),
      );
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        pointer.x * 0.22 + Math.sin(t * 0.15) * 0.04,
        4,
        delta,
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        -pointer.y * 0.24,
        4,
        delta,
      );
    }

    // Center node: soft breathing; outer arc slowly sweeps
    if (centerRef.current) {
      centerRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.03);
    }
    if (outerArcRef.current) {
      outerArcRef.current.rotation.z += (0.12 + burst * 1.4) * delta;
    }
    if (innerArcRef.current) {
      innerArcRef.current.rotation.z -= (0.2 + burst * 1.0) * delta;
    }

    // Hovered chip scales up
    chipsRef.current?.children.forEach((chip, i) => {
      const target = hoveredIndex === i ? 1.12 : 1;
      chip.scale.setScalar(
        THREE.MathUtils.damp(chip.scale.x, target, 8, delta),
      );
    });

    // Retrieval pulses along the spokes
    pulsesRef.current?.children.forEach((dot, i) => {
      const spec = PRIMARY_SPECS[i];
      const speed =
        (hoveredIndex === i ? spec.pulseSpeed * 2.4 : spec.pulseSpeed) *
        (1 + burst * 2.5);
      const progress = (t * speed + i * 0.37) % 1;
      dot.position.set(
        spec.pos[0] * (1 - progress),
        spec.pos[1] * (1 - progress),
        spec.pos[2] * (1 - progress),
      );
      const material = (dot as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.opacity = Math.sin(progress * Math.PI) * 0.9;
    });

    // Slower pulses wandering along the cross-links, alternating direction
    crossPulsesRef.current?.children.forEach((dot, i) => {
      const curve = crossCurves[(i * 2 + 1) % crossCurves.length];
      const raw = (t * (0.09 + seeded(i + 21) * 0.07) + i * 0.29) % 1;
      const progress = i % 2 === 0 ? raw : 1 - raw;
      curve.getPoint(progress, tmpVec);
      dot.position.copy(tmpVec);
      const material = (dot as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.opacity = Math.sin(raw * Math.PI) * (0.45 + burst * 0.4);
    });

    // Dust field: gentle counter-parallax drift
    if (dustGroupRef.current) {
      dustGroupRef.current.position.x = THREE.MathUtils.damp(
        dustGroupRef.current.position.x,
        -pointer.x * 0.2,
        3,
        delta,
      );
      dustGroupRef.current.position.y = THREE.MathUtils.damp(
        dustGroupRef.current.position.y,
        -pointer.y * 0.15 + Math.sin(t * 0.3) * 0.05,
        3,
        delta,
      );
    }

    // Satellites orbit their parent; hairlines follow
    const satellites = satellitesRef.current;
    const positions = hairlineGeometry.attributes
      .position as THREE.BufferAttribute;
    if (satellites) {
      SATELLITE_SPECS.forEach((spec, i) => {
        const parent = PRIMARY_SPECS[spec.parent].pos;
        const angle =
          spec.baseAngle +
          t * spec.orbitSpeed +
          burst * Math.sin(t * 6 + i) * 0.12;
        const x = parent[0] + Math.cos(angle) * spec.radius;
        const y = parent[1] + Math.sin(angle) * spec.radius * 0.8;
        const z = parent[2] + spec.z;

        dummy.position.set(x, y, z);
        dummy.scale.setScalar(spec.scale);
        dummy.updateMatrix();
        satellites.setMatrixAt(i, dummy.matrix);

        positions.setXYZ(i * 2, x, y, z);
        positions.setXYZ(i * 2 + 1, parent[0], parent[1], parent[2]);
      });
      satellites.instanceMatrix.needsUpdate = true;
    }

    // Labeled sub-nodes: gentle bob, hairlines follow (same shared buffer)
    subsRef.current?.children.forEach((sub, i) => {
      const spec = SUB_SPECS[i];
      const parent = PRIMARY_SPECS[spec.parent].pos;
      const y = spec.pos[1] + Math.sin(t * 0.9 + spec.phase) * 0.035;
      sub.position.set(spec.pos[0], y, spec.pos[2]);

      const offset = (SATELLITE_COUNT + i) * 2;
      positions.setXYZ(offset, spec.pos[0], y, spec.pos[2]);
      positions.setXYZ(offset + 1, parent[0], parent[1], parent[2]);
    });
    positions.needsUpdate = true;
  });

  return (
    <group ref={group}>
      {/* Background dust field */}
      <group ref={dustGroupRef}>
        <instancedMesh ref={dustRef} args={[undefined, undefined, DUST_COUNT]}>
          <circleGeometry args={[0.02, 8]} />
          <meshBasicMaterial color={INK} transparent opacity={0.25} />
        </instancedMesh>
      </group>

      {/* Orbital rings around the center */}
      <mesh>
        <ringGeometry args={[0.6, 0.615, 64]} />
        <meshBasicMaterial
          color={INK}
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={outerArcRef}>
        <ringGeometry args={[1.05, 1.065, 64, 1, 0, 4.4]} />
        <meshBasicMaterial
          color={INK}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={innerArcRef}>
        <ringGeometry args={[0.42, 0.43, 64, 1, 0, 2.4]} />
        <meshBasicMaterial
          color={INK}
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dashed spokes: primary → center */}
      {spokes.map((spokeLine, i) => (
        <primitive key={`spoke-${i}`} object={spokeLine} />
      ))}

      {/* Curved cross-links between primary nodes */}
      {crossLines.map((crossLine, i) => (
        <primitive key={`cross-${i}`} object={crossLine} />
      ))}

      {/* Satellite hairlines (single shared buffer) */}
      <lineSegments ref={hairlinesRef}>
        <primitive object={hairlineGeometry} attach="geometry" />
        <lineBasicMaterial color={INK} transparent opacity={0.12} />
      </lineSegments>

      {/* Satellite dots (instanced) */}
      <instancedMesh
        ref={satellitesRef}
        args={[undefined, undefined, SATELLITE_COUNT]}
      >
        <circleGeometry args={[0.042, 16]} />
        <meshBasicMaterial color={INK} transparent opacity={0.55} />
      </instancedMesh>

      {/* Retrieval pulses */}
      <group ref={pulsesRef}>
        {chips.map((_, i) => (
          <mesh key={`pulse-${i}`}>
            <circleGeometry args={[0.045, 16]} />
            <meshBasicMaterial color={INK} transparent depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* Wandering pulses on the cross-links */}
      <group ref={crossPulsesRef}>
        {Array.from({ length: CROSS_PULSE_COUNT }, (_, i) => (
          <mesh key={`cross-pulse-${i}`}>
            <circleGeometry args={[0.03, 12]} />
            <meshBasicMaterial color={INK} transparent depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* Labeled sub-nodes */}
      <group ref={subsRef}>
        {subChips.map((chip, i) => (
          <mesh key={`sub-${i}`} position={chip.pos}>
            <planeGeometry args={[0.17 * chip.aspect, 0.17]} />
            <meshBasicMaterial map={chip.texture} transparent />
          </mesh>
        ))}
      </group>

      {/* Center "You" node */}
      <mesh ref={centerRef}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial map={centerTexture} transparent />
      </mesh>

      {/* Labeled primary nodes */}
      <group ref={chipsRef}>
        {chips.map((chip, i) => (
          <mesh
            key={chip.label}
            position={chip.pos}
            onPointerOver={() => setHoveredIndex(i)}
            onPointerOut={() =>
              setHoveredIndex((current) => (current === i ? null : current))
            }
          >
            <planeGeometry args={[0.28 * chip.aspect, 0.28]} />
            <meshBasicMaterial map={chip.texture} transparent />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ---------- static fallback (reduced motion / no WebGL) ----------

const FALLBACK_NODES = [
  { label: "CV Sections", inverted: false, x: 10, y: 20 },
  { label: "Job Memory", inverted: true, x: 48, y: 8 },
  { label: "Skills", inverted: false, x: 78, y: 20 },
  { label: "JD Match", inverted: true, x: 80, y: 62 },
  { label: "Knowledge", inverted: true, x: 12, y: 66 },
  { label: "AI Score", inverted: false, x: 50, y: 86 },
];

function StaticFallback() {
  return (
    <div aria-hidden="true" className="relative h-full w-full">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {FALLBACK_NODES.map((node) => (
          <line
            key={node.label}
            x1={node.x + 6}
            y1={node.y + 3}
            x2={50}
            y2={50}
            stroke={INK}
            strokeOpacity={0.25}
            strokeWidth={0.3}
            strokeDasharray="1.4 1"
          />
        ))}
      </svg>
      <div
        className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-lg font-black"
        style={{
          background: INK,
          color: CREAM,
          border: "2px solid rgba(245,242,216,0.3)",
        }}
      >
        You
      </div>
      {FALLBACK_NODES.map((node) => (
        <span
          key={node.label}
          className="absolute rounded-full px-3 py-1.5 text-[11px] font-black"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            background: node.inverted ? INK : CREAM,
            color: node.inverted ? CREAM : INK,
            border: node.inverted
              ? "1px solid rgba(245,242,216,0.25)"
              : "1px solid rgba(17,17,17,0.45)",
          }}
        >
          {node.label}
        </span>
      ))}
    </div>
  );
}

// ---------- wrapper ----------

export default function HeroRagNodes() {
  const [mode, setMode] = useState<"init" | "3d" | "fallback">("init");

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let hasWebgl = false;
    try {
      const canvas = document.createElement("canvas");
      hasWebgl = Boolean(
        canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
      );
    } catch {
      hasWebgl = false;
    }
    setMode(reducedMotion || !hasWebgl ? "fallback" : "3d");
  }, []);

  if (mode === "init") {
    return null;
  }

  if (mode === "fallback") {
    return <StaticFallback />;
  }

  return (
    <div aria-hidden="true" className="relative h-full w-full">
      <Canvas
        flat
        camera={{ position: [0, 0, 6.0], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
      >
        <RagScene />
      </Canvas>
    </div>
  );
}
