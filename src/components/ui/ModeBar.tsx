import React from 'react';
import { useShowroomStore, ViewMode } from '../../store/showroomStore';
import { Eye, Layers, Scissors, Compass, UserCheck } from 'lucide-react';

export const ModeBar: React.FC = () => {
  const { mode, setMode, language } = useShowroomStore();

  const modes: { id: ViewMode; icon: React.ReactNode; labelEn: string; labelHi: string }[] = [
    {
      id: 'real',
      icon: <Eye size={16} />,
      labelEn: 'Real View',
      labelHi: 'असली रूप',
    },
    {
      id: 'layers',
      icon: <Layers size={16} />,
      labelEn: 'Layers Tech',
      labelHi: 'परतें और तकनीक',
    },
    {
      id: 'cutaway',
      icon: <Scissors size={16} />,
      labelEn: 'Cross-Section',
      labelHi: 'अंदर का कट',
    },
    {
      id: 'blueprint',
      icon: <Compass size={16} />,
      labelEn: 'Blueprint',
      labelHi: 'ब्लूप्रिंट',
    },
    {
      id: 'sleeptest',
      icon: <UserCheck size={16} />,
      labelEn: 'Sleep Test & Spine',
      labelHi: 'सोने का टेस्ट और रीढ़',
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-x-auto max-w-full">
      {modes.map((m) => {
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            {m.icon}
            <span>{language === 'hi' ? m.labelHi : m.labelEn}</span>
          </button>
        );
      })}
    </div>
  );
};

