import React, { useState } from 'react';
import { RoleType, SubmissionItem } from '../types';
import { COURSE_DETAILS, CHAPTER_OUTLINES, GROUPS_DATA } from '../data/curriculumData';
import { Shield, Sparkles, Send, Bot, User, Terminal, CheckCircle2 } from 'lucide-react';

interface AIChatAssistantProps {
  currentRole: RoleType;
  submissions: SubmissionItem[];
  onTriggerCommand: (cmd: string) => void;
}

interface Message {
  sender: 'system' | 'user';
  text: string;
  timestamp: string;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  currentRole,
  submissions,
  onTriggerCommand
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'system',
      text: `Halo! Saya Asisten Pakar PjBL untuk Mata Kuliah "${COURSE_DETAILS.name}" (${COURSE_DETAILS.program}), Dosen Pengampu Dr. Bruri Melky Laimeheriwa, S.Pi., M.Si. Ada yang bisa saya bantu terkait analisis regulasi PPKT, data gazetir 17.024 pulau, atau penyusunan buku referensi? (Coba ketik /rekap_dosen, /template_bab, atau /uji_presentasi)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg: Message = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    setTimeout(() => {
      let responseText = '';
      const lower = userText.toLowerCase();

      if (lower.includes('/rekap_dosen')) {
        onTriggerCommand('/rekap_dosen');
        responseText = `📊 [REKAP DOSEN TRIGGERED] Menampilkan dashboard rekapitulasi seluruh kelompok (1 s.d 4) untuk Dosen Pengampu Dr. Bruri Melky Laimeheriwa. Silakan lihat tabel ringkasan di layar utama.`;
      } else if (lower.includes('/template_bab')) {
        onTriggerCommand('/template_bab');
        responseText = `📖 [TEMPLATE BAB TRIGGERED] Membuka panduan sistematika 6 Bab Buku Referensi PjBL PPKT di menu Outline Bab.`;
      } else if (lower.includes('/uji_presentasi')) {
        onTriggerCommand('/uji_presentasi');
        responseText = `🎯 [UJI PRESENTASI TRIGGERED] Mengaktifkan Mode Simulator Dewan Penguji Ujian Akhir Semester. Silakan jawab pertanyaan kritis seputar kedaulatan dan gazetir pulau terluar.`;
      } else if (lower.includes('perpres') || lower.includes('78/2005')) {
        responseText = `⚖️ [VALIDATOR REGULASI] Perpres No. 78 Tahun 2005 mengatur tentang Pengelolaan Pulau-Pulau Kecil Terluar dengan kriteria areal <= 2.000 km² serta titik-titik dasar garis pangkal laut yang ditetapkan oleh pemerintah.`;
      } else if (lower.includes('kepres') || lower.includes('6/2017')) {
        responseText = `⚖️ [VALIDATOR REGULASI] Keputusan Presiden (Kepres) No. 6 Tahun 2017 menetapkan secara resmi sebanyak 111 Pulau-Pulau Kecil Terluar (PPKT) di wilayah perbatasan NKRI.`;
      } else if (lower.includes('gazetir') || lower.includes('pulau') || lower.includes('ungegn')) {
        responseText = `🗺️ [DATA GEOPOLITIK MARITIM] Data resmi pencatatan pulau Indonesia: UNGEGN 2019 (16.671 pulau), Gazetir Nasional 2020 (16.771 pulau), dan Gazetir Nasional 2022 (17.024 pulau). Total 111 PPKT terdiri dari 42 pulau berpenduduk dan 69 pulau tidak berpenduduk.`;
      } else {
        responseText = `🤖 [SISTEM REPOSITORI PjBL PPKT] Catatan Anda telah dicatat dalam sistem repositori. Untuk memastikan luaran buku referensi Bab 1 hingga Bab 6 tersusun sempurna, pastikan setiap kelompok merujuk pada data sebaran 22 provinsi, regulasi perbatasan, serta siklus pengelolaan terpadu (Perencanaan, Pelaksanaan, Pengawasan, Pengendalian).`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'system',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-4 rounded-full shadow-2xl flex items-center space-x-3 transition transform hover:scale-105 border border-cyan-400/40 animate-bounce"
        >
          <Bot className="w-6 h-6" />
          <span className="font-bold text-sm hidden md:inline">Asisten Pakar PjBL PPKT</span>
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-80 md:w-96 h-[500px] shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Coastal-Gov Pakar</h3>
                <p className="text-[10px] text-cyan-300">Asisten Ahli PjBL Dr. Bruri</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg text-xs"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'system' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-200'
                }`}>
                  {m.sender === 'system' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'system'
                    ? 'bg-slate-900 text-slate-200 border border-slate-800'
                    : 'bg-cyan-600 text-white font-medium'
                }`}>
                  {m.text}
                  <div className={`text-[9px] mt-1 text-right ${m.sender === 'system' ? 'text-slate-500' : 'text-cyan-200'}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan atau perintah /rekap_dosen..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
