import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen, onClose, onConfirm,
  title = 'ยืนยันการลบกำหนดการ',
  description = 'คุณแน่ใจหรือไม่ว่าต้องการลบกำหนดการนี้? การดำเนินการนี้ไม่สามารถกู้คืนได้'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-24 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center border border-gray-100 dark:border-zinc-800">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{description}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors w-full">ยกเลิก</button>
          <button onClick={onConfirm} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors w-full">ลบข้อมูล</button>
        </div>
      </div>
    </div>
  );
};
