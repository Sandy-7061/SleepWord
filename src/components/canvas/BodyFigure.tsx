import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useShowroomStore } from '../../store/showroomStore';
import { PRESSURE_DATA } from '../../data/pressurePoints';
import { MATTRESS_MODELS } from '../../data/mattresses';

interface BodyFigureProps {
  topSurfaceY: number;
}

export const BodyFigure: React.FC<BodyFigureProps> = ({ topSurfaceY }) => {
  const { sleeperPose, sleeperGender, compareType, selectedModelIndex } = useShowroomStore();
  const currentModel = MATTRESS_MODELS[selectedModelIndex];

  // Calculate deformation factor based on mattress firmness
  // Firmness 0 (soft) -> deeper sink, Firmness 4 (firm) -> shallower sink
  const isWoman = sleeperGender === 'woman';
  const isSide = sleeperPose === 'side';

  // Materials for skin, pajamas, hair, pillow
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: isWoman ? 0xd49b78 : 0xbe825d,
        roughness: 0.55,
        metalness: 0.05,
      }),
      cloth: new THREE.MeshStandardMaterial({
        color: isWoman ? 0xebdcd0 : 0x778899,
        roughness: 0.85,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: 0x1f1915,
        roughness: 0.4,
      }),
      pillow: new THREE.MeshStandardMaterial({
        color: 0xf8f9fa,
        roughness: 0.9,
      }),
    };
  }, [isWoman]);

  // Dynamic spine curve points along the human back
  const spinePoints = useMemo(() => {
    const isSleepWorld = compareType === 'sleepworld';
    const profile = PRESSURE_DATA[sleeperPose];
    const points: THREE.Vector3[] = [];

    // Calculate curve based on actual anatomical sinkage
    profile.points.forEach((pt) => {
      const data = isSleepWorld ? pt.sleepWorld : pt.typical;
      const sinkDepth = data[2] * (isSleepWorld ? 1.0 - (currentModel.firmness - 2) * 0.1 : 1.3);
      const yOffset = isSide ? 1.6 : 1.05;
      points.push(new THREE.Vector3(0, topSurfaceY + yOffset - sinkDepth * 3.5, pt.z));
    });

    return points;
  }, [sleeperPose, compareType, currentModel.firmness, topSurfaceY, isSide]);

  const spineCurve = useMemo(() => {
    if (spinePoints.length < 2) return null;
    return new THREE.CatmullRomCurve3(spinePoints);
  }, [spinePoints]);

  return (
    <group position={[0, topSurfaceY, 0]}>
      {/* Head Pillow */}
      <mesh material={materials.pillow} position={[0, 0.45, -7.6]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.7, 2.2]} />
      </mesh>

      {/* ANATOMICAL BODY */}
      {isSide ? (
        /* SIDE SLEEPER ANATOMY */
        <group position={[0, 0.4, 0]}>
          {/* Head */}
          <mesh material={materials.skin} position={[0.1, 1.25, -7.8]} castShadow>
            <sphereGeometry args={[0.9, 24, 20]} />
          </mesh>
          {/* Hair */}
          <mesh material={materials.hair} position={[-0.15, 1.35, -8.0]} castShadow>
            <sphereGeometry args={[isWoman ? 1.05 : 0.96, 20, 18]} />
          </mesh>
          {isWoman && (
            <mesh material={materials.hair} position={[-0.4, 0.8, -6.6]} castShadow>
              <sphereGeometry args={[0.7, 16, 16]} />
            </mesh>
          )}

          {/* Neck */}
          <mesh material={materials.skin} position={[0, 0.9, -6.8]} castShadow>
            <cylinderGeometry args={[0.42, 0.45, 0.7, 16]} />
          </mesh>

          {/* Shoulder & Chest (Torso) */}
          <mesh material={materials.cloth} position={[0, 1.15, -4.8]} castShadow>
            <sphereGeometry args={[isWoman ? 1.05 : 1.25, 24, 20]} />
          </mesh>

          {/* Waist (Narrower anatomical waist curve) */}
          <mesh material={materials.cloth} position={[0, 0.9, -2.6]} castShadow>
            <sphereGeometry args={[0.92, 22, 18]} />
          </mesh>

          {/* Pelvis & Hips (Wider anatomical curve) */}
          <mesh material={materials.cloth} position={[0, 1.1, -0.8]} castShadow>
            <sphereGeometry args={[isWoman ? 1.35 : 1.2, 24, 20]} />
          </mesh>

          {/* Thighs (Side bent pose) */}
          <mesh material={materials.cloth} position={[0.2, 0.8, 1.8]} rotation={[0.25, 0, 0]} castShadow>
            <capsuleGeometry args={[0.55, 3.2, 16, 16]} />
          </mesh>
          <mesh material={materials.cloth} position={[0.3, 1.7, 1.9]} rotation={[0.45, 0, 0]} castShadow>
            <capsuleGeometry args={[0.52, 3.0, 16, 16]} />
          </mesh>

          {/* Shins & Calves */}
          <mesh material={materials.cloth} position={[0.1, 0.5, 5.2]} rotation={[-0.3, 0, 0]} castShadow>
            <capsuleGeometry args={[0.4, 3.2, 16, 16]} />
          </mesh>
          <mesh material={materials.cloth} position={[0.25, 1.1, 5.3]} rotation={[-0.2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.38, 3.0, 16, 16]} />
          </mesh>

          {/* Arms folded comfortably under head/chest */}
          <mesh material={materials.skin} position={[0.8, 1.3, -4.6]} rotation={[0, 0, -0.5]} castShadow>
            <capsuleGeometry args={[0.32, 2.2, 16, 16]} />
          </mesh>
          <mesh material={materials.skin} position={[1.2, 1.0, -5.8]} rotation={[0.6, 0.4, 0]} castShadow>
            <capsuleGeometry args={[0.28, 1.8, 16, 16]} />
          </mesh>
        </group>
      ) : (
        /* BACK SLEEPER ANATOMY */
        <group position={[0, 0.2, 0]}>
          {/* Head */}
          <mesh material={materials.skin} position={[0, 1.1, -7.7]} castShadow>
            <sphereGeometry args={[0.9, 24, 20]} />
          </mesh>
          {/* Hair */}
          <mesh material={materials.hair} position={[0, 0.95, -7.95]} castShadow>
            <sphereGeometry args={[0.98, 20, 18]} />
          </mesh>

          {/* Neck */}
          <mesh material={materials.skin} position={[0, 0.75, -6.7]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.7, 16]} />
          </mesh>

          {/* Upper Chest & Broad Shoulders */}
          <mesh material={materials.cloth} position={[0, 0.85, -4.8]} scale={[isWoman ? 1.7 : 2.1, 1.0, 1.4]} castShadow>
            <sphereGeometry args={[1, 24, 20]} />
          </mesh>

          {/* Mid Back & Ribs */}
          <mesh material={materials.cloth} position={[0, 0.75, -3.0]} scale={[1.45, 0.9, 1.4]} castShadow>
            <sphereGeometry args={[1, 22, 18]} />
          </mesh>

          {/* Lumbar Spine Hollow */}
          <mesh material={materials.cloth} position={[0, 0.65, -1.5]} scale={[1.25, 0.75, 1.1]} castShadow>
            <sphereGeometry args={[1, 20, 16]} />
          </mesh>

          {/* Pelvis & Hips */}
          <mesh material={materials.cloth} position={[0, 0.8, -0.2]} scale={[isWoman ? 1.85 : 1.65, 0.95, 1.3]} castShadow>
            <sphereGeometry args={[1, 24, 20]} />
          </mesh>

          {/* Legs (Straight relaxed back posture) */}
          {[-0.8, 0.8].map((lx, i) => (
            <React.Fragment key={i}>
              {/* Thigh */}
              <mesh material={materials.cloth} position={[lx, 0.6, 2.0]} rotation={[0.08, 0, 0]} castShadow>
                <capsuleGeometry args={[0.55, 3.2, 16, 16]} />
              </mesh>
              {/* Calf */}
              <mesh material={materials.cloth} position={[lx, 0.45, 5.4]} rotation={[0.04, 0, 0]} castShadow>
                <capsuleGeometry args={[0.42, 3.2, 16, 16]} />
              </mesh>
              {/* Foot/Heel */}
              <mesh material={materials.skin} position={[lx, 0.35, 7.3]} scale={[0.4, 0.45, 0.85]} castShadow>
                <sphereGeometry args={[1, 16, 14]} />
              </mesh>
            </React.Fragment>
          ))}

          {/* Arms resting at sides */}
          {[-1.95, 1.95].map((ax, i) => (
            <mesh key={i} material={materials.skin} position={[ax, 0.55, -3.5]} rotation={[0, 0, ax > 0 ? -0.1 : 0.1]} castShadow>
              <capsuleGeometry args={[0.3, 3.8, 16, 16]} />
            </mesh>
          ))}
        </group>
      )}

      {/* DYNAMIC LUMBAR / SPINE ALIGNMENT TRACER LINE */}
      {spineCurve && (
        <group>
          {/* Glowing Spine Tube */}
          <mesh>
            <tubeGeometry args={[spineCurve, 64, 0.08, 12, false]} />
            <meshBasicMaterial
              color={compareType === 'sleepworld' ? '#00d2d3' : '#ff7675'}
              toneMapped={false}
            />
          </mesh>
          {/* Spine Vertebrae Spheres */}
          {spinePoints.map((pt, i) => (
            <mesh key={i} position={pt}>
              <sphereGeometry args={[0.16, 14, 14]} />
              <meshBasicMaterial
                color={compareType === 'sleepworld' ? '#ffffff' : '#fab1a0'}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

