import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useShowroomStore } from '../../store/showroomStore';
import { MATTRESS_MODELS } from '../../data/mattresses';
import { LAYER_TYPES } from '../../data/layerTypes';
import { generateLayerTexture } from '../../textures/generators';
import { PocketSprings } from './PocketSprings';
import { PRESSURE_DATA } from '../../data/pressurePoints';

interface MattressModelProps {
  width?: number;
  length?: number;
}

export const MattressModel: React.FC<MattressModelProps> = ({ width = 15, length = 20 }) => {
  const {
    mode,
    selectedModelIndex,
    selectedLayerIndex,
    setSelectedLayerIndex,
    cutawaySlice,
    sleeperPose,
    compareType,
    showHeatmap,
    language,
  } = useShowroomStore();

  const currentModel = MATTRESS_MODELS[selectedModelIndex];
  const modelLayers = useMemo(() => [...currentModel.layers].reverse(), [currentModel]);
  const numLayers = modelLayers.length;

  // Build layer thickness and heights
  const layerConfigs = useMemo(() => {
    let currentY = 0;
    return modelLayers.map(([key, label], index) => {
      const typeInfo = LAYER_TYPES[key];
      const thickness = (typeInfo?.defaultThicknessCm || 3) / 10;
      const centerY = currentY + thickness / 2;
      currentY += thickness;
      return {
        key,
        label,
        typeInfo,
        thickness,
        centerY,
        isTop: index === numLayers - 1,
        index,
      };
    });
  }, [modelLayers, numLayers]);

  const totalHeight = useMemo(() => {
    return layerConfigs.reduce((acc, curr) => acc + curr.thickness, 0);
  }, [layerConfigs]);

  // Clipping plane for Cutaway mode
  const cutawayPlane = useMemo(() => {
    return new THREE.Plane(new THREE.Vector3(-1, 0, 0), cutawaySlice);
  }, [cutawaySlice]);

  // Heatmap generation on top fabric in Sleep Test mode
  const heatmapTexture = useMemo(() => {
    if (mode !== 'sleeptest' || !showHeatmap) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base color
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const profile = PRESSURE_DATA[sleeperPose];
    const isSleepWorld = compareType === 'sleepworld';

    // RAMP color converter
    const getColorForPressure = (p: number) => {
      // 0 -> Blue, 32 -> Green/Cyan, 55 -> Yellow, 80+ -> Red
      if (p < 30) return 'rgba(30, 144, 255, 0.85)';
      if (p < 50) return 'rgba(46, 204, 113, 0.9)';
      if (p < 70) return 'rgba(241, 196, 15, 0.95)';
      return 'rgba(231, 76, 60, 0.98)';
    };

    profile.points.forEach((pt) => {
      const data = isSleepWorld ? pt.sleepWorld : pt.typical;
      const pressure = data[0];
      const radius = data[1];

      const drawSpot = (px: number, pz: number) => {
        const cx = ((px + width / 2) / width) * canvas.width;
        const cy = ((length / 2 - pz) / length) * canvas.height;
        const spotRadius = radius * 28;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, spotRadius);
        grad.addColorStop(0, getColorForPressure(pressure));
        grad.addColorStop(0.7, 'rgba(41, 128, 185, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, spotRadius, 0, Math.PI * 2);
        ctx.fill();
      };

      drawSpot(pt.x, pt.z);
      if (pt.isMirrored) {
        drawSpot(-pt.x, pt.z);
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [mode, showHeatmap, sleeperPose, compareType, width, length]);

  // Deformation logic for top layer in Sleep Test mode
  const topMeshRef = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (!topMeshRef.current) return;
    const geo = topMeshRef.current.geometry;
    const pos = geo.attributes.position;
    const isSleepTest = mode === 'sleeptest';
    const profile = PRESSURE_DATA[sleeperPose];
    const isSleepWorld = compareType === 'sleepworld';

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);

      if (isSleepTest && vy > 0.05) {
        // Calculate sinkage depression sum at (vx, vz)
        let totalSink = 0;
        profile.points.forEach((pt) => {
          const data = isSleepWorld ? pt.sleepWorld : pt.typical;
          const radius = data[1] * 1.4;
          const depth = data[2] * (isSleepWorld ? 1.0 - (currentModel.firmness - 2) * 0.1 : 1.4);

          const checkSpot = (px: number, pz: number) => {
            const distSq = (vx - px) ** 2 + (vz - pz) ** 2;
            totalSink += depth * Math.exp(-distSq / (2 * radius * radius));
          };
          checkSpot(pt.x, pt.z);
          if (pt.isMirrored) checkSpot(-pt.x, pt.z);
        });

        pos.setY(i, 0.15 - Math.min(totalSink * 1.5, 0.35));
      } else {
        // Reset to original flat level
        if (vy > 0.05) pos.setY(i, 0.15);
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [mode, sleeperPose, compareType, currentModel.firmness]);

  // Explosion gap factor
  const layerGap = mode === 'layers' ? 1.2 : mode === 'blueprint' ? 0.7 : 0;

  return (
    <group position={[0, 0, 0]}>
      {/* Mattresses Layers Stack */}
      {layerConfigs.map((layer) => {
        const isSelected = selectedLayerIndex === layer.index;
        const isDimmed = selectedLayerIndex !== -1 && !isSelected;
        const layerY = layer.centerY + layer.index * layerGap;

        // Textures
        const faceTexture = generateLayerTexture(layer.key, currentModel.coverPattern, false);
        const cutTexture = generateLayerTexture(layer.key, currentModel.coverPattern, true);

        return (
          <group
            key={`${layer.index}-${layer.key}`}
            position={[0, layerY, 0]}
            onClick={(e) => {
              e.stopPropagation();
              if (mode === 'real' || mode === 'sleeptest') {
                useShowroomStore.getState().setMode('layers');
              }
              setSelectedLayerIndex(layer.index);
            }}
          >
            {/* Spring layer or Foam box */}
            {layer.key === 'spr' ? (
              <PocketSprings width={width} length={length} thickness={layer.thickness} />
            ) : (
              <mesh
                ref={layer.isTop ? topMeshRef : undefined}
                castShadow
                receiveShadow
              >
                {layer.isTop ? (
                  <boxGeometry args={[width, layer.thickness, length, 48, 1, 64]} />
                ) : (
                  <boxGeometry args={[width, layer.thickness, length]} />
                )}
                {/* Standard or Blueprint Material */}
                {mode === 'blueprint' ? (
                  <meshBasicMaterial
                    color="#38bdf8"
                    wireframe
                    transparent
                    opacity={isDimmed ? 0.1 : 0.65}
                  />
                ) : (
                  <meshStandardMaterial
                    map={layer.isTop && heatmapTexture ? heatmapTexture : faceTexture}
                    bumpMap={faceTexture}
                    bumpScale={layer.isTop ? 0.4 : 1.2}
                    roughness={0.88}
                    metalness={0.02}
                    transparent={isDimmed}
                    opacity={isDimmed ? 0.12 : 1.0}
                    clippingPlanes={mode === 'cutaway' ? [cutawayPlane] : undefined}
                    clipShadows
                  />
                )}
              </mesh>
            )}

            {/* Cross-section cut cap face when in Cutaway Mode */}
            {mode === 'cutaway' && (
              <mesh
                position={[cutawaySlice - 0.01, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[length, layer.thickness]} />
                <meshStandardMaterial
                  map={cutTexture}
                  roughness={0.9}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Interactive floating tag on the side */}
            {(mode === 'layers' || mode === 'blueprint') && (
              <Html
                position={[width / 2 + 0.6, 0, 0]}
                center
                distanceFactor={24}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLayerIndex(layer.index);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white scale-110 ring-2 ring-blue-300'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/30"
                    style={{ backgroundColor: layer.typeInfo?.color || '#3b82f6' }}
                  />
                  <span>
                    {numLayers - layer.index}. {layer.typeInfo?.title[language === 'hi' ? 1 : 0]}
                  </span>
                  <span className="text-[10px] text-blue-300 font-mono">
                    ({(layer.thickness * 10).toFixed(0)}cm)
                  </span>
                </button>
              </Html>
            )}
          </group>
        );
      })}

      {/* SleepWorld Branded Border Ribbon & Pillows (Shown in Real Mode) */}
      {mode === 'real' && (
        <group>
          {/* Outer perimeter band */}
          <mesh position={[0, totalHeight / 2, 0]}>
            <boxGeometry args={[width + 0.08, totalHeight, length + 0.08]} />
            <meshStandardMaterial
              color={currentModel.wallColor}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* 2 Showroom Pillows */}
          {[-3.6, 3.6].map((px, i) => (
            <mesh
              key={i}
              position={[px, totalHeight + 0.35, -length / 2 + 2.4]}
              scale={[2.8, 0.65, 1.8]}
              castShadow
            >
              <sphereGeometry args={[1, 24, 18]} />
              <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

