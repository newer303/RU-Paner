'use client';
import { 
  Plus, Trash2, Calendar, BookOpen, AlertCircle, 
  ChevronRight, ArrowRight, Layers, Sparkles, TrendingUp, X
} from 'lucide-react';
import { Course, SemesterPlan } from '@/types';
import { useState, useMemo } from 'react';

interface RoadmapTabProps {
  roadmap: SemesterPlan[];
  mr30Courses: Course[];
  onAddCourse: (semesterId: string, courseCode: string) => void;
  onRemoveCourse: (semesterId: string, courseCode: string) => void;
  onMoveCourse: (courseCode: string, oldSemesterId: string, newSemesterId: string) => void;
  onRemoveSemester: (semesterId: string) => void;
}

export const RoadmapTab = ({
  roadmap,
  mr30Courses,
  onAddCourse,
  onRemoveCourse,
  onMoveCourse,
  onRemoveSemester
}: RoadmapTabProps) => {
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [newSemesterId, setNewSemesterId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetSemesterId, setTargetSemesterId] = useState<string | null>(null);
  const [movingCourse, setMovingCourse] = useState<{ code: string; semesterId: string } | null>(null);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return mr30Courses.filter(c => 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.name.includes(searchQuery)
    ).slice(0, 10);
  }, [searchQuery, mr30Courses]);

  const handleAddSemester = () => {
    if (!newSemesterId.trim()) return;
    // Semesters are added implicitly when first course is added, 
    // but we'll manage a local "empty" state if needed. 
    // For now, let's just use the ID to open the search.
    setTargetSemesterId(newSemesterId);
    setNewSemesterId('');
    setIsAddingSemester(false);
  };

  const totalCreditsPlanned = useMemo(() => {
    return roadmap.reduce((sum, sem) => 
      sum + sem.courses.reduce((s, c) => s + (c.credit || 3), 0), 0
    );
  }, [roadmap]);

  return (
    <div className="animate-slide-up space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="text-white" size={20} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">Roadmap แผนการเรียน</h2>
          </div>
          <p className="text-slate-500 font-medium">วางแผนการลงทะเบียนล่วงหน้าเพื่อความแม่นยำตลอดหลักสูตร</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
             <div className="text-right">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Planned</span>
                <span className="text-lg font-black text-blue-600">{totalCreditsPlanned} <span className="text-xs text-slate-400">นก.</span></span>
             </div>
             <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800"></div>
             <TrendingUp className="text-emerald-500" size={20} />
          </div>
          <button 
            onClick={() => setIsAddingSemester(true)}
            className="btn-primary"
          >
            <Plus size={20} className="mr-2" /> เพิ่มเทอมใหม่
          </button>
        </div>
      </div>

      {/* Adding Semester UI */}
      {isAddingSemester && (
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/30 animate-scale-up relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
             <Sparkles size={120} />
          </div>
          <h3 className="text-xl font-black mb-6 uppercase tracking-tight">ระบุปีการศึกษา/เทอม</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="เช่น 2/2568 หรือ Summer/2569"
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-white/10 placeholder-white/40 font-bold"
              value={newSemesterId}
              onChange={(e) => setNewSemesterId(e.target.value)}
              autoFocus
            />
            <button onClick={handleAddSemester} className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all">สร้างแผนเทอมนี้</button>
            <button onClick={() => setIsAddingSemester(false)} className="px-6 py-4 font-bold uppercase tracking-widest">ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Roadmap Timeline */}
      <div className="relative space-y-12">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/20 via-blue-500/10 to-transparent hidden md:block"></div>

        {roadmap.length === 0 && !targetSemesterId ? (
          <div className="py-20 text-center">
             <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[3rem] flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Layers className="text-slate-300 dark:text-slate-700" size={40} />
             </div>
             <h4 className="text-slate-400 font-black uppercase tracking-[0.2em]">เริ่มสร้าง Roadmap ของคุณ</h4>
             <p className="text-slate-400 text-sm font-medium mt-2">เพิ่มเทอมแรกเพื่อเริ่มจัดแผนการเรียนล่วงหน้า</p>
          </div>
        ) : (
          [...roadmap, targetSemesterId ? { semester_id: targetSemesterId, courses: [] } : null]
          .filter(Boolean)
          .sort((a: any, b: any) => b.semester_id.localeCompare(a.semester_id))
          .map((semester: any) => {
            const semCredits = semester.courses.reduce((sum: number, c: Course) => sum + (c.credit || 3), 0);
            const isTarget = targetSemesterId === semester.semester_id;

            return (
              <div key={semester.semester_id} className="relative md:pl-20 animate-slide-up">
                {/* Semester Dot */}
                <div className="absolute left-[26px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-slate-950 z-10 hidden md:block"></div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                  <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-4">
                      <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600">
                         <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{semester.semester_id}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Credits</span>
                        <span className="text-sm font-black text-blue-600 mt-1">{semCredits} นก.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => setTargetSemesterId(semester.semester_id)}
                         className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-90"
                       >
                         <Plus size={20} />
                       </button>
                       <button 
                         onClick={() => onRemoveSemester(semester.semester_id)}
                         className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
                       >
                         <Trash2 size={20} />
                       </button>
                    </div>
                  </div>

                  {/* Course List in Semester */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {semester.courses.length > 0 ? (
                      semester.courses.map((course: Course) => (
                        <div key={course.code} className="group relative bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[1.75rem] border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                          <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                             <button 
                               onClick={() => setMovingCourse({ code: course.code, semesterId: semester.semester_id })}
                               className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-slate-400 hover:text-blue-600 transition-all"
                               title="ย้ายไปเทอมอื่น"
                             >
                               <ArrowRight size={14} />
                             </button>
                             <button 
                               onClick={() => onRemoveCourse(semester.semester_id, course.code)}
                               className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-slate-400 hover:text-red-500 transition-all"
                               title="ลบออก"
                             >
                               <X size={14} />
                             </button>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                             <span className="px-2 py-0.5 bg-white dark:bg-slate-700 text-[10px] font-black rounded-lg text-blue-600 shadow-sm">{course.code}</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase">{course.credit} นก.</span>
                          </div>
                          <p className="font-black text-slate-900 dark:text-white text-sm line-clamp-1 pr-14">{course.name}</p>
                        </div>
                      ))
                    ) : !isTarget && (
                      <div className="col-span-full py-10 text-center">
                        <p className="text-slate-400 text-xs font-bold italic">ยังไม่มีวิชาในเทอมนี้</p>
                      </div>
                    )}

                    {/* Quick Search inside Semester */}
                    {isTarget && (
                      <div className="col-span-full animate-slide-up border-2 border-dashed border-blue-200 dark:border-blue-900/50 rounded-[2rem] p-6">
                        <div className="flex items-center gap-4 mb-4">
                           <BookOpen className="text-blue-500" size={24} />
                           <input 
                             type="text" 
                             placeholder="ค้นหารหัสวิชาเพื่อเพิ่มลงแผน..."
                             className="flex-1 bg-transparent text-lg font-black outline-none placeholder-slate-300"
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             autoFocus
                           />
                           <button onClick={() => { setTargetSemesterId(null); setSearchQuery(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20} /></button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {searchResults.map(c => (
                            <button 
                              key={c.code}
                              onClick={() => {
                                onAddCourse(semester.semester_id, c.code);
                                setSearchQuery('');
                              }}
                              className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group/item shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                 <span className="font-black text-sm group-hover/item:text-white">{c.code}</span>
                                 <span className="text-[10px] font-bold opacity-60 line-clamp-1">{c.name}</span>
                              </div>
                              <Plus size={16} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Move Course Overlay/Modal */}
      {movingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setMovingCourse(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-scale-up border border-slate-100 dark:border-slate-800">
             <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tight">ย้ายวิชาเรียน</h3>
                   <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Select Destination Semester</p>
                </div>
                <button onClick={() => setMovingCourse(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                   <X size={20} />
                </button>
             </div>
             <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl mb-6 flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <BookOpen size={24} />
                   </div>
                   <div>
                      <span className="block text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Moving Course</span>
                      <p className="font-black text-slate-900 dark:text-white uppercase">{movingCourse.code}</p>
                   </div>
                </div>

                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">เลือกเทอมปลายทาง</p>
                {roadmap
                  .filter(s => s.semester_id !== movingCourse.semesterId)
                  .map(s => (
                  <button 
                    key={s.semester_id}
                    onClick={() => {
                      onMoveCourse(movingCourse.code, movingCourse.semesterId, s.semester_id);
                      setMovingCourse(null);
                    }}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-600 hover:text-white rounded-2xl transition-all group shadow-sm border border-transparent hover:border-blue-400"
                  >
                    <span className="font-black text-lg uppercase tracking-tight">{s.semester_id}</span>
                    <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                  </button>
                ))}

                {roadmap.filter(s => s.semester_id !== movingCourse.semesterId).length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-slate-400 text-sm font-bold italic">กรุณาเพิ่มเทอมอื่นก่อนเพื่อย้ายวิชา</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2.5rem] border border-amber-200/50 dark:border-amber-900/20 flex items-start gap-6">
         <div className="bg-amber-500 p-4 rounded-2xl shadow-xl shadow-amber-500/20 shrink-0">
            <AlertCircle className="text-white" size={24} />
         </div>
         <div>
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">ข้อแนะนำในการจัด Roadmap</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
               <li>• ภาคเรียนปกติลงได้ไม่เกิน <span className="text-amber-600 dark:text-amber-500 font-black underline">22 หน่วยกิต</span></li>
               <li>• ภาคฤดูร้อนลงได้ไม่เกิน <span className="text-amber-600 dark:text-amber-500 font-black underline">9 หน่วยกิต</span></li>
               <li>• ควรเช็ควิชาที่ "ยังไม่ผ่าน" ในหน้าหลักสูตรก่อนจัดแผน</li>
            </ul>
         </div>
      </div>
    </div>
  );
};
