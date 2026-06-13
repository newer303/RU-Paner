'use client';
import { 
  Plus, Trash2, Calendar, BookOpen, AlertCircle, 
  ChevronRight, ArrowRight, Layers, Sparkles, TrendingUp, X, Edit2
} from 'lucide-react';
import { Course, SemesterPlan } from '@/types';
import { useState, useMemo } from 'react';

interface RoadmapTabProps {
  roadmap: SemesterPlan[];
  mr30Courses: Course[];
  onAddCourse: (semesterId: string, courseCode: string) => void;
  onRemoveCourse: (semesterId: string, courseCode: string) => void;
  onMoveCourse: (courseCode: string, oldSemesterId: string, newSemesterId: string) => void;
  onRenameSemester: (oldSemesterId: string, newSemesterId: string) => void;
  onRemoveSemester: (semesterId: string) => void;
}

export const RoadmapTab = ({
  roadmap,
  mr30Courses,
  onAddCourse,
  onRemoveCourse,
  onMoveCourse,
  onRenameSemester,
  onRemoveSemester
}: RoadmapTabProps) => {
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [newSemesterId, setNewSemesterId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetSemesterId, setTargetSemesterId] = useState<string | null>(null);
  const [movingCourse, setMovingCourse] = useState<{ code: string; semesterId: string } | null>(null);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return mr30Courses.filter(c => 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.name.includes(searchQuery)
    ).slice(0, 10);
  }, [searchQuery, mr30Courses]);

  const handleAddSemester = () => {
    if (!newSemesterId.trim()) return;
    setTargetSemesterId(newSemesterId);
    setNewSemesterId('');
    setIsAddingSemester(false);
  };

  const totalCreditsPlanned = useMemo(() => {
    return roadmap.reduce((sum, sem) => 
      sum + sem.courses.reduce((s, c) => s + (c.credit || 3), 0), 0
    );
  }, [roadmap]);

  const handleStartRename = (id: string) => {
    setEditingSemesterId(id);
    setRenamingValue(id);
  };

  const handleConfirmRename = (oldId: string) => {
    const val = renamingValue.trim();
    if (val && val !== oldId) {
      onRenameSemester(oldId, val);
    }
    setEditingSemesterId(null);
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20 max-w-6xl mx-auto px-4">
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Layers size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Planning Tool</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Study <span className="text-blue-600">Roadmap</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">จัดการแผนการเรียนล่วงหน้าให้เป็นระบบ</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
             <div className="text-right">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Planned</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{totalCreditsPlanned} <span className="text-[10px] text-slate-400">นก.</span></span>
             </div>
             <TrendingUp className="text-emerald-500" size={18} />
          </div>
          <button 
            onClick={() => setIsAddingSemester(true)}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={18} /> Add Term
          </button>
        </div>
      </div>

      {/* Compact Add Semester UI */}
      {isAddingSemester && (
        <div className="bg-slate-900 dark:bg-blue-600 p-6 rounded-3xl text-white shadow-xl animate-scale-up relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
              <Calendar size={18} /> เพิ่มเทอมใหม่
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="เช่น 2/2568"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-white/30 placeholder-white/30 font-bold"
                value={newSemesterId}
                onChange={(e) => setNewSemesterId(e.target.value)}
                autoFocus
              />
              <button onClick={handleAddSemester} className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all">Create Plan</button>
              <button onClick={() => setIsAddingSemester(false)} className="px-4 py-3 font-bold text-sm text-white/60 hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Refined Timeline */}
      <div className="relative space-y-10">
        <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 hidden md:block"></div>

        {(() => {
          const existingSemesters = roadmap
            .filter(Boolean)
            .filter((s, i, self) => i === self.findIndex(t => t.semester_id === s.semester_id));

          const hasNewSemester = targetSemesterId && !existingSemesters.some(s => s.semester_id === targetSemesterId);
          const displayList = hasNewSemester 
            ? [...existingSemesters, { semester_id: targetSemesterId, courses: [] }] 
            : existingSemesters;

          if (displayList.length === 0) {
            return (
              <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                 <Layers className="text-slate-300 dark:text-slate-700 mx-auto mb-4" size={40} />
                 <h4 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Roadmap is Empty</h4>
                 <p className="text-slate-400 text-xs mt-1">กดปุ่ม Add Term เพื่อเริ่มจัดแผน</p>
              </div>
            );
          }

          return displayList
            .sort((a, b) => b.semester_id.localeCompare(a.semester_id))
            .map((semester, idx) => {
              const semCredits = semester.courses.reduce((sum: number, c: Course) => sum + (c.credit || 3), 0);
              const isTarget = targetSemesterId === semester.semester_id;

              return (
                <div key={semester.semester_id} className="relative md:pl-16 animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  {/* Subtle Marker */}
                  <div className="absolute left-4 top-2 w-4 h-4 bg-white dark:bg-slate-900 rounded-full border-2 border-blue-500 z-10 hidden md:block"></div>

                  <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-900 shadow-sm overflow-hidden group/card hover:shadow-md transition-all duration-300">
                    <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30 dark:bg-slate-900/30">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                              {editingSemesterId === semester.semester_id ? (
                                <input 
                                  type="text"
                                  className="bg-transparent border-b border-blue-500 outline-none font-bold text-xl w-32 text-slate-900 dark:text-white uppercase"
                                  value={renamingValue}
                                  onChange={(e) => setRenamingValue(e.target.value)}
                                  onBlur={() => handleConfirmRename(semester.semester_id)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename(semester.semester_id)}
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">ภาคเรียน {semester.semester_id}</h3>
                                  <button onClick={() => handleStartRename(semester.semester_id)} className="p-1.5 text-slate-300 hover:text-blue-500 transition-colors">
                                    <Edit2 size={12} />
                                  </button>
                                </>
                              )}
                           </div>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{semCredits} Credits</span>
                              <span className="text-[10px] text-slate-300">•</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{semester.courses.length} Subjects</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={() => setTargetSemesterId(semester.semester_id)}
                           className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"
                         >
                           <Plus size={14} /> Add Subject
                         </button>
                         <button 
                           onClick={() => onRemoveSemester(semester.semester_id)}
                           className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                         >
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {semester.courses.length > 0 ? (
                          semester.courses.map((course: Course) => (
                            <div key={course.code} className="group/item relative bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all">
                              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                                 <button 
                                   onClick={() => setMovingCourse({ code: course.code, semesterId: semester.semester_id })}
                                   className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400 hover:text-blue-600 border border-slate-100 dark:border-slate-700"
                                 >
                                   <ArrowRight size={12} />
                                 </button>
                                 <button 
                                   onClick={() => onRemoveCourse(semester.semester_id, course.code)}
                                   className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400 hover:text-red-500 border border-slate-100 dark:border-slate-700"
                                 >
                                   <X size={12} />
                                 </button>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md">{course.code}</span>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{course.credit} นก.</span>
                                </div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 pr-10">{course.name}</p>
                              </div>
                            </div>
                          ))
                        ) : !isTarget && (
                          <div className="col-span-full py-8 text-center">
                            <p className="text-slate-400 text-xs font-medium italic">ยังไม่มีวิชาในเทอมนี้</p>
                          </div>
                        )}

                        {isTarget && (
                          <div className="col-span-full animate-slide-up bg-blue-50/20 dark:bg-blue-900/10 border-2 border-dashed border-blue-100 dark:border-blue-900/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                               <BookOpen className="text-blue-500" size={18} />
                               <input 
                                 type="text" 
                                 placeholder="ค้นหารหัสวิชา..."
                                 className="flex-1 bg-transparent text-base font-bold outline-none placeholder-slate-300 text-slate-900 dark:text-white"
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 autoFocus
                               />
                               <button onClick={() => { setTargetSemesterId(null); setSearchQuery(''); }} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {searchResults.map(c => (
                                <button 
                                  key={c.code}
                                  onClick={() => {
                                    onAddCourse(semester.semester_id, c.code);
                                    setSearchQuery('');
                                  }}
                                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                     <span className="font-bold text-xs shrink-0">{c.code}</span>
                                     <span className="text-[10px] opacity-60 truncate">{c.name}</span>
                                  </div>
                                  <Plus size={14} className="shrink-0 ml-2" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        })()}
      </div>

      {/* Refined Move Overlay */}
      {movingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setMovingCourse(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-scale-up border border-slate-100 dark:border-slate-800">
             <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold uppercase text-slate-900 dark:text-white">ย้ายวิชาเรียน</h3>
                <button onClick={() => setMovingCourse(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
             </div>
             <div className="p-8 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-center gap-4 border border-blue-100/50 dark:border-blue-800/50">
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                      <BookOpen size={20} />
                   </div>
                   <div className="overflow-hidden">
                      <span className="block text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Moving</span>
                      <p className="text-base font-black text-slate-900 dark:text-white truncate uppercase">{movingCourse.code}</p>
                   </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">ย้ายไปเทอมไหนดี?</p>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {roadmap
                      .filter(s => s.semester_id !== movingCourse.semesterId)
                      .map(s => (
                      <button 
                        key={s.semester_id}
                        onClick={() => {
                          onMoveCourse(movingCourse.code, movingCourse.semesterId, s.semester_id);
                          setMovingCourse(null);
                        }}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-transparent"
                      >
                        <span className="font-bold text-sm">ภาคเรียน {s.semester_id}</span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                </div>

                {roadmap.filter(s => s.semester_id !== movingCourse.semesterId).length === 0 && (
                  <p className="text-center text-slate-400 text-xs italic py-4">กรุณาเพิ่มเทอมอื่นก่อนเพื่อย้ายวิชา</p>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Refined Info Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6">
         <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
            <AlertCircle size={24} />
         </div>
         <div className="flex-1 text-center md:text-left space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tips: การจัด Roadmap</h4>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ปกติ: ไม่เกิน 22 นก.</p>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ฤดูร้อน: ไม่เกิน 9 นก.</p>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">เช็ควิชาที่ "ยังไม่ผ่าน" ก่อนเสมอ</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
