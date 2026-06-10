'use client';

import React from 'react';
import { getCalendarIcon } from '@/lib/utils';
import { NavButton } from '@/components/NavButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Calendar, BookMarked, Bell, LayoutDashboard, List, CalendarDays,
  Smartphone, AlertCircle, CheckCircle, Loader2, LogOut, User as UserIcon,
  Sparkles, Menu, X as CloseIcon, BookOpen
} from 'lucide-react';
import { CalendarTab } from '@/components/CalendarTab';
import { PlannerTab } from '@/components/PlannerTab';
import { DegreePlanTab } from '@/components/DegreePlanTab';
import { CoursesTab } from '@/components/CoursesTab';
import { DashboardTab } from '@/components/DashboardTab';

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
    handleAddCategory, closeAddCategoryModal, confirmAddCategory, handleDeleteCategory,
    handleAddCourse, confirmAddCourseToCategory, degreeSearchResults, handleDeleteCourse,
    showToast
  } = useAppData();

  const [isPushSupported, setIsPushSupported] = React.useState(false);
  const [isSubscribed, setIsPushSubscribed] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsPushSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const subscribeToPush = async () => {
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('VAPID Public Key is missing. Please check your environment variables.');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission not granted for notifications.');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      const response = await fetch('/api/web-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save subscription on server');
      }

      setIsPushSubscribed(true);
      alert('ลงทะเบียนรับแจ้งเตือนผ่าน Browser สำเร็จ!');
    } catch (err: any) {
      console.error('Failed to subscribe:', err);
      alert(`เกิดข้อผิดพลาด: ${err.message || 'ไม่ทราบสาเหตุ'}`);
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

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <BookMarked size={20} className="text-blue-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-10 flex flex-col md:flex-row gap-10">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block md:w-72 flex-shrink-0 sticky top-10 self-start animate-slide-up">
          <div className="mb-10 px-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              <BookMarked size={28} className="text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white">RU Planner</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version 2.0</p>
              </div>
            </div>
          </div>
          
          <nav className="flex flex-col gap-3">
            <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={20} />} label="หน้าหลัก" />
            <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar size={20} />} label="ปฏิทินราม" />
            <NavButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={<BookMarked size={20} />} label="ค้นหาวิชา" />
            <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<CalendarDays size={20} />} label="จัดตารางเรียน" />
            <NavButton active={activeTab === 'degree'} onClick={() => setActiveTab('degree')} icon={<List size={20} />} label="แผนการเรียน" />
            <NavButton active={activeTab === 'notify'} onClick={() => setActiveTab('notify')} icon={<Bell size={20} />} label="ตั้งค่า" />
          </nav>

          <div className="mt-10 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-125 transition-transform duration-700">
               <Sparkles size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon size={14} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Session</span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate mb-4">{session.user?.name || session.user?.email}</p>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="flex justify-between items-center mb-6 md:hidden animate-slide-up">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                <BookMarked size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter">RU Planner</h1>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Version 2.0</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
             <ThemeToggle />
             <button 
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
             >
               {isMobileMenuOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
             </button>
           </div>
        </header>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-[#f8fafc]/95 dark:bg-[#020617]/95 backdrop-blur-xl animate-fade-in p-6 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <BookMarked className="text-blue-600" size={32} />
                <h2 className="text-2xl font-black tracking-tighter">MENU</h2>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                <CloseIcon size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-4 overflow-y-auto">
              <NavButton active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} icon={<LayoutDashboard size={24} />} label="หน้าหลัก" />
              <NavButton active={activeTab === 'calendar'} onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }} icon={<Calendar size={24} />} label="ปฏิทินราม" />
              <NavButton active={activeTab === 'courses'} onClick={() => { setActiveTab('courses'); setIsMobileMenuOpen(false); }} icon={<BookMarked size={24} />} label="ค้นหาวิชา" />
              <NavButton active={activeTab === 'planner'} onClick={() => { setActiveTab('planner'); setIsMobileMenuOpen(false); }} icon={<CalendarDays size={24} />} label="จัดตารางเรียน" />
              <NavButton active={activeTab === 'degree'} onClick={() => { setActiveTab('degree'); setIsMobileMenuOpen(false); }} icon={<List size={24} />} label="แผนการเรียน" />
              <NavButton active={activeTab === 'notify'} onClick={() => { setActiveTab('notify'); setIsMobileMenuOpen(false); }} icon={<Bell size={24} />} label="การตั้งค่า" />
            </nav>
            <div className="mt-auto py-10 flex flex-col gap-4">
              <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <UserIcon size={20} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 dark:text-white truncate">{session.user?.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full py-5 rounded-3xl bg-red-600 text-white font-black uppercase tracking-widest shadow-xl shadow-red-500/30 flex items-center justify-center gap-3"
              >
                <LogOut size={20} /> SIGN OUT
              </button>
            </div>
          </div>
        )}

        <section className="flex-1 min-w-0">
          <div className="hidden md:flex justify-end mb-10 animate-fade-in">
            <ThemeToggle />
          </div>

          <div className="relative">
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
                      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 animate-slide-up">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">LINE Notify Token</label>
                        <input
                          type="password"
                          value={lineToken}
                          onChange={(e) => updateSetting('lineToken', e.target.value)}
                          placeholder="วาง Token ของคุณที่นี่..."
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bento-card">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-5">
                        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
                          <Smartphone className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">Browser Notify</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">แจ้งเตือนบนเบราว์เซอร์</p>
                        </div>
                      </div>
                      {!isPushSupported ? (
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Not Supported</span>
                      ) : (
                        <button
                          onClick={isSubscribed ? testPush : subscribeToPush}
                          className={`text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full transition-all ${isSubscribed ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
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

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="glass shadow-2xl shadow-slate-900/20 rounded-[2.5rem] border-white/20 px-2 py-3 flex justify-around items-center">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={20} />} label="HOME" />
          <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar size={20} />} label="CAL" />
          <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<CalendarDays size={20} />} label="PLAN" />
          <NavButton active={activeTab === 'degree'} onClick={() => setActiveTab('degree')} icon={<List size={20} />} label="DEGREE" />
          <NavButton active={activeTab === 'notify'} onClick={() => setActiveTab('notify')} icon={<Bell size={20} />} label="SET" />
        </div>
      </nav>

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
        setSearchQuery={setCourseSearchQuery}
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
