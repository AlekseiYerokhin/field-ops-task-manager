import { useSettingsStore } from './settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({ demoMode: false });
  });

  it('defaults to demoMode false', () => {
    expect(useSettingsStore.getState().demoMode).toBe(false);
  });

  it('sets demoMode to true', () => {
    useSettingsStore.getState().setDemoMode(true);
    expect(useSettingsStore.getState().demoMode).toBe(true);
  });

  it('sets demoMode back to false', () => {
    useSettingsStore.getState().setDemoMode(true);
    useSettingsStore.getState().setDemoMode(false);
    expect(useSettingsStore.getState().demoMode).toBe(false);
  });
});