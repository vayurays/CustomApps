import { useEffect, useState } from 'react';

export function useVayuTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // 1. Priority: URL query param (?theme=light or ?theme=dark)
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme');
    if (urlTheme === 'dark' || urlTheme === 'light') return urlTheme;

    // 2. Priority: localStorage cache
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;

    // 3. Fallback: browser / OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for THEME_CHANGED messages from the parent VayuRays WebClient iframe
      if (event.data?.type === 'THEME_CHANGED' && (event.data.theme === 'light' || event.data.theme === 'dark')) {
        setTheme(event.data.theme);
      }
    };

    // Apply data-theme and class on the root html element
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);

    // Listen to parent iframe messages
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}
