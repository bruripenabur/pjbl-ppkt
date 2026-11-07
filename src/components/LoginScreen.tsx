import React, { useState } from 'react';
import { RoleType } from '../types';
import { GROUPS_DATA, COURSE_DETAILS } from '../data/curriculumData';
import { Shield, Users, Award, Lock, ArrowRight, BookOpen, GraduationCap, UserPlus, X, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: RoleType, userName: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<RoleType>('lecturer');
  const [userName, setUserName] = useState<string>('Dr. Bruri Melky Laimeheriwa, S.Pi., M.Si.');
  const [passcode, setPasscode] = useState<string>('');

  // Register Modal State
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [regName, setRegName] = useState<string>('');
  const [regGroupId, setRegGroupId] = useState<string>('group1');
  const [regPin, setRegPin] = useState<string>('');

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    if (role === 'lecturer') {
      setUserName('Dr. Bruri Melky Laimeheriwa, S.Pi., M.Si.');
    } else {
      const g = GROUPS_DATA.find(item => item.id === role);
      if (g) {
        setUserName(g.members[0]);
      }
    }
    setPasscode('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate PIN / Token
    if (selectedRole === 'lecturer' && passcode !== '12345') {
      alert('PIN Dosen salah! Silakan coba lagi.');
      return;
    }
    if (selectedRole !== 'lecturer' && passcode !== '12345678') {
      alert('PIN Kelompok salah! Silakan coba lagi.');
      return;
    }

    onLogin(selectedRole, userName);
  };

  const handleRegisterMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPin.trim()) {
      alert('Mohon isi nama lengkap dan PIN pendaftaran.');
      return;
    }
    if (regPin !== '12345678') {
      alert('PIN Pendaftaran kelompok salah! Gunakan PIN kelompok yang valid (12345678).');
      return;
    }

    const targetGroup = GROUPS_DATA.find(g => g.id === regGroupId);
    if (targetGroup && !targetGroup.members.includes(regName.trim())) {
      targetGroup.members.push(regName.trim());
    }

    setShowRegisterModal(false);
    onLogin(regGroupId as RoleType, regName.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="max-w-4xl w-full bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl p-8 relative z-10 space-y-8 backdrop-blur-xl">
        {/* Unpatti Logo & Header Branding */}
        <div className="text-center space-y-3 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border border-cyan-500/30 shadow-xl p-2 mb-1">
            <img 
              src="/assets/aistudio/logo-unpatti-satuta-trans_3a9e0d9e.png" 
              alt="Logo Universitas Pattimura" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-400 font-semibold tracking-widest uppercase">
              UNIVERSITAS PATTIMURA • FAKULTAS ILMU SOSIAL DAN ILMU POLITIK
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
              PRODI ILMU PEMERINTAHAN • SEMESTER 3 (TA 2026/2027)
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl mx-auto">
              {COURSE_DETAILS.name} ({COURSE_DETAILS.code})
            </p>
          </div>
        </div>

        {/* Role Selection Grid & Register Button */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pilih Peran Masuk (Login Berbasis Peran • Kerahasiaan Kelompok Terjaga):
            </label>
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Anggota Kelompok</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Lecturer Role */}
            <button
              type="button"
              onClick={() => handleRoleSelect('lecturer')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-3 ${
                selectedRole === 'lecturer'
                  ? 'bg-cyan-950 border-cyan-500 text-white shadow-lg ring-2 ring-cyan-400/50'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">👨‍🏫</span>
                <span className="text-[10px] font-mono bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded">Dosen</span>
              </div>
              <div>
                <div className="font-bold text-sm">Dosen Pengampu</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Dr. Bruri Melky Laimeheriwa</div>
              </div>
            </button>

            {/* Groups 1-4 */}
            {GROUPS_DATA.map((grp) => (
              <button
                key={grp.id}
                type="button"
                onClick={() => handleRoleSelect(grp.id as RoleType)}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-3 ${
                  selectedRole === grp.id
                    ? 'bg-blue-950 border-blue-500 text-white shadow-lg ring-2 ring-blue-400/50'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">👥</span>
                  <span className="text-[10px] font-mono bg-blue-900 text-blue-300 px-2 py-0.5 rounded">Kel {grp.number}</span>
                </div>
                <div>
                  <div className="font-bold text-sm truncate">Kelompok {grp.number}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{grp.targetChapters}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form Inputs */}
        <form onSubmit={handleSubmit} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Mahasiswa / Dosen:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PIN / Token Akses:</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Sistem Manajemen Proyek PPKT • Universitas Pattimura</span>
            </span>

            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-8 py-3 rounded-xl text-sm shadow-lg shadow-cyan-600/30 flex items-center space-x-2 transition transform hover:scale-105"
            >
              <span>Masuk ke Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Register Group Member Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Pendaftaran Anggota Kelompok Baru</span>
              </h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap Mahasiswa</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Kelompok PjBL</label>
                <select
                  value={regGroupId}
                  onChange={(e) => setRegGroupId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {GROUPS_DATA.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.targetChapters})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PIN / Token Pendaftaran Kelompok</label>
                <input
                  type="password"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition"
                >
                  Daftar & Masuk Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
