'use client';

import React from 'react';
import { getCalendarIcon } from '@/lib/utils';
import { NavButton } from '@/components/NavButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Calendar, BookMarked, Bell, LayoutDashboard, List, CalendarDays,
  Smartphone, AlertCircle, CheckCircle, Loader2, LogOut, User as UserIcon,
  Sparkles, Menu, X as CloseIcon, BookOpen, Layers, Lock
} from 'lucide-react';
import { CalendarTab } from '@/components/CalendarTab';
import { PlannerTab } from '@/components/PlannerTab';
import { DegreePlanTab } from '@/components/DegreePlanTab';
import { CoursesTab } from '@/components/CoursesTab';
import { DashboardTab } from '@/components/DashboardTab';
import { RoadmapTab } from '@/components/RoadmapTab';

// Hooks
import { useAppData } from '@/hooks/useAppData';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Modals
import { EventModal } from '@/components/modals/EventModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { AddCourseModal } from '@/components/modals/AddCourseModal';
import { AddCategoryModal } from '@/components/modals/AddCategoryModal';
import { ManualCourseModal } from '@/components/modals/ManualCourseModal';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function App() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    activeTab, setActiveTab,
    filterRegion, setFilterRegion,
    filterType, setFilterType,
    calendarEvents, filteredCalendar,
    isEventModalOpen, setIsEventModalOpen,
    confirmDeleteId, setConfirmDeleteId,
    toastMessage,
    eventFormData, setEventFormData,
    selectedCourses, mr30Courses,
    searchQuery, setSearchQuery,
    plannerError,
    isManualCourseModalOpen, setIsManualCourseModalOpen,
    manualCourseData, setManualCourseData,
    isDegreeEditMode, setIsDegreeEditMode,
    degreePlan,
    isDegreeLoading,
    completedCourses,
    isAddCourseModalOpen, setIsAddCourseModalOpen,
    isAddCategoryModalOpen, setIsAddCategoryModalOpen,
    newCategoryName, setNewCategoryName,
    courseSearchQuery, setCourseSearchQuery,
    notifyLine,
    notifyEmail,
    lineToken,
    loadAllData, updateSetting,
    handleOpenEventModal, handleSaveEvent, handleDeleteEvent,
    searchResults, addCourseToPlanner, removeCourseFromPlanner, handleSaveManualCourse,
    totalCompletedCredits, toggleCourseCompletion, toggleReExam, updateCourseGrade, handleSaveDegreeSettings,
    gpax,
    semesterRoadmap, addCourseToSemester, removeCourseFromSemester, moveCourseToSemester, renameSemester, removeSemester,
    handleAddCategory, closeAddCategoryModal, confirmAddCategory, handleDeleteCategory,
    handleAddCourse, confirmAddCourseToCategory, degreeSearchResults, handleDeleteCourse,
    showToast
  } = useAppData();

  const [isPushSupported, setIsPushSupported] = React.useState(false);
  const [isSubscribed, setIsPushSubscribed] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsPushSubscribed(!!subscription);
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const subscribeToPush = async () => {
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error('VAPID public key missing');

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      const res = await fetch('/api/web-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save subscription on server');
      }

      setIsPushSubscribed(true);
      alert('ลงทะเบียนรับแจ้งเตือนผ่าน Browser สำเร็จ!');
    } catch (err: any) {
      console.error('Failed to subscribe:', err);
      alert(`ไม่สามารถเปิดแจ้งเตือนได้: ${err.message}`);
    }
  };

  const testPush = async () => {
    try {
      await fetch('/api/web-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ทดสอบระบบ',
          message: 'นี่คือตัวอย่างการแจ้งเตือนจาก RU Planner'
        })
      });
    } catch (err) {
      console.error('Test push failed:', err);
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Handle authentication status
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">RU Planner</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (status === 'unauthenticated') {
    router.push('/login');
    // Return null to prevent rendering while redirecting
    return null;
  }

  // If authenticated, show the full app
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-500/30">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-[60] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-900 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">RU Planner</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
          >
            {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[65] bg-slate-950/40 backdrop-blur-md animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <main className="flex">
        {/* Responsive Sidebar - Compact Redesign */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-[100dvh] z-[70]
          w-full lg:w-[260px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-800/50
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isMobileMenuOpen ? 'translate-x-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.1)]' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}>
          {/* Sidebar Header with Gradient Background */}
          <div className="relative p-6 mb-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-indigo-600/5 dark:from-blue-500/10 dark:to-indigo-500/10 -z-10"></div>
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform transition-transform hover:rotate-6">
                  <Sparkles className="text-white" size={18} />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">RU Planner</h1>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Cloud Sync Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
                className="lg:hidden relative z-10 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Back to Home"
              >
                <CloseIcon size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Links - Compact Visuals */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="px-3 mb-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">เมนูหลัก</span>
            </div>
            <NavButton
              active={activeTab === 'home'}
              onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
              icon={<LayoutDashboard size={18} />}
              label="หน้าหลัก"
              className="w-full justify-start py-3 px-4 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
            />
            <NavButton
              active={activeTab === 'roadmap'}
              onClick={() => { setActiveTab('roadmap'); setIsMobileMenuOpen(false); }}
              icon={<Layers size={18} />}
              label="แผนการเรียน"
              className="w-full justify-start py-3 px-4 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
            />
            <NavButton
              active={activeTab === 'courses'}
              onClick={() => { setActiveTab('courses'); setIsMobileMenuOpen(false); }}
              icon={<BookOpen size={18} />}
              label="ค้นหารายวิชา"
              className="w-full justify-start py-3 px-4 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
            />
            <NavButton
              active={activeTab === 'planner'}
              onClick={() => { setActiveTab('planner'); setIsMobileMenuOpen(false); }}
              icon={<CalendarDays size={18} />}
              label="จัดตารางเรียน"
              className="w-full justify-start py-3 px-4 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
            />
            <NavButton
              active={activeTab === 'degree'}
              onClick={() => { setActiveTab('degree'); setIsMobileMenuOpen(false); }}
              icon={<List size={18} />}
              label="ติดตามหลักสูตร"
              className="w-full justify-start py-3 px-4 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
            />

            <div className="px-3 mt-6 mb-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">ระบบและการซิงค์</span>
            </div>
            <NavButton
              active={activeTab === 'calendar'}
              onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
              icon={<Calendar size={18} />}
              label="ปฏิทินสอบ ม.รามฯ"
              className="w-full justify-start py-3 px-4 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
            />
            <NavButton
              active={activeTab === 'notify'}
              onClick={() => { setActiveTab('notify'); setIsMobileMenuOpen(false); }}
              icon={<Bell size={18} />}
              label="ตั้งค่าการแจ้งเตือน"
              className="w-full justify-start py-3 px-4 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
            />
          </nav>

          {/* Sidebar Footer - Compact Profile Card */}
          <div className="p-4 mt-2">
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 p-4 rounded-3xl space-y-4">
              {session?.user && (
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md relative z-10">
                      {session.user.name?.[0] || 'U'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{session.user.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 truncate tracking-wide">{session.user.email}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push('/settings/security')}
                  className="py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-all duration-300 flex items-center justify-center gap-1 shadow-sm text-[8px] font-black uppercase tracking-widest"
                >
                  <Lock size={10} />
                  Password
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-red-50 dark:bg-red-900/10 border border-slate-100 dark:border-slate-700 hover:border-red-900/30 text-slate-600 dark:text-slate-400 hover:text-red-600 transition-all duration-300 flex items-center justify-center gap-1 shadow-sm text-[8px] font-black uppercase tracking-widest"
                >
                  <LogOut size={10} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          <p className="text-center mt-4 text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">Version 2.0.4</p>
        </aside>

        {/* Content Area */}
        <section className="flex-1 min-w-0 p-5 lg:p-12">
          <div className="hidden lg:flex justify-end mb-8 animate-fade-in">
            <ThemeToggle />
          </div>

          <div className="max-w-6xl mx-auto pb-10">
            {activeTab === 'home' && (
              <DashboardTab
                degreePlan={degreePlan}
                selectedCourses={selectedCourses}
                calendarEvents={calendarEvents}
                totalCompletedCredits={totalCompletedCredits}
                gpax={gpax}
                onNavigate={setActiveTab}
                userName={session?.user?.name || ''}
                deferredPrompt={deferredPrompt}
                onInstall={handleInstallApp}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarTab
                filterRegion={filterRegion}
                setFilterRegion={setFilterRegion}
                filterType={filterType}
                setFilterType={setFilterType}
                filteredCalendar={filteredCalendar}
                handleOpenEventModal={handleOpenEventModal}
                setConfirmDeleteId={setConfirmDeleteId}
                getCalendarIcon={getCalendarIcon}
              />
            )}

            {activeTab === 'roadmap' && (
              <RoadmapTab
                roadmap={semesterRoadmap}
                mr30Courses={mr30Courses}
                onAddCourse={addCourseToSemester}
                onRemoveCourse={removeCourseFromSemester}
                onMoveCourse={moveCourseToSemester}
                onRenameSemester={renameSemester}
                onRemoveSemester={removeSemester}
              />
            )}

            {activeTab === 'courses' && (
              isDegreeLoading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen size={20} className="text-blue-600" />
                    </div>
                  </div>
                </div>
              ) : (
                <CoursesTab
                  courses={mr30Courses}
                  onCourseAdded={loadAllData}
                  showToast={showToast}
                  addCourseToPlanner={addCourseToPlanner}
                  selectedCourses={selectedCourses}
                />
              )
            )}

            {activeTab === 'planner' && (
              <PlannerTab
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                addCourseToPlanner={addCourseToPlanner}
                plannerError={plannerError}
                selectedCourses={selectedCourses}
                removeCourseFromPlanner={removeCourseFromPlanner}
                openManualCourseModal={() => setIsManualCourseModalOpen(true)}
                calendarEvents={calendarEvents}
                showToast={showToast}
              />
            )}

            {activeTab === 'degree' && (
              <DegreePlanTab
                degreePlan={degreePlan}
                isDegreeEditMode={isDegreeEditMode}
                setIsDegreeEditMode={setIsDegreeEditMode}
                handleSaveDegreeSettings={handleSaveDegreeSettings}
                totalCompletedCredits={totalCompletedCredits}
                toggleCourseCompletion={toggleCourseCompletion}
                toggleReExam={toggleReExam}
                updateCourseGrade={updateCourseGrade}
                handleAddCategory={handleAddCategory}
                handleDeleteCategory={handleDeleteCategory}
                handleAddCourse={handleAddCourse}
                handleDeleteCourse={handleDeleteCourse}
                isDegreeLoading={isDegreeLoading}
                completedCourses={completedCourses}
                mr30Courses={mr30Courses}
                semesterRoadmap={semesterRoadmap}
              />
            )}

            {activeTab === 'notify' && (
              <div className="animate-slide-up space-y-8 max-w-2xl">
                <div className="flex flex-col gap-2 mb-4">
                  <h2 className="text-3xl font-black tracking-tighter uppercase">การตั้งค่าแจ้งเตือน</h2>
                  <p className="text-slate-500 font-medium">จัดการวิธีที่คุณต้องการรับข้อมูลจากเรา</p>
                </div>

                <div className="grid gap-6">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bento-card">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-5">
                        <div className="bg-[#00B900] p-4 rounded-2xl shadow-lg shadow-green-500/20">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" className="w-6 h-6 invert brightness-0" alt="LINE" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">LINE Notify</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">แจ้งเตือนผ่านแอป LINE</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('notifyLine', !notifyLine)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${notifyLine ? 'bg-[#00B900]' : 'bg-slate-200 dark:bg-slate-800'}`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition-transform duration-500 ${notifyLine ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {notifyLine && (
                      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slice-800/50 animate-slide-up">
                        <label className="block text-[10px] font-black text-slice-400 dark:text-slice-500 uppercase tracking-[0.2em] mb-3 ml-1">LINE Notify Token</label>
                        <input
                          type="password"
                          value={lineToken}
                          onChange={(e) => updateSetting('lineToken', e.target.value)}
                          placeholder="วาง Token ของคุณที่นี่..."
                          className="w-full bg-slice-50 dark:bg-slice-800/50 border border-slice-100 dark:slice-100 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-slice-900 dark:text-white font-bold"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slice-900 p-8 rounded-[2.5rem] border border-slice-100 dark:slice-800/50 shadow-xl shadow-slice-200/50 dark:shadow-none bento-card">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-5">
                        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
                          <Smartphone className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-slice-900 dark:text-white uppercase tracking-tight">Browser Notify</h3>
                          <p className="text-xs text-slice-500 dark:text-slice-400 font-bold">แจ้งเตือนบนเบราว์เซอร์</p>
                        </div>
                      </div>
                      {!isPushSupported ? (
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Not Supported</span>
                      ) : (
                        <button
                          onClick={isSubscribed ? testPush : subscribeToPush}
                          className={`text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full transaction-all ${isSubscribed ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
                        >
                          {isSubscribed ? 'Test Alert' : 'Enable'}
                        </button>
                      )}
                      </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
          <div className="glass px-8 py-4 rounded-[2rem] shadow-2xl border-white/40 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle size={18} />
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        formData={eventFormData}
        setFormData={setEventFormData}
        onSave={handleSaveEvent}
      />
      <DeleteConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteEvent}
      />
      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onAddCourse={confirmAddCourseToCategory}
        searchQuery={courseSearchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={degreeSearchResults}
      />
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={closeAddCategoryModal}
        onConfirm={confirmAddCategory}
        categoryName={newCategoryName}
        setCategoryName={setNewCategoryName}
      />
      <ManualCourseModal
        isOpen={isManualCourseModalOpen}
        onClose={() => setIsManualCourseModalOpen(false)}
        formData={manualCourseData}
        setFormData={setManualCourseData}
        onSave={handleSaveManualCourse}
      />
    </div>
  );
}