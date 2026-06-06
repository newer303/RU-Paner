'use client';

import React from 'react';
import { getCalendarIcon } from '@/lib/utils';
import { NavButton } from '@/components/NavButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Calendar, BookMarked, Bell, LayoutDashboard, List, CalendarDays,
  Smartphone, AlertCircle, CheckCircle, Loader2
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
import { LogOut, User as UserIcon } from 'lucide-react';

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
    totalCompletedCredits, toggleCourseCompletion, updateCourseGrade, handleSaveDegreeSettings,
    gpax,
    handleAddCategory, closeAddCategoryModal, confirmAddCategory, handleDeleteCategory,
    handleAddCourse, confirmAddCourseToCategory, degreeSearchResults, handleDeleteCourse
  } = useAppData();

  const [isPushSupported, setIsPushSupported] = React.useState(false);
  const [isSubscribed, setIsPushSubscribed] = React.useState(false);

  React.useEffect(() => {
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

      // Check permission first
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
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans text-gray-800 dark:text-zinc-200 transition-colors duration-300">
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 md:p-2 rounded-lg shadow-sm">
              <BookMarked className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">RU Planner</h1>
              <p className="hidden md:block text-xs text-gray-500 dark:text-zinc-400">ระบบจัดการตารางเรียนและหลักสูตร ม.รามคำแหง</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
              <UserIcon size={14} className="text-gray-500 dark:text-zinc-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 max-w-[120px] truncate">
                {session.user?.name || session.user?.email}
              </span>
            </div>
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1.5 md:p-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 md:py-8 flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block md:w-64 flex-shrink-0 sticky top-24 self-start">
          <nav className="flex flex-col gap-2">
            <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={20} />} label="หน้าแรก" />
            <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar size={20} />} label="ปฏิทินการศึกษา" />
            <NavButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={<BookMarked size={20} />} label="รวมรายวิชา" />
            <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<CalendarDays size={20} />} label="จัดตารางเรียน" />
            <NavButton active={activeTab === 'degree'} onClick={() => setActiveTab('degree')} icon={<List size={20} />} label="เช็คหลักสูตร" />
            <NavButton active={activeTab === 'notify'} onClick={() => setActiveTab('notify')} icon={<Bell size={20} />} label="ตั้งค่าแจ้งเตือน" />
          </nav>
        </aside>

        <section className="flex-1 min-w-0 pb-24 md:pb-0">
          {activeTab === 'home' && (
            <DashboardTab
              degreePlan={degreePlan}
              selectedCourses={selectedCourses}
              calendarEvents={calendarEvents}
              totalCompletedCredits={totalCompletedCredits}
              gpax={gpax}
              onNavigate={setActiveTab}
              userName={session?.user?.name || ''}
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
            <CoursesTab courses={mr30Courses} onCourseAdded={loadAllData} />
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
            />
          )}

          {activeTab === 'degree' && (
            <DegreePlanTab
              degreePlan={degreePlan}
              isDegreeEditMode={isDegreeEditMode}
              setIsDegreeEditMode={setIsDegreeEditMode}
              completedCourses={completedCourses}
              totalCompletedCredits={totalCompletedCredits}
              toggleCourseCompletion={toggleCourseCompletion}
              updateCourseGrade={updateCourseGrade}
              handleDeleteCategory={handleDeleteCategory}
              handleAddCourse={handleAddCourse}
              handleDeleteCourse={handleDeleteCourse}
              handleAddCategory={handleAddCategory}
              mr30Courses={mr30Courses}
              handleSaveDegreeSettings={handleSaveDegreeSettings}
              isDegreeLoading={isDegreeLoading}
            />
          )}

          {activeTab === 'notify' && (
            <div className="animate-fade-in max-w-xl mx-auto md:mx-0">
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-1 text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                  <Bell className="text-blue-600" size={24} /> ตั้งค่าแจ้งเตือน
                </h2>
                <p className="text-gray-500 dark:text-zinc-400 text-sm">รับการแจ้งเตือนวันสอบและวันสำคัญ</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-start gap-5">
                  <div className="bg-[#00B900] p-3 rounded-xl shadow-lg shadow-green-50 dark:shadow-none">
                    <Smartphone className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-0.5">LINE แจ้งเตือน</h3>
                        <p className="text-[13px] text-gray-400 dark:text-zinc-500">รับข้อความแจ้งเตือนผ่าน LINE Notify</p>
                      </div>
                      <button
                        onClick={() => updateSetting('notifyLine', !notifyLine)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${notifyLine ? 'bg-[#00B900]' : 'bg-gray-200 dark:bg-zinc-700'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${notifyLine ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {notifyLine && (
                      <div className="mt-4 animate-fade-in">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">LINE Notify Token</label>
                        <input
                          type="password"
                          value={lineToken}
                          onChange={(e) => updateSetting('lineToken', e.target.value)}
                          placeholder="วาง Token ที่นี่..."
                          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-green-500 transition-all text-gray-900 dark:text-zinc-100"
                        />
                        <p className="mt-2 text-[10px] text-gray-400 dark:text-zinc-500 leading-relaxed">คุณสามารถขอ Token ได้ที่ <a href="https://notify-bot.line.me/" target="_blank" rel="noreferrer" className="text-blue-500 underline">notify-bot.line.me</a></p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-start gap-5">
                  <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-50 dark:shadow-none">
                    <Smartphone className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-0.5">Browser แจ้งเตือน</h3>
                    <p className="text-[13px] text-gray-400 dark:text-zinc-500 mb-4">รับการแจ้งเตือนโดยตรงผ่าน Web Browser</p>

                    {!isPushSupported ? (
                      <p className="text-xs text-red-500 font-medium italic">Browser นี้ไม่รองรับการแจ้งเตือน</p>
                    ) : isSubscribed ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle size={12} /> ลงทะเบียนแล้ว
                        </span>
                        <button
                          onClick={testPush}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          ทดสอบการแจ้งเตือน
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={subscribeToPush}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-100 dark:shadow-none"
                      >
                        เปิดใช้งานการแจ้งเตือน
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-start gap-5">
                  <div className="bg-gray-900 dark:bg-zinc-800 p-3 rounded-xl shadow-lg shadow-gray-100 dark:shadow-none">
                    <AlertCircle className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-0.5">Email แจ้งเตือน</h3>
                    <p className="text-[13px] text-gray-400 dark:text-zinc-500 mb-4">รับสรุปตารางสอบผ่านทางอีเมล</p>
                    <button
                      onClick={() => updateSetting('notifyEmail', !notifyEmail)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${notifyEmail ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${notifyEmail ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-zinc-800 px-2 py-3 flex justify-around items-center z-50">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={20} />} label="หน้าแรก" />
        <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar size={20} />} label="ปฏิทิน" />
        <NavButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={<BookMarked size={20} />} label="วิชา" />
        <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<CalendarDays size={20} />} label="ตาราง" />
        <NavButton active={activeTab === 'degree'} onClick={() => setActiveTab('degree')} icon={<List size={20} />} label="หลักสูตร" />
        <NavButton active={activeTab === 'notify'} onClick={() => setActiveTab('notify')} icon={<Bell size={20} />} label="ตั้งค่า" />
      </nav>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-900/90 dark:bg-zinc-800/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in flex items-center gap-3">
          <CheckCircle size={20} className="text-green-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
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
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteEvent}
      />

      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        searchQuery={courseSearchQuery}
        setSearchQuery={setCourseSearchQuery}
        searchResults={degreeSearchResults}
        onAddCourse={confirmAddCourseToCategory}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={closeAddCategoryModal}
        categoryName={newCategoryName}
        setCategoryName={setNewCategoryName}
        onConfirm={confirmAddCategory}
      />

      <ManualCourseModal
        isOpen={isManualCourseModalOpen}
        onClose={() => setIsManualCourseModalOpen(false)}
        formData={manualCourseData}
        setFormData={setManualCourseData}
        onSave={handleSaveManualCourse}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
