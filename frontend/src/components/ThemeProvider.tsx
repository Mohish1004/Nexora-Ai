import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);
  const blobOpacity = useAppStore((s) => s.blobOpacity);
  const accentHue = useAppStore((s) => s.accentHue);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--blob-opacity', String(blobOpacity));
  }, [blobOpacity]);

  useEffect(() => {
    const root = document.documentElement;
    if (accentHue === 'emerald') {
      root.style.setProperty('--accent-business', '#00E676');
    } else {
      root.style.setProperty('--accent-business', '#00F0FF');
    }
  }, [accentHue]);

  return <>{children}</>;
}
