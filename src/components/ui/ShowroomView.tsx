import React, { useState, useRef } from 'react';
import { useShowroomStore } from '../../store/showroomStore';
import { MATTRESS_MODELS } from '../../data/mattresses';
import { LAYER_TYPES } from '../../data/layerTypes';
import { RealMattressCanvas } from '../canvas/RealMattressCanvas';
import { LayerThumbnail } from './LayerThumbnail';
import {
  Box,
  Image as ImageIcon,
  RotateCw,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  X,
  Wind,
  Shield,
  Feather,
  Layers,
  Volume2,
  VolumeX,
  ArrowLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

export const ShowroomView: React.FC = () => {
  const {
    selectedModelIndex,
    setSelectedModelIndex,
    language,
    toggleLanguage,
    isPitchActive,
    setIsPitchActive,
  } = useShowroomStore();

  const currentModel = MATTRESS_MODELS[selectedModelIndex] || MATTRESS_MODELS[0];
  const layers = currentModel.layers;

  // View state
  const [isRealView, setIsRealView] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [hoveredLayerIndex, setHoveredLayerIndex] = useState<number>(-1);
  const [pulledLayerIndex, setPulledLayerIndex] = useState<number>(-1);
  const [zoomAction, setZoomAction] = useState<'in' | 'out' | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  // Isolated Single Layer View (Image 3)
  const [isolatedLayerKey, setIsolatedLayerKey] = useState<string | null>(null);

  // Connecting line positions
  const [screenPositions, setScreenPositions] = useState<{ index: number; x: number; y: number }[]>([]);
  const drawerItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleReset = () => {
    setCameraPreset(1);
    setAutoRotate(false);
    setIsRealView(true);
    setIsolatedLayerKey(null);
    setPulledLayerIndex(-1);
    setIsDrawerOpen(true);
  };

  const selectedLayerInfo = isolatedLayerKey ? LAYER_TYPES[isolatedLayerKey] : null;
  const pulledLayer = pulledLayerIndex >= 0 ? layers[pulledLayerIndex] : null;
  const pulledLayerInfo = pulledLayer ? LAYER_TYPES[pulledLayer[0]] : null;

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#050b14] text-white overflow-hidden select-none font-sans">
      {/* ─── TOP BRAND HEADER ──────────────────────────────────────────────── */}
      <header className="relative z-30 flex items-center justify-between px-6 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/70">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 12c3-3 6-3 9 0s6 3 9 0" />
              <path d="M2 16c3-3 6-3 9 0s6 3 9 0" opacity="0.6" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white leading-none">
              SleepWorld
            </h1>
            <span className="text-[10px] tracking-widest text-blue-300 font-semibold uppercase">
              #BecauseSleepMatters
            </span>
          </div>
        </div>

        {/* Mattress Model Selector Dropdown */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 shadow-inner">
          <span className="text-slate-400 text-xs font-medium">Model:</span>
          <select
            value={selectedModelIndex}
            onChange={(e) => {
              setSelectedModelIndex(Number(e.target.value));
              setIsolatedLayerKey(null);
              setPulledLayerIndex(-1);
            }}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-2"
          >
            {MATTRESS_MODELS.map((m, idx) => (
              <option key={m.id} value={idx} className="bg-slate-900 text-white">
                {m.name} ({m.layers.length} Layers)
              </option>
            ))}
          </select>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Mode Switch: 3D Exploded View vs Real Arranged View */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-md">
            <button
              onClick={() => {
                setIsRealView(false);
                setIsolatedLayerKey(null);
                setCameraPreset(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isRealView && !isolatedLayerKey
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box size={14} />
              <span>3D Explode</span>
            </button>
            <button
              onClick={() => {
                setIsRealView(true);
                setIsolatedLayerKey(null);
                setPulledLayerIndex(-1);
                setCameraPreset(1); // Real Showroom View
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isRealView
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon size={14} />
              <span>Real Bed View</span>
            </button>
          </div>

          {/* Guided Audio Pitch Mode */}
          <button
            onClick={() => setIsPitchActive(!isPitchActive)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isPitchActive
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Guided Sales Pitch"
          >
            {isPitchActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Language Switch */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>

          {/* Close / Reset */}
          <button
            onClick={handleReset}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Reset View"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* ─── MAIN 3D SHOWROOM CANVAS ───────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Real Three.js WebGL Canvas with OrbitControls & Gestures */}
        <div className="absolute inset-0">
          <RealMattressCanvas
            isIsolatedMode={!!isolatedLayerKey}
            isolatedLayerKey={isolatedLayerKey}
            isRealView={isRealView}
            cameraPreset={cameraPreset}
            autoRotate={autoRotate}
            onLayerClick={(key, idx) => {
              setPulledLayerIndex(pulledLayerIndex === idx ? -1 : idx);
            }}
            onLayerOpenIsolated={(key) => setIsolatedLayerKey(key)}
            hoveredLayerIndex={hoveredLayerIndex}
            pulledLayerIndex={pulledLayerIndex}
            setPulledLayerIndex={setPulledLayerIndex}
            onScreenPositionsUpdate={setScreenPositions}
            zoomAction={zoomAction}
            onZoomReset={() => setZoomAction(null)}
          />
        </div>

        {/* ─── DYNAMIC CONNECTING LINES (FROM 3D STACK TO RIGHT DRAWER) ───── */}
        {!isolatedLayerKey && !isRealView && isDrawerOpen && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {screenPositions.map((pos) => {
              const isHovered = hoveredLayerIndex === pos.index || pulledLayerIndex === pos.index;
              const rowEl = drawerItemRefs.current[pos.index];
              let drawerX = window.innerWidth - 370;
              let drawerY = 150 + pos.index * 68;

              if (rowEl) {
                const rect = rowEl.getBoundingClientRect();
                drawerX = rect.left + 4;
                drawerY = rect.top + rect.height / 2;
              }

              if (pos.x < 30 || pos.x > drawerX) return null;

              return (
                <g key={pos.index}>
                  <line
                    x1={pos.x}
                    y1={pos.y}
                    x2={drawerX}
                    y2={drawerY}
                    stroke={isHovered ? '#00e5ff' : 'rgba(56, 189, 248, 0.45)'}
                    strokeWidth={isHovered ? 2.5 : 1.4}
                    strokeDasharray={isHovered ? 'none' : '4,4'}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isHovered ? 5 : 3.5}
                    fill={isHovered ? '#ffffff' : '#38bdf8'}
                  />
                  <circle
                    cx={drawerX}
                    cy={drawerY}
                    r={isHovered ? 5 : 3.5}
                    fill={isHovered ? '#ffffff' : '#38bdf8'}
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* ─── PULLED-OUT LAYER BANNER (WHEN USER SLIDES LAYER LEFT) ────────── */}
        {!isolatedLayerKey && pulledLayerIndex >= 0 && pulledLayer && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/60 shadow-2xl shadow-cyan-500/20 px-5 py-2.5 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-9 h-6 rounded-lg overflow-hidden flex-shrink-0">
              <LayerThumbnail layerKey={pulledLayer[0]} size={36} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                Layer Pulled Out for Inspection
              </div>
              <div className="text-xs font-bold text-white">
                {pulledLayerInfo?.title[0] || pulledLayer[1]}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-700 mx-1" />
            <button
              onClick={() => setIsolatedLayerKey(pulledLayer[0])}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Eye size={13} />
              <span>Inspect in 360°</span>
            </button>
            <button
              onClick={() => setPulledLayerIndex(-1)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Push layer back"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ─── LEFT ANGLE PRESET THUMBNAILS (IMAGE 2) ──────────────────────── */}
        {!isolatedLayerKey && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
            {[
              { id: 0, label: '3D Exploded', desc: 'Exploded stack' },
              { id: 1, label: 'Real Bed', desc: 'Closed profile' },
              { id: 2, label: 'Corner Detail', desc: 'Cutaway zoom' },
              { id: 3, label: 'Quilt Macro', desc: 'Fabric surface' },
            ].map((preset) => {
              const isActive = cameraPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setCameraPreset(preset.id);
                    if (preset.id === 1) setIsRealView(true);
                    else setIsRealView(false);
                  }}
                  className={`w-24 h-16 rounded-xl overflow-hidden relative border transition-all cursor-pointer shadow-lg bg-slate-900/90 ${
                    isActive
                      ? 'border-blue-400 ring-2 ring-blue-500/60 shadow-blue-500/30 scale-105'
                      : 'border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gradient-to-br from-slate-800 to-slate-950">
                    <Box size={18} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                    <span className="text-[9px] font-bold text-white mt-1 leading-tight text-center">
                      {preset.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ─── RIGHT DRAWER: MATTRESS LAYERS (IMAGE 1 & 2) ─────────────────── */}
        {!isolatedLayerKey && (
          <>
            {/* Floating button when drawer is collapsed */}
            {!isDrawerOpen && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="absolute right-6 top-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 shadow-2xl text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-md"
                title="Expand Mattress Layers Drawer"
              >
                <Layers size={16} className="text-blue-400" />
                <span>Layers ({layers.length})</span>
                <ChevronRight size={14} className="rotate-180 text-slate-400" />
              </button>
            )}

            <aside
              className={`absolute right-6 top-6 bottom-20 w-88 z-20 flex flex-col bg-slate-900/85 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
                isDrawerOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-[calc(100%+32px)] opacity-0 pointer-events-none'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-white leading-tight">
                      Mattress Layers
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Engineered for Perfect Sleep
                    </p>
                  </div>
                </div>
                {/* Collapse button */}
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Collapse drawer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Scrollable Layer List */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                {layers.map(([key, label], idx) => {
                  const info = LAYER_TYPES[key];
                  const isHovered = hoveredLayerIndex === idx;
                  const isPulled = pulledLayerIndex === idx;

                  return (
                    <div
                      key={`${key}-${idx}`}
                      ref={(el) => {
                        drawerItemRefs.current[idx] = el;
                      }}
                      onMouseEnter={() => setHoveredLayerIndex(idx)}
                      onMouseLeave={() => setHoveredLayerIndex(-1)}
                      onClick={() => {
                        if (isRealView) {
                          setIsRealView(false);
                          setCameraPreset(0);
                        }
                        setPulledLayerIndex(isPulled ? -1 : idx);
                      }}
                      onDoubleClick={() => setIsolatedLayerKey(key)}
                      className={`flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all border group ${
                        isPulled
                          ? 'bg-cyan-600/20 border-cyan-400 shadow-lg shadow-cyan-500/30 translate-x-[-6px]'
                          : isHovered
                          ? 'bg-blue-600/15 border-blue-500/60 shadow-lg shadow-blue-500/20 scale-[1.02]'
                          : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/50'
                      }`}
                    >
                      {/* 3D Realistic Layer Thumbnail */}
                      <div className="w-16 h-11 flex-shrink-0">
                        <LayerThumbnail layerKey={key} size={64} />
                      </div>

                      {/* Titles */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-xs text-white truncate leading-snug">
                            {language === 'hi' && info?.title[1]
                              ? info.title[1]
                              : info?.title[0] || label.split('-')[0]}
                          </h3>
                          {/* Pull out / Inspect button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsolatedLayerKey(key);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[10px] transition-all ml-1"
                            title="Open in 360°"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight line-clamp-2 mt-0.5">
                          {label.includes('-')
                            ? label.split('-')[1]?.trim()
                            : info?.tagline[0] || label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Tip for employee */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[10px] text-slate-400 text-center">
                💡 <strong>Slide Left</strong> on mattress to pull out layer • <strong>Double-click</strong> to inspect in 360°
              </div>
            </aside>
          </>
        )}

        {/* ─── ISOLATED SINGLE LAYER 3D VIEW (IMAGE 3) ─────────────────────── */}
        {isolatedLayerKey && (
          <>
            {/* Top Right (X) Close Button */}
            <button
              onClick={() => setIsolatedLayerKey(null)}
              className="absolute top-6 right-6 z-40 p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white shadow-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Return to full mattress"
            >
              <ArrowLeft size={16} />
              <span className="text-xs font-bold pr-1">Back to Mattress</span>
            </button>

            {/* Right Vertical Thumbnail Strip (switch between layers) */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5 bg-slate-950/70 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-md">
              {layers.map(([key]) => {
                const isSelected = isolatedLayerKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setIsolatedLayerKey(key)}
                    className={`w-14 h-10 rounded-xl overflow-hidden relative border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-400 ring-2 ring-blue-500 shadow-lg shadow-blue-500/50 scale-105'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <LayerThumbnail layerKey={key} size={56} />
                  </button>
                );
              })}
            </div>

            {/* Bottom Left Card: Layer Details */}
            <div className="absolute left-6 bottom-6 z-30 flex items-center gap-3.5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-3.5 shadow-2xl max-w-sm">
              <div className="w-14 h-10 rounded-xl overflow-hidden flex-shrink-0">
                <LayerThumbnail layerKey={isolatedLayerKey} size={56} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white leading-tight">
                  {selectedLayerInfo?.title[0] || 'Mattress Layer'}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-blue-300 mt-0.5">
                  <Wind size={13} />
                  <span className="truncate">
                    {selectedLayerInfo?.tagline[0] || 'Breathable & Pressure Relief'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Right: 3 Layer Feature Badges */}
            <div className="absolute right-6 bottom-6 z-30 flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl px-4 py-2.5 shadow-2xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Feather size={14} className="text-blue-400" />
                <span>Ultra Soft</span>
              </div>
              <div className="w-px h-3 bg-slate-700" />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Wind size={14} className="text-cyan-400" />
                <span>Breathable</span>
              </div>
              <div className="w-px h-3 bg-slate-700" />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Shield size={14} className="text-emerald-400" />
                <span>Long Lasting</span>
              </div>
            </div>
          </>
        )}

        {/* ─── BOTTOM CENTER TURNTABLE CONTROLS ────────────────────────────── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          {/* 360° indicator with curved arrows (Image 2 & 3) */}
          <div className="flex items-center gap-2 mb-2 px-3 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/30 text-[11px] font-bold text-cyan-400 shadow-lg backdrop-blur-md">
            <span className="text-cyan-400 font-extrabold">⟵</span>
            <span className="tracking-wider">360°</span>
            <span className="text-cyan-400 font-extrabold">⟶</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl px-3 py-1.5 shadow-2xl">
            {/* Rotate / Auto-Spin */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                autoRotate ? 'text-blue-400 bg-blue-950/40' : 'text-slate-400 hover:text-white'
              }`}
              title="Slow Auto-rotate 360°"
            >
              <RotateCw size={16} className={autoRotate ? 'animate-spin' : ''} />
              <span className="text-[9px] font-semibold">Rotate</span>
            </button>

            {/* Zoom In */}
            <button
              onClick={() => setZoomAction('in')}
              className="flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Zoom in closer"
            >
              <ZoomIn size={16} />
              <span className="text-[9px] font-semibold">Zoom +</span>
            </button>

            {/* Zoom Out */}
            <button
              onClick={() => setZoomAction('out')}
              className="flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut size={16} />
              <span className="text-[9px] font-semibold">Zoom -</span>
            </button>

            {/* Move / Recenter */}
            <button
              onClick={() => {
                if (isRealView) setCameraPreset(1);
                else setCameraPreset(0);
              }}
              className="flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Recenter camera on mattress"
            >
              <Move size={16} />
              <span className="text-[9px] font-semibold">Center</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Toggle Fullscreen"
            >
              <Maximize2 size={16} />
              <span className="text-[9px] font-semibold">Fullscreen</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Reset position"
            >
              <RotateCcw size={16} />
              <span className="text-[9px] font-semibold">Reset</span>
            </button>
          </div>
        </div>

        {/* ─── BOTTOM LEFT CONTROLS & FEATURE BADGES (IMAGE 1 & 2) ─────────── */}
        {!isolatedLayerKey && (
          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-4">
            {/* 3D View / Real View Toggle (matching Image 1) */}
            <div className="flex bg-slate-950/80 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-xl">
              <button
                onClick={() => {
                  setIsRealView(false);
                  setCameraPreset(0);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isRealView
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box size={14} />
                <span>3D View</span>
              </button>
              <button
                onClick={() => {
                  setIsRealView(true);
                  setCameraPreset(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isRealView
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon size={14} />
                <span>Real View</span>
              </button>
            </div>

            {/* 4 Feature Badges */}
            <div className="hidden xl:flex items-center gap-5 bg-slate-950/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full border border-blue-500/40 bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm">
                  ❄️
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">Cool Comfort</div>
                  <div className="text-[9px] text-slate-400">Heat dissipating</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full border border-purple-500/40 bg-purple-500/10 flex items-center justify-center text-purple-400 text-sm">
                  🦴
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">Orthopedic</div>
                  <div className="text-[9px] text-slate-400">Spine alignment</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm">
                  🍃
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">Ultra Soft</div>
                  <div className="text-[9px] text-slate-400">Cloud cushioning</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 text-sm">
                  🛡️
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">Long Lasting</div>
                  <div className="text-[9px] text-slate-400">{currentModel.warranty}y Warranty</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
