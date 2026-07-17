'use client';
import React, { useRef, useState, useMemo } from 'react';
import { CalendarDays, Search, Plus, AlertCircle, Clock, X, Download, Image as ImageIcon, Loader2, List, MapPin, Grid3X3, BookOpen, Edit2 } from 'lucide-react';
import { Course, PlannerCourse, CalendarEvent, SemesterPlan } from '@/types';
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
  openManualCourseModal: (course?: Course) => void;
  calendarEvents: CalendarEvent[];
  showToast?: (msg: string) => void;
  syncRoadmapToPlanner: (semesterId: string) => void;
  semesterRoadmap: SemesterPlan[];
}

const DAYS_TH = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

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
  const [activeTab, setActiveTab] = useState<'schedule' | 'exams' | 'courses'>('schedule');
  const plannerRef = useRef<HTMLDivElement>(null);

  const parseDay = (day: string): number => {
    const d = day.trim();
    if (d.includes('จันทร์')) return 0;
    if (d.includes('อังคาร')) return 1;
    if (d.includes('พุธ')) return 2;
    if (d.includes('พฤหัสบดี') || d.includes('พฤหัส')) return 3;
    if (d.includes('ศุกร์')) return 4;
    if (d.includes('เสาร์')) return 5;
    if (d.includes('อาทิตย์')) return 6;
    const dUpper = d.toUpperCase();
    if (dUpper.includes('MON') || dUpper === 'M') return 0;
    if (dUpper.includes('TUE') || dUpper === 'TU') return 1;
    if (dUpper.includes('WED') || dUpper === 'W') return 2;
    if (dUpper.includes('THU') || dUpper === 'TH') return 3;
    if (dUpper.includes('FRI') || dUpper === 'F') return 4;
    if (dUpper.includes('SAT') || dUpper === 'SA') return 5;
    if (dUpper.includes('SUN') || dUpper === 'SU') return 6;
    return -1;
  };

  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/(\d{1,2})[:.]?(\d{2})\s*-\s*(\d{1,2})[:.]?(\d{2})/);
    if (!match) return null;
    return {
      start: parseInt(match[1]) + parseInt(match[2]) / 60,
      duration: (parseInt(match[3]) + parseInt(match[4]) / 60) - (parseInt(match[1]) + parseInt(match[2]) / 60),
      label: `${match[1].padStart(2, '0')}:${match[2]} - ${match[3].padStart(2, '0')}:${match[4]}`
    };
  };

  const timetableData = useMemo(() => {
    return selectedCourses.flatMap((course, index) => {
      const entries: any[] = [];
      if (course.lecDay && course.lecTime) {
        entries.push({ course, part: 'lec', dayIdx: parseDay(course.lecDay), timeData: parseTime(course.lecTime), time: course.lecTime, room: course.lecRoom || course.room || 'TBA', label: 'LEC', colorClass: COURSE_COLORS[index % COURSE_COLORS.length] });
      }
      if (course.labDay && course.labTime) {
        entries.push({ course, part: 'lab', dayIdx: parseDay(course.labDay), timeData: parseTime(course.labTime), time: course.labTime, room: course.labRoom || course.room || 'TBA', label: 'LAB', colorClass: COURSE_COLORS[index % COURSE_COLORS.length] });
      }
      if (!course.lecDay && !course.lecTime && !course.labDay && !course.labTime && course.day && course.time) {
        entries.push({ course, part: 'default', dayIdx: parseDay(course.day), timeData: parseTime(course.time), time: course.time, room: course.room || 'TBA', label: '', colorClass: COURSE_COLORS[index % COURSE_COLORS.length] });
      }
      return entries.filter(e => e.dayIdx !== -1 && e.timeData !== null);
    });
  }, [selectedCourses]);

  const handleExport = async () => {
    if (!plannerRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await domToPng(plannerRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      const filename = activeTab === 'schedule' ? 'ตารางเรียน.png' : 'ตารางสอบ.png';
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      if (showToast) showToast('ไม่สามารถบันทึกรูปภาพได้');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
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
                </div>
              </div>
            </div>
            <div className="flex gap-2 bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl">
              <button onClick={() => setActiveTab('schedule')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'schedule' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-60'}`}>ตารางเรียน</button>
              <button onClick={() => setActiveTab('exams')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'exams' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-60'}`}>ตารางสอบ</button>
              <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'courses' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'opacity-60'}`}>จัดการรายวิชา</button>
            </div>
        </div>

        <div className="flex justify-end mb-4">
           {activeTab !== 'courses' && (
             <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />} 
                  Save {activeTab === 'schedule' ? 'ตารางเรียน' : 'ตารางสอบ'}
              </button>
           )}
        </div>

        <div ref={plannerRef} className="space-y-6 bg-white dark:bg-zinc-950 p-4 sm:p-8 rounded-[3rem]">
          {activeTab === 'schedule' ? (
             selectedCourses.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-[3rem] p-24 text-center flex flex-col items-center">
                <h3 className="text-xl font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tight mb-2">ยังไม่มีวิชาในตาราง</h3>
              </div>
            ) : (
              <div className="space-y-6">
                {DAYS_TH.map((dayName, dayIdx) => {
                  const dayEntries = timetableData.filter(e => e.dayIdx === dayIdx);
                  if (dayEntries.length === 0) return null;

                  return (
                    <div key={dayName} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                        <h3 className="text-sm font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tight">{dayName}</h3>
                      </div>
                      <div className="space-y-2">
                        {dayEntries
                          .sort((a, b) => a.timeData!.start - b.timeData!.start)
                          .map((entry, idx) => (
                            <div key={`${entry.course.code}-${entry.part}-${idx}`} className={`p-3 rounded-xl border flex items-center gap-3 ${entry.colorClass}`}>
                              <div className="flex flex-col items-center justify-center min-w-[50px]">
                                  <span className="text-[10px] font-black">{entry.timeData?.label.split(' - ')[0]}</span>
                                  <span className="text-[8px] font-bold opacity-60">ถึง</span>
                                  <span className="text-[10px] font-black">{entry.timeData?.label.split(' - ')[1]}</span>
                              </div>
                              <div className="h-8 w-px bg-current opacity-20"></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-xs">{entry.course.code}</span>
                                  <span className="text-[8px] font-black uppercase bg-white/20 px-1 py-0.5 rounded">{entry.label}</span>
                                </div>
                                <p className="text-[10px] font-bold truncate">{entry.course.name}</p>
                                <p className="text-[9px] font-medium opacity-80 flex items-center gap-1">
                                  <MapPin size={9} /> {entry.room}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeTab === 'exams' ? (
             selectedCourses.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden mb-12">
                <div className="bg-rose-50/50 dark:bg-rose-900/10 px-8 py-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                      <AlertCircle size={20} className="text-white" />
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tighter text-lg">ตารางสอบ</h3>
                  </div>
                  <span className="text-[11px] bg-rose-600 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-wider">
                    {selectedCourses.filter(c => c.examDate || c.examMonthOnly || c.isFacultyExam).length} วิชาที่มีข้อมูลสอบ
                  </span>
                </div>

                <div className="p-0">
                  {selectedCourses.filter(c => c.examDate || c.examMonthOnly || c.isFacultyExam).length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {selectedCourses
                        .filter(c => c.examDate || c.examMonthOnly || c.isFacultyExam)
                        .sort((a, b) => {
                          if (a.examDate && b.examDate) {
                            const dateA = new Date(a.examDate);
                            const dateB = new Date(b.examDate);
                            const timeA = dateA.getTime();
                            const timeB = dateB.getTime();
                            if (!isNaN(timeA) && !isNaN(timeB)) return timeA - timeB;
                          }
                          if (a.examDate) return -1;
                          if (b.examDate) return 1;
                          return 0;
                        })
                        .map((course, idx, arr) => {
                          const hasConflict = !!(course.examDate && course.examTime && arr.some((c, i) => i !== idx && c.examDate === course.examDate && c.examTime === course.examTime));
                          return (
                            <div key={course.code} className={`p-6 flex flex-col gap-3 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all ${hasConflict ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${hasConflict ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                                      {course.code}
                                  </span>
                                  <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">{course.name}</p>
                                </div>
                                {hasConflict && (
                                  <span className="flex items-center gap-1 text-[10px] text-red-500 font-black uppercase tracking-tighter">
                                    <AlertCircle size={12} /> Conflict!
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2 text-[11px] font-bold text-gray-600 dark:text-zinc-400">
                                <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-wrap gap-x-4 gap-y-1">
                                    <div className="flex gap-1">
                                      <span className="font-black text-gray-400 uppercase">วันที่สอบ:</span>
                                      <span className="text-gray-900 dark:text-zinc-100">
                                        {course.examDate || (course.isFacultyExam ? 'คณะจัดสอบเอง' : (course.examMonth ? `เดือน${course.examMonth}` : 'TBA'))}
                                      </span>
                                    </div>
                                    <div className="flex gap-1">
                                      <span className="font-black text-gray-400 uppercase">เวลาสอบ:</span>
                                      <span className="text-gray-900 dark:text-zinc-100">
                                        {course.examDate || course.examMonthOnly || course.isFacultyExam ? (course.examTime || '-') : '-'}
                                      </span>
                                    </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
            )
          ) : (
             // Course Management View
             <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tight">รายวิชาที่ลงทะเบียน</h3>
                <div className="flex gap-2">
                  <button onClick={() => openManualCourseModal()} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800 px-6 py-2.5 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
                        <Plus size={16} /> Add Custom
                  </button>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="ค้นหารายวิชา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                    {searchResults.map(course => (
                      <button 
                        key={course.code}
                        onClick={() => { addCourseToPlanner(course); setSearchQuery(''); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-between"
                      >
                        <span className="font-bold text-sm">{course.code} - {course.name}</span>
                        <Plus size={16} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedCourses.map((course) => (
                <div key={course.code} className="p-5 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-3xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-sm">{course.code}</p>
                      <p className="text-xs text-gray-500 font-bold">{course.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openManualCourseModal(course)} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => removeCourseFromPlanner(course.code)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-bold text-gray-600 dark:text-zinc-400">
                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">เวลาเรียน</p>
                       <div className="space-y-1">
                          {course.lecDay && <div className="flex gap-1"><span className="text-blue-500 font-black">LEC:</span> {course.lecDay} {course.lecTime} ({course.lecRoom || 'TBA'})</div>}
                          {course.labDay && <div className="flex gap-1"><span className="text-amber-500 font-black">LAB:</span> {course.labDay} {course.labTime} ({course.labRoom || 'TBA'})</div>}
                          {!course.lecDay && !course.labDay && <div>{course.day} {course.time} ({course.room || 'TBA'})</div>}
                       </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20">
                       <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">ตารางสอบ</p>
                       <div className="text-gray-900 dark:text-zinc-100">
                          {course.isFacultyExam ? 'คณะจัดสอบเอง' : (course.examDate || course.examMonth || 'TBA')}
                          {!course.isFacultyExam && ` (${course.examTime || '-'})`}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};
