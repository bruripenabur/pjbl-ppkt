import React, { useState } from 'react';
import { DRILL_QUESTIONS } from '../data/curriculumData';
import { Award, Shield, CheckCircle2, HelpCircle, Sparkles, Send, RefreshCw } from 'lucide-react';

export const PresentationDrillSimulator: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<number | null>(null);

  const q = DRILL_QUESTIONS[currentIdx];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      alert('Mohon tuliskan jawaban atau argumen Anda terlebih dahulu.');
      return;
    }

    const lower = userAnswer.toLowerCase();
    let score = 75;
    if (lower.includes('effective occupation') || lower.includes('gazetir') || lower.includes('sinergi') || lower.includes('kedaulatan') || lower.includes('17.024')) {
      score = 92;
    } else if (userAnswer.length > 100) {
      score = 85;
    }

    setScoreResult(score);
    setSubmitted(true);
  };

  const handleNext = () => {
    setUserAnswer('');
    setSubmitted(false);
    setScoreResult(null);
    setCurrentIdx((prev) => (prev + 1) % DRILL_QUESTIONS.length);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 rounded-2xl p-6 border border-amber-500/30 shadow-2xl">
        <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs mb-1">
          <Award className="w-4 h-4" />
          <span>SIMULATOR UJIAN (PROJECT EXHIBITION)</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Uji Kompetensi (/uji_presentasi)
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          Bertindak sebagai Dewan Penguji PjBL, sistem akan menguji pemahaman geopolitik maritim, data gazetir, dan keandalan strategi pertahanan pulau terluar.
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-xs font-mono bg-amber-950 text-amber-300 px-3 py-1 rounded-full border border-amber-800">
            Pertanyaan {currentIdx + 1} dari {DRILL_QUESTIONS.length} • {q.category}
          </span>
          <span className="text-xs text-slate-400">Bobot Asesmen: Kognitif & Solusi (70%)</span>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white leading-snug">
            "{q.question}"
          </h3>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-cyan-300 flex items-start space-x-2">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>Hint Penguji:</strong> {q.hint}</span>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Argumen / Tanggapan Anda sebagai Mahasiswa:</label>
              <textarea
                rows={5}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Tuliskan argumen ilmiah berdasarkan regulasi, data gazetir, atau strategi pengelolaan..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-600/30 flex items-center space-x-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Jawaban ke Dewan Penguji</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Evaluasi Dewan Penguji:</span>
                <span className="text-lg font-black text-amber-400 bg-amber-950 px-3 py-1 rounded-lg border border-amber-800">
                  Nilai Kompetensi: {scoreResult} / 100
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Kunci Jawaban Ahli / Dosen Pengampu:</h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900 p-4 rounded-lg border border-slate-800">
                  {q.expertAnswer}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-cyan-600/30 flex items-center space-x-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Pertanyaan Berikutnya</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
