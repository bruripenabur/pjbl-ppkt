import React, { useState, useEffect } from 'react';
import { GroupInfo, SubmissionItem, RoleType, AccessRequest } from '../types';
import { CHAPTER_OUTLINES, TIMELINE_WEEKS, GROUPS_DATA } from '../data/curriculumData';
import { dbService } from '../services/db';
import { Shield, BookOpen, Send, CheckCircle2, AlertTriangle, FileText, Sparkles, Smile, Meh, Frown, Users, Lock, Eye, Key, Plus, X } from 'lucide-react';

interface StudentWorkspaceProps {
  group: GroupInfo;
  currentRole: RoleType;
  submissions: SubmissionItem[];
  onSubmitDraft: (newSub: Omit<SubmissionItem, 'id' | 'submittedAt'>) => void;
  onSelectRole: (role: RoleType) => void;
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  group,
  currentRole,
  submissions,
  onSubmitDraft
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'my_workspace' | 'explore_others' | 'access_requests'>('my_workspace');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(group.members[0]);
  const [week, setWeek] = useState<number>(3);

  // Access requests state
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [selectedExploreGroupId, setSelectedExploreGroupId] = useState<string>(
    GROUPS_DATA.find(g => g.id !== group.id)?.id || 'group1'
  );
  
  // Access Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTargetGroup, setRequestTargetGroup] = useState<GroupInfo>(GROUPS_DATA[0]);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    async function loadRequests() {
      try {
        const reqs = await dbService.getAccessRequests();
        setAccessRequests(reqs);
      } catch (e) {
        console.error('Failed to load access requests:', e);
      }
    }
    loadRequests();

    const handleReqUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setAccessRequests(customEvent.detail);
      }
    };
    window.addEventListener('pjbl_requests_update', handleReqUpdate);
    return () => {
      window.removeEventListener('pjbl_requests_update', handleReqUpdate);
    };
  }, []);

  const groupSubmissions = submissions.filter(s => s.groupId === group.id);
  const relevantChapters = CHAPTER_OUTLINES.filter(ch => ch.assignedGroup === group.name.split(':')[0]);

  // Sentiment Analysis helper
  const analyzeSentiment = (text: string) => {
    if (!text || text.length < 20) return { label: 'Belum cukup teks', score: 50, tone: 'neutral' };
    const lower = text.toLowerCase();
    const optimisticWords = ['optimal', 'strategis', 'sejahtera', 'berdaulat', 'berkembang', 'sinergi', 'berkelanjutan', 'sukses', 'kuat', 'efektif', 'maju'];
    const hesitationWords = ['kendala', 'kesulitan', 'belum', 'terbatas', 'masalah', 'ancaman', 'keraguan', 'tertinggal', 'lemah', 'risiko', 'berat'];

    let optCount = 0;
    let hesCount = 0;

    optimisticWords.forEach(w => { if (lower.includes(w)) optCount++; });
    hesitationWords.forEach(w => { if (lower.includes(w)) hesCount++; });

    const total = optCount + hesCount || 1;
    const optimismScore = Math.round((optCount / total) * 100);

    if (optimismScore >= 65) {
      return { label: 'Optimisme Tinggi & Solutif', score: optimismScore, tone: 'positive' };
    } else if (optimismScore >= 40) {
      return { label: 'Analisis Kritis & Waspada', score: optimismScore, tone: 'neutral' };
    } else {
      return { label: 'Keraguan Tinggi / Perlu Penguatan Solusi', score: optimismScore, tone: 'negative' };
    }
  };

  const currentSentiment = analyzeSentiment(content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Mohon isi judul dan draf materi terlebih dahulu.');
      return;
    }

    const targetChap = group.targetChapters;
    const storageTag = `[STORAGE VAULT] -> Kelompok: ${group.number} | Minggu Ke: ${week} | Bab Target: ${targetChap} | Status: Pending Review`;
    
    const hasRegValidation = content.toLowerCase().includes('perpres') || content.toLowerCase().includes('kepres') || content.toLowerCase().includes('gazetir') || content.toLowerCase().includes('ungegn');
    const cogScore = hasRegValidation ? 92 : 80;
    const creScore = content.length > 200 ? 88 : 75;
    const solScore = content.toLowerCase().includes('nkri') || content.toLowerCase().includes('kesejahteraan') || content.toLowerCase().includes('perbatasan') ? 94 : 82;

    onSubmitDraft({
      groupId: group.id,
      groupName: group.name,
      week,
      targetChapter: targetChap,
      title,
      content,
      author,
      status: 'Approved',
      rubric: {
        cognitive: { score: cogScore, notes: hasRegValidation ? 'Sitasi regulasi/data gazetir terdeteksi dengan baik.' : 'Perlu memperkuat rujukan Perpres/Kepres/Gazetir.' },
        creativity: { score: creScore, notes: 'Struktur draf cukup jelas dan sistematis.' },
        solution: { score: solScore, notes: 'Relevansi terhadap kedaulatan NKRI dan kesejahteraan masyarakat pulau terluar terpenuhi.' }
      },
      storageTag: `[STORAGE VAULT] -> Kelompok: ${group.number} | Minggu Ke: ${week} | Bab Target: ${targetChap} | Status: Approved`,
      feedback: `Draf divalidasi Sistem & Analisis Sentimen [${currentSentiment.label} (${currentSentiment.score}% Optimisme)]. Sangat baik!`
    });

    setTitle('');
    setContent('');
    alert('Draf berhasil disetorkan ke Storage Vault dengan analisis sentimen otomatis!');
  };

  const handleSendAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim() || !requestReason.trim()) {
      alert('Mohon lengkapi judul permintaan dan alasan.');
      return;
    }

    const newReq: AccessRequest = {
      id: `req-${Date.now()}`,
      fromGroupId: group.id,
      fromGroupName: group.name,
      toGroupId: requestTargetGroup.id,
      toGroupName: requestTargetGroup.name,
      title: requestTitle,
      reason: requestReason,
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    await dbService.saveAccessRequest(newReq);
    setRequestTitle('');
    setRequestReason('');
    setShowRequestModal(false);
    alert(`Permintaan akses ke ${requestTargetGroup.name} berhasil dikirim!`);
  };

  const handleUpdateReqStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    const updated = await dbService.updateAccessRequestStatus(id, status);
    setAccessRequests(updated);
  };

  // Check if current group has approved access to target group's data
  const hasApprovedAccessTo = (targetGroupId: string) => {
    if (targetGroupId === group.id) return true;
    const req = accessRequests.find(r => r.fromGroupId === group.id && r.toGroupId === targetGroupId && r.status === 'Approved');
    return !!req;
  };

  const exploreGroup = GROUPS_DATA.find(g => g.id === selectedExploreGroupId) || GROUPS_DATA[0];
  const exploreSubmissions = submissions.filter(s => s.groupId === exploreGroup.id);
  const isAccessGranted = hasApprovedAccessTo(exploreGroup.id);

  // Incoming and outgoing requests for current group
  const incomingRequests = accessRequests.filter(r => r.toGroupId === group.id);
  const outgoingRequests = accessRequests.filter(r => r.fromGroupId === group.id);

  return (
    <div className="space-y-6">
      {/* Group Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 rounded-2xl p-6 border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
              <Shield className="w-4 h-4" />
              <span>RUANG KERJA KELOMPOK MAHASISWA • UNIVERSITAS PATTIMURA</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {group.name}
            </h2>
            <p className="text-cyan-200 text-sm mt-1">
              Fokus Utama: <span className="font-semibold">{group.focus}</span>
            </p>
            <p className="text-slate-300 text-xs mt-1">
              Target Luaran Buku: <strong className="text-amber-300">{group.targetChapters}</strong>
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 max-w-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Anggota Kelompok:</h4>
            <div className="flex flex-wrap gap-1.5">
              {group.members.map((m, idx) => (
                <span key={idx} className="bg-slate-900 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-md text-xs font-medium">
                  👤 {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Workspace Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('my_workspace')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'my_workspace'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Workspace & Penyetoran Kelompok Saya</span>
          </button>

          <button
            onClick={() => setActiveSubTab('explore_others')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'explore_others'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Eksplorasi Kelompok Lain (Read-Only)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('access_requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 relative ${
              activeSubTab === 'access_requests'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Permintaan Akses Data & Hasil Kerja</span>
            {incomingRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                {incomingRequests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: MY WORKSPACE */}
      {activeSubTab === 'my_workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Assigned Chapters & Synergy */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Target Bab Buku Referensi</span>
              </h3>

              <div className="space-y-4">
                {relevantChapters.map(ch => (
                  <div key={ch.chapterNumber} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                        BAB {ch.chapterNumber}
                      </span>
                      <span className="text-xs text-slate-400">{ch.assignedGroup}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{ch.title}</h4>
                    <p className="text-xs text-slate-400">{ch.description}</p>
                    <div className="pt-2 border-t border-slate-900 space-y-1.5">
                      {ch.sections.map(sec => (
                        <div key={sec.code} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="font-mono text-cyan-400 font-semibold">{sec.code}</span>
                          <span>{sec.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-Group Synergy Detector */}
            <div className="bg-slate-900 rounded-2xl border border-purple-500/30 p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-purple-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Cross-Group Synergy Detector</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sistem AI mendeteksi keterkaitan substansi:
              </p>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                <li><strong>Kelompok 1 & 2:</strong> Data gazetir & regulasi Perpres 78/2005 menjadi fondasi dasar Bab 3.</li>
                <li><strong>Kelompok 3:</strong> 5 permasalahan multidimensi harus dijawab dalam Solusi Kebijakan Bab 5 oleh Kelompok 4.</li>
                <li><strong>Kelompok 4:</strong> Perumusan 12 PPKT wajib merujuk langsung pada temuan data demografi Kelompok 2 & tantangan perbatasan Kelompok 3.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Submission Form & Vault */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submission Form */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Setor Draf Milestone / Luaran Bab</h3>
                  <p className="text-xs text-slate-400">Kirimkan draf analisis dengan analisis sentimen otomatis AI</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                  Validasi & Analisis Sentimen Sistem
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Minggu Pelaksanaan PjBL</label>
                    <select
                      value={week}
                      onChange={(e) => setWeek(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      {TIMELINE_WEEKS.map(w => (
                        <option key={w.week} value={w.week}>Minggu {w.week}: {w.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Perwakilan Pengirim</label>
                    <select
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      {group.members.map((m, idx) => (
                        <option key={idx} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Draf / Bab</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Analisis Kebijakan Pengelolaan PPKT di Wilayah Perbatasan..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Isi Draf / Argumen Analisis</label>
                  <textarea
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tuliskan analisis mendalam, sitasi regulasi (Perpres 78/2005 / Kepres 6/2017 / Gazetir 17.024 pulau), serta rekomendasi kebijakan..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
                  />
                  
                  {content.length > 15 && (
                    <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between text-xs ${
                      currentSentiment.tone === 'positive' 
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                        : currentSentiment.tone === 'neutral'
                        ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {currentSentiment.tone === 'positive' ? <Smile className="w-4 h-4 text-emerald-400" /> : currentSentiment.tone === 'neutral' ? <Meh className="w-4 h-4 text-blue-400" /> : <Frown className="w-4 h-4 text-amber-400" />}
                        <span>Analisis Sentimen Draf: <strong>{currentSentiment.label}</strong></span>
                      </div>
                      <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Optimisme: {currentSentiment.score}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-cyan-600/30 flex items-center space-x-2 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Setor ke Storage Vault</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Storage Vault & Submission History */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Storage Vault & Riwayat Penyetoran Kelompok {group.number}</span>
              </h3>

              {groupSubmissions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm italic">
                  Belum ada draf yang disetorkan. Gunakan form di atas untuk mengirimkan tugas kelompok.
                </div>
              ) : (
                <div className="space-y-4">
                  {groupSubmissions.map(sub => (
                    <div key={sub.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 shadow-md">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                        <div>
                          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                            {sub.storageTag}
                          </span>
                          <h4 className="text-base font-bold text-white mt-1.5">{sub.title}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                          sub.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {sub.status === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>{sub.status}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                        {sub.content}
                      </p>

                      <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs text-center font-mono">
                        <div>Kognitif: <strong className="text-cyan-400">{sub.rubric.cognitive.score}</strong></div>
                        <div>Kreatif: <strong className="text-purple-400">{sub.rubric.creativity.score}</strong></div>
                        <div>Solusi: <strong className="text-emerald-400">{sub.rubric.solution.score}</strong></div>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                        <span>Pengirim: <strong>{sub.author}</strong> • {sub.submittedAt}</span>
                        <span className="text-cyan-300 font-medium">Ulasan AI: {sub.feedback}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPLORE OTHER GROUPS (READ-ONLY & REQUEST ACCESS) */}
      {activeSubTab === 'explore_others' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Eksplorasi Workspace Kelompok Lain (Read-Only)</h3>
              <p className="text-xs text-slate-400">Anda dapat melihat pekerjaan kelompok lain, namun tidak memiliki hak untuk menambah, mengubah, atau menghapus pekerjaan mereka.</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-300">Pilih Kelompok:</span>
              <select
                value={selectedExploreGroupId}
                onChange={(e) => setSelectedExploreGroupId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {GROUPS_DATA.filter(g => g.id !== group.id).map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>

              {!isAccessGranted && (
                <button
                  onClick={() => {
                    setRequestTargetGroup(exploreGroup);
                    setRequestTitle(`Permintaan Akses Dokumen ke ${exploreGroup.name}`);
                    setShowRequestModal(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Minta Akses Khusus</span>
                </button>
              )}
            </div>
          </div>

          {/* Target Group Info & Submissions */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                  {exploreGroup.targetChapters}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{exploreGroup.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Fokus: {exploreGroup.focus}</p>
                <p className="text-xs text-slate-400 mt-1">Deskripsi: {exploreGroup.description}</p>
              </div>

              <div className="text-right">
                {isAccessGranted ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Akses Penuh Disetujui</span>
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1">
                    <Lock className="w-4 h-4" />
                    <span>Akses Terbatas (Kirim Permintaan untuk Membuka)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Draf Milestones & Luaran {exploreGroup.name}:</h4>
              
              {exploreSubmissions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm italic">
                  Kelompok ini belum menyetorkan draf ke storage vault.
                </div>
              ) : (
                exploreSubmissions.map(sub => (
                  <div key={sub.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-xs font-mono text-cyan-400">{sub.storageTag}</span>
                      <span className="text-xs text-emerald-400 font-semibold">{sub.status}</span>
                    </div>

                    <h5 className="font-bold text-white text-base">{sub.title}</h5>
                    
                    {isAccessGranted ? (
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                        {sub.content}
                      </p>
                    ) : (
                      <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 text-center space-y-2">
                        <Lock className="w-6 h-6 text-amber-400 mx-auto" />
                        <p className="text-xs text-slate-300">Isi draf ini dikunci untuk perlindungan priv antar kelompok. Klik tombol <strong>Minta Akses Khusus</strong> di atas untuk mengajukan izin akses.</p>
                      </div>
                    )}

                    <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                      <span>Pengirim: {sub.author} • {sub.submittedAt}</span>
                      <span className="text-cyan-300 font-mono">Ulasan: {sub.feedback}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCESS REQUESTS */}
      {activeSubTab === 'access_requests' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-white">Manajemen Permintaan Akses Antar Kelompok</h3>
            <p className="text-xs text-slate-400 mt-1">Kelola permintaan akses data yang masuk dari kelompok lain atau pantau status permintaan yang Anda kirimkan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incoming Requests */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-cyan-300 border-b border-slate-800 pb-3 flex items-center space-x-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Permintaan Masuk ke Kelompok Anda ({incomingRequests.length})</span>
              </h4>

              {incomingRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">Tidak ada permintaan akses masuk.</div>
              ) : (
                incomingRequests.map(req => (
                  <div key={req.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400">{req.fromGroupName}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : req.status === 'Rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm">{req.title}</div>
                    <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">Alasan: {req.reason}</p>
                    <div className="text-[11px] text-slate-400">{req.createdAt}</div>

                    {req.status === 'Pending' && (
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-900">
                        <button
                          onClick={() => handleUpdateReqStatus(req.id, 'Rejected')}
                          className="bg-red-900/60 hover:bg-red-800 text-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => handleUpdateReqStatus(req.id, 'Approved')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          Setujui Akses
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Outgoing Requests */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-purple-300 border-b border-slate-800 pb-3 flex items-center space-x-2">
                <Send className="w-4 h-4 text-purple-400" />
                <span>Permintaan Keluar yang Anda Kirim ({outgoingRequests.length})</span>
              </h4>

              {outgoingRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">Anda belum mengirimkan permintaan akses ke kelompok lain.</div>
              ) : (
                outgoingRequests.map(req => (
                  <div key={req.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">Kepada: {req.toGroupName}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : req.status === 'Rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm">{req.title}</div>
                    <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">Alasan: {req.reason}</p>
                    <div className="text-[11px] text-slate-400">{req.createdAt}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Access Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>Kirim Permintaan Akses Data</span>
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAccessRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kelompok Tujuan</label>
                <input
                  type="text"
                  disabled
                  value={requestTargetGroup.name}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-cyan-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Judul / Subjek Permintaan</label>
                <input
                  type="text"
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                  placeholder="Contoh: Permintaan Akses Draf Bab 3 Demografi PPKT..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alasan / Keperluan Koordinasi</label>
                <textarea
                  rows={4}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Jelaskan mengapa kelompok Anda memerlukan data/draf ini untuk penyusunan laporan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition"
                >
                  Kirim Permintaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
