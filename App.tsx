import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation';
import { initializeSyncListener, cleanupSyncListener } from './src/services';

export default function App() {
  useEffect(() => {
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
