'use client';
import React, { useRef, useState, useMemo } from 'react';
import { CalendarDays, Search, Plus, AlertCircle, Clock, X, Download, Image as ImageIcon, Loader2, List, Grid3X3, MapPin } from 'lucide-react';
import { Course, PlannerCourse, CalendarEvent } from '@/types';
import { generateICS } from '@/lib/utils';
import { domToPng } from 'modern-screenshot';

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
  syncRoadmapToPlanner: (semesterId: string) => void;
  semesterRoadmap: SemesterPlan[];
}

const DAYS_TH = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
const DAYS_EN = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_COLORS: Record<string, string> = {
  'MON': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  'TUE': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  'WED': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'THU': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  'FRI': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'SAT': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'SUN': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
};

const COURSE_COLORS = [
  'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800',
  'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-800',
  'bg-violet-500/10 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-800',
  'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800',
  'bg-rose-500/10 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-800',
  'bg-cyan-500/10 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-800',
];

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
  showToast,
  syncRoadmapToPlanner,
  semesterRoadmap
}: PlannerTabProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const plannerRef = useRef<HTMLDivElement>(null);

  const sortedSelectedCourses = useMemo(() => {
    const dayPriority: Record<string, number> = {
      'จันทร์': 0, 'MON': 0, 'M': 0,
      'อังคาร': 1, 'TUE': 1, 'TU': 1,
      'พุธ': 2, 'WED': 2, 'W': 2,
      'พฤหัสบดี': 3, 'THU': 3, 'TH': 3,
      'ศุกร์': 4, 'FRI': 4, 'F': 4,
      'เสาร์': 5, 'SAT': 5, 'SA': 5,
      'อาทิตย์': 6, 'SUN': 6, 'SU': 6,
    };

    return [...selectedCourses].sort((a, b) => {
      const dayA = dayPriority[a.day.toUpperCase()] ?? 99;
      const dayB = dayPriority[b.day.toUpperCase()] ?? 99;
      if (dayA !== dayB) return dayA - dayB;
      return a.time.localeCompare(b.time);
    });
  }, [selectedCourses]);

  const handleExportImage = async () => {
    if (!plannerRef.current) return;
    setIsExporting(true);
    
    // Give a small delay to ensure UI is ready
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const dataUrl = await domToPng(plannerRef.current, {
        backgroundColor: '#ffffff',
        scale: 3, // Higher scale for better quality
        style: {
          borderRadius: '0',
        }
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `ru-planner-${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (showToast) showToast('บันทึกรูปภาพตารางเรียนเรียบร้อยแล้ว');
    } catch (err: any) {
      console.error('Image export failed:', err);
      alert('ไม่สามารถบันทึกรูปภาพได้: ' + (err.message || 'เกิดข้อผิดพลาดทางเทคนิค'));
    } finally {
      setIsExporting(false);
    }
  };

  const parseDay = (day: string): number => {
    const d = day.trim().toUpperCase();
    if (d.includes('จันทร์') || d.includes('MON') || d === 'M') return 0;
    if (d.includes('อังคาร') || d.includes('TUE') || d === 'TU') return 1;
    if (d.includes('พุธ') || d.includes('WED') || d === 'W') return 2;
    if (d.includes('พฤหัส') || d.includes('THU') || d === 'TH') return 3;
    if (d.includes('ศุกร์') || d.includes('FRI') || d === 'F') return 4;
    if (d.includes('เสาร์') || d.includes('SAT') || d === 'SA') return 5;
    if (d.includes('อาทิตย์') || d.includes('SUN') || d === 'SU') return 6;
    return -1;
  };

  const parseTime = (timeStr: string) => {
    // Expected format: "09:30-11:20" or "0930-1120" or "09.30-11.20"
    const match = timeStr.match(/(\d{1,2})[:.]?(\d{2})\s*-\s*(\d{1,2})[:.]?(\d{2})/);
    if (!match) return null;
    
    const startH = parseInt(match[1]);
    const startM = parseInt(match[2]);
    const endH = parseInt(match[3]);
    const endM = parseInt(match[4]);
    
    return {
      start: startH + startM / 60,
      end: endH + endM / 60,
      duration: (endH + endM / 60) - (startH + startM / 60),
      label: `${match[1].padStart(2, '0')}:${match[2]} - ${match[3].padStart(2, '0')}:${match[4]}`
    };
  };

  const timetableData = useMemo(() => {
    return selectedCourses.map((course, index) => {
      const dayIdx = parseDay(course.day);
      const timeData = parseTime(course.time);
      return {
        ...course,
        dayIdx,
        timeData,
        colorClass: COURSE_COLORS[index % COURSE_COLORS.length]
      };
    }).filter(c => c.dayIdx !== -1 && c.timeData !== null);
  }, [selectedCourses]);

  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 to 20:00

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <CalendarDays className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 dark:text-zinc-100 uppercase">
                จัดตารางเรียน
              </h2>
              <p className="text-gray-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">Simulation & Planning</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
              <Grid3X3 size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
              <List size={14} /> List
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2.5 rounded-2xl text-xs font-black uppercase outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            >
              <option value="">เลือกเทอม</option>
              {semesterRoadmap.map(s => (
                <option key={s.semester_id} value={s.semester_id}>{s.semester_id}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (selectedSemesterId) syncRoadmapToPlanner(selectedSemesterId);
              }}
              disabled={!selectedSemesterId}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Download size={16} /> Sync
            </button>
          </div>

          <button
            onClick={handleExportImage}
            disabled={selectedCourses.length === 0 || isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />} 
            Save Image
          </button>
          <button
            onClick={openManualCourseModal}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800 px-6 py-2.5 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus size={16} /> Add Custom
          </button>
        </div>
      </div>

      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        </div>
        <input
          type="text"
          placeholder="ค้นหารหัสวิชาหรือชื่อวิชา (เช่น ACC1101)"
          className="w-full pl-14 pr-6 py-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none shadow-sm transition-all text-gray-900 dark:text-zinc-100 font-bold placeholder-gray-400 dark:placeholder-zinc-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {searchQuery.length >= 2 && (
          <div className="absolute z-50 w-full mt-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-2xl max-h-80 overflow-y-auto p-3 border-t-0 animate-slide-up">
            {searchResults.length > 0 ? (
              searchResults.map(course => (
                <button
                  key={course.code}
                  onClick={() => addCourseToPlanner(course)}
                  className="w-full text-left px-5 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl flex items-center justify-between transition-all group/item mb-1 last:mb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-xl flex flex-col items-center justify-center border border-gray-100 dark:border-zinc-700 group-hover/item:border-blue-200 dark:group-hover/item:border-blue-800 transition-colors">
                      <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-tighter">Credit</span>
                      <span className="text-sm font-black text-gray-900 dark:text-zinc-100">{course.credit}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-gray-900 dark:text-zinc-100 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">{course.code}</span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-[9px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest">{course.day}</span>
                      </div>
                      <p className="text-gray-500 dark:text-zinc-400 text-xs font-medium line-clamp-1">{course.name}</p>
                    </div>
                  </div>
                  <div className="bg-blue-600 text-white p-2 rounded-xl scale-0 group-hover/item:scale-100 transition-transform shadow-lg shadow-blue-500/30">
                    <Plus size={18} />
                  </div>
                </button>
              ))
            ) : (
              <div className="px-6 py-10 text-center flex flex-col items-center gap-3">
                <AlertCircle className="text-gray-300 dark:text-zinc-700" size={32} />
                <p className="text-gray-400 dark:text-zinc-500 text-sm font-bold uppercase tracking-widest">ไม่พบรายวิชาที่ค้นหา</p>
              </div>
            )}
          </div>
        )}
      </div>

      {plannerError && (
        <div className="mb-8 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-5 rounded-[2rem] flex items-start gap-4 border border-red-100 dark:border-red-900/30 animate-shake shadow-sm">
          <div className="bg-red-500 p-2 rounded-xl text-white">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">ข้อผิดพลาด</p>
            <p className="text-xs font-bold opacity-80">{plannerError}</p>
          </div>
        </div>
      )}

      {/* Main Timetable Content */}
      <div ref={plannerRef} className="space-y-8">
        {/* Timetable Header (Only for Export) */}
        <div className="hidden export-only flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-blue-900 uppercase">My Schedule</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RU Planner System</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-gray-900">{selectedCourses.reduce((sum, c) => sum + (c.credit || 0), 0)} CREDITS</p>
            <p className="text-[10px] font-bold text-gray-400">{new Date().toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        {selectedCourses.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-[3rem] p-24 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center mb-6 text-gray-300 dark:text-zinc-700">
              <CalendarDays size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tight mb-2">ยังไม่มีวิชาในตาราง</h3>
            <p className="text-gray-400 dark:text-zinc-500 text-sm font-medium">เริ่มต้นด้วยการค้นหาวิชาที่คุณต้องการลงทะเบียน</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[900px] p-6">
                <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px bg-gray-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800">
                  {/* Top Header Days */}
                  <div className="bg-gray-50 dark:bg-zinc-900 h-12 flex items-center justify-center border-b border-r border-gray-200 dark:border-zinc-800">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  {DAYS_EN.map((day, i) => (
                    <div key={day} className={`h-12 flex items-center justify-center border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900`}>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-400">{day}</span>
                    </div>
                  ))}

                  {/* Time Grid Rows */}
                  {timeSlots.map((hour) => (
                    <React.Fragment key={hour}>
                      <div className="bg-gray-50 dark:bg-zinc-900 h-20 flex items-center justify-center border-r border-b border-gray-200 dark:border-zinc-800 relative">
                        <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500">{hour.toString().padStart(2, '0')}:00</span>
                      </div>
                      {Array.from({ length: 7 }).map((_, dayIdx) => (
                        <div key={`${hour}-${dayIdx}`} className="bg-white dark:bg-zinc-900 h-20 border-r border-b border-gray-100 dark:border-zinc-800 last:border-r-0 relative">
                          {/* Render course blocks for this day/hour */}
                          {timetableData
                            .filter(c => c.dayIdx === dayIdx && Math.floor(c.timeData!.start) === hour)
                            .map((course, idx) => (
                              <div
                                key={course.code}
                                className={`absolute top-0 left-0 right-0 z-10 m-0.5 p-2 rounded-xl border flex flex-col justify-between overflow-hidden shadow-sm hover:z-20 transition-all ${course.colorClass}`}
                                style={{
                                  height: `${course.timeData!.duration * 80 - 4}px`,
                                  top: `${(course.timeData!.start - hour) * 80}px`
                                }}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <span className="text-[10px] font-black truncate">{course.code}</span>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); removeCourseFromPlanner(course.code); }}
                                      className="text-current opacity-40 hover:opacity-100 transition-opacity"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                  <p className="text-[8px] font-bold leading-tight line-clamp-2 uppercase">{course.name}</p>
                                </div>
                                <div className="mt-1 pt-1 border-t border-current/10 flex items-center gap-1">
                                  <MapPin size={8} />
                                  <span className="text-[8px] font-black truncate">{course.room || 'TBA'}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
            <div className="bg-gray-50/50 dark:bg-zinc-800/50 px-8 py-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tighter text-lg">Selected Courses</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">{selectedCourses.length} วิชา</span>
                <span className="text-[11px] bg-blue-600 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-wider shadow-lg shadow-blue-500/20">
                  {selectedCourses.reduce((sum, c) => sum + (c.credit || 0), 0)} หน่วยกิต
                </span>
              </div>
            </div>

            <ul className="divide-y divide-gray-50 dark:divide-zinc-800">
              {sortedSelectedCourses.map((course, idx) => (
                <li key={course.code} className="p-8 flex flex-col sm:flex-row gap-6 justify-between hover:bg-gray-50/30 dark:hover:bg-zinc-800/30 transition-all group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-3 h-3 rounded-full ${COURSE_COLORS[idx % COURSE_COLORS.length].split(' ')[0].replace('/10', '')}`}></span>
                      <span className="font-black text-2xl text-gray-900 dark:text-zinc-100 tracking-tighter">{course.code}</span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-lg font-black text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest">{course.credit} UNITS</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 font-medium max-w-2xl">{course.name}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-gray-50 dark:bg-zinc-800/50 px-4 py-2 rounded-2xl flex items-center gap-2.5 border border-gray-100 dark:border-zinc-800">
                        <Clock size={14} className="text-blue-500" />
                        <span className="text-[11px] text-gray-700 dark:text-zinc-300 font-black uppercase tracking-tight">{course.day} {course.time}</span>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-2xl flex items-center gap-2.5 border border-red-100/50 dark:border-red-900/30">
                        <AlertCircle size={14} className="text-red-500" />
                        <span className="text-[11px] text-red-700 dark:text-red-400 font-black uppercase tracking-tight">Exam: {course.examDate || 'TBA'} ({course.examTime || 'TBA'})</span>
                      </div>
                      {course.room && (
                        <div className="bg-gray-50 dark:bg-zinc-800/50 px-4 py-2 rounded-2xl flex items-center gap-2.5 border border-gray-100 dark:border-zinc-800">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-black uppercase tracking-tight">{course.room}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeCourseFromPlanner(course.code)}
                    className="self-end sm:self-center bg-gray-50 dark:bg-zinc-800 text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                  >
                    <X size={24} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exam Schedule Summary */}
        {selectedCourses.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden mb-12">
            <div className="bg-rose-50/50 dark:bg-rose-900/10 px-8 py-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <AlertCircle size={20} className="text-white" />
                </div>
                <h3 className="font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tighter text-lg">Exam Schedule</h3>
              </div>
              <span className="text-[11px] bg-rose-600 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-wider">
                {selectedCourses.filter(c => c.examDate).length} วิชาที่มีสอบ
              </span>
            </div>

            <div className="p-0">
              {selectedCourses.filter(c => c.examDate).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-zinc-800/30 text-gray-400 dark:text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4">Course</th>
                        <th className="px-8 py-4">Title</th>
                        <th className="px-8 py-4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                      {selectedCourses
                        .filter(c => c.examDate)
                        .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
                        .map((course, idx, arr) => {
                          const hasConflict = arr.some((c, i) => i !== idx && c.examDate === course.examDate && c.examTime === course.examTime);
                          return (
                            <tr key={course.code} className={`hover:bg-gray-50/30 dark:hover:bg-zinc-800/20 transition-colors ${hasConflict ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <span className="font-black text-gray-900 dark:text-zinc-100 text-sm tracking-tight">{course.examDate}</span>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${hasConflict ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                                  {course.code}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <p className="text-gray-500 dark:text-zinc-400 text-xs font-bold line-clamp-1 max-w-xs">{course.name}</p>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className={`font-black text-sm tracking-tight ${hasConflict ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-zinc-200'}`}>{course.examTime}</span>
                                  {hasConflict && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <AlertCircle size={10} className="text-red-500" />
                                      <span className="text-[9px] text-red-500 font-black uppercase tracking-tighter">Conflict!</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-300 dark:text-zinc-700">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-gray-400 dark:text-zinc-500 text-sm font-bold uppercase tracking-widest">ยังไม่มีข้อมูลการสอบ</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .export-only {
          display: none;
        }
        @media print {
          .export-only {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
};
