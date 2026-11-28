import type * as ThreeNamespace from "three";
import type { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Three = typeof ThreeNamespace;

export interface ThreeKit {
  THREE: Three;
  RoundedBoxGeometry: typeof RoundedBoxGeometry;
  RoomEnvironment: typeof RoomEnvironment;
}

let pending: Promise<ThreeKit> | undefined;

async function importThree(): Promise<ThreeKit> {
  const [THREE, rounded, room] = await Promise.all([
    import("three"),
    import("three/examples/jsm/geometries/RoundedBoxGeometry.js"),
    import("three/examples/jsm/environments/RoomEnvironment.js"),
  ]);
  return {
    THREE,
    RoundedBoxGeometry: rounded.RoundedBoxGeometry,
    RoomEnvironment: room.RoomEnvironment,
  };
}

export function loadThree() {
  pending ??= importThree().catch((error) => {
    pending = undefined;
    throw error;
  });
  return pending;
}
