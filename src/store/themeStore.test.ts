import { useThemeStore } from './themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useThemeStore.setState({ theme: 'light' });
  });

  it('should have light theme as default', () => {
    const state = useThemeStore.getState();
    expect(state.theme).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    const state = useThemeStore.getState();
    state.toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    useThemeStore.setState({ theme: 'dark' });
    const state = useThemeStore.getState();
    state.toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('should toggle theme multiple times', () => {
    const state = useThemeStore.getState();

    state.toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');

    state.toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');

    state.toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
  });
});
