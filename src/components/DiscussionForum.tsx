import React, { useState, useEffect, useRef } from 'react';
import { RoleType, DiscussionMessage, GroupInfo } from '../types';
import { GROUPS_DATA, COURSE_DETAILS } from '../data/curriculumData';
import { dbService } from '../services/db';
import { MessageSquare, Send, Users, Shield, Globe, Edit3 } from 'lucide-react';

interface DiscussionForumProps {
  currentRole: RoleType;
  loggedInUser: string;
}

export const DiscussionForum: React.FC<DiscussionForumProps> = ({
  currentRole,
  loggedInUser
}) => {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [activeForumType, setActiveForumType] = useState<'general' | 'group'>('general');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    currentRole === 'lecturer' ? 'group1' : currentRole
  );
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const isLecturer = currentRole === 'lecturer';
  const currentGroup = GROUPS_DATA.find(g => g.id === currentRole);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await dbService.getDiscussionMessages();
        setMessages(data);
      } catch (e) {
        console.error('Failed to load discussions:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setMessages(customEvent.detail);
      }
    };
    window.addEventListener('pjbl_discussions_update', handleUpdate);
    return () => {
      window.removeEventListener('pjbl_discussions_update', handleUpdate);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: DiscussionMessage = {
      id: `msg-${Date.now()}`,
      forumType: activeForumType,
      groupId: activeForumType === 'group' ? (isLecturer ? selectedGroupId : currentRole) : undefined,
      author: loggedInUser,
      role: isLecturer ? 'Dosen Pengampu' : (currentGroup?.name || 'Mahasiswa'),
      message: newMessage.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = await dbService.saveDiscussionMessage(msg);
    setMessages(updated);
    setNewMessage('');
  };

  const scrollToInput = () => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputRef.current.focus();
    }
  };

  const activeGroupTarget = GROUPS_DATA.find(g => g.id === (isLecturer ? selectedGroupId : currentRole));

  const filteredMessages = messages.filter(m => {
    if (activeForumType === 'general') {
      return m.forumType === 'general';
    } else {
      const targetId = isLecturer ? selectedGroupId : currentRole;
      return m.forumType === 'group' && m.groupId === targetId;
    }
  });

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400 font-mono text-xs">Memuat Forum Diskusi...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Forum Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 rounded-2xl p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>FORUM DISKUSI AKADEMIK • UNIVERSITAS PATTIMURA</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Ruang Diskusi PjBL
            </h2>
            <p className="text-slate-300 text-xs mt-1">
              Fasilitas diskusi umum seluruh kelompok & forum privat per kelompok bimbingan {COURSE_DETAILS.lecturer}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={scrollToInput}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>Tulis Pesan Diskusi</span>
            </button>

            {/* Forum Selector Tabs */}
            <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveForumType('general')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeForumType === 'general'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Forum Umum</span>
              </button>
              <button
                onClick={() => setActiveForumType('group')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeForumType === 'group'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Forum Kelompok</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Selector if Lecturer in Group Forum */}
      {activeForumType === 'group' && isLecturer && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-300">Pilih Ruang Kelompok:</span>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {GROUPS_DATA.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main Discussion Box */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[600px]">
        {/* Forum Title Bar */}
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {activeForumType === 'general' ? (
              <Globe className="w-5 h-5 text-cyan-400" />
            ) : (
              <Users className="w-5 h-5 text-cyan-400" />
            )}
            <div>
              <h3 className="font-bold text-white text-sm">
                {activeForumType === 'general' ? 'Forum Umum Kuliah (Seluruh Kelompok)' : `Forum Privat: ${activeGroupTarget?.name}`}
              </h3>
              <p className="text-xs text-slate-400">
                {activeForumType === 'general' ? 'Dapat diakses oleh seluruh mahasiswa dan dosen pengampu.' : `Hanya anggota ${activeGroupTarget?.name} dan dosen pengampu.`}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded border border-cyan-800">
            {filteredMessages.length} Pesan Diskusi
          </span>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm italic">
              Belum ada pesan dalam forum ini. Mulai diskusi dengan mengirimkan pesan di bawah.
            </div>
          ) : (
            filteredMessages.map((m) => {
              const isMe = m.author === loggedInUser;
              return (
                <div key={m.id} className={`flex flex-col space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 px-1">
                    <strong className="text-cyan-300">{m.author}</strong>
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300">{m.role}</span>
                    <span>• {m.createdAt}</span>
                  </div>
                  <div className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role.includes('Dosen')
                      ? 'bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/40 text-amber-100 shadow-lg'
                      : isMe
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-100 border border-slate-700'
                  }`}>
                    {m.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="bg-slate-950 p-4 border-t border-slate-800 flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={activeForumType === 'general' ? "Tulis tanggapan atau pertanyaan untuk seluruh kelompok..." : `Tulis pesan koordinasi untuk ${activeGroupTarget?.name}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-cyan-600/30 flex items-center space-x-2 transition"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Pesan</span>
          </button>
        </form>
      </div>
    </div>
  );
};
