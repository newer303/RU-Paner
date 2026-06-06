'use client';
import { Calendar, Clock, Plus, Edit2, Trash2, Zap } from 'lucide-react';
import { CalendarEvent } from '@/types';
import { getEventStatus, calculateEventProgress } from '@/lib/utils';

interface CalendarTabProps {
  filterRegion: string;
  setFilterRegion: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  filteredCalendar: CalendarEvent[];
  handleOpenEventModal: (event?: CalendarEvent) => void;
  setConfirmDeleteId: (id: number) => void;
  getCalendarIcon: (type: string) => React.ReactNode;
}

export const CalendarTab = ({
  filterRegion,
  setFilterRegion,
  filterType,
  setFilterType,
  filteredCalendar,
  handleOpenEventModal,
  setConfirmDeleteId,
  getCalendarIcon
}: CalendarTabProps) => {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-1 text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="text-blue-600 dark:text-blue-500" size={24} /> ปฏิทินการศึกษา
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">ติดตามกำหนดการสำคัญของมหาวิทยาลัย</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg text-[13px] font-medium border border-blue-100 dark:border-blue-800/50 flex items-center gap-2 shadow-sm">
            <Clock size={14} />
            {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
          <button
            onClick={() => handleOpenEventModal()}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[13px] font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus size={14} />
            เพิ่มกำหนดการ
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-3 md:p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-row gap-3">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">ส่วนการศึกษา</label>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="w-full border-gray-200 dark:border-zinc-700 rounded-xl text-[13px] bg-gray-50 dark:bg-zinc-800 p-2 border focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-gray-800 dark:text-zinc-200"
          >
            <option value="all">ทั้งหมด</option>
            <option value="central">ส่วนกลาง</option>
            <option value="regional">ส่วนภูมิภาค</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">ประเภทกิจกรรม</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full border-gray-200 dark:border-zinc-700 rounded-xl text-[13px] bg-gray-50 dark:bg-zinc-800 p-2 border focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-gray-800 dark:text-zinc-200"
          >
            <option value="all">ทั้งหมด</option>
            <option value="lecture">การบรรยาย</option>
            <option value="registration">การลงทะเบียน</option>
            <option value="exam">การสอบ</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredCalendar.map(item => {
          const status = getEventStatus(item.startDate, item.endDate);
          const progress = calculateEventProgress(item.startDate, item.endDate);
          const isOngoing = status.label === 'กำลังดำเนินการ';

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border flex flex-col items-stretch gap-4 transition-all hover:shadow-md ${status.label === 'ผ่านมาแล้ว' ? 'opacity-60 bg-gray-50/50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800' : 'border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/50'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
                <div className="flex items-start gap-4 flex-1 w-full">
                  <div className={`p-2.5 rounded-xl shrink-0 ${status.label === 'ผ่านมาแล้ว' ? 'bg-gray-100 dark:bg-zinc-800' : 'bg-blue-50/50 dark:bg-blue-900/20'}`}>
                    {getCalendarIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`font-bold text-[15px] ${status.label === 'ผ่านมาแล้ว' ? 'text-gray-500 dark:text-zinc-500' : 'text-gray-900 dark:text-zinc-100'} truncate`}>{item.title}</span>
                      {item.region === 'central' && <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">ส่วนกลาง</span>}
                      {item.region === 'regional' && <span className="text-[9px] bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">ส่วนภูมิภาค</span>}
                    </div>
                    <div className="text-[13px] text-gray-400 dark:text-zinc-500 flex items-center gap-1.5">
                      <Clock size={12} className="shrink-0" /> <span className="truncate">{item.dateStr}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-50 dark:border-zinc-800">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEventModal(item)} className="p-2 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => item.id && setConfirmDeleteId(item.id)} className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className={`text-[11px] px-3 py-1.5 rounded-full font-bold border flex items-center justify-center whitespace-nowrap ${status.color.replace('bg-','bg-opacity-50 dark:bg-opacity-20 ')}`}>
                    {status.label === 'กำลังดำเนินการ' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>}
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Energy Bar (Progress Bar) */}
              <div className="mt-1">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-tighter">
                    <Zap size={10} className={isOngoing ? 'text-yellow-500 animate-pulse fill-yellow-500' : 'text-gray-300 dark:text-zinc-700'} />
                    {isOngoing ? 'สถานะเวลา' : status.label === 'ผ่านมาแล้ว' ? 'สิ้นสุดกิจกรรม' : 'ยังไม่เริ่มต้น'}
                  </div>
                  <span className={`text-[10px] font-black ${isOngoing ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'}`}>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-gray-50 dark:border-zinc-700 p-[1px] shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      status.label === 'ผ่านมาแล้ว' ? 'bg-gray-300 dark:bg-zinc-600' :
                      progress > 85 ? 'bg-gradient-to-r from-orange-400 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' :
                      'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)] dark:from-blue-500 dark:via-blue-600 dark:to-blue-700'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredCalendar.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 transition-colors">
            <Calendar size={48} className="mx-auto text-gray-200 dark:text-zinc-800 mb-4" />
            <p className="text-gray-400 dark:text-zinc-500 text-sm">ไม่พบกำหนดการที่ตรงกับตัวกรอง</p>
          </div>
        )}
      </div>
    </div>
  );
};
