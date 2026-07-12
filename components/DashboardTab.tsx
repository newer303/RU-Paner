'use client';
import { 
  LayoutDashboard, GraduationCap, Calendar, Clock, AlertCircle, 
  CheckCircle2, ArrowRight, Zap, Sparkles, TrendingUp, BookOpen 
} from 'lucide-react';
import { DegreePlan, PlannerCourse, CalendarEvent } from '@/types';
import { getEventStatus } from '@/lib/utils';
import { useMemo } from 'react';

interface DashboardTabProps {
  degreePlan: DegreePlan;
  selectedCourses: PlannerCourse[];
  calendarEvents: CalendarEvent[];
  totalCompletedCredits: number;
  gpax: string;
  onNavigate: (tab: string) => void;
  userName?: string;
  deferredPrompt?: any;
  onInstall?: () => void;
}

export const DashboardTab = ({
  degreePlan,
  selectedCourses,
  calendarEvents,
  totalCompletedCredits,
  gpax,
  onNavigate,
  userName,
  deferredPrompt,
  onInstall
}: DashboardTabProps) => {
  
  const progressPercent = useMemo(() => {
    if (!degreePlan.totalCredits) return 0;
    return Math.round((totalCompletedCredits / degreePlan.totalCredits) * 100);
  }, [totalCompletedCredits, degreePlan.totalCredits]);

  const upcomingExams = useMemo(() => {
    return selectedCourses
      .filter(c => c.examDate)
      .sort((a, b) => {
        const dateA = new Date(a.examDate).getTime();
        const dateB = new Date(b.examDate).getTime();
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateA - dateB;
      })
      .slice(0, 3);
  }, [selectedCourses]);

  const activeEvents = useMemo(() => {
    return calendarEvents
      .filter(e => {
        const status = getEventStatus(e.startDate, e.endDate);
        return status.label === 'กำลังดำเนินการ';
      })
      .slice(0, 2);
  }, [calendarEvents]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* PWA Install Banner - Floating Style */}
      {deferredPrompt && (
        <div className="glass p-5 rounded-[2rem] border-blue-500/30 shadow-2xl shadow-blue-500/10 animate-slide-up flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20">
              <Zap className="text-white" size={28} fill="white" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                ติดตั้ง RU Planner <Sparkles className="text-amber-400" size={16} />
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">เข้าใช้งานได้รวดเร็วและลื่นไหลเหมือนแอปจริง</p>
            </div>
          </div>
          <button
            onClick={onInstall}
            className="w-full sm:w-auto btn-primary relative z-10"
          >
            ติดตั้งลงเครื่องเลย
          </button>
        </div>
      )}

      {/* Hero Section with Bento Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up stagger-1">
        {/* Main Welcome Card */}
        <div className="lg:col-span-8 mesh-gradient rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-1000"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-blue-100/80">Student Profile</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white/70">{userName || 'Student'}</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
              <div className="glass-light bg-white/10 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-5 flex-1">
                <span className="block text-[10px] uppercase font-black tracking-widest text-blue-200/60 mb-1">GPAX โดยประมาณ</span>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black tracking-tighter">{gpax}</span>
                  <TrendingUp size={18} className="text-emerald-400 mb-1" />
                </div>
              </div>
              <div className="glass-light bg-white/10 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-5 flex-1">
                <span className="block text-[10px] uppercase font-black tracking-widest text-blue-200/60 mb-1">หน่วยกิตสะสม</span>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black tracking-tighter">{totalCompletedCredits}</span>
                  <span className="text-xs font-bold text-blue-200/60 mb-1.5">/ {degreePlan.totalCredits}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Circle Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center justify-center text-center group bento-card">
          <div className="relative w-40 h-40 md:w-44 md:h-44 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50 dark:text-slate-800" />
              <circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={477.5} 
                strokeDashoffset={477.5 - (477.5 * progressPercent) / 100}
                strokeLinecap="round"
                className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{progressPercent}%</span>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Completed</span>
            </div>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">ความสำเร็จหลักสูตร</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold max-w-[200px] leading-relaxed">
            {degreePlan.major}
          </p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Exams & Quick Actions */}
        <div className="lg:col-span-8 space-y-8">
          {/* Upcoming Exams Bento */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden animate-slide-up stagger-2 bento-card">
            <div className="p-8 pb-6 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Calendar className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight leading-tight">ตารางสอบเร็วๆ นี้</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Exam Countdown</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('planner')} 
                className="group flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm"
              >
                ดูทั้งหมด <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="px-6 pb-8 space-y-4">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((course, idx) => {
                  const examDateObj = new Date(course.examDate);
                  const today = new Date();
                  const diffTime = examDateObj.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                  const month = monthNames[examDateObj.getMonth()];
                  const day = examDateObj.getDate();

                  return (
                    <div key={course.code} className="group/item flex items-center gap-6 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-transparent hover:border-red-500/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500">
                      <div className="flex-shrink-0 w-16 h-20 bg-white dark:bg-slate-700 rounded-[1.25rem] shadow-sm border border-slate-100 dark:border-slate-600 flex flex-col overflow-hidden text-center group-hover/item:scale-105 transition-transform duration-500">
                        <div className="bg-red-600 py-1 text-[9px] font-black text-white uppercase tracking-wider">{month}</div>
                        <div className="flex-1 flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white">{day}</div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-[9px] font-black text-blue-600 dark:text-blue-400 rounded-lg uppercase tracking-wider">{course.code}</span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Clock size={12} /> {course.examTime}
                          </span>
                        </div>
                        <h4 className="font-black text-base text-slate-800 dark:text-white truncate group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">{course.name}</h4>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                             {course.room || 'รอระบุห้อง'}
                           </div>
                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col items-end">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${diffDays <= 3 ? 'text-red-500' : 'text-slate-400'}`}>
                          {diffDays === 0 ? 'Today' : diffDays < 0 ? 'Passed' : `In ${diffDays} days`}
                        </span>
                        <div className={`mt-1.5 h-1.5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden`}>
                           <div 
                             className={`h-full transition-all duration-1000 ${diffDays <= 3 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                             style={{ width: `${Math.max(0, Math.min(100, 100 - (diffDays * 5)))}%` }}
                           ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Calendar className="text-slate-300 dark:text-slate-600" size={32} />
                  </div>
                  <h4 className="text-slate-400 dark:text-slate-500 text-sm font-black uppercase tracking-widest">No Exams Found</h4>
                  <p className="text-[11px] text-slate-300 dark:text-slate-600 font-bold mt-1">Add courses to see your exam schedule</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up stagger-3">
            <button 
              onClick={() => onNavigate('planner')} 
              className="group bg-gradient-to-br from-emerald-500 to-teal-600 p-1 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <div className="bg-white dark:bg-slate-900 h-full w-full rounded-[2.4rem] p-6 flex items-center gap-6 overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-700">
                  <Calendar size={120} />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:rotate-6 transition-transform">
                  <Calendar size={28} />
                </div>
                <div className="text-left relative z-10">
                  <h4 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">เช็ควันสอบซ้ำซ้อน</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Planner & Conflicts</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => onNavigate('courses')} 
              className="group bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <div className="bg-white dark:bg-slate-900 h-full w-full rounded-[2.4rem] p-6 flex items-center gap-6 overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-700">
                  <BookOpen size={120} />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:rotate-6 transition-transform">
                  <BookOpen size={28} />
                </div>
                <div className="text-left relative z-10">
                  <h4 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">ค้นหาวิชาเรียน</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Browse Courses</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Side: University Events & Sidebar Info */}
        <div className="lg:col-span-4 space-y-8 animate-slide-up stagger-4">
          <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden bento-card shadow-2xl shadow-slate-900/30">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Zap size={80} className="text-yellow-400" fill="currentColor" />
            </div>
            
            <h3 className="font-black text-xl mb-8 flex items-center gap-3 uppercase tracking-tight relative z-10">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
              University Events
            </h3>

            <div className="space-y-6 relative z-10">
              {activeEvents.length > 0 ? (
                activeEvents.map(event => (
                  <div key={event.id} className="group/event cursor-pointer">
                    <p className="text-[10px] font-black text-blue-400 mb-1 uppercase tracking-[0.2em]">{event.dateStr}</p>
                    <p className="text-sm font-black text-slate-100 leading-tight mb-3 group-hover:text-blue-300 transition-colors">{event.title}</p>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[65%] group-hover:w-full transition-all duration-1000"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                   <p className="text-slate-500 text-xs font-bold italic">ไม่มีกิจกรรมสำคัญในขณะนี้</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('calendar')}
              className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-xs font-black transition-all border border-white/5 uppercase tracking-widest"
            >
              View Full Calendar
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bento-card">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <TrendingUp size={12} /> Recent Stats
            </h4>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">วิชาที่ลงทะเบียน</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{selectedCourses.length}</span>
              </div>
              <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">วิชาที่ผ่านแล้ว</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{degreePlan.completedCourses.length}</span>
              </div>
              <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">เกรดเฉลี่ยเป้าหมาย</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-500">4.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
