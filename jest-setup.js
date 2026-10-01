// Set up React Native globals
global.__DEV__ = true;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock expo modules before they're imported
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

// Mock react-native
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((styles) => styles),
    },
    Alert: {
      alert: jest.fn(),
    },
    TouchableOpacity: 'TouchableOpacity',
    View: 'View',
    Text: 'Text',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    Switch: 'Switch',
    RefreshControl: 'RefreshControl',
    ActivityIndicator: 'ActivityIndicator',
  };
});
