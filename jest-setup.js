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

jest.mock('expo-notifications', () => ({
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  AndroidImportance: {
    MAX: 5,
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
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
    TextInput: 'TextInput',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    Switch: 'Switch',
    RefreshControl: 'RefreshControl',
    ActivityIndicator: 'ActivityIndicator',
    Image: 'Image',
    Modal: 'Modal',
    Animated: {
      Value: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn((cb) => cb && cb()),
        stop: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: jest.fn((cb) => cb && cb()),
        stop: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn((cb) => cb && cb()),
        stop: jest.fn(),
      })),
      View: 'Animated.View',
    },
  };
});
