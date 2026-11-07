import React, { useState } from 'react';
import { CHAPTER_OUTLINES, COURSE_DETAILS } from '../data/curriculumData';
import { BookOpen, FileText, CheckCircle2, Shield, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export const ChapterTemplateViewer: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<number>(1);

  const currentCh = CHAPTER_OUTLINES.find(c => c.chapterNumber === activeChapter) || CHAPTER_OUTLINES[0];

  const handleDownloadFullTemplate = async () => {
    const doc = new jsPDF();
    const margin = 14;
    const pageWidth = 210;
    const maxLineWidth = pageWidth - (2 * margin);

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
        const imgWidth = 20; // 2 cm
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(dataUri, 'PNG', margin, 10, imgWidth, imgHeight);
      }
    } catch (e) {
      console.warn('Logo could not be loaded into PDF:', e);
    }

    // Header Text (shifted right to make space for 2 cm logo)
    doc.setTextColor(30, 58, 138); // Deep Blue #1e3a8a
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("UNIVERSITAS PATTIMURA - PROGRAM STUDI ILMU PEMERINTAHAN", 38, 16);
    
    doc.setFontSize(10);
    doc.text("PANDUAN OUTLINE BUKU REFERENSI PjBL", 38, 22);

    doc.setTextColor(51, 65, 85); // Slate
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Mata Kuliah: ${COURSE_DETAILS.name} (${COURSE_DETAILS.code})`, 38, 28);
    doc.text(`Dosen Pengampu: ${COURSE_DETAILS.lecturer}`, 38, 33);

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 38, pageWidth - margin, 38);

    let y = 46;
    CHAPTER_OUTLINES.forEach((ch) => {
      if (y > 255) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(2, 132, 199); // Cyan / Blue accent
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`BAB ${ch.chapterNumber}: ${ch.title}`, margin, y);
      y += 6;

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(`Penanggung Jawab: ${ch.assignedGroup} | ${ch.description}`, margin, y);
      y += 8;

      ch.sections.forEach(sec => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        const secPrefix = `• [${sec.code}] ${sec.title}: `;
        doc.text(secPrefix, margin + 2, y);

        doc.setFont("helvetica", "normal");
        const fullText = sec.details;
        const prefixWidth = doc.getTextWidth(secPrefix);
        const detailLines = doc.splitTextToSize(fullText, maxLineWidth - prefixWidth - 4);
        
        doc.text(detailLines, margin + 2 + prefixWidth, y);
        y += (detailLines.length * 5) + 3;
      });
      y += 6;
    });

    doc.save("Outline_Buku_Referensi_PjBL_PPKT.pdf");
    alert('Outline Buku Referensi berhasil diunduh dalam format PDF dengan margin, proporsi, dan logo Unpatti 2 cm yang rapi.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 border border-cyan-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
              <Shield className="w-4 h-4" />
              <span>SISTEMATIKA STRUKTUR BUKU (TABLE OF CONTENTS)</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Outline Buku Referensi (Bab 1 - 6)
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Panduan penulisan baku untuk kompilasi akhir buku referensi Mata Kuliah Pengelolaan Sumber Daya Kelautan dan Pulau-Pulau Kecil.
            </p>
          </div>
          <button
            onClick={handleDownloadFullTemplate}
            className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow transition"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Template Lengkap</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chapter Selection Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Pilih Bab Buku:</h3>
          {CHAPTER_OUTLINES.map(ch => (
            <button
              key={ch.chapterNumber}
              onClick={() => setActiveChapter(ch.chapterNumber)}
              className={`w-full text-left p-3.5 rounded-xl transition flex flex-col space-y-1 border ${
                activeChapter === ch.chapterNumber
                  ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">BAB {ch.chapterNumber}</span>
                <span className="text-slate-400">{ch.assignedGroup}</span>
              </div>
              <div className="text-sm font-bold line-clamp-1">{ch.title}</div>
            </button>
          ))}
        </div>

        {/* Chapter Detail View */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-3 py-1 rounded-full border border-cyan-800">
                  BAB UTAMA {currentCh.chapterNumber} • Ditugaskan ke {currentCh.assignedGroup}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">{currentCh.title}</h3>
                <p className="text-sm text-slate-300 mt-1">{currentCh.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sub-Bab & Detail Substansi:</h4>
              <div className="space-y-3">
                {currentCh.sections.map(sec => (
                  <div key={sec.code} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start space-x-3">
                    <div className="bg-cyan-950 text-cyan-300 font-mono text-xs font-bold px-2.5 py-1 rounded border border-cyan-800">
                      {sec.code}
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-sm">{sec.title}</h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sec.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-900/40 text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-300">💡 Instruksi Penulisan:</strong> Setiap kelompok wajib mengacu pada standar tata tulis ilmiah, mencantumkan rujukan pustaka primer (Perpres 78/2005, Kepres 6/2017, data UNGEGN, dan Gazetir Nasional 17.024 pulau), serta memastikan kohesi dengan bab kelompok lainnya.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
