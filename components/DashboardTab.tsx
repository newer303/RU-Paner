'use client';
import { LayoutDashboard, GraduationCap, Calendar, Clock, AlertCircle, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
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
}

export const DashboardTab = ({
  degreePlan,
  selectedCourses,
  calendarEvents,
  totalCompletedCredits,
  gpax,
  onNavigate
}: DashboardTabProps) => {
  
  const progressPercent = useMemo(() => {
    if (!degreePlan.totalCredits) return 0;
    return Math.round((totalCompletedCredits / degreePlan.totalCredits) * 100);
  }, [totalCompletedCredits, degreePlan.totalCredits]);

  const upcomingExams = useMemo(() => {
    return selectedCourses
      .filter(c => c.examDate)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
      .slice(0, 2);
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
    <div className="animate-fade-in space-y-6">
      {/* Welcome Header */}
      <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-6 text-white shadow-md">
        <h2 className="text-xl md:text-2xl font-bold mb-1">สวัสดีปีการศึกษาใหม่! 👋</h2>
        <p className="text-blue-100 dark:text-blue-50 text-sm mb-4">มาเริ่มวางแผนการเรียนให้มีประสิทธิภาพกันเถอะ</p>
        <div className="flex gap-4">
          <div className="bg-white/10 dark:bg-black/20 rounded-xl px-4 py-2 border border-white/10 dark:border-white/5">
            <span className="block text-[10px] uppercase font-bold text-blue-200 dark:text-blue-300">หน่วยกิตสะสม</span>
            <span className="text-lg font-bold">{totalCompletedCredits} / {degreePlan.totalCredits}</span>
          </div>
          <div className="bg-white/10 dark:bg-black/20 rounded-xl px-4 py-2 border border-white/10 dark:border-white/5">
            <span className="block text-[10px] uppercase font-bold text-blue-200 dark:text-blue-300">GPAX โดยประมาณ</span>
            <span className="text-lg font-bold">{gpax}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-zinc-800" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={351.8} 
                  strokeDashoffset={351.8 - (351.8 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{progressPercent}%</span>
                <span className="text-[8px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">เรียนจบแล้ว</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1">ความคืบหน้าหลักสูตร</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mb-4 font-medium">คุณเรียนอยู่ในหลักสูตร <span className="text-blue-600 dark:text-blue-400 font-bold">{degreePlan.major}</span></p>
              <button 
                onClick={() => onNavigate('degree')}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline"
              >
                ดูรายละเอียดวิชา <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <AlertCircle className="text-red-500" size={18} /> กำหนดการสอบเร็วๆ นี้
              </h3>
              <button onClick={() => onNavigate('planner')} className="text-xs font-bold text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">ดูตารางสอบทั้งหมด</button>
            </div>
            <div className="space-y-3">
              {upcomingExams.length > 0 ? (
                upcomingExams.map(course => (
                  <div key={course.code} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 hover:border-red-100 dark:hover:border-red-900/30 transition-colors">
                    <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-sm text-center min-w-[50px]">
                      <span className="block text-[8px] font-bold text-gray-400 dark:text-zinc-500 uppercase leading-none mb-1">วันสอบ</span>
                      <span className="block text-sm font-bold text-red-600 dark:text-red-400 leading-none">{course.examDate.split('-')[2]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-zinc-100 truncate mb-0.5">{course.code}</p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">{course.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 mb-1">{course.examTime}</span>
                      <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-[8px] font-bold uppercase">สำคัญมาก</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-gray-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
                  <p className="text-gray-400 dark:text-zinc-500 text-sm">ยังไม่มีวิชาที่มีกำหนดการสอบ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Events & Actions */}
        <div className="space-y-6">
          {/* Active Events */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
              <Zap className="text-yellow-500" size={18} fill="currentColor" /> กิจกรรมมหาลัยขณะนี้
            </h3>
            <div className="space-y-4">
              {activeEvents.length > 0 ? (
                activeEvents.map(event => (
                  <div key={event.id} className="relative pl-4 border-l-2 border-blue-100 dark:border-zinc-800">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500"></div>
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-0.5 uppercase tracking-wider">{event.dateStr}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 leading-tight mb-2">{event.title}</p>
                    <div className="w-full h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 dark:bg-blue-500 w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 dark:text-zinc-500 text-xs italic">ไม่มีกิจกรรมสำคัญในขณะนี้</p>
              )}
            </div>
            <button 
              onClick={() => onNavigate('calendar')}
              className="w-full mt-6 py-2.5 bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              ดูปฏิทินทั้งหมด <ArrowRight size={14} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-4">ทางลัดจัดการ</h4>
            <button onClick={() => onNavigate('planner')} className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                <Calendar size={18} />
              </div>
              <span className="font-bold text-sm text-gray-700 dark:text-zinc-300 flex-1 text-left">เช็ควันสอบซ้ำซ้อน</span>
              <ArrowRight size={16} className="text-gray-300 dark:text-zinc-600 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
            </button>
            <button onClick={() => onNavigate('courses')} className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                <Clock size={18} />
              </div>
              <span className="font-bold text-sm text-gray-700 dark:text-zinc-300 flex-1 text-left">ค้นหาวิชาเรียน</span>
              <ArrowRight size={16} className="text-gray-300 dark:text-zinc-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
