import React from 'react';
import { RoleType } from '../types';
import { COURSE_DETAILS, GROUPS_DATA } from '../data/curriculumData';
import { Shield, BookOpen, Users, Award, Terminal, FileText, CheckCircle2, LogOut, MessageSquare } from 'lucide-react';

interface NavbarProps {
  currentRole: RoleType;
  onSelectRole: (role: RoleType) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onTriggerCommand: (cmd: string) => void;
  loggedInUser: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  activeTab,
  onSelectTab,
  onTriggerCommand,
  loggedInUser,
  onLogout
}) => {
  const isLecturer = currentRole === 'lecturer';
  const currentGroup = GROUPS_DATA.find(g => g.id === currentRole);

  return (
    <header className="bg-slate-900 text-white shadow-xl border-b border-cyan-500/30 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      {/* Top Banner with Unpatti Logo & Info */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 px-4 py-2 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <img 
            src="/assets/aistudio/logo-unpatti-satuta-trans_3a9e0d9e.png" 
            alt="Unpatti Logo" 
            className="w-5 h-5 object-contain"
          />
          <span className="bg-cyan-600 text-white px-2 py-0.5 rounded font-bold tracking-wide">UNPATTI AMBON</span>
          <span className="text-slate-300 font-medium">Prodi Ilmu Pemerintahan | {COURSE_DETAILS.code}</span>
          <span className="hidden md:inline text-cyan-400 font-semibold">• Dosen: {COURSE_DETAILS.lecturer}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-amber-300 font-medium">
            Login: <strong>{loggedInUser}</strong> ({isLecturer ? 'Dosen Pengampu' : currentGroup?.name})
          </span>
          <button
            onClick={onLogout}
            className="bg-red-900/60 hover:bg-red-800 text-red-200 px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center space-x-1 transition"
          >
            <LogOut className="w-3 h-3" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-cyan-500/30 p-1 flex items-center justify-center shadow-lg">
            <img 
              src="/assets/aistudio/logo-unpatti-satuta-trans_3a9e0d9e.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              Coastal-Gov AI Assistant
            </h1>
            <p className="text-xs text-slate-400">Universitas Pattimura • PjBL PPKT 2026/2027</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isLecturer ? 'Dashboard Dosen & Buku' : 'Workspace Kelompok'}</span>
          </button>

          <button
            onClick={() => onSelectTab('forum')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'forum'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Forum Diskusi</span>
          </button>

          <button
            onClick={() => onSelectTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'timeline'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Timeline 7 Minggu</span>
          </button>

          <button
            onClick={() => onSelectTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'templates'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Outline Bab (1-6)</span>
          </button>

          <button
            onClick={() => onSelectTab('drill')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'drill'
                ? 'bg-amber-600 text-white shadow-md animate-pulse'
                : 'text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Uji Presentasi (/uji_presentasi)</span>
          </button>
        </div>
      </div>

      {/* Role Switcher & Special Command Bar (Lecturer Only or Restricted) */}
      <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          <span className="text-slate-400 font-semibold flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Peran Aktif:</span>
          </span>
          
          {isLecturer ? (
            <div className="flex items-center space-x-2">
              <span className="bg-cyan-700 text-white px-3 py-1 rounded-md font-bold text-xs">
                👨‍🏫 Dosen Pengampu (Akses Penuh Seluruh Kelompok)
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="bg-blue-700 text-white px-3 py-1 rounded-md font-bold text-xs">
                👥 {currentGroup?.name} (Privasi Terjaga • Hanya Akses Kelompok Sendiri)
              </span>
            </div>
          )}
        </div>

        {/* Special Command Shortcuts */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-mono hidden lg:inline">Perintah AI:</span>
          {isLecturer && (
            <button
              onClick={() => onTriggerCommand('/rekap_dosen')}
              className="bg-slate-800 hover:bg-cyan-900 text-cyan-300 px-2.5 py-1 rounded border border-cyan-700/40 font-mono flex items-center space-x-1 transition"
              title="Rekapitulasi Dosen seluruh kelompok"
            >
              <Terminal className="w-3 h-3" />
              <span>/rekap_dosen</span>
            </button>
          )}
          <button
            onClick={() => onTriggerCommand('/template_bab')}
            className="bg-slate-800 hover:bg-cyan-900 text-cyan-300 px-2.5 py-1 rounded border border-cyan-700/40 font-mono flex items-center space-x-1 transition"
            title="Lihat template Bab 1-6"
          >
            <Terminal className="w-3 h-3" />
            <span>/template_bab</span>
          </button>
          <button
            onClick={() => onTriggerCommand('/uji_presentasi')}
            className="bg-amber-950/60 hover:bg-amber-900 text-amber-300 px-2.5 py-1 rounded border border-amber-700/40 font-mono flex items-center space-x-1 transition"
            title="Aktifkan simulasi ujian presentasi"
          >
            <Award className="w-3 h-3" />
            <span>/uji_presentasi</span>
          </button>
        </div>
      </div>
    </header>
  );
};
