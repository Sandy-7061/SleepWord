import React from 'react';
import { useShowroomStore } from '../../store/showroomStore';
import { MATTRESS_MODELS } from '../../data/mattresses';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const ModelSelector: React.FC = () => {
  const { selectedModelIndex, setSelectedModelIndex, language } = useShowroomStore();

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2.5 px-4 flex items-center gap-2 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md z-20">
      <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-amber-400 uppercase tracking-wider shrink-0">
        <Sparkles size={14} />
        <span>{language === 'hi' ? 'मॉडल चुनें' : 'Models'}</span>
      </div>

      {MATTRESS_MODELS.map((model, index) => {
        const isSelected = selectedModelIndex === index;
        return (
          <button
            key={model.id}
            onClick={() => setSelectedModelIndex(index)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
              isSelected
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/50 scale-105'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <span className="font-mono text-[10px] opacity-75">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{model.name}</span>
            {model.warranty >= 10 && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded-md">
                <ShieldCheck size={11} />
                {model.warranty}y
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

