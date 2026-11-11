import React, { useState } from 'react';
import { useShowroomStore } from '../../store/showroomStore';

// Pressure zones with mmHg data
const BACK_PRESSURE_ZONES = [
  { id: 'neck', label: 'Neck', mmhg: 18, x: 50, y: 7, r: 6, severity: 'low' },
  { id: 'shoulder-l', label: 'L. Shoulder', mmhg: 32, x: 32, y: 15, r: 7, severity: 'low' },
  { id: 'shoulder-r', label: 'R. Shoulder', mmhg: 30, x: 68, y: 15, r: 7, severity: 'low' },
  { id: 'upper-back', label: 'Upper Back', mmhg: 25, x: 50, y: 20, r: 9, severity: 'low' },
  { id: 'lumbar', label: 'Lumbar', mmhg: 48, x: 50, y: 42, r: 10, severity: 'med' },
  { id: 'hip-l', label: 'L. Hip', mmhg: 65, x: 34, y: 56, r: 9, severity: 'high' },
  { id: 'hip-r', label: 'R. Hip', mmhg: 62, x: 66, y: 56, r: 9, severity: 'high' },
  { id: 'thigh-l', label: 'L. Thigh', mmhg: 38, x: 36, y: 70, r: 7, severity: 'low' },
  { id: 'thigh-r', label: 'R. Thigh', mmhg: 36, x: 64, y: 70, r: 7, severity: 'low' },
  { id: 'heel-l', label: 'L. Heel', mmhg: 44, x: 38, y: 90, r: 5, severity: 'med' },
  { id: 'heel-r', label: 'R. Heel', mmhg: 42, x: 62, y: 90, r: 5, severity: 'med' },
];

const SIDE_PRESSURE_ZONES = [
  { id: 'ear', label: 'Head/Ear', mmhg: 22, x: 50, y: 6, r: 7, severity: 'low' },
  { id: 'shoulder-side', label: 'Shoulder', mmhg: 88, x: 44, y: 18, r: 11, severity: 'critical' },
  { id: 'armpit', label: 'Armpit', mmhg: 42, x: 56, y: 23, r: 6, severity: 'med' },
  { id: 'waist', label: 'Waist Gap', mmhg: 8, x: 60, y: 40, r: 5, severity: 'gap' },
  { id: 'hip-side', label: 'Hip', mmhg: 95, x: 46, y: 55, r: 12, severity: 'critical' },
  { id: 'knee-side', label: 'Knee', mmhg: 68, x: 48, y: 70, r: 8, severity: 'high' },
  { id: 'ankle', label: 'Ankle', mmhg: 52, x: 48, y: 83, r: 6, severity: 'med' },
  { id: 'foot', label: 'Foot', mmhg: 30, x: 50, y: 93, r: 5, severity: 'low' },
];

const SEVERITY_COLORS: Record<string, { fill: string; stroke: string; text: string; label: string }> = {
  low:      { fill: 'rgba(34,197,94,0.35)',  stroke: '#22c55e', text: '#4ade80', label: 'Low' },
  med:      { fill: 'rgba(234,179,8,0.35)',  stroke: '#eab308', text: '#fde047', label: 'Medium' },
  high:     { fill: 'rgba(239,68,68,0.40)',  stroke: '#ef4444', text: '#f87171', label: 'High' },
  critical: { fill: 'rgba(220,38,38,0.55)',  stroke: '#dc2626', text: '#fca5a5', label: 'Critical' },
  gap:      { fill: 'rgba(96,165,250,0.25)', stroke: '#60a5fa', text: '#93c5fd', label: 'Gap' },
};

// SVG anatomical body silhouette (back view)
const BackBodySVG: React.FC<{
  zones: typeof BACK_PRESSURE_ZONES;
  selected: string | null;
  onSelect: (id: string) => void;
  showHeatmap: boolean;
  gender: 'man' | 'woman';
}> = ({ zones, selected, onSelect, showHeatmap, gender }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ maxHeight: 400 }}>
    <defs>
      <radialGradient id="bg-glow">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="100%" stopColor="#0d1520" />
      </radialGradient>
      {/* Mattress deformation gradient */}
      <linearGradient id="mattress-deform" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2a4a7a" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#1a3060" stopOpacity="0.5" />
      </linearGradient>
    </defs>

    {/* Body silhouette — back view */}
    <g opacity="0.9">
      {/* Head */}
      <ellipse cx="50" cy="6" rx="6" ry="6.5" fill={gender === 'woman' ? '#d4a89a' : '#c49080'} />
      {/* Neck */}
      <rect x="47" y="11" width="6" height="4" rx="2" fill={gender === 'woman' ? '#d4a89a' : '#c49080'} />
      {/* Torso */}
      <path d={`M${gender === 'woman' ? '34' : '36'},16 Q32,25 ${gender === 'woman' ? '30' : '33'},34 L30,56 Q32,62 36,64 L64,64 Q68,62 70,56 L${gender === 'woman' ? '70' : '67'},34 Q${gender === 'woman' ? '68' : '67'},25 ${gender === 'woman' ? '66' : '64'},16 Z`}
        fill={gender === 'woman' ? '#d4a89a' : '#c49080'} stroke="#b88070" strokeWidth="0.3" />
      {/* Arms */}
      <path d={`M${gender === 'woman' ? '34' : '36'},16 Q26,20 24,38 Q22,46 24,54 Q25,56 26,55 Q28,46 30,38 Q32,26 ${gender === 'woman' ? '34' : '36'},18 Z`}
        fill={gender === 'woman' ? '#d4a89a' : '#c49080'} />
      <path d={`M${gender === 'woman' ? '66' : '64'},16 Q74,20 76,38 Q78,46 76,54 Q75,56 74,55 Q72,46 70,38 Q68,26 ${gender === 'woman' ? '66' : '64'},18 Z`}
        fill={gender === 'woman' ? '#d4a89a' : '#c49080'} />
      {/* Hips/Pelvis */}
      <path d={`M30,56 Q28,70 32,76 L38,80 L50,78 L62,80 L68,76 Q72,70 70,56 Z`}
        fill={gender === 'woman' ? '#c49080' : '#b48070'} />
      {/* Thighs */}
      <path d="M32,76 Q28,88 30,96 L40,96 Q42,88 38,78 Z" fill={gender === 'woman' ? '#d4a89a' : '#c49080'} />
      <path d="M68,76 Q72,88 70,96 L60,96 Q58,88 62,78 Z" fill={gender === 'woman' ? '#d4a89a' : '#c49080'} />

      {/* Spine line */}
      <path d="M50,12 Q50.5,25 50,38 Q49.5,52 50,64" stroke="#8a6050" strokeWidth="0.5" fill="none" strokeDasharray="1,2" opacity="0.5" />

      {/* Mattress surface under body */}
      <path d={`M20,96 Q22,98 50,99 Q78,98 80,96 L80,100 L20,100 Z`}
        fill="url(#mattress-deform)" opacity="0.7" />

      {/* Body depression curve on mattress */}
      <path d="M20,97 Q30,95 50,96 Q70,95 80,97"
        stroke="#60a5fa" strokeWidth="0.6" fill="none" opacity="0.5" strokeDasharray="2,2" />
    </g>

    {/* Pressure zones overlay */}
    {showHeatmap && zones.map(z => {
      const col = SEVERITY_COLORS[z.severity];
      const isSelected = selected === z.id;
      return (
        <g key={z.id} onClick={() => onSelect(z.id)} style={{ cursor: 'pointer' }}>
          {/* Pulsing halo for critical */}
          {z.severity === 'critical' && (
            <circle cx={z.x} cy={z.y} r={z.r + 4} fill="rgba(220,38,38,0.1)">
              <animate attributeName="r" values={`${z.r + 2};${z.r + 6};${z.r + 2}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <circle cx={z.x} cy={z.y} r={z.r}
            fill={col.fill}
            stroke={isSelected ? '#fff' : col.stroke}
            strokeWidth={isSelected ? 1 : 0.6}
            opacity={0.85}
          />
          <text x={z.x} y={z.y + 0.5} textAnchor="middle" dominantBaseline="middle"
            fontSize="3.5" fontWeight="bold" fill={col.text} style={{ pointerEvents: 'none' }}>
            {z.mmhg}
          </text>
          <text x={z.x} y={z.y + 4} textAnchor="middle" dominantBaseline="middle"
            fontSize="2.2" fill={col.text} opacity="0.8" style={{ pointerEvents: 'none' }}>
            mmHg
          </text>
        </g>
      );
    })}
  </svg>
);

// SVG anatomical body silhouette (side view)
const SideBodySVG: React.FC<{
  zones: typeof SIDE_PRESSURE_ZONES;
  selected: string | null;
  onSelect: (id: string) => void;
  showHeatmap: boolean;
  gender: 'man' | 'woman';
}> = ({ zones, selected, onSelect, showHeatmap, gender }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ maxHeight: 400 }}>
    <defs>
      <radialGradient id="body-grad">
        <stop offset="0%" stopColor={gender === 'woman' ? '#d4a89a' : '#c49080'} />
        <stop offset="100%" stopColor={gender === 'woman' ? '#b08070' : '#a07060'} />
      </radialGradient>
    </defs>
    {/* Side body silhouette */}
    <g opacity="0.9">
      {/* Head */}
      <ellipse cx="50" cy="6" rx="5.5" ry="6" fill={gender === 'woman' ? '#d4a89a' : '#c49080'} />
      {/* Neck */}
      <rect x="47" y="11" width="5" height="4" fill={gender === 'woman' ? '#d4a89a' : '#c49080'} />
      {/* Shoulder protrusion */}
      <ellipse cx="44" cy="17" rx="8" ry="6" fill={gender === 'woman' ? '#c49080' : '#b48070'} />
      {/* Torso */}
      <path d={`M42,13 Q38,20 ${gender === 'woman' ? '36' : '38'},30 Q${gender === 'woman' ? '34' : '36'},40 ${gender === 'woman' ? '38' : '40'},50 Q${gender === 'woman' ? '40' : '42'},58 ${gender === 'woman' ? '44' : '46'},62 Q${gender === 'woman' ? '52' : '56'},64 ${gender === 'woman' ? '58' : '60'},62 Q62,58 60,50 L58,30 Q56,20 54,13 Z`}
        fill={gender === 'woman' ? '#d4a89a' : '#c49080'} stroke="#b08070" strokeWidth="0.3" />
      {/* Hip bump (pronounced for woman) */}
      <ellipse cx={gender === 'woman' ? '46' : '48'} cy="58" rx={gender === 'woman' ? '12' : '10'} ry="8"
        fill={gender === 'woman' ? '#c49080' : '#b48070'} />
      {/* Legs */}
      <path d="M44,64 Q42,72 42,82 Q42,90 44,96 L50,96 Q52,90 52,82 Q52,72 50,64 Z"
        fill={gender === 'woman' ? '#d4a89a' : '#c49080'} />

      {/* Spine curve */}
      <path d="M50,12 Q52,20 52,28 Q50,38 52,48 Q54,56 52,64"
        stroke="#8a6050" strokeWidth="0.7" fill="none" strokeDasharray="1,2" opacity="0.6" />

      {/* Waist gap visualization */}
      <path d="M60,38 L68,38" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="1,1.5" opacity="0.6" />
      <text x="70" y="39" fontSize="2.5" fill="#60a5fa" opacity="0.8">Gap</text>

      {/* Mattress surface depression */}
      <path d="M20,96 Q30,94 44,95 Q48,96 50,96 Q62,95 72,94 Q78,94 80,96 L80,100 L20,100 Z"
        fill="rgba(42,74,122,0.7)" />
      {/* Mattress deform curve */}
      <path d="M20,97 Q32,93 44,95 Q50,96.5 56,95 Q68,93 80,96"
        stroke="#60a5fa" strokeWidth="0.7" fill="none" opacity="0.6" strokeDasharray="2,2" />
    </g>

    {/* Pressure zones overlay */}
    {showHeatmap && zones.map(z => {
      const col = SEVERITY_COLORS[z.severity];
      const isSelected = selected === z.id;
      return (
        <g key={z.id} onClick={() => onSelect(z.id)} style={{ cursor: 'pointer' }}>
          {z.severity === 'critical' && (
            <circle cx={z.x} cy={z.y} r={z.r + 4} fill="rgba(220,38,38,0.1)">
              <animate attributeName="r" values={`${z.r + 2};${z.r + 6};${z.r + 2}`} dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}
          <circle cx={z.x} cy={z.y} r={z.r}
            fill={col.fill}
            stroke={isSelected ? '#fff' : col.stroke}
            strokeWidth={isSelected ? 1 : 0.6}
            opacity={0.85}
          />
          <text x={z.x} y={z.y + 0.5} textAnchor="middle" dominantBaseline="middle"
            fontSize="3.5" fontWeight="bold" fill={col.text} style={{ pointerEvents: 'none' }}>
            {z.mmhg}
          </text>
          <text x={z.x} y={z.y + 4} textAnchor="middle" dominantBaseline="middle"
            fontSize="2.2" fill={col.text} opacity="0.8" style={{ pointerEvents: 'none' }}>
            mmHg
          </text>
        </g>
      );
    })}
  </svg>
);

export const BodyPressureView: React.FC = () => {
  const { sleeperPose, setSleeperPose, sleeperGender, setSleeperGender, showHeatmap, setShowHeatmap } = useShowroomStore();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const zones = sleeperPose === 'back' ? BACK_PRESSURE_ZONES : SIDE_PRESSURE_ZONES;
  const selectedZoneData = selectedZone ? zones.find(z => z.id === selectedZone) : null;

  // Compare: SleepWorld vs typical
  const [compareType, setCompareType] = useState<'sleepworld' | 'typical'>('sleepworld');
  const typicalMultiplier = 1.6;

  const getDisplayMmhg = (z: { mmhg: number }) =>
    compareType === 'typical' ? Math.round(z.mmhg * typicalMultiplier) : z.mmhg;

  return (
    <div className="flex flex-col h-full bg-slate-950/90 p-3 gap-3 overflow-y-auto">
      {/* Title */}
      <div>
        <h3 className="text-white font-bold text-sm">Sleep Test — Pressure Analysis</h3>
        <p className="text-slate-400 text-[11px]">Real anatomical pressure point visualization</p>
      </div>

      {/* Controls row */}
      <div className="flex gap-2 flex-wrap">
        {/* Pose toggle */}
        <div className="flex bg-slate-900 rounded-xl p-0.5 gap-0.5">
          <button onClick={() => setSleeperPose('back')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sleeperPose === 'back' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Back
          </button>
          <button onClick={() => setSleeperPose('side')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sleeperPose === 'side' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Side
          </button>
        </div>

        {/* Gender toggle */}
        <div className="flex bg-slate-900 rounded-xl p-0.5 gap-0.5">
          <button onClick={() => setSleeperGender('woman')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sleeperGender === 'woman' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Woman
          </button>
          <button onClick={() => setSleeperGender('man')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sleeperGender === 'man' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Man
          </button>
        </div>

        {/* Heatmap toggle */}
        <button onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            showHeatmap ? 'bg-orange-600/20 border-orange-500/50 text-orange-300' : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}>
          {showHeatmap ? '🌡️ Heatmap ON' : '🌡️ Heatmap'}
        </button>
      </div>

      {/* Compare bar */}
      <div className="flex bg-slate-900 rounded-xl p-0.5 gap-0.5">
        <button onClick={() => setCompareType('sleepworld')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${compareType === 'sleepworld' ? 'bg-blue-700 text-white' : 'text-slate-400 hover:text-white'}`}>
          SleepWorld
        </button>
        <button onClick={() => setCompareType('typical')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${compareType === 'typical' ? 'bg-red-700 text-white' : 'text-slate-400 hover:text-white'}`}>
          Typical Mattress
        </button>
      </div>

      {/* Body SVG */}
      <div className="flex-shrink-0 relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-2 border border-slate-800/50 overflow-hidden"
        style={{ height: 320 }}>
        {/* Mattress base */}
        <div className="absolute bottom-0 left-0 right-0 h-5 rounded-b-2xl"
          style={{ background: 'linear-gradient(180deg,#1e3a5f,#0d2040)' }} />
        {sleeperPose === 'back' ? (
          <BackBodySVG
            zones={BACK_PRESSURE_ZONES}
            selected={selectedZone}
            onSelect={setSelectedZone}
            showHeatmap={showHeatmap}
            gender={sleeperGender}
          />
        ) : (
          <SideBodySVG
            zones={SIDE_PRESSURE_ZONES}
            selected={selectedZone}
            onSelect={setSelectedZone}
            showHeatmap={showHeatmap}
            gender={sleeperGender}
          />
        )}

        {/* Click hint */}
        {!selectedZone && (
          <div className="absolute bottom-6 left-0 right-0 text-center text-slate-500 text-[10px]">
            Tap a pressure zone to inspect it
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(SEVERITY_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border" style={{ background: val.fill, borderColor: val.stroke }} />
            <span className="text-[10px] text-slate-400">{val.label}</span>
          </div>
        ))}
      </div>

      {/* Selected zone detail */}
      {selectedZoneData && (
        <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-bold text-sm">{selectedZoneData.label}</h4>
              <p className="text-slate-400 text-[11px]">{sleeperPose === 'back' ? 'Back Sleeper' : 'Side Sleeper'} — {sleeperGender === 'woman' ? 'Female' : 'Male'} Profile</p>
            </div>
            <button onClick={() => setSelectedZone(null)} className="text-slate-500 hover:text-white text-sm">✕</button>
          </div>

          {/* Pressure comparison */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-900/30 rounded-xl p-2 border border-blue-800/40">
              <div className="text-blue-300 text-[10px] font-semibold">SleepWorld</div>
              <div className="text-blue-100 font-bold text-xl">{selectedZoneData.mmhg}</div>
              <div className="text-blue-400 text-[10px]">mmHg</div>
              <div className={`text-[10px] mt-1 font-semibold ${
                selectedZoneData.mmhg < 32 ? 'text-green-400' : selectedZoneData.mmhg < 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {selectedZoneData.mmhg < 32 ? '✓ Excellent' : selectedZoneData.mmhg < 60 ? '⚠ Moderate' : '✗ High'}
              </div>
            </div>
            <div className="bg-red-900/20 rounded-xl p-2 border border-red-800/30">
              <div className="text-red-300 text-[10px] font-semibold">Typical</div>
              <div className="text-red-100 font-bold text-xl">{getDisplayMmhg(selectedZoneData)}</div>
              <div className="text-red-400 text-[10px]">mmHg</div>
              <div className="text-red-400 text-[10px] mt-1 font-semibold">✗ Elevated</div>
            </div>
          </div>

          {/* Pressure bar */}
          <div>
            <div className="text-slate-400 text-[10px] mb-1">Pressure Level</div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((selectedZoneData.mmhg / 120) * 100, 100)}%`,
                  background: selectedZoneData.mmhg < 32 ? '#22c55e' : selectedZoneData.mmhg < 60 ? '#eab308' : '#ef4444',
                }} />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
              <span>0</span><span>60</span><span>120 mmHg</span>
            </div>
          </div>

          {/* Clinical note */}
          <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/50 rounded-lg p-2">
            {selectedZoneData.severity === 'critical' && (
              <>⚠️ <strong className="text-red-300">Critical zone:</strong> Pressure above 80 mmHg compresses capillaries, cutting blood flow and causing numbness. SleepWorld's adaptive layer reduces this by {Math.round((1 - 1/typicalMultiplier)*100)}%.</>
            )}
            {selectedZoneData.severity === 'high' && (
              <>🔶 <strong className="text-orange-300">High pressure:</strong> This zone bears significant weight. Our orthopedic layer distributes load across a wider surface area, reducing peak pressure.</>
            )}
            {selectedZoneData.severity === 'med' && (
              <>🟡 <strong className="text-yellow-300">Moderate pressure:</strong> Within acceptable range. Our comfort layers maintain pressure below the capillary closure threshold of 32 mmHg where possible.</>
            )}
            {selectedZoneData.severity === 'low' && (
              <>✅ <strong className="text-green-300">Optimal:</strong> Excellent pressure distribution. SleepWorld's multi-layer system keeps this zone in the comfort zone all night.</>
            )}
            {selectedZoneData.severity === 'gap' && (
              <>💙 <strong className="text-blue-300">Support gap:</strong> This natural waist curve has zero contact with ordinary mattresses. Our zone-mapped foam fills this gap, eliminating lower back muscle strain.</>
            )}
          </div>
        </div>
      )}

      {/* Zone list */}
      {!selectedZoneData && (
        <div className="space-y-1">
          <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">All Zones</div>
          {zones.map(z => {
            const col = SEVERITY_COLORS[z.severity];
            return (
              <button key={z.id} onClick={() => setSelectedZone(z.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900/60 transition-all">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: col.stroke }} />
                <span className="text-slate-300 text-xs flex-1 text-left">{z.label}</span>
                <span className="font-bold text-xs" style={{ color: col.text }}>
                  {compareType === 'sleepworld' ? z.mmhg : Math.round(z.mmhg * typicalMultiplier)} mmHg
                </span>
                <span className="text-[10px] text-slate-500">{col.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

