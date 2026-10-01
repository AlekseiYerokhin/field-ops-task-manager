import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import {
  registerForPushNotificationsAsync,
  initializeSyncListener,
  cleanupSyncListener,
} from './src/services';

export default function App() {
  useEffect(() => {
    // Request notification permissions on startup, handled gracefully
    registerForPushNotificationsAsync();
    // Listen for connectivity to trigger offline sync
    initializeSyncListener();
    return () => cleanupSyncListener();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
