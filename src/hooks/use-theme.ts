import { useThemeContext } from '@/contexts/ThemeContext';

export function useTheme() {
  const { theme, toggleTheme } = useThemeContext();
  return { theme, toggleTheme };
}
