'use client';
import { List, Trash2, CheckCircle, Plus, X, AlertCircle } from 'lucide-react';
import { DegreePlan, Course, DegreeCategory, CompletedCourse } from '@/types';
import { useState, useEffect } from 'react';

interface DegreePlanTabProps {
  degreePlan: DegreePlan;
  isDegreeEditMode: boolean;
  setIsDegreeEditMode: (val: boolean) => void;
  completedCourses: CompletedCourse[];
  totalCompletedCredits: number;
  toggleCourseCompletion: (code: string) => void;
  toggleReExam: (code: string) => void;
  updateCourseGrade: (code: string, grade: string) => void;
  handleDeleteCategory: (id: string) => void;
  handleAddCourse: (id: string) => void;
  handleDeleteCourse: (catId: string, code: string) => void;
  handleAddCategory: () => void;
  mr30Courses: Course[];
  handleSaveDegreeSettings: (major: string, totalCredits: number, categories: DegreeCategory[]) => void;
  isDegreeLoading?: boolean;
}

export const DegreePlanTab = ({
  degreePlan,
  isDegreeEditMode,
  setIsDegreeEditMode,
  completedCourses,
  totalCompletedCredits,
  toggleCourseCompletion,
  toggleReExam,
  updateCourseGrade,
  handleDeleteCategory,
  handleAddCourse,
  handleDeleteCourse,
  handleAddCategory,
  mr30Courses = [],
  handleSaveDegreeSettings,
  isDegreeLoading
}: DegreePlanTabProps) => {
  const [editedMajor, setEditedMajor] = useState(degreePlan.major);
  const [editedTotalCredits, setEditedTotalCredits] = useState(degreePlan.totalCredits);
  const [editedCategories, setEditedCategories] = useState(degreePlan.categories);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<string | null>(null);

  // Sync initial state when starting edit mode
  useEffect(() => {
    if (!isDegreeEditMode) {
      setEditedMajor(degreePlan.major);
      setEditedTotalCredits(degreePlan.totalCredits);
      setEditedCategories(degreePlan.categories);
    }
  }, [degreePlan.major, degreePlan.totalCredits, degreePlan.categories, isDegreeEditMode]);

  // Sync specific data (like course lists) from parent while in edit mode
  useEffect(() => {
    if (isDegreeEditMode && degreePlan.categories.length > 0) {
      setEditedCategories(prev => {
        return prev.map(localCat => {
          const fresh = degreePlan.categories.find(c => c.id === localCat.id);
          if (fresh) {
            return {
              ...fresh, // take fresh course list
              name: localCat.name, // keep user metadata edits
              required: localCat.required, // keep user metadata edits
            };
          }
          return localCat;
        });
      });
    }
  }, [degreePlan.categories, isDegreeEditMode]);

  const handleToggleEditMode = () => {
    if (isDegreeEditMode) {
      handleSaveDegreeSettings(editedMajor, editedTotalCredits, editedCategories);
    }
    setIsDegreeEditMode(!isDegreeEditMode);
  };

  const updateCategoryRequired = (id: string, required: number) => {
    setEditedCategories(prev => prev.map(c => c.id === id ? { ...c, required } : c));
  };

  const updateCategoryName = (id: string, name: string) => {
    setEditedCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const onInternalDeleteCategory = (id: string) => {
    setEditedCategories(prev => prev.filter(c => c.id !== id));
    handleDeleteCategory(id);
    setConfirmDeleteCategoryId(null);
  };

  const totalCoursesCount = degreePlan.categories.reduce((sum, cat) => sum + cat.courses.length, 0);
  const totalCompletedCount = degreePlan.categories.reduce((sum, cat) => {
    return sum + cat.courses.filter(code => completedCourses.some(c => c.course_code === code && !c.is_reexam)).length;
  }, 0);
  const totalReExamCount = degreePlan.categories.reduce((sum, cat) => {
    return sum + cat.courses.filter(code => completedCourses.some(c => c.course_code === code && c.is_reexam)).length;
  }, 0);
  const totalUnpassedCount = totalCoursesCount - totalCompletedCount - totalReExamCount;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-1 text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <List className="text-blue-600 dark:text-blue-500" size={24} /> เช็คหลักสูตร
          </h2>
          {isDegreeEditMode ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-zinc-400">โครงสร้างหลักสูตร</span>
              <input
                type="text"
                value={editedMajor}
                onChange={(e) => setEditedMajor(e.target.value)}
                className="text-sm border-b border-blue-400 focus:outline-none focus:border-blue-600 px-1 py-0 bg-transparent font-bold text-gray-800 dark:text-zinc-200"
                placeholder="ชื่อหลักสูตร"
              />
            </div>
          ) : (
            <p className="text-gray-500 dark:text-zinc-400 text-sm">โครงสร้างหลักสูตร {degreePlan.major}</p>
          )}
        </div>
        <button
          onClick={handleToggleEditMode}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${isDegreeEditMode ? 'bg-orange-500 text-white shadow-orange-200 shadow-lg' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
        >
          {isDegreeEditMode ? 'บันทึกการแก้ไข' : 'แก้ไขหลักสูตร'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 dark:bg-blue-500"></div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1">ความคืบหน้าโดยรวม</span>
              {isDegreeEditMode ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900 dark:text-zinc-100">{totalCompletedCredits}</span>
                  <span className="text-sm font-bold text-gray-400 dark:text-zinc-500">/ </span>
                  <input
                    type="number"
                    value={editedTotalCredits}
                    onChange={(e) => setEditedTotalCredits(parseInt(e.target.value) || 0)}
                    className="w-16 text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-blue-300 dark:border-blue-800 focus:outline-none focus:border-blue-600 bg-transparent"
                  />
                  <span className="text-sm font-bold text-gray-400 dark:text-zinc-500">นก.</span>
                </div>
              ) : (
                <span className="text-3xl font-black text-gray-900 dark:text-zinc-100">{totalCompletedCredits}<span className="text-sm font-bold text-gray-400 dark:text-zinc-500 ml-1">/ {degreePlan.totalCredits} นก.</span></span>
              )}
            </div>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {degreePlan.totalCredits > 0 ? Math.round((totalCompletedCredits / degreePlan.totalCredits) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(37,99,235,0.3)]"
              style={{ width: `${degreePlan.totalCredits > 0 ? (totalCompletedCredits / degreePlan.totalCredits) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex justify-around items-center text-center">
          <div>
            <span className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1">ผ่านแล้ว</span>
            <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-500">{totalCompletedCount}</span>
          </div>
          <div className="w-[1px] h-10 bg-gray-100 dark:bg-zinc-800"></div>
          <div>
            <span className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1">รอสอบแก้</span>
            <span className="block text-2xl font-black text-orange-600 dark:text-orange-500">{totalReExamCount}</span>
          </div>
          <div className="w-[1px] h-10 bg-gray-100 dark:bg-zinc-800"></div>
          <div>
            <span className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1">ยังไม่ผ่าน</span>
            <span className="block text-2xl font-black text-slate-400 dark:text-slate-500">{totalUnpassedCount}</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {(isDegreeEditMode ? editedCategories : degreePlan.categories).length === 0 && !isDegreeLoading ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
            <List size={48} className="mx-auto text-gray-200 dark:text-zinc-800 mb-4" />
            <p className="text-gray-400 dark:text-zinc-500 text-sm">ไม่พบข้อมูลหมวดหมู่ (กรุณากดปุ่มแก้ไขเพื่อเพิ่ม)</p>
          </div>
        ) : null}
        
        {!isDegreeLoading && (isDegreeEditMode ? editedCategories : degreePlan.categories).map(category => {
          const completedInCategory = category.courses.reduce((sum, code) => {
            const completed = completedCourses.find(c => c.course_code === code && !c.is_reexam);
            if (completed) {
              const course = mr30Courses.find(c => c.code === code);
              return sum + (course?.credit || 3);
            }
            return sum;
          }, 0);

          const totalCoursesInCat = category.courses.length;
          const completedCountInCat = category.courses.filter(code => completedCourses.some(c => c.course_code === code && !c.is_reexam)).length;
          const reexamCountInCat = category.courses.filter(code => completedCourses.some(c => c.course_code === code && c.is_reexam)).length;
          const unpassedCountInCat = totalCoursesInCat - completedCountInCat - reexamCountInCat;

          return (
            <div key={category.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-50/50 dark:bg-zinc-800/50 px-5 py-4 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center">
                <div className="flex flex-col">
                  {isDegreeEditMode ? (
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategoryName(category.id, e.target.value)}
                      className="font-bold text-gray-900 dark:text-zinc-100 bg-transparent border-b border-blue-300 dark:border-blue-800 focus:outline-none focus:border-blue-600"
                    />
                  ) : (
                    <h3 className="font-bold text-gray-900 dark:text-zinc-100">{category.name}</h3>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">เหลืออีก {unpassedCountInCat} วิชา</span>
                    {reexamCountInCat > 0 && <span className="text-[10px] font-bold text-orange-500 uppercase">| สอบซ่อม {reexamCountInCat} วิชา</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isDegreeEditMode ? (
                    <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">
                      <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">{completedInCategory} / </span>
                      <input
                        type="number"
                        value={category.required}
                        onChange={(e) => updateCategoryRequired(category.id, parseInt(e.target.value) || 0)}
                        className="w-8 text-[11px] font-black text-blue-600 dark:text-blue-400 bg-transparent border-b border-blue-300 dark:border-blue-800 focus:outline-none focus:border-blue-600 text-center"
                      />
                      <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">นก.</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">{completedInCategory} / {category.required} นก.</span>
                  )}
                  {isDegreeEditMode && (
                    <button onClick={() => setConfirmDeleteCategoryId(category.id)} className="text-red-400 hover:text-red-600 p-1 transition-colors"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {category.courses.map(courseCode => {
                  const completedData = completedCourses.find(c => c.course_code === courseCode);
                  const isCompleted = !!completedData && !completedData.is_reexam;
                  const isReExam = !!completedData && completedData.is_reexam;
                  const courseData = mr30Courses.find(c => c.code === courseCode);
                  const gradeOptions = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];

                  return (
                    <div key={courseCode} className="relative group">
                      <div className={`w-full p-3 md:p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${isCompleted
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : isReExam 
                          ? 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-400 shadow-sm'
                          : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-600 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
                        } ${isDegreeEditMode ? 'opacity-50 cursor-default' : ''}`}
                      >
                        <div className="flex flex-col items-center gap-1 w-full">
                           <button
                            disabled={isDegreeEditMode}
                            onClick={() => toggleCourseCompletion(courseCode)}
                            className="flex flex-col items-center gap-1 w-full active:scale-95 transition-transform"
                          >
                            <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800'}`}>
                              {isCompleted && <CheckCircle size={12} />}
                            </div>
                            <span className={`font-black text-[12px] md:text-[13px] tracking-tight ${isCompleted ? 'text-emerald-800 dark:text-emerald-300' : isReExam ? 'text-orange-800 dark:text-orange-300' : 'text-gray-700 dark:text-zinc-400'}`}>{courseCode}</span>
                          </button>

                          {!isDegreeEditMode && (
                            <button 
                              onClick={() => toggleReExam(courseCode)}
                              className={`mt-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${isReExam ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600'}`}
                            >
                              {isReExam ? 'รอสอบซ่อม' : 'สอบซ่อม'}
                            </button>
                          )}
                        </div>

                        {isCompleted && !isDegreeEditMode && (
                          <select
                            value={completedData.grade || 'A'}
                            onChange={(e) => updateCourseGrade(courseCode, e.target.value)}
                            className="mt-2 text-[10px] font-bold bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-900/50 rounded px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400 outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                          >
                            {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        )}
                        
                        {(!isCompleted || isDegreeEditMode) && (
                          <span className={`text-[9px] md:text-[10px] font-medium line-clamp-1 text-center mt-1 ${isCompleted ? 'text-emerald-600/80 dark:text-emerald-400/80' : isReExam ? 'text-orange-600/80 dark:text-orange-400/80' : 'text-gray-400 dark:text-zinc-600'}`}>
                            {courseData?.name || 'ไม่ระบุชื่อวิชา'}
                          </span>
                        )}
                      </div>
                      {isDegreeEditMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCourse(category.id, courseCode); }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg shadow-red-200 dark:shadow-none z-10 hover:scale-110 transition-transform"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
                {isDegreeEditMode && (
                  <button
                    onClick={() => handleAddCourse(category.id)}
                    className="p-4 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center text-gray-300 dark:text-zinc-700 hover:border-blue-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/10 group"
                  >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-[10px] font-black mt-1 uppercase tracking-widest">เพิ่มวิชา </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {isDegreeEditMode && (
          <button
            onClick={handleAddCategory}
            className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-2xl text-gray-400 dark:text-zinc-600 hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 hover:border-gray-300 dark:hover:border-zinc-500 transition-all font-bold flex items-center justify-center gap-2 group"
          >
            <Plus size={20} className="group-hover:scale-125 transition-transform" /> เพิ่มหมวดวิชาใหม่
          </button>
        )}
      </div>

      {confirmDeleteCategoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-xl border border-gray-100 dark:border-zinc-800 transform transition-all animate-scale-up">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={30} className="text-red-500 dark:text-red-400" strokeWidth={2} />
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">ลบหมวดหมู่วิชา?</h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed">
                  คุณแน่ใจหรือไม่ว่าต้องการลบหมวด <span className="font-bold text-gray-800 dark:text-zinc-200">"{editedCategories.find(c => c.id === confirmDeleteCategoryId)?.name}"</span>? 
                  รายวิชาทั้งหมดในหมวดนี้จะหายไปด้วย
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDeleteCategoryId(null)} 
                  className="flex-1 py-3.5 text-sm font-bold text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={() => onInternalDeleteCategory(confirmDeleteCategoryId)} 
                  className="flex-1 py-3.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-100 dark:shadow-none transition-all active:scale-95"
                >
                  ยืนยันการลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
