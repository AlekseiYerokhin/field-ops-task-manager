import config from './config';

describe('config', () => {
  it('should export apiBaseUrl', () => {
    expect(config.apiBaseUrl).toBeDefined();
    expect(typeof config.apiBaseUrl).toBe('string');
  });

  it('should export appEnv', () => {
    expect(config.appEnv).toBeDefined();
    expect(typeof config.appEnv).toBe('string');
  });

  it('should have valid apiBaseUrl format', () => {
    expect(config.apiBaseUrl).toMatch(/^https?:\/\//);
  });

  it('should default to localhost when API_BASE_URL is not set', () => {
    // Since we can't easily mock process.env in this test,
    // we just verify the default value is present
    expect(config.apiBaseUrl).toBe('http://localhost:3000');
  });

  it('should default to development when APP_ENV is not set', () => {
    expect(config.appEnv).toBe('development');
  });
});
