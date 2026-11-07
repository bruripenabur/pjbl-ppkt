import React, { useState, useEffect, useRef } from 'react';
import { RoleType, SubmissionItem } from './types';
import { GROUPS_DATA } from './data/curriculumData';
import { dbService } from './services/db';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { LecturerDashboard } from './components/LecturerDashboard';
import { StudentWorkspace } from './components/StudentWorkspace';
import { ChapterTemplateViewer } from './components/ChapterTemplateViewer';
import { PresentationDrillSimulator } from './components/PresentationDrillSimulator';
import { TimelineView } from './components/TimelineView';
import { AIChatAssistant } from './components/AIChatAssistant';
import { DiscussionForum } from './components/DiscussionForum';
import { Bell, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<RoleType>('lecturer');
  const [loggedInUser, setLoggedInUser] = useState<string>('Dr. Bruri Melky Laimeheriwa, S.Pi., M.Si.');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const prevSubmissionsRef = useRef<SubmissionItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await dbService.getSubmissions();
        setSubmissions(data);
        prevSubmissionsRef.current = data;
      } catch (e) {
        console.error('Failed to load submissions from database:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Subscribe to Supabase Realtime changes
    const unsubscribe = dbService.subscribeToSubmissions((fresh) => {
      // Check for status updates on student submissions
      if (prevSubmissionsRef.current.length > 0 && currentRole !== 'lecturer') {
        fresh.forEach(newSub => {
          const oldSub = prevSubmissionsRef.current.find(s => s.id === newSub.id);
          if (oldSub && oldSub.status !== newSub.status && newSub.groupId === currentRole) {
            setNotification({
              message: `Notifikasi Realtime Supabase: Draf "${newSub.title}" kini berstatus [${newSub.status}] oleh Dosen Pengampu!`,
              type: newSub.status === 'Approved' ? 'success' : 'warning'
            });
          }
        });
      }

      setSubmissions(fresh);
      prevSubmissionsRef.current = fresh;
    });

    return () => {
      unsubscribe();
    };
  }, [currentRole]);

  const handleLogin = (role: RoleType, userName: string) => {
    setCurrentRole(role);
    setLoggedInUser(userName);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleUpdateSubmissionStatus = async (id: string, status: 'Approved' | 'Revision Required') => {
    const updated = await dbService.updateSubmissionStatus(id, status);
    setSubmissions(updated);
    prevSubmissionsRef.current = updated;
  };

  const handleSubmitDraft = async (newSub: Omit<SubmissionItem, 'id' | 'submittedAt'>) => {
    const item: SubmissionItem = {
      ...newSub,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    const updated = await dbService.saveSubmission(item);
    setSubmissions(updated);
    prevSubmissionsRef.current = updated;
  };

  const handleTriggerCommand = (cmd: string) => {
    if (cmd === '/rekap_dosen') {
      if (currentRole === 'lecturer') {
        setActiveTab('dashboard');
      } else {
        alert('Akses Terbatas: Hanya Dosen Pengampu yang dapat mengakses rekapitulasi seluruh kelompok.');
      }
    } else if (cmd === '/template_bab') {
      setActiveTab('templates');
    } else if (cmd === '/uji_presentasi') {
      setActiveTab('drill');
    }
  };

  const activeGroup = GROUPS_DATA.find(g => g.id === currentRole);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-mono">Menghubungkan ke Database Supabase Realtime & Memuat Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white pb-20 relative">
      {/* Realtime Notification Toast Banner */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-bounce">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start space-x-3 ${
            notification.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 backdrop-blur-md' 
              : 'bg-amber-950/90 border-amber-500 text-amber-200 backdrop-blur-md'
          }`}>
            <div className="shrink-0 mt-0.5">
              {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
            </div>
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              <div className="font-bold mb-0.5 flex items-center space-x-1">
                <Bell className="w-3.5 h-3.5" />
                <span>Supabase Realtime Alert</span>
              </div>
              {notification.message}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Navbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onTriggerCommand={handleTriggerCommand}
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentRole === 'lecturer' && activeTab === 'dashboard' && (
          <LecturerDashboard
            submissions={submissions}
            onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
            onSelectRole={setCurrentRole}
          />
        )}

        {currentRole !== 'lecturer' && activeGroup && activeTab === 'dashboard' && (
          <StudentWorkspace
            group={activeGroup}
            currentRole={currentRole}
            submissions={submissions}
            onSubmitDraft={handleSubmitDraft}
            onSelectRole={setCurrentRole}
          />
        )}

        {activeTab === 'forum' && <DiscussionForum currentRole={currentRole} loggedInUser={loggedInUser} />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'templates' && <ChapterTemplateViewer />}
        {activeTab === 'drill' && <PresentationDrillSimulator />}
      </main>

      <AIChatAssistant
        currentRole={currentRole}
        submissions={submissions}
        onTriggerCommand={handleTriggerCommand}
      />
    </div>
  );
}
