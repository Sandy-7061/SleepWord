import React, { useState } from 'react';
import { useShowroomStore } from '../../store/showroomStore';
import { MATTRESS_MODELS } from '../../data/mattresses';
import { LAYER_TYPES } from '../../data/layerTypes';
import { ChevronLeft, ChevronRight, ChevronDown, Info, Layers, Star, Mic2 } from 'lucide-react';

type TabId = 'overview' | 'material' | 'benefits' | 'pitch';

const TAB_CONFIG: { id: TabId; label: string; icon: React.FC<any> }[] = [
  { id: 'overview',  label: 'Overview',  icon: Info },
  { id: 'material',  label: 'Material',  icon: Layers },
  { id: 'benefits',  label: 'Benefits',  icon: Star },
  { id: 'pitch',     label: 'Pitch',     icon: Mic2 },
];

// Firmness label mapping
const FIRMNESS_LABELS = ['Soft', 'Med. Soft', 'Medium', 'Med. Firm', 'Firm'];
const FIRMNESS_COLORS = ['#60a5fa', '#818cf8', '#a78bfa', '#f59e0b', '#ef4444'];

const FirmnessBar: React.FC<{ level: number }> = ({ level }) => (
  <div className="flex gap-0.5 items-center">
    {[0, 1, 2, 3, 4].map(i => (
      <div key={i} className="h-3 w-5 rounded-sm transition-all"
        style={{
          background: i <= level ? FIRMNESS_COLORS[level] : 'rgba(255,255,255,0.08)',
          opacity: i <= level ? 1 : 0.4,
        }} />
    ))}
    <span className="ml-1.5 text-[11px] font-semibold" style={{ color: FIRMNESS_COLORS[level] }}>
      {FIRMNESS_LABELS[level]}
    </span>
  </div>
);

const PressureScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 90 ? '#22c55e' : score >= 75 ? '#eab308' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 60, height: 60 }}>
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-bold text-sm leading-none">{score}</span>
        <span className="text-slate-400 text-[8px]">/ 100</span>
      </div>
    </div>
  );
};

// ─── MATTRESS OVERVIEW (no layer selected) ────────────────────────────────────
const MattressOverview: React.FC = () => {
  const { selectedModelIndex, language } = useShowroomStore();
  const model = MATTRESS_MODELS[selectedModelIndex];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3 p-4">
      {/* Model hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700/50">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-white text-xl font-bold">{model.name}</h2>
            <p className="text-slate-400 text-xs">{model.layers.length} layers · {model.warranty}yr warranty</p>
          </div>
          <div className="text-right">
            <div className="text-blue-400 text-2xl font-bold">{model.warranty}<span className="text-xs">yr</span></div>
            <div className="text-slate-500 text-[10px]">Warranty</div>
          </div>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed">{model.description}</p>

        {/* Firmness */}
        <div className="mt-3">
          <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1.5">Firmness</div>
          <FirmnessBar level={model.firmness} />
        </div>
      </div>

      {/* Layer stack preview */}
      <div>
        <div className="text-slate-400 text-[11px] uppercase tracking-wide mb-2 font-semibold flex items-center gap-1">
          <Layers size={12} /> Layer Stack
        </div>
        <div className="space-y-1">
          {model.layers.map(([key, label], i) => {
            const info = LAYER_TYPES[key];
            return (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ background: info?.color || '#888' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[11px] font-semibold truncate">
                    {language === 'hi' ? info?.title[1] || info?.title[0] : info?.title[0] || key.toUpperCase()}
                  </div>
                  <div className="text-slate-500 text-[9px] truncate">{label}</div>
                </div>
                <div className="text-slate-500 text-[10px] flex-shrink-0">{info?.defaultThicknessCm}cm</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-3 text-[11px] text-blue-300">
        💡 Tap any layer in the mattress view to explore it in detail. Switch to <strong>Layer Explode</strong> mode for the full breakdown.
      </div>
    </div>
  );
};

// ─── LAYER DETAIL PANEL ───────────────────────────────────────────────────────
const LayerDetailPanel: React.FC = () => {
  const { selectedModelIndex, selectedLayerIndex, setSelectedLayerIndex, language } = useShowroomStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const model = MATTRESS_MODELS[selectedModelIndex];
  const [layerKey, layerLabel] = model.layers[selectedLayerIndex];
  const info = LAYER_TYPES[layerKey];

  if (!info) return (
    <div className="p-4 text-slate-400 text-sm">Layer info unavailable.</div>
  );

  const totalLayers = model.layers.length;
  const canPrev = selectedLayerIndex > 0;
  const canNext = selectedLayerIndex < totalLayers - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Layer header */}
      <div className="p-3 border-b border-slate-800/50 flex-shrink-0">
        {/* Nav row */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => canPrev && setSelectedLayerIndex(selectedLayerIndex - 1)}
            disabled={!canPrev}
            className={`p-1.5 rounded-lg transition-all ${canPrev ? 'hover:bg-slate-800 text-slate-300' : 'text-slate-700 cursor-not-allowed'}`}>
            <ChevronLeft size={16} />
          </button>
          <div className="text-slate-500 text-[11px] font-mono">
            Layer {selectedLayerIndex + 1} / {totalLayers}
          </div>
          <button onClick={() => canNext && setSelectedLayerIndex(selectedLayerIndex + 1)}
            disabled={!canNext}
            className={`p-1.5 rounded-lg transition-all ${canNext ? 'hover:bg-slate-800 text-slate-300' : 'text-slate-700 cursor-not-allowed'}`}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Layer title */}
        <div>
          <h3 className="text-white font-bold text-base leading-tight">
            {language === 'hi' && info.title[1] ? info.title[1] : info.title[0]}
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
            {language === 'hi' && info.tagline[1] ? info.tagline[1] : info.tagline[0]}
          </p>
        </div>

        {/* Color indicator */}
        <div className="mt-2 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-white/20" style={{ background: info.color }} />
          <span className="text-slate-400 text-[10px]">{layerLabel}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/50 flex-shrink-0 overflow-x-auto no-scrollbar">
        {TAB_CONFIG.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1 py-2.5 px-1 text-[11px] font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
              }`}>
              <Icon size={12} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Pressure score */}
            <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800/50 flex items-center gap-4">
              <PressureScoreRing score={info.benefits.pressureScore} />
              <div>
                <div className="text-white font-bold text-sm">{info.benefits.title}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">Pressure Relief Score</div>
                <div className="text-slate-300 text-[11px] mt-1">{info.benefits.desc.slice(0, 60)}…</div>
              </div>
            </div>

            {/* Quick specs */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Density', value: info.materialTech.density },
                { label: 'Breathability', value: info.materialTech.breathability.slice(0, 30) },
                { label: 'Cell Structure', value: info.materialTech.cellStructure.slice(0, 30) },
                { label: 'Durability', value: info.materialTech.durability.slice(0, 30) },
              ].map(spec => (
                <div key={spec.label} className="bg-slate-900/40 rounded-xl p-2 border border-slate-800/40">
                  <div className="text-slate-500 text-[9px] uppercase tracking-wider">{spec.label}</div>
                  <div className="text-slate-200 text-[11px] font-semibold mt-0.5 leading-snug">{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Ideal for */}
            <div className="bg-green-900/15 border border-green-800/30 rounded-xl p-2.5">
              <div className="text-green-400 text-[10px] font-semibold uppercase tracking-wide mb-1">✓ Ideal For</div>
              <div className="text-green-200 text-xs leading-relaxed">{info.benefits.idealFor}</div>
            </div>
          </>
        )}

        {/* MATERIAL TAB */}
        {activeTab === 'material' && (
          <>
            <div className="space-y-2">
              {[
                { label: 'Composition', value: info.materialTech.composition, icon: '🧬' },
                { label: 'Density', value: info.materialTech.density, icon: '⚖️' },
                { label: 'Cell Structure', value: info.materialTech.cellStructure, icon: '🔬' },
                { label: 'Breathability', value: info.materialTech.breathability, icon: '💨' },
                { label: 'Durability', value: info.materialTech.durability, icon: '🛡️' },
              ].map(item => (
                <div key={item.label} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/40">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span>{item.icon}</span>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">{item.label}</span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* BENEFITS TAB */}
        {activeTab === 'benefits' && (
          <>
            <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800/50 flex gap-3 items-start">
              <PressureScoreRing score={info.benefits.pressureScore} />
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{info.benefits.title}</div>
                <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">{info.benefits.desc}</p>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-3">
              <div className="text-blue-300 text-[10px] font-semibold uppercase tracking-wide mb-1.5">👤 Ideal For</div>
              <p className="text-blue-100 text-xs leading-relaxed">{info.benefits.idealFor}</p>
            </div>

            {/* Comparison pill */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-900/20 rounded-xl p-2.5 border border-green-800/30 text-center">
                <div className="text-green-400 text-xs font-bold">SleepWorld</div>
                <div className="text-green-200 font-bold text-xl">{info.benefits.pressureScore}</div>
                <div className="text-green-500 text-[9px]">Pressure Score</div>
              </div>
              <div className="bg-red-900/20 rounded-xl p-2.5 border border-red-800/30 text-center">
                <div className="text-red-400 text-xs font-bold">Market Avg.</div>
                <div className="text-red-200 font-bold text-xl">{Math.round(info.benefits.pressureScore * 0.6)}</div>
                <div className="text-red-500 text-[9px]">Pressure Score</div>
              </div>
            </div>
          </>
        )}

        {/* PITCH TAB */}
        {activeTab === 'pitch' && (
          <>
            {/* Hook */}
            <div className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-3">
              <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wide mb-1">🎯 Opening Hook</div>
              <p className="text-amber-100 text-xs leading-relaxed italic">"{info.employeePitch.hook}"</p>
            </div>

            {/* Script */}
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/40">
              <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">💬 Say This To Customer</div>
              <p className="text-slate-200 text-xs leading-relaxed">"{info.employeePitch.explanation}"</p>
            </div>

            {/* Demo action */}
            <div className="bg-purple-900/20 border border-purple-800/30 rounded-xl p-3">
              <div className="text-purple-400 text-[10px] font-bold uppercase tracking-wide mb-1">🖐 Demonstration</div>
              <p className="text-purple-100 text-xs leading-relaxed">{info.employeePitch.demonstrationAction}</p>
            </div>

            {/* Objection */}
            <div className="bg-red-900/15 border border-red-800/20 rounded-xl p-3">
              <div className="text-red-400 text-[10px] font-bold uppercase tracking-wide mb-1">🛡 Objection Handler</div>
              <p className="text-red-200 text-xs leading-relaxed">{info.employeePitch.objectionHandling}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export const LayerDeepDive: React.FC = () => {
  const { selectedLayerIndex, mode } = useShowroomStore();

  const showLayerDetail = selectedLayerIndex >= 0;

  return (
    <div className="h-full flex flex-col bg-slate-950/95 border-l border-slate-800/30 overflow-hidden">
      {showLayerDetail ? <LayerDetailPanel /> : <MattressOverview />}
    </div>
  );
};
