import { useThemeStore } from '../store';
import { lightColors, darkColors, type Colors } from './colors';

export function useThemeColors(): Colors {
  const theme = useThemeStore((state) => state.theme);
  return theme === 'dark' ? darkColors : lightColors;
}
