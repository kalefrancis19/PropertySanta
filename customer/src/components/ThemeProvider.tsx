'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type SystemTheme = 'light' | 'dark';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ThemeContextType {
  theme: Theme;
  systemTheme: SystemTheme | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Create context with default values
const defaultContextValue: ThemeContextType = {
  theme: 'system',
  systemTheme: null,
  setTheme: () => {},
  toggleTheme: () => {}
};

const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  enableSystem = true,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<SystemTheme | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted state and initialize theme from localStorage
  useEffect(() => {
    setMounted(true);
    
    // Only access localStorage after component is mounted (client-side)
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, [storageKey]);

  // Get system theme preference
  useEffect(() => {
    if (typeof window === 'undefined' || !enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    // Set initial value
    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystem]);

  // Apply theme class to document element
  useEffect(() => {
    // Only run on client-side after mount
    if (!mounted) return;
    
    const root = window.document.documentElement;
    
    // Clear all theme classes
    root.classList.remove('light', 'dark');
    
    // Apply the selected theme
    if (theme === 'system' && systemTheme) {
      root.classList.add(systemTheme);
    } else if (theme === 'light' || theme === 'dark') {
      root.classList.add(theme);
    }
    
    // Disable transitions if needed
    if (disableTransitionOnChange) {
      const body = document.body;
      body.classList.add('disable-transitions');
      const timer = setTimeout(() => body.classList.remove('disable-transitions'), 1);
      return () => clearTimeout(timer);
    }
  }, [theme, systemTheme, disableTransitionOnChange, mounted]);

  // Save to localStorage if not system theme
  const setTheme = (theme: Theme) => {
    if (mounted) {
      localStorage.setItem(storageKey, theme);
    }
    setThemeState(theme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Create the context value
  const contextValue = {
    theme: mounted ? theme : defaultTheme,
    systemTheme: mounted ? systemTheme : null,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {/* Apply theme class to the root element */}
      <div className={`${!mounted ? (defaultTheme === 'dark' ? 'dark' : '') : ''}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// This hook can be used in any component to access the theme context
export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};