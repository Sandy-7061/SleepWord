import React, { useMemo } from 'react';
import * as THREE from 'three';
import { generateBedWoodTexture } from '../../textures/generators';

interface BedFrameProps {
  width: number;
  length: number;
}

export const BedFrame: React.FC<BedFrameProps> = ({ width, length }) => {
  const woodTexture = useMemo(() => generateBedWoodTexture(), []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.6,
        metalness: 0.05,
      }),
    [woodTexture]
  );

  return (
    <group position={[0, -0.9, 0]}>
      {/* Base platform board */}
      <mesh material={material} castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[width + 1.2, 1.6, length + 1.2]} />
      </mesh>

      {/* Headboard */}
      <mesh
        material={material}
        castShadow
        receiveShadow
        position={[0, 4.0, -length / 2 - 0.7]}
      >
        <boxGeometry args={[width + 1.2, 7.8, 0.8]} />
      </mesh>

      {/* 4 Wooden Feet */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh
          key={i}
          material={material}
          castShadow
          receiveShadow
          position={[sx * (width / 2 + 0.1), -1.1, sz * (length / 2 + 0.1)]}
        >
          <boxGeometry args={[0.9, 0.7, 0.9]} />
        </mesh>
      ))}
    </group>
  );
};

