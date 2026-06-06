'use client';
import { CalendarDays, Search, Plus, AlertCircle, Clock, X, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Course, PlannerCourse, CalendarEvent } from '@/types';
import { generateICS } from '@/lib/utils';
import { domToPng } from 'modern-screenshot';
import { useRef, useState } from 'react';

interface PlannerTabProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchResults: Course[];
  addCourseToPlanner: (course: Course) => void;
  plannerError: string;
  selectedCourses: PlannerCourse[];
  removeCourseFromPlanner: (code: string) => void;
  openManualCourseModal: () => void;
  calendarEvents: CalendarEvent[];
  showToast?: (msg: string) => void;
}

export const PlannerTab = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  addCourseToPlanner,
  plannerError,
  selectedCourses,
  removeCourseFromPlanner,
  openManualCourseModal,
  calendarEvents,
  showToast
}: PlannerTabProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const plannerRef = useRef<HTMLDivElement>(null);

  const handleExportICS = () => {
    const icsContent = generateICS(selectedCourses, []);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'ru-exam-schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportImage = async () => {
    if (!plannerRef.current) return;
    setIsExporting(true);
    
    // Give a small delay to ensure UI is ready
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const dataUrl = await domToPng(plannerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `ru-planner-${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (showToast) showToast('บันทึกรูปภาพเรียบร้อยแล้ว');
    } catch (err: any) {
      console.error('Image export failed:', err);
      alert('ไม่สามารถบันทึกรูปภาพได้: ' + (err.message || 'เกิดข้อผิดพลาดทางเทคนิค'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-1 text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <CalendarDays className="text-blue-600 dark:text-blue-500" size={24} /> จัดตารางเรียน
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">จำลองการจัดตารางและเช็ควันสอบซ้ำซ้อน</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportImage}
            disabled={selectedCourses.length === 0 || isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />} 
            Save Image
          </button>
          {/* <button
            onClick={handleExportICS}
            disabled={selectedCourses.length === 0}
            className="bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={16} /> ส่งออกปฏิทิน
          </button> */}
          <button
            onClick={openManualCourseModal}
            className="bg-white dark:bg-zinc-800 border-2 border-blue-100 dark:border-zinc-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus size={16} /> เพิ่มวิชาเอง
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-gray-400 dark:text-zinc-500" size={18} />
        </div>
        <input
          type="text"
          placeholder="ค้นหารหัสวิชาหรือชื่อวิชา"
          className="w-full pl-11 pr-4 py-4 border border-gray-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none shadow-sm transition-all bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {searchQuery.length >= 2 && (
          <div className="absolute z-20 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl max-h-72 overflow-y-auto p-2 border-t-0">
            {searchResults.length > 0 ? (
              searchResults.map(course => (
                <button
                  key={course.code}
                  onClick={() => addCourseToPlanner(course)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl flex items-center justify-between transition-colors group"
                >
                  <div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{course.code}</span>
                    <span className="text-gray-400 dark:text-zinc-500 text-xs ml-3">{course.name}</span>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-400 dark:text-zinc-500 text-sm">ไม่พบรายวิชาที่ค้นหา</div>
            )}
          </div>
        )}
      </div>

      {plannerError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-2xl flex items-start gap-3 border border-red-100 dark:border-red-900/30 animate-shake">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{plannerError}</p>
        </div>
      )}

      <div ref={plannerRef} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden mb-6">
        <div className="bg-gray-50/50 dark:bg-zinc-800/50 px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 uppercase tracking-tight">ตารางเรียนของฉัน</h3>
          <span className="text-[11px] bg-blue-600 dark:bg-blue-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-wider">
            {selectedCourses.reduce((sum, c) => sum + (c.credit || 0), 0)} หน่วยกิต
          </span>
        </div>

        {selectedCourses.length === 0 ? (
          <div className="p-16 text-center">
            <CalendarDays size={48} className="mx-auto text-gray-100 dark:text-zinc-800 mb-4" />
            <p className="text-gray-400 dark:text-zinc-500 text-sm">ยังไม่มีวิชาในตาราง ค้นหาแล้วกดเพิ่มได้เลย</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-zinc-800">
            {selectedCourses.map(course => (
              <li key={course.code} className="p-5 flex flex-col sm:flex-row gap-4 justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-lg text-blue-900 dark:text-blue-400">{course.code}</span>
                    <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-bold text-gray-500 dark:text-zinc-400 uppercase">{course.credit} นก.</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-zinc-300 mb-3">{course.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 font-medium"><Clock size={12} className="text-blue-500 dark:text-blue-400" /> {course.day} {course.time}</span>
                    <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400 font-bold"><AlertCircle size={12} /> สอบ: {course.examDate} ({course.examTime})</span>
                  </div>
                </div>
                <button
                  onClick={() => removeCourseFromPlanner(course.code)}
                  className="self-end sm:self-center text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
