import React from 'react';
import { X, Edit2, Plus, Save, Bell } from 'lucide-react';
import { EventFormData } from '@/types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: EventFormData;
  setFormData: (data: EventFormData) => void;
  onSave: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen, onClose, formData, setFormData, onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800">
        <div className="bg-gray-50 dark:bg-zinc-800/50 px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            {formData.id ? <Edit2 size={18} className="text-blue-600 dark:text-blue-500" /> : <Plus size={18} className="text-blue-600 dark:text-blue-500" />}
            {formData.id ? 'แก้ไขกำหนดการ' : 'เพิ่มกำหนดการใหม่'}
          </h3>
          <button onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-1 ml-1">ชื่อกำหนดการ *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-600 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600"
              placeholder="เช่น วันลงทะเบียนเรียน..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-1 ml-1">วันเริ่มต้น *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-600 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-1 ml-1">วันสิ้นสุด *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-600 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-1 ml-1">ส่วนการศึกษา</label>
              <select
                value={formData.region}
                onChange={e => setFormData({ ...formData, region: e.target.value })}
                className="w-full border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-600 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              >
                <option value="all">ทั้งหมด (ส่วนกลางและภูมิภาค)</option>
                <option value="central">ส่วนกลาง</option>
                <option value="regional">ส่วนภูมิภาค</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-1 ml-1">ประเภท</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-600 outline-none text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              >
                <option value="lecture">การบรรยาย</option>
                <option value="registration">การลงทะเบียน</option>
                <option value="exam">การสอบ</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-1.5"><Bell size={16} /> แจ้งเตือนผู้ใช้งาน</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">ส่งแจ้งเตือนกิจกรรมนี้ (จำลอง Push Notification)</p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, sendNotify: !formData.sendNotify })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.sendNotify ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-zinc-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.sendNotify ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-colors">ยกเลิก</button>
          <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"><Save size={16} /> บันทึกข้อมูล</button>
        </div>
      </div>
    </div>
  );
};
