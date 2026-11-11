import React from 'react';
import { useShowroomStore } from '../../store/showroomStore';
import { PRESSURE_DATA } from '../../data/pressurePoints';
import { MATTRESS_MODELS } from '../../data/mattresses';
import {
  Activity,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const SleepTestPanel: React.FC = () => {
  const {
    mode,
    sleeperPose,
    setSleeperPose,
    sleeperGender,
    setSleeperGender,
    compareType,
    setCompareType,
    showHeatmap,
    setShowHeatmap,
    selectedModelIndex,
    selectedPressurePointId,
    setSelectedPressurePointId,
    language,
  } = useShowroomStore();

  const currentModel = MATTRESS_MODELS[selectedModelIndex];

  if (mode !== 'sleeptest') return null;

  const profile = PRESSURE_DATA[sleeperPose];
  const isSleepWorld = compareType === 'sleepworld';

  // Calculate highest peak pressure point
  const pointsWithValues = profile.points.map((pt) => {
    const val = isSleepWorld
      ? Math.round(pt.sleepWorld[0] * (1 + (currentModel.firmness - 2) * 0.05))
      : pt.typical[0];
    return { ...pt, calculatedPressure: val };
  });

  const peakPressure = Math.max(...pointsWithValues.map((p) => p.calculatedPressure));

  // Find active selected point if clicked
  const activePoint = selectedPressurePointId
    ? pointsWithValues.find((p) => p.id === selectedPressurePointId)
    : null;

  return (
    <div className="w-80 md:w-96 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 text-slate-200">
      {/* Title & Pose switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <Activity size={12} />
            {language === 'hi' ? 'दबाव विश्लेषण' : 'Biomechanical Pressure Test'}
          </span>
          <h3 className="text-lg font-bold text-white">
            {sleeperPose === 'side'
              ? language === 'hi' ? 'करवट सोने की मुद्रा' : 'Side Sleeper Posture'
              : language === 'hi' ? 'पीठ के बल सोने की मुद्रा' : 'Back Sleeper Posture'}
          </h3>
        </div>
      </div>

      {/* Sub Controls: Pose, Gender, Heatmap */}
      <div className="space-y-2 text-xs">
        {/* Pose & Gender Toggles */}
        <div className="grid grid-cols-2 gap-2">
          {/* Pose Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSleeperPose('side')}
              className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                sleeperPose === 'side' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              {language === 'hi' ? 'करवट (Side)' : 'Side'}
            </button>
            <button
              onClick={() => setSleeperPose('back')}
              className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                sleeperPose === 'back' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              {language === 'hi' ? 'पीठ (Back)' : 'Back'}
            </button>
          </div>

          {/* Gender Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSleeperGender('woman')}
              className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                sleeperGender === 'woman' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              {language === 'hi' ? 'महिला' : 'Woman'}
            </button>
            <button
              onClick={() => setSleeperGender('man')}
              className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                sleeperGender === 'man' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              {language === 'hi' ? 'पुरुष' : 'Man'}
            </button>
          </div>
        </div>

        {/* Comparison Toggle & Heatmap Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCompareType('sleepworld')}
              className={`flex-1 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                compareType === 'sleepworld'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400'
              }`}
            >
              {currentModel.name}
            </button>
            <button
              onClick={() => setCompareType('typical')}
              className={`flex-1 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                compareType === 'typical' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              {language === 'hi' ? 'आम गद्दा' : 'Typical Bed'}
            </button>
          </div>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`py-1 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              showHeatmap
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Flame size={13} className={showHeatmap ? 'text-amber-400' : ''} />
            <span>{language === 'hi' ? 'हीट मैप' : 'Heatmap'}</span>
          </button>
        </div>
      </div>

      {/* COMPARISON METRICS BOX */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* SleepWorld score */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            isSleepWorld
              ? 'bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-400/50'
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`}
        >
          <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">
            {currentModel.name}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-white">
              {Math.min(...pointsWithValues.map((p) => p.sleepWorld[0]))} -{' '}
              {Math.max(...pointsWithValues.map((p) => p.sleepWorld[0]))}
            </span>
            <span className="text-[10px] text-slate-400">mmHg</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-semibold block mt-1 flex items-center gap-1">
            <CheckCircle2 size={11} /> {profile.alignmentScores[0]}% Spine Aligned
          </span>
        </div>

        {/* Typical Mattress score */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            !isSleepWorld
              ? 'bg-rose-950/40 border-rose-500/40 ring-1 ring-rose-400/50'
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`}
        >
          <span className="text-[10px] text-rose-400 font-bold block mb-0.5">
            {language === 'hi' ? 'आम लोकल गद्दा' : 'Typical Bed'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-rose-400">
              {Math.max(...pointsWithValues.map((p) => p.typical[0]))}
            </span>
            <span className="text-[10px] text-slate-400">mmHg Peak</span>
          </div>
          <span className="text-[10px] text-rose-300 font-semibold block mt-1 flex items-center gap-1">
            <AlertTriangle size={11} /> Only {profile.alignmentScores[1]}% Aligned
          </span>
        </div>
      </div>

      {/* SELECTED PRESSURE POINT DETAIL */}
      {activePoint ? (
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-blue-500/30 text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-300 text-sm">
              {language === 'hi' ? activePoint.nameHi : activePoint.name}
            </span>
            <button
              onClick={() => setSelectedPressurePointId(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-emerald-950/30 p-2 rounded-xl border border-emerald-900/50">
              <span className="text-[10px] text-slate-400 block">SleepWorld</span>
              <span className="font-bold text-emerald-400 text-base">
                {activePoint.sleepWorld[0]} mmHg
              </span>
            </div>
            <div className="bg-rose-950/30 p-2 rounded-xl border border-rose-900/50">
              <span className="text-[10px] text-slate-400 block">Typical Mattress</span>
              <span className="font-bold text-rose-400 text-base">
                {activePoint.typical[0]} mmHg
              </span>
            </div>
          </div>

          <div className="bg-blue-950/30 p-2.5 rounded-xl border border-blue-900/50 text-[11px] leading-relaxed text-slate-200">
            <span className="text-[10px] text-amber-300 font-bold block mb-0.5">
              {language === 'hi' ? 'ग्राहक को समझाएं:' : 'Explanation to Buyer:'}
            </span>
            {language === 'hi' ? activePoint.tipHi : activePoint.tipEn}
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <Sparkles className="text-blue-400 shrink-0" size={15} />
          <span>
            {language === 'hi'
              ? 'शरीर के किसी भी दबाव बिंदु (कंधे, कूल्हे, कमर) पर टैप करें।'
              : 'Tap any floating 3D pressure badge (shoulder, hip, lumbar) for deep clinical explanation.'}
          </span>
        </div>
      )}

      {/* Capillary closing pressure note */}
      <p className="text-[9px] text-slate-500 leading-tight">
        *32 mmHg is the medical capillary closing threshold. Pressures above 32 mmHg restrict blood circulation, causing tossing and turning.
      </p>
    </div>
  );
};

