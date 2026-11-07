import React, { useState } from 'react';
import { SubmissionItem, RoleType } from '../types';
import { GROUPS_DATA, COURSE_DETAILS } from '../data/curriculumData';
import { Shield, BookOpen, CheckCircle2, AlertTriangle, FileText, Award, Users, Download, Sparkles, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';

interface LecturerDashboardProps {
  submissions: SubmissionItem[];
  onUpdateSubmissionStatus: (id: string, status: 'Approved' | 'Revision Required') => void;
  onSelectRole: (role: RoleType) => void;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({
  submissions,
  onUpdateSubmissionStatus,
  onSelectRole
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);

  // Calculate average scores
  const totalSub = submissions.length;
  const avgCognitive = totalSub ? Math.round(submissions.reduce((acc, s) => acc + s.rubric.cognitive.score, 0) / totalSub) : 0;
  const avgCreativity = totalSub ? Math.round(submissions.reduce((acc, s) => acc + s.rubric.creativity.score, 0) / totalSub) : 0;
  const avgSolution = totalSub ? Math.round(submissions.reduce((acc, s) => acc + s.rubric.solution.score, 0) / totalSub) : 0;

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    
    // Add 2 cm Unpatti logo in PDF header
    try {
      const imgUrl = '/assets/aistudio/logo-unpatti-satuta-trans_3a9e0d9e.png';
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imgUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUri = canvas.toDataURL('image/png');
        // 20 mm = 2 cm width
        const imgWidth = 20;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(dataUri, 'PNG', 14, 10, imgWidth, imgHeight);
      }
    } catch (e) {
      console.warn('Logo could not be loaded into PDF:', e);
    }
    
    // Header Text (shifted right to make space for 2 cm logo)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("UNIVERSITAS PATTIMURA - FISIP", 38, 16);
    doc.setFontSize(11);
    doc.text("PROGRAM STUDI ILMU PEMERINTAHAN (SEMESTER 3)", 38, 23);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Mata Kuliah: ${COURSE_DETAILS.name} (${COURSE_DETAILS.code})`, 38, 29);
    doc.text(`Dosen Pengampu: ${COURSE_DETAILS.lecturer} (NIP: ${COURSE_DETAILS.nip})`, 38, 35);
    
    doc.setFontSize(9);
    doc.text(`Topik: ${COURSE_DETAILS.topic.substring(0, 95)}...`, 14, 44);

    doc.line(14, 48, 196, 48);

    // Summary stats
    doc.setFont("helvetica", "bold");
    doc.text("REKAPITULASI PENILAIAN & STATUS KELOMPOK PjBL PPKT", 14, 56);
    doc.setFont("helvetica", "normal");
    doc.text(`Rata-rata Kognitif: ${avgCognitive}/100 | Kreativitas: ${avgCreativity}/100 | Solusi NKRI: ${avgSolution}/100`, 14, 63);

    let y = 73;
    submissions.forEach((sub, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${sub.groupName} (Minggu ${sub.week} - ${sub.targetChapter})`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(`   Judul: ${sub.title.substring(0, 75)}...`, 14, y + 6);
      doc.text(`   Status: ${sub.status} | Nilai [Kog: ${sub.rubric.cognitive.score}, Kreatif: ${sub.rubric.creativity.score}, Solusi: ${sub.rubric.solution.score}]`, 14, y + 12);
      doc.text(`   Ulasan: ${sub.feedback.substring(0, 90)}...`, 14, y + 18);
      y += 27;
    });

    doc.save("rekap_penilaian_pjbl_ppkt_unpatti.pdf");
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Group', 'Week', 'Target Chapter', 'Title', 'Author', 'Status', 'Cognitive Score', 'Creativity Score', 'Solution Score', 'Submitted At', 'Feedback'];
    const rows = submissions.map(sub => [
      sub.id,
      `"${sub.groupName.replace(/"/g, '""')}"`,
      sub.week,
      `"${sub.targetChapter}"`,
      `"${sub.title.replace(/"/g, '""')}"`,
      `"${sub.author.replace(/"/g, '""')}"`,
      sub.status,
      sub.rubric.cognitive.score,
      sub.rubric.creativity.score,
      sub.rubric.solution.score,
      `"${sub.submittedAt}"`,
      `"${sub.feedback.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'rekap_draf_mahasiswa_pjbl_ppkt.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
              <Shield className="w-4 h-4" />
              <span>PANEL DOSEN PENGAMPU MATA KULIAH • UNIVERSITAS PATTIMURA</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Dashboard PjBL
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              {COURSE_DETAILS.name} • {COURSE_DETAILS.program} ({COURSE_DETAILS.classes})
            </p>
            <p className="text-cyan-300 text-xs mt-1 font-medium">
              Dosen Pengampu: {COURSE_DETAILS.lecturer} (NIP: {COURSE_DETAILS.nip})
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex items-center space-x-4 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400">4 / 4</div>
              <div className="text-xs text-slate-400">Kelompok Aktif</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-400">6 Bab</div>
              <div className="text-xs text-slate-400">Struktur Buku</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-amber-400">39.375 JP</div>
              <div className="text-xs text-slate-400">Total Beban</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Rata-rata Kognitif (30%)</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{avgCognitive} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <p className="text-xs text-slate-400 mt-1">Ketepatan regulasi & data gazetir</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Rata-rata Kreativitas (30%)</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{avgCreativity} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <p className="text-xs text-slate-400 mt-1">Visualisasi & kejelasan poin</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Rata-rata Solusi NKRI (40%)</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{avgSolution} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <p className="text-xs text-slate-400 mt-1">Relevansi kedaulatan & kesejahteraan</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Status Kompilasi Buku</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-300 mt-1">Draf Sistemik 6 Bab</div>
          <p className="text-xs text-slate-400 mt-1">Siap Layouting & Ujian Akhir</p>
        </div>
      </div>

      {/* REKAP DOSEN TABLE (Perintah Khusus /rekap_dosen) */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-ping" />
            <h3 className="text-lg font-bold text-white">Rekapitulasi Perkembangan Kelompok (/rekap_dosen)</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-cyan-700 hover:bg-cyan-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-3.5">Kelompok & Fokus</th>
                <th className="px-6 py-3.5">Target Bab</th>
                <th className="px-6 py-3.5">Status Minggu</th>
                <th className="px-6 py-3.5">Estimasi Nilai Rubrik</th>
                <th className="px-6 py-3.5">Catatan Kritis / Vault</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {GROUPS_DATA.map((grp) => {
                const sub = submissions.find(s => s.groupId === grp.id);
                return (
                  <tr key={grp.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center space-x-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>{grp.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{grp.focus}</div>
                      <div className="text-xs text-cyan-300 font-mono mt-1">Anggota: {grp.members.join(', ')}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-cyan-400 text-xs font-bold">
                      {grp.targetChapters}
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          sub.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {sub.status === 'Approved' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          <span>{sub.status} (Mg {sub.week})</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Belum Mengumpulkan</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <div className="space-y-1 text-xs font-mono">
                          <div className="text-slate-300">Kog: <strong className="text-cyan-400">{sub.rubric.cognitive.score}</strong></div>
                          <div className="text-slate-300">Kreatif: <strong className="text-purple-400">{sub.rubric.creativity.score}</strong></div>
                          <div className="text-slate-300">Solusi: <strong className="text-emerald-400">{sub.rubric.solution.score}</strong></div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <div className="max-w-xs truncate text-xs text-slate-300 font-mono bg-slate-950 p-2 rounded border border-slate-800" title={sub.storageTag}>
                          {sub.storageTag}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Menunggu Draf</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => sub && setSelectedSubmission(sub)}
                        disabled={!sub}
                        className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
                      >
                        Detail & Nilai
                      </button>
                      <button
                        onClick={() => onSelectRole(grp.id as RoleType)}
                        className="bg-cyan-700/80 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        Buka Kelompok
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
                  {selectedSubmission.storageTag}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">{selectedSubmission.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Oleh: {selectedSubmission.author} • {selectedSubmission.submittedAt}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Ringkasan Draf Luaran:</h4>
                {selectedSubmission.content}
              </div>

              {/* Rubric Evaluation Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-cyan-400">Aspek Kognitif (30%)</div>
                  <div className="text-2xl font-black text-white mt-1">{selectedSubmission.rubric.cognitive.score}/100</div>
                  <p className="text-xs text-slate-400 mt-1">{selectedSubmission.rubric.cognitive.notes}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-purple-400">Aspek Kreativitas (30%)</div>
                  <div className="text-2xl font-black text-white mt-1">{selectedSubmission.rubric.creativity.score}/100</div>
                  <p className="text-xs text-slate-400 mt-1">{selectedSubmission.rubric.creativity.notes}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-emerald-400">Aspek Solusi NKRI (40%)</div>
                  <div className="text-2xl font-black text-white mt-1">{selectedSubmission.rubric.solution.score}/100</div>
                  <p className="text-xs text-slate-400 mt-1">{selectedSubmission.rubric.solution.notes}</p>
                </div>
              </div>

              <div className="bg-blue-950/40 p-4 rounded-xl border border-blue-900/40">
                <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Catatan & Ulasan Dosen / AI Validator:</h4>
                <p className="text-sm text-slate-300">{selectedSubmission.feedback}</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  onUpdateSubmissionStatus(selectedSubmission.id, 'Revision Required');
                  setSelectedSubmission(null);
                }}
                className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
              >
                Minta Revisi (Revision Required)
              </button>
              <button
                onClick={() => {
                  onUpdateSubmissionStatus(selectedSubmission.id, 'Approved');
                  setSelectedSubmission(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
              >
                Setujui Milestone (Approved)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
