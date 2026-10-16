import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-testid="theme-toggle-btn"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Current: ${isDark ? 'Dark' : 'Light'} Mode (Click to switch)`}
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#caa14d]/70 bg-white/95 dark:bg-[#1a1e2b] text-[#5e430d] dark:text-amber-200 hover:bg-[#caa14d]/20 dark:hover:bg-[#caa14d]/30 transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#caa14d]/50 shrink-0 ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-amber-300 animate-in spin-in-180 duration-300" />
          <span className="text-[10px] font-black tracking-widest uppercase text-amber-200">
            LIGHT
          </span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-[#684a0c] transition-transform hover:-rotate-12" />
          <span className="text-[10px] font-black tracking-widest uppercase text-[#684a0c]">
            DARK
          </span>
        </>
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

export default ThemeToggle;
