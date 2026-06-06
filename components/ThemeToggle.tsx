'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-9 h-9" />; // Placeholder
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-500 theme-icon-enter" />
        ) : (
          <Moon className="w-5 h-5 text-zinc-700 theme-icon-enter" />
        )}
      </div>
    </button>
  );
}
