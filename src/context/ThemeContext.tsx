import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isLight: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('agentforge_theme');
      return (saved as ThemeMode) || 'light';
    } catch (e) {
      console.warn('Error reading agentforge_theme from localStorage:', e);
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('agentforge_theme', theme);
    } catch (e) {
      console.warn('Error saving agentforge_theme to localStorage:', e);
    }
    const allThemeClasses = ['light', 'dark', 'theme-mission', 'theme-editorial', 'theme-nordic', 'theme-sage'];
    document.documentElement.classList.remove(...allThemeClasses);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
      if (theme !== 'light') {
        document.documentElement.classList.add(`theme-${theme}`);
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  const isLight = true;

  return (
    <ThemeContext.Provider value={{ theme, isLight, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
