'use client';

import { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 dark:bg-zinc-950 px-4">
      {/* Background Decor */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
      
      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
            <BookMarked className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            RU Planner
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            เข้าสู่ระบบเพื่อจัดการตารางเรียนของคุณ
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
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300" htmlFor="password">
                  รหัสผ่าน
                </label>
              </div>
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
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="text-sm font-medium text-gray-600 dark:text-zinc-400 cursor-pointer">
                จดจำฉันไว้ในระบบ
              </label>
            </div>
            {/* You can add "Forgot Password?" link here later if needed */}
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
                เข้าสู่ระบบ <LogIn size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-4 text-gray-400 dark:text-zinc-500 font-medium">
              หรือ
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-bold text-gray-700 dark:text-zinc-300 transition-all hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.98]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          ดำเนินการต่อด้วย Google
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
            สมัครสมาชิกใหม่
          </Link>
        </p>
      </div>
    </div>
  );
}
