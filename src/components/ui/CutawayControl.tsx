import React from 'react';
import { useShowroomStore } from '../../store/showroomStore';
import { Sliders } from 'lucide-react';

export const CutawayControl: React.FC = () => {
  const { mode, cutawaySlice, setCutawaySlice, language } = useShowroomStore();

  if (mode !== 'cutaway') return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl text-xs text-slate-200">
      <Sliders size={15} className="text-blue-400 shrink-0" />
      <span className="font-bold whitespace-nowrap">
        {language === 'hi' ? 'कट की स्थिति:' : 'Slice Position:'}
      </span>
      <input
        type="range"
        min="-7"
        max="7"
        step="0.1"
        value={cutawaySlice}
        onChange={(e) => setCutawaySlice(parseFloat(e.target.value))}
        className="w-32 md:w-48 accent-blue-500 cursor-pointer"
      />
      <span className="font-mono text-blue-400 font-bold w-12 text-right">
        {cutawaySlice.toFixed(1)}m
      </span>
    </div>
  );
};

