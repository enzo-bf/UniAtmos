"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function roundedRectPath(width: number, height: number, radius: number) {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w, h);
  const path = new THREE.CurvePath<THREE.Vector3>();

  path.add(new THREE.LineCurve3(new THREE.Vector3(-w + r, h, 0), new THREE.Vector3(w - r, h, 0)));
  path.add(
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(w - r, h, 0),
      new THREE.Vector3(w, h, 0),
      new THREE.Vector3(w, h - r, 0),
    ),
  );
  path.add(new THREE.LineCurve3(new THREE.Vector3(w, h - r, 0), new THREE.Vector3(w, -h + r, 0)));
  path.add(
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(w, -h + r, 0),
      new THREE.Vector3(w, -h, 0),
      new THREE.Vector3(w - r, -h, 0),
    ),
  );
  path.add(new THREE.LineCurve3(new THREE.Vector3(w - r, -h, 0), new THREE.Vector3(-w + r, -h, 0)));
  path.add(
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-w + r, -h, 0),
      new THREE.Vector3(-w, -h, 0),
      new THREE.Vector3(-w, -h + r, 0),
    ),
  );
  path.add(new THREE.LineCurve3(new THREE.Vector3(-w, -h + r, 0), new THREE.Vector3(-w, h - r, 0)));
  path.add(
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-w, h - r, 0),
      new THREE.Vector3(-w, h, 0),
      new THREE.Vector3(-w + r, h, 0),
    ),
  );

  return path;
}

export function RobotEye({
  position,
  rotation,
  scale = 1,
  blinkDuration = 0.18,
  blinkCycle = 4,
  isActiveRef,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  blinkDuration?: number;
  blinkCycle?: number;
  isActiveRef: React.MutableRefObject<boolean>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const path = useMemo(() => roundedRectPath(0.034, 0.02, 0.007), []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !materialRef.current) return;

    const active = isActiveRef.current;
    const t = clock.getElapsedTime();
    const glow = active ? 1.35 + Math.sin(t * 10) * 0.2 : 1;
    materialRef.current.color.setRGB(glow, glow, glow);

    const cycle = t % blinkCycle;
    let targetScaleY = 1;
    if (cycle < blinkDuration && !active) {
      const progress = cycle / blinkDuration;
      targetScaleY = Math.max(0.08, 1 - Math.sin(progress * Math.PI));
    }
    groupRef.current.scale.set(scale, scale * targetScaleY, scale);
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh>
        <tubeGeometry args={[path, 48, 0.0024, 8, true]} />
        <meshBasicMaterial ref={materialRef} color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}
