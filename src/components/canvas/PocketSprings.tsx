import React, { useMemo } from 'react';
import * as THREE from 'three';

interface PocketSpringsProps {
  width: number;
  length: number;
  thickness: number;
}

// Parametric spring helix curve
class SpringHelixCurve extends THREE.Curve<THREE.Vector3> {
  height: number;
  constructor(height: number) {
    super();
    this.height = height;
  }
  getPoint(u: number): THREE.Vector3 {
    const coils = 5.5;
    const angle = u * Math.PI * 2 * coils;
    const radius = 0.22;
    const y = (u - 0.5) * this.height * 0.9;
    return new THREE.Vector3(radius * Math.cos(angle), y, radius * Math.sin(angle));
  }
}

export const PocketSprings: React.FC<PocketSpringsProps> = ({ width, length, thickness }) => {
  const { coilMesh, pocketMesh } = useMemo(() => {
    const nx = 17;
    const nz = 24;
    const totalCount = nx * nz;

    const helixCurve = new SpringHelixCurve(thickness);
    const coilGeo = new THREE.TubeGeometry(helixCurve, 50, 0.035, 6, false);
    const coilMat = new THREE.MeshStandardMaterial({
      color: 0xdcdde1,
      metalness: 0.85,
      roughness: 0.25,
    });

    const pocketGeo = new THREE.CylinderGeometry(0.33, 0.33, thickness * 0.95, 14, 1, true);
    const pocketMat = new THREE.MeshStandardMaterial({
      color: 0xf5f6fa,
      roughness: 0.9,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });

    const coilInst = new THREE.InstancedMesh(coilGeo, coilMat, totalCount);
    const pocketInst = new THREE.InstancedMesh(pocketGeo, pocketMat, totalCount);

    const dummy = new THREE.Object3D();
    const stepX = (width - 1.2) / nx;
    const stepZ = (length - 1.2) / nz;

    let index = 0;
    for (let x = 0; x < nx; x++) {
      for (let z = 0; z < nz; z++) {
        const px = (x - (nx - 1) / 2) * stepX;
        const pz = (z - (nz - 1) / 2) * stepZ;
        dummy.position.set(px, 0, pz);
        dummy.updateMatrix();
        coilInst.setMatrixAt(index, dummy.matrix);
        pocketInst.setMatrixAt(index, dummy.matrix);
        index++;
      }
    }
    coilInst.instanceMatrix.needsUpdate = true;
    pocketInst.instanceMatrix.needsUpdate = true;

    return { coilMesh: coilInst, pocketMesh: pocketInst };
  }, [width, length, thickness]);

  return (
    <group>
      {/* Perimeter edge reinforcement frame */}
      {[-1, 1].map((dir, idx) => (
        <React.Fragment key={idx}>
          <mesh position={[dir * (width / 2 - 0.2), 0, 0]}>
            <boxGeometry args={[0.4, thickness, length]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, dir * (length / 2 - 0.2)]}>
            <boxGeometry args={[width - 0.8, thickness, 0.4]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
          </mesh>
        </React.Fragment>
      ))}

      <primitive object={coilMesh} />
      <primitive object={pocketMesh} />
    </group>
  );
};

