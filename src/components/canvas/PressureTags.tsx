import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useShowroomStore } from '../../store/showroomStore';
import { PRESSURE_DATA } from '../../data/pressurePoints';
import { MATTRESS_MODELS } from '../../data/mattresses';

interface PressureTagsProps {
  topSurfaceY: number;
}

export const PressureTags: React.FC<PressureTagsProps> = ({ topSurfaceY }) => {
  const {
    mode,
    sleeperPose,
    compareType,
    selectedModelIndex,
    selectedPressurePointId,
    setSelectedPressurePointId,
    language,
  } = useShowroomStore();

  const currentModel = MATTRESS_MODELS[selectedModelIndex];

  if (mode !== 'sleeptest') return null;

  const profile = PRESSURE_DATA[sleeperPose];
  const isSleepWorld = compareType === 'sleepworld';

  return (
    <group position={[0, topSurfaceY + 2.5, 0]}>
      {profile.points.map((pt) => {
        const data = isSleepWorld ? pt.sleepWorld : pt.typical;
        const pressure = Math.round(
          data[0] * (isSleepWorld ? 1 + (currentModel.firmness - 2) * 0.05 : 1)
        );
        const isSelected = selectedPressurePointId === pt.id;

        // Health category badge color
        const badgeColor =
          pressure <= 32
            ? 'bg-emerald-500/90 border-emerald-400 text-emerald-50'
            : pressure <= 55
            ? 'bg-amber-500/90 border-amber-400 text-amber-50'
            : 'bg-rose-600/90 border-rose-400 text-rose-50 animate-pulse';

        return (
          <Html
            key={pt.id}
            position={[pt.x, 0, pt.z]}
            center
            distanceFactor={22}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPressurePointId(pt.id);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-xl flex items-center gap-1.5 transition-all transform hover:scale-110 cursor-pointer ${badgeColor} ${
                isSelected ? 'ring-4 ring-white scale-125' : ''
              }`}
            >
              <span>{language === 'hi' ? pt.nameHi : pt.name}</span>
              <span className="bg-black/30 px-1.5 py-0.5 rounded-md font-mono text-[11px]">
                {pressure} <span className="text-[9px]">mmHg</span>
              </span>
            </button>
          </Html>
        );
      })}
    </group>
  );
};

