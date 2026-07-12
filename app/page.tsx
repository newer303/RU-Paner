'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, Loader2, AlertCircle, BookMarked } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      if (errorParam === 'CredentialsSignin') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn('credentials', {
        redirect: true,
        callbackUrl: '/dashboard',
        email,
        password,
        rememberMe: rememberMe.toString()
      });
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-zinc-950 px-4">
      {/* Refined Background Decor */}
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
      <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse" />

      <div className="relative w-full max-w-md transition-all duration-500 ease-out">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 shadow-2xl shadow-blue-500/40 transform transition-transform hover:scale-105">
              <BookMarked className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
              Planner
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 font-medium">
              เข้าสู่ระบบเพื่อจัดการตารางเรียนของคุณ
            </p>
          </div>

          {/* Main Login Card */}
          <div className="rounded-[2.5rem] border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 ml-1" htmlFor="email">
                    อีเมล
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      className="flex h-12 w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 px-11 py-2 text-sm transition-all focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 disabled:opacity-50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-bold text-slate-700 dark:text-zinc-300" htmlFor="password">
                      รหัสผ่าน
                    </label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="flex h-12 w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 px-11 py-2 text-sm transition-all focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 disabled:opacity-50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:bg-blue-700 hover:shadow-blue-500/50 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    เข้าสู่ระบบ <LogIn size={18} />
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Footer Section */}
          <p className="text-center text-sm text-slate-500 dark:text-zinc-400 font-medium">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors underline underline-offset-4">
              สมัครสมาชิกใหม่
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
