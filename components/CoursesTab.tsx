'use client';
import { BookMarked, Search, Clock, MapPin, Calendar, Info, Plus, X, Save, Edit2, Trash2, AlertTriangle, FileUp, CheckCircle, ChevronDown, Filter } from 'lucide-react';
import { Course } from '@/types';
import { useState, useMemo, useRef, useEffect } from 'react';

interface CoursesTabProps {
  courses: Course[];
  onCourseAdded?: () => Promise<void>;
  showToast?: (msg: string) => void;
  addCourseToPlanner?: (course: Course) => void;
  selectedCourses?: Course[];
}

export const CoursesTab = ({ 
  courses, 
  onCourseAdded, 
  showToast,
  addCourseToPlanner,
  selectedCourses = []
}: CoursesTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // PDF Import State
  const [isUploading, setIsUploading] = useState(false);
  const [extractedCourses, setExtractedCourses] = useState<{code: string, name?: string, credit?: number, grade?: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPrefix, setSelectedPrefix] = useState<string>('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let result = courses;
    if (query) {
      result = courses.filter(c => 
        c.code.toLowerCase().includes(query) || 
        c.name.toLowerCase().includes(query)
      );
    }
    return result;
  }, [courses, searchQuery]);

  const groupedCourses = useMemo(() => {
    const groups: Record<string, Course[]> = {};
    filteredCourses.forEach(course => {
      const prefix = course.code.match(/^[A-Z]+/)?.[0] || 'OTHER';
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(course);
    });
    return groups;
  }, [filteredCourses]);

  const sortedPrefixes = useMemo(() => {
    return Object.keys(groupedCourses).sort();
  }, [groupedCourses]);

  const allPrefixesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    courses.forEach(c => {
      const prefix = c.code.match(/^[A-Z]+/)?.[0] || 'OTHER';
      counts[prefix] = (counts[prefix] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([prefix, count]) => ({ prefix, count }))
      .sort((a, b) => a.prefix.localeCompare(b.prefix));
  }, [courses]);

  const displayedGroups = useMemo(() => {
    if (selectedPrefix === 'ALL') return sortedPrefixes;
    return sortedPrefixes.filter(p => p === selectedPrefix);
  }, [sortedPrefixes, selectedPrefix]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formData, setFormData] = useState<Course>({
    code: '',
    name: '',
    credit: 3,
    day: '',
    time: '',
    room: '',
    lecDay: '',
    lecTime: '',
    lecRoom: '',
    labDay: '',
    labTime: '',
    labRoom: '',
    examDate: '',
    examTime: 'เช้า (09:30-12:00)',
    isFacultyExam: false,
    examMonthOnly: false,
    examMonth: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      code: '', name: '', credit: 3, day: '', time: '',
      room: '', lecDay: '', lecTime: '', lecRoom: '', labDay: '', labTime: '', labRoom: '',
      examDate: '', examTime: 'เช้า (09:30-12:00)',
      isFacultyExam: false, examMonthOnly: false, examMonth: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setIsEditing(true);
    setFormData({ ...course });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (code: string) => {
    setCourseToDelete(code);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!formData.code || !formData.name) {
      alert('กรุณากรอกรหัสวิชาและชื่อวิชา');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        console.error('Non-JSON response from /api/courses:', text);
        throw new Error(`Unexpected server response: ${text.slice(0, 200)}`);
      }

      if (!res.ok) {
        throw new Error(data?.details || data?.error || `Failed to save course (${res.status})`);
      }
      
      console.log('Save response successful:', data);
      setIsModalOpen(false);
      if (showToast) showToast(isEditing ? `อัปเดตวิชา ${formData.code} แล้ว` : `เพิ่มวิชา ${formData.code} เรียบร้อยแล้ว`);
      
      // Explicitly trigger a refresh of the entire data set
      if (onCourseAdded) await onCourseAdded();
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/courses?code=${courseToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete course');
      
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
      if (onCourseAdded) await onCourseAdded();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.courses) {
        setExtractedCourses(data.courses);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImportExtracted = async () => {
    try {
      const res = await fetch('/api/degree-plan/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: extractedCourses }),
      });
      if (!res.ok) throw new Error('Failed to import');
      
      alert(`นำเข้าสำเร็จ ${extractedCourses.length} รายวิชา!`);
      setExtractedCourses([]);
      if (onCourseAdded) await onCourseAdded();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-1 text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <BookMarked className="text-blue-600 dark:text-blue-500" size={24} /> รวมรายวิชา
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">ค้นหาและดูรายละเอียดวิชาทั้งหมดในระบบ ({courses.length} วิชา)</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePdfUpload} 
            accept=".pdf" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50"
          >
            <FileUp size={18} /> {isUploading ? 'กำลังอ่าน...' : 'นำเข้าจาก PDF'}
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
          >
            <Plus size={18} /> เพิ่มวิชาใหม่
          </button>
        </div>
      </div>

      {extractedCourses.length > 0 && (
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Info size={18} /> พบรายวิชาจากไฟล์ PDF
            </h3>
            <button onClick={() => setExtractedCourses([])} className="text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {extractedCourses.map(course => (
              <div key={course.code} className="px-3 py-2 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-800/50 rounded-xl text-[11px] flex justify-between items-center group">
                <div className="min-w-0 flex-1">
                  <span className="font-black text-blue-700 dark:text-blue-400 block">{course.code}</span>
                  <span className="text-[9px] text-gray-400 dark:text-zinc-500 truncate block">{course.name || 'ไม่ระบุชื่อ'}</span>
                </div>
                <span className="font-black text-green-600 dark:text-green-400">{course.grade}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={handleImportExtracted}
            className="w-full py-3 bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all"
          >
            ยืนยันและบันทึกวิชาที่ผ่านแล้วทั้งหมด ({extractedCourses.length})
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 dark:text-zinc-500" size={18} />
          </div>
          <input
            type="text"
            placeholder="ค้นหารหัสวิชา หรือชื่อวิชา..."
            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none shadow-sm transition-all bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full md:w-64 px-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-2">
              <Filter size={18} className={selectedPrefix === 'ALL' ? 'text-gray-400' : 'text-blue-600'} />
              <span className="font-bold text-sm text-gray-700 dark:text-zinc-300">
                {selectedPrefix === 'ALL' ? 'หมวดวิชาทั้งหมด' : `หมวดวิชา ${selectedPrefix}`}
              </span>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-[60] mt-2 w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-72 overflow-y-auto p-2 no-scrollbar">
                <button
                  onClick={() => { setSelectedPrefix('ALL'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex justify-between items-center transition-colors ${selectedPrefix === 'ALL' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400'}`}
                >
                  ทั้งหมด <span>({courses.length})</span>
                </button>
                <div className="h-px bg-gray-50 dark:bg-zinc-800 my-1 mx-2"></div>
                {allPrefixesWithCounts.map(({ prefix, count }) => (
                  <button
                    key={prefix}
                    onClick={() => { setSelectedPrefix(prefix); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex justify-between items-center transition-colors ${selectedPrefix === prefix ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400'}`}
                  >
                    {prefix} <span>({count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {displayedGroups.length > 0 ? (
          displayedGroups.map(prefix => (
            <div key={prefix} className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-100 dark:bg-zinc-800"></div>
                <h3 className="font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest text-sm">{prefix} ({groupedCourses[prefix].length})</h3>
                <div className="h-px flex-1 bg-gray-100 dark:bg-zinc-800"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedCourses[prefix].map(course => (
                  <div key={course.code} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md dark:hover:border-zinc-700 transition-shadow group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                        <span className="text-blue-700 dark:text-blue-400 font-black text-sm tracking-tight">{course.code}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {addCourseToPlanner && (
                          <button 
                            onClick={() => addCourseToPlanner(course)}
                            disabled={selectedCourses.some(c => c.code === course.code)}
                            className={`p-2 rounded-lg transition-all ${selectedCourses.some(c => c.code === course.code) 
                              ? 'text-green-500 bg-green-50 dark:bg-green-900/20' 
                              : 'text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                            title={selectedCourses.some(c => c.code === course.code) ? 'อยู่ในตารางแล้ว' : 'เพิ่มเข้าตารางเรียน'}
                          >
                            {selectedCourses.some(c => c.code === course.code) ? <CheckCircle size={16} /> : <Plus size={16} />}
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenEditModal(course)}
                          className="p-2 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="แก้ไขวิชา"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenDeleteModal(course.code)}
                          className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="ลบวิชา"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-gray-900 dark:text-zinc-100 mb-4 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-10">{course.name}</h4>
                    
                    <div className="grid grid-cols-1 gap-y-3">
                      {((course.lecDay || course.lecTime || course.lecRoom) || (course.labDay || course.labTime || course.labRoom)) ? (
                        <>
                          {(course.lecDay || course.lecTime || course.lecRoom) && (
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                              <div className="p-1.5 bg-blue-50 dark:bg-blue-900 rounded-lg text-blue-500 dark:text-blue-300">
                                LEC
                              </div>
                              <span className="truncate">
                                {course.lecDay || ''}{course.lecDay && course.lecTime ? ' ' : ''}{course.lecTime || ''}{course.lecRoom ? ` • ${course.lecRoom}` : ''}
                              </span>
                            </div>
                          )}
                          {(course.labDay || course.labTime || course.labRoom) && (
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                              <div className="p-1.5 bg-amber-50 dark:bg-amber-900 rounded-lg text-amber-500 dark:text-amber-300">
                                LAB
                              </div>
                              <span className="truncate">
                                {course.labDay || ''}{course.labDay && course.labTime ? ' ' : ''}{course.labTime || ''}{course.labRoom ? ` • ${course.labRoom}` : ''}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                            <div className="p-1.5 bg-gray-50 dark:bg-zinc-800 rounded-lg text-blue-500 dark:text-blue-400">
                              <Clock size={12} />
                            </div>
                            <span>{course.day || '-'} {course.time || ''}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                            <div className="p-1.5 bg-gray-50 dark:bg-zinc-800 rounded-lg text-green-500 dark:text-green-400">
                              <MapPin size={12} />
                            </div>
                            <span className="truncate">{course.room || '-'}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400 font-medium col-span-2">
                          <div className="p-1.5 bg-gray-50 dark:bg-zinc-800 rounded-lg text-orange-500 dark:text-orange-400">
                            <Calendar size={12} />
                          </div>
                          <span className="truncate">
                            สอบ: {course.isFacultyExam
                              ? 'คณะจัดสอบเอง'
                              : course.examMonthOnly
                                ? `เดือน ${course.examMonth || 'ยังไม่ระบุ'}`
                                : (course.examDate || 'ไม่มีข้อมูลสอบ')}
                            {course.isFacultyExam ? '' : ` เวลา ${course.examTime || '-'}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
            <Search size={48} className="mx-auto text-gray-200 dark:text-zinc-800 mb-4" />
            <p className="text-gray-400 dark:text-zinc-500 text-sm font-medium">ไม่พบวิชาที่ค้นหา</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800">
            <div className="bg-gray-50 dark:bg-zinc-800/50 px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                {isEditing ? <Edit2 size={18} className="text-blue-600 dark:text-blue-50" /> : <Plus size={18} className="text-blue-600 dark:text-blue-50" />}
                {isEditing ? 'แก้ไขข้อมูลวิชา' : 'เพิ่มวิชาใหม่เข้าระบบ'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">รหัสวิชา *</label>
                <input
                  type="text"
                  placeholder="เช่น RAM1000"
                  disabled={isEditing}
                  className={`w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 ${isEditing ? 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-500' : ''}`}
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">ชื่อวิชา *</label>
                <input
                  type="text"
                  placeholder="เช่น ความรู้คู่คุณธรรม"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">หน่วยกิต</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                  value={formData.credit}
                  onChange={e => setFormData({ ...formData, credit: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 gap-4">
                <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-400">Lecture (LEC)</span>
                    <span className="text-[10px] text-gray-400">ถ้ามี</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">วันเรียน LEC</label>
                      <select
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                        value={formData.lecDay || ''}
                        onChange={e => setFormData({ ...formData, lecDay: e.target.value })}
                      >
                        <option value="">ไม่ระบุ</option>
                        <option value="จันทร์">จันทร์</option>
                        <option value="อังคาร">อังคาร</option>
                        <option value="พุธ">พุธ</option>
                        <option value="พฤหัสบดี">พฤหัสบดี</option>
                        <option value="ศุกร์">ศุกร์</option>
                        <option value="เสาร์">เสาร์</option>
                        <option value="อาทิตย์">อาทิตย์</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">เวลาเรียน LEC</label>
                      <input
                        type="text"
                        placeholder="เช่น 09:30 - 11:20"
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                        value={formData.lecTime || ''}
                        onChange={e => setFormData({ ...formData, lecTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">ห้องเรียน LEC</label>
                      <input
                        type="text"
                        placeholder="เช่น KTB 201"
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                        value={formData.lecRoom || ''}
                        onChange={e => setFormData({ ...formData, lecRoom: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-400">Lab (LAB)</span>
                    <span className="text-[10px] text-gray-400">ถ้ามี</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">วันเรียน LAB</label>
                      <select
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                        value={formData.labDay || ''}
                        onChange={e => setFormData({ ...formData, labDay: e.target.value })}
                      >
                        <option value="">ไม่ระบุ</option>
                        <option value="จันทร์">จันทร์</option>
                        <option value="อังคาร">อังคาร</option>
                        <option value="พุธ">พุธ</option>
                        <option value="พฤหัสบดี">พฤหัสบดี</option>
                        <option value="ศุกร์">ศุกร์</option>
                        <option value="เสาร์">เสาร์</option>
                        <option value="อาทิตย์">อาทิตย์</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">เวลาเรียน LAB</label>
                      <input
                        type="text"
                        placeholder="เช่น 13:30 - 15:20"
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                        value={formData.labTime || ''}
                        onChange={e => setFormData({ ...formData, labTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">ห้องเรียน LAB</label>
                      <input
                        type="text"
                        placeholder="เช่น LAB 101"
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                        value={formData.labRoom || ''}
                        onChange={e => setFormData({ ...formData, labRoom: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">วันที่สอบ (YYYY-MM-DD)</label>
                <input
                  type="date"
                  disabled={formData.isFacultyExam}
                  className={`w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 ${formData.isFacultyExam ? 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-500 cursor-not-allowed' : ''}`}
                  value={formData.examDate}
                  onChange={e => setFormData({ ...formData, examDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">เวลาสอบ</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                  value={formData.examTime}
                  onChange={e => setFormData({ ...formData, examTime: e.target.value })}
                >
                  <option value="เช้า (09:30-12:00)">เช้า (09:30-12:00)</option>
                  <option value="บ่าย (14:00-16:30)">บ่าย (14:00-16:30)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer group mb-3">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={formData.isFacultyExam}
                    onChange={e => setFormData({ ...formData, isFacultyExam: e.target.checked, examDate: e.target.checked ? '' : formData.examDate })}
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-sm font-bold text-gray-700 dark:text-zinc-300 transition-colors peer-checked:bg-blue-600 peer-checked:text-white">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    คณะจัดสอบเอง
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group mb-3">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={formData.examMonthOnly}
                    onChange={e => setFormData({ ...formData, examMonthOnly: e.target.checked })}
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-sm font-bold text-gray-700 dark:text-zinc-300 transition-colors peer-checked:bg-blue-600 peer-checked:text-white">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    ระบุเดือนสอบ (ถ้าทราบ)
                  </span>
                </label>

                {formData.examMonthOnly && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1 ml-1">เดือนที่สอบ</label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                      value={formData.examMonth || ''}
                      onChange={e => setFormData({ ...formData, examMonth: e.target.value })}
                    >
                      <option value="">เลือกเดือน...</option>
                      <option value="มกราคม">มกราคม</option>
                      <option value="กุมภาพันธ์">กุมภาพันธ์</option>
                      <option value="มีนาคม">มีนาคม</option>
                      <option value="เมษายน">เมษายน</option>
                      <option value="พฤษภาคม">พฤษภาคม</option>
                      <option value="มิถุนายน">มิถุนายน</option>
                      <option value="กรกฎาคม">กรกฎาคม</option>
                      <option value="สิงหาคม">สิงหาคม</option>
                      <option value="กันยายน">กันยายน</option>
                      <option value="ตุลาคม">ตุลาคม</option>
                      <option value="พฤศจิกายน">พฤศจิกายน</option>
                      <option value="ธันวาคม">ธันวาคม</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-800 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSaveCourse} 
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'กำลังบันทึก...' : <><Save size={16} /> {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มวิชา'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2">ยืนยันการลบวิชา?</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">คุณแน่ใจหรือไม่ที่จะลบวิชา <span className="font-bold text-gray-800 dark:text-zinc-200">{courseToDelete}</span>? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleDeleteCourse}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'กำลังลบ...' : 'ลบเลย'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
