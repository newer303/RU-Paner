import React from 'react';
import { X, Plus, BookOpen, Clock, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { Course } from '@/types';

interface ManualCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Course;
  setFormData: (data: Course) => void;
  onSave: () => void;
}

export const ManualCourseModal: React.FC<ManualCourseModalProps> = ({
  isOpen, onClose, formData, setFormData, onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-zinc-800 animate-slide-up">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 px-8 py-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Plus size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tighter text-lg">
                Add Custom Course
              </h3>
              <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">เพิ่มรายวิชาด้วยตนเอง</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
              <BookOpen size={10} /> รหัสวิชา *
            </label>
            <input
              type="text"
              placeholder="เช่น RAM1000"
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
              <BookOpen size={10} /> ชื่อวิชา *
            </label>
            <input
              type="text"
              placeholder="เช่น ความรู้คู่คุณธรรม"
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
              <Plus size={10} /> หน่วยกิต
            </label>
            <input
              type="number"
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all"
              value={formData.credit}
              onChange={e => setFormData({ ...formData, credit: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
              <Calendar size={10} /> วันเรียน
            </label>
            <select
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all appearance-none"
              value={formData.day}
              onChange={e => setFormData({ ...formData, day: e.target.value })}
            >
              <option value="จันทร์">จันทร์</option>
              <option value="อังคาร">อังคาร</option>
              <option value="พุธ">พุธ</option>
              <option value="พฤหัสบดี">พฤหัสบดี</option>
              <option value="ศุกร์">ศุกร์</option>
              <option value="เสาร์">เสาร์</option>
              <option value="อาทิตย์">อาทิตย์</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
              <Clock size={10} /> เวลาเรียน
            </label>
            <input
              type="text"
              placeholder="เช่น 09:30 - 11:20"
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
              <MapPin size={10} /> ห้องเรียน
            </label>
            <input
              type="text"
              placeholder="เช่น KTB 201"
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all"
              value={formData.room}
              onChange={e => setFormData({ ...formData, room: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
              <BookOpen size={10} /> Lecture (LEC)
            </label>
            <input
              type="text"
              placeholder="เช่น จันทร์ 09:30 - 11:20"
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all"
              value={`${formData.lecDay || ''}${formData.lecDay ? ' ' : ''}${formData.lecTime || ''}`.trim()}
              onChange={e => {
                const [lecDay, ...lecTimeParts] = e.target.value.split(' ');
                setFormData({ ...formData, lecDay: lecDay || '', lecTime: lecTimeParts.join(' ').trim() });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
              <BookOpen size={10} /> Lab (LAB)
            </label>
            <input
              type="text"
              placeholder="เช่น พุธ 13:30 - 15:20"
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all"
              value={`${formData.labDay || ''}${formData.labDay ? ' ' : ''}${formData.labTime || ''}`.trim()}
              onChange={e => {
                const [labDay, ...labTimeParts] = e.target.value.split(' ');
                setFormData({ ...formData, labDay: labDay || '', labTime: labTimeParts.join(' ').trim() });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
              <Calendar size={10} /> วันที่สอบ (YYYY-MM-DD)
            </label>
            <input
              type="date"
              disabled={formData.isFacultyExam}
              className={`w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all ${formData.isFacultyExam ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={formData.examDate}
              onChange={e => {
                const newDate = e.target.value;
                setFormData({ 
                  ...formData, 
                  examDate: newDate,
                  isFacultyExam: !newDate 
                });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
              <Clock size={10} /> เวลาสอบ
            </label>
            <select
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all appearance-none"
              value={formData.examTime}
              onChange={e => setFormData({ ...formData, examTime: e.target.value })}
            >
              <option value="เช้า (09:30-12:00)">เช้า (09:30-12:00)</option>
              <option value="บ่าย (14:00-16:30)">บ่าย (14:00-16:30)</option>
            </select>
          </div>
        </div>

        {/* Exam Options */}
        <div className="px-8 pb-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-gray-100 dark:bg-zinc-800"></div>
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">ตัวเลือกการสอบ</span>
            <div className="h-[1px] flex-1 bg-gray-100 dark:bg-zinc-800"></div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={formData.isFacultyExam}
                onChange={e => setFormData({ ...formData, isFacultyExam: e.target.checked, examDate: e.target.checked ? '' : formData.examDate })}
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              คณะจัดสอบเอง (ยังไม่กำหนดวันสอบ)
            </span>
          </label>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={formData.examMonthOnly}
                  onChange={e => setFormData({ ...formData, examMonthOnly: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <span className="text-xs font-bold text-gray-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                ระบุเดือนสอบ (ถ้าทราบ)
              </span>
            </label>

            {formData.examMonthOnly && (
              <div className="pl-14 space-y-1.5 animate-fade-in">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                  <Calendar size={10} /> เดือนที่สอบ
                </label>
                <select
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-600 outline-none text-sm font-bold text-gray-900 dark:text-zinc-100 transition-all appearance-none"
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

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onSave} 
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <CheckCircle2 size={16} /> Add to Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
