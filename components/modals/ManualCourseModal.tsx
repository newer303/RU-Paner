import React from 'react';
import { X, Plus } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Plus size={18} className="text-blue-600" /> เพิ่มวิชาเข้าตารางเรียนด้วยตนเอง
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">รหัสวิชา *</label>
            <input
              type="text"
              placeholder="เช่น RAM1000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ชื่อวิชา *</label>
            <input
              type="text"
              placeholder="เช่น ความรู้คู่คุณธรรม"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">หน่วยกิต</label>
            <input
              type="number"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.credit}
              onChange={e => setFormData({ ...formData, credit: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">วันเรียน</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
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
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">เวลาเรียน</label>
            <input
              type="text"
              placeholder="เช่น 09:30 - 11:20"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ห้องเรียน</label>
            <input
              type="text"
              placeholder="เช่น KTB 201"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.room}
              onChange={e => setFormData({ ...formData, room: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">วันที่สอบ (YYYY-MM-DD)</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={formData.examDate}
              onChange={e => setFormData({ ...formData, examDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">เวลาสอบ</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              value={formData.examTime}
              onChange={e => setFormData({ ...formData, examTime: e.target.value })}
            >
              <option value="เช้า (09:30-12:00)">เช้า (09:30-12:00)</option>
              <option value="บ่าย (14:00-16:30)">บ่าย (14:00-16:30)</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">ยกเลิก</button>
          <button onClick={onSave} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">เพิ่มเข้าตาราง</button>
        </div>
      </div>
    </div>
  );
};
