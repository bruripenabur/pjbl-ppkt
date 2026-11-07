import React from 'react';
import { TIMELINE_WEEKS, COURSE_DETAILS } from '../data/curriculumData';
import { CheckCircle2, Shield, Calendar, BookOpen } from 'lucide-react';

export const TimelineView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
          <Calendar className="w-4 h-4" />
          <span>JADWAL PELAKSANAAN PROYEK 7 MINGGU</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Timeline & Milestone PjBL
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          {COURSE_DETAILS.name} • Total Beban Waktu: <strong className="text-amber-300">{COURSE_DETAILS.totalJP}</strong>
        </p>
      </div>

      <div className="space-y-4">
        {TIMELINE_WEEKS.map((w) => (
          <div key={w.week} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-cyan-500/40 transition">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-300 font-mono font-black text-lg shrink-0 shadow-lg">
                W{w.week}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 font-semibold">{w.phase}</span>
                <h3 className="text-lg font-bold text-white">{w.title}</h3>
                <ul className="text-xs text-slate-300 space-y-1 mt-2 list-disc pl-4">
                  {w.activities.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shrink-0 max-w-xs">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Luaran Dihasilkan:</div>
              <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{w.output}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
