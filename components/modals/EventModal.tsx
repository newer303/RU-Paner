import React from 'react';
import { X, Edit2, Plus, Save, Bell, Calendar, Tag, MapPin } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800 px-6 py-5 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-3 text-lg">
            {formData.id ? (
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400">
                <Edit2 size={20} />
              </div>
            ) : (
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
                <Plus size={20} />
              </div>
            )}
            {formData.id ? 'แก้ไขกำหนดการ' : 'เพิ่มกำหนดการใหม่'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-100 p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-zinc-700 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">ชื่อกำหนดการ *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full border-gray-200 dark:border-zinc-700 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500"
              placeholder="เช่น วันลงทะเบียนเรียน..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Calendar size={16} /> วันเริ่มต้น *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border-gray-200 dark:border-zinc-700 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Calendar size={16} /> วันสิ้นสุด *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border-gray-200 dark:border-zinc-700 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <MapPin size={16} /> ส่วนการศึกษา
              </label>
              <select
                value={formData.region}
                onChange={e => setFormData({ ...formData, region: e.target.value })}
                className="w-full border-gray-200 dark:border-zinc-700 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              >
                <option value="all">ทั้งหมด</option>
                <option value="central">ส่วนกลาง</option>
                <option value="regional">ส่วนภูมิภาค</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Tag size={16} /> ประเภท
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full border-gray-200 dark:border-zinc-700 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              >
                <option value="lecture">การบรรยาย</option>
                <option value="registration">การลงทะเบียน</option>
                <option value="exam">การสอบ</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-xl text-blue-600 dark:text-blue-400">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">แจ้งเตือนผู้ใช้งาน</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">ส่งการแจ้งเตือนสำหรับกิจกรรมนี้</p>
              </div>
            </div>
            <button
              onClick={() => setFormData({ ...formData, sendNotify: !formData.sendNotify })}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.sendNotify ? 'bg-blue-600' : 'bg-gray-300 dark:bg-zinc-700'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.sendNotify ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-700 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-all"
          >
            ยกเลิก
          </button>
          <button 
            onClick={onSave} 
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Save size={18} /> บันทึกข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
};
