import React, { useEffect } from 'react';
import { useShowroomStore } from '../../store/showroomStore';
import { MATTRESS_MODELS } from '../../data/mattresses';
import {
  Play,
  Square,
  Languages,
  PhoneCall,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    isPitchActive,
    setIsPitchActive,
    language,
    toggleLanguage,
    setMode,
    setSelectedLayerIndex,
    setIsContactModalOpen,
    selectedModelIndex,
  } = useShowroomStore();

  const currentModel = MATTRESS_MODELS[selectedModelIndex];
  const numLayers = currentModel.layers.length;

  // Guided Pitch Tour sequencer
  useEffect(() => {
    if (!isPitchActive) return;

    setMode('layers');
    let currentStep = numLayers - 1;
    setSelectedLayerIndex(currentStep);

    const interval = setInterval(() => {
      currentStep--;
      if (currentStep < 0) {
        // Move to Cutaway then Sleep Test
        setMode('sleeptest');
        setIsPitchActive(false);
        clearInterval(interval);
      } else {
        setSelectedLayerIndex(currentStep);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isPitchActive, numLayers, setMode, setSelectedLayerIndex, setIsPitchActive]);

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 z-20">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-500/30 text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <div>
            <h1 className="font-serif font-bold text-lg tracking-wide text-white leading-none">
              SleepWorld
            </h1>
            <span className="text-[9px] uppercase tracking-widest text-blue-200 block font-mono font-semibold">
              #BecauseSleepMatters
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Guided Pitch Button */}
        <button
          onClick={() => setIsPitchActive(!isPitchActive)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer ${
            isPitchActive
              ? 'bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold shadow-amber-500/20'
          }`}
        >
          {isPitchActive ? <Square size={13} /> : <Play size={13} fill="currentColor" />}
          <span>
            {isPitchActive
              ? language === 'hi' ? 'रोकें (Stop)' : 'Stop Pitch'
              : language === 'hi' ? 'गाइडेड पिच ▶' : 'Guided Pitch ▶'}
          </span>
        </button>

        {/* Language switch */}
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          title="Toggle Language"
        >
          <Languages size={14} className="text-blue-400" />
          <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>

        {/* Contact info modal */}
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Contact & Experience Centres"
        >
          <PhoneCall size={15} />
        </button>

        {/* Reset view */}
        <button
          onClick={() => {
            setIsPitchActive(false);
            setMode('real');
            setSelectedLayerIndex(-1);
          }}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Reset to Real View"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
};

