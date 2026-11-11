import React from 'react';
import { useShowroomStore } from '../../store/showroomStore';
import { Phone, Mail, Globe, MapPin, Building, X } from 'lucide-react';

export const ContactModal: React.FC = () => {
  const { isContactModalOpen, setIsContactModalOpen, language } = useShowroomStore();

  if (!isContactModalOpen) return null;

  return (
    <div
      onClick={() => setIsContactModalOpen(false)}
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 relative"
      >
        <button
          onClick={() => setIsContactModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <h3 className="font-serif font-bold text-2xl text-white">SleepWorld</h3>
        </div>
        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-4">
          #BecauseSleepMatters
        </p>

        <div className="space-y-3 text-xs mb-6">
          <a
            href="tel:+918966891159"
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 transition-all text-slate-200"
          >
            <Phone size={16} className="text-emerald-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Toll Free / Showroom Hotline</span>
              <span className="font-bold text-white text-sm">+91 896-689-1159</span>
            </div>
          </a>

          <a
            href="mailto:info@mysleepworld.com"
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 transition-all text-slate-200"
          >
            <Mail size={16} className="text-blue-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Email Enquiries</span>
              <span className="font-bold text-white">info@mysleepworld.com</span>
            </div>
          </a>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-200">
            <Globe size={16} className="text-indigo-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Website & Social</span>
              <span className="font-bold text-white">mysleepworld.com · @mysleepworld</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-200">
            <MapPin size={16} className="text-rose-400 mt-0.5 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400">Corporate Factory & HQ</span>
              <span className="text-slate-300 leading-relaxed block mt-0.5">
                Plot No. 11, 10/B and 9/A, Sector-B, Sanwer Road, Industrial Area, Indore, Madhya Pradesh.
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 mb-4">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Building size={13} />
            {language === 'hi' ? 'एक्सपीरियंस सेंटर (शोरूम)' : 'Showroom Experience Centres'}
          </span>
          <p className="text-xs text-slate-200 font-semibold">
            Indore · Ujjain · Ratlam · Jalgaon
          </p>
        </div>

        <button
          onClick={() => (window.location.href = 'tel:+918966891159')}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
        >
          {language === 'hi' ? 'कॉल करें' : 'Call Showroom Now'}
        </button>
      </div>
    </div>
  );
};

