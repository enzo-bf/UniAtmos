"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function RobotArm({
  side,
  limbMaterial,
  jointMaterial,
}: {
  side: 1 | -1;
  limbMaterial: THREE.Material;
  jointMaterial: THREE.Material;
}) {
  const armRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!armRef.current) return;
    const t = clock.getElapsedTime();
    armRef.current.rotation.x = Math.sin(t * 1.3 + (side > 0 ? 0 : Math.PI)) * 0.07;
    armRef.current.rotation.z = side * -0.16;
  });

  return (
    <group ref={armRef} position={[side * 0.42, 0.12, 0]}>
      <mesh castShadow receiveShadow material={jointMaterial}>
        <sphereGeometry args={[0.09, 32, 32]} />
      </mesh>
      <mesh
        position={[side * 0.02, -0.15, 0]}
        rotation={[0, 0, side * 0.1]}
        castShadow
        receiveShadow
        material={limbMaterial}
      >
        <capsuleGeometry args={[0.05, 0.18, 8, 16]} />
      </mesh>
      <mesh position={[side * 0.05, -0.28, 0]} castShadow receiveShadow material={jointMaterial}>
        <sphereGeometry args={[0.058, 32, 32]} />
      </mesh>
      <mesh
        position={[side * 0.07, -0.4, 0.01]}
        rotation={[0, 0, side * 0.05]}
        castShadow
        receiveShadow
        material={limbMaterial}
      >
        <capsuleGeometry args={[0.044, 0.15, 8, 16]} />
      </mesh>
      <mesh position={[side * 0.08, -0.52, 0.01]} castShadow receiveShadow material={jointMaterial}>
        <sphereGeometry args={[0.064, 32, 32]} />
      </mesh>
    </group>
  );
}
