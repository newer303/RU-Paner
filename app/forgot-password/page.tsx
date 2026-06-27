'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Loader2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.exists) {
        // Redirect to reset password page with the userId as the token
        router.push(`/reset-password?token=${data.userId}`);
      } else {
        setStatus('error');
        setMessage(data.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      setStatus('error');
      setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 dark:bg-zinc-950 px-4">
      {/* Background Decor */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            ลืมรหัสผ่าน?
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            กรอกอีเมลของคุณเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <Mail className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-zinc-300 font-medium">
                {message}
              </p>
            </div>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              กลับไปยังหน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 ml-1" htmlFor="email">
                อีเมล
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 px-10 py-2 text-sm transition-all focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="relative flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {status === 'loading' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                ส่งลิงก์รีเซ็ตรหัสผ่าน <Mail size={16} />
                </span>
              )}
            </button>

            <div className="flex justify-center mt-4">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับไปยังหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
