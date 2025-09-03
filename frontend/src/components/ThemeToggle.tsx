import { memo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = memo(() => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-all duration-200 shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Current theme: ${isDark ? 'dark' : 'light'}. Click to switch to ${isDark ? 'light' : 'dark'} mode.`}
    >
      {isDark ? (
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
          <span className="text-sm font-medium hidden sm:inline">Light</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
          <span className="text-sm font-medium hidden sm:inline">Dark</span>
        </div>
      )}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;