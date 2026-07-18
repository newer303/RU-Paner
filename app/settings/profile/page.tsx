'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, Lock, Loader2, Image as ImageIcon, Camera, ChevronLeft } from 'lucide-react';

export default function EditProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [image, setImage] = useState(session?.user?.image || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordMessage, setPasswordMessage] = useState('');
  
  const router = useRouter();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus('loading');
    setProfileMessage('');

    console.log("Submitting profile update:", { name, image });

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileStatus('success');
        setProfileMessage('อัปเดตข้อมูลสำเร็จ');

        console.log("Updating session with:", { name, image });

        // Update session
        const result = await updateSession({ 
          ...session, 
          user: { 
            ...session?.user, 
            name, 
            image 
          } 
        });

        console.log("Session update result:", result);

        // Force refresh the page to ensure data is fetched fresh from the server
        window.location.reload(); 
      } else {
        const errorData = await response.json();
        setProfileStatus('error');
        setProfileMessage(errorData.message || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (err) {
      setProfileStatus('error');
      setProfileMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setPasswordStatus('loading');
    setPasswordMessage('');

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordStatus('success');
        setPasswordMessage('เปลี่ยนรหัสผ่านสำเร็จ');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus('error');
        setPasswordMessage(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setPasswordStatus('error');
      setPasswordMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 md:p-12">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">ตั้งค่าโปรไฟล์</h1>
            <p className="text-slate-500 font-bold text-xs">จัดการข้อมูลส่วนตัวและความปลอดภัย</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="space-y-6">
          {/* Profile Section */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">ข้อมูลส่วนตัว</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-inner overflow-hidden flex items-center justify-center">
                    {image ? (
                      <img src={image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={32} />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg transition-transform hover:scale-105">
                    <Camera size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const res = await fetch('/api/user/upload-avatar', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (res.ok) setImage(data.url);
                        else alert('อัปโหลดล้มเหลว');
                      } catch (err) { alert('อัปโหลดล้มเหลว'); }
                    }}/>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">ชื่อผู้ใช้งาน</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>

              {profileStatus !== 'idle' && (
                <p className={`text-xs font-bold ${profileStatus === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {profileMessage}
                </p>
              )}
              
              <button type="submit" disabled={profileStatus === 'loading'} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {profileStatus === 'loading' ? <Loader2 className="animate-spin" /> : 'บันทึกข้อมูล'}
              </button>
            </form>
          </section>

          {/* Security Section */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">ความปลอดภัย</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="รหัสผ่านปัจจุบัน" className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white" />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="รหัสผ่านใหม่" className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="ยืนยันรหัสผ่านใหม่" className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white" />
              
              {passwordStatus !== 'idle' && (
                <p className={`text-xs font-bold ${passwordStatus === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {passwordMessage}
                </p>
              )}
              
              <button type="submit" disabled={passwordStatus === 'loading'} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                {passwordStatus === 'loading' ? <Loader2 className="animate-spin" /> : 'เปลี่ยนรหัสผ่าน'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

