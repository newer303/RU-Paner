'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 dark:bg-zinc-950 px-4">
        {/* Background Decor */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative w-full max-w-md space-y-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-10 text-center shadow-2xl backdrop-blur-sm animate-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 shadow-inner">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-in fade-in zoom-in duration-500 delay-150 fill-mode-both" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              สมัครสมาชิกสำเร็จ!
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 font-medium">
              ยินดีต้อนรับเข้าสู่ครอบครัว RU Planner
            </p>
          </div>

          <div className="pt-4">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-bold">
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังพาท่านไปหน้าเข้าสู่ระบบ...
              </div>
              <div className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                <div className="h-full bg-green-500 transition-all duration-[2000ms] ease-linear" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 dark:bg-zinc-950 px-4">
      {/* Background Decor */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
      
      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            สร้างบัญชีใหม่
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            เริ่มต้นใช้งาน RU Planner เพื่อวางแผนการเรียนของคุณ
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 ml-1" htmlFor="name">
                ชื่อ-นามสกุล
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="name"
                  type="text"
                  placeholder="ชื่อ-นามสกุลของคุณ"
                  className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 px-10 py-2 text-sm transition-all focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 ml-1" htmlFor="password">
                รหัสผ่าน
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 px-10 py-2 text-sm transition-all focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                สมัครสมาชิก <UserPlus size={16} />
              </span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
            เข้าสู่ระบบเลย
          </Link>
        </p>
      </div>
    </div>
  );
}
