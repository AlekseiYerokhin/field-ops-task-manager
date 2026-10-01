import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as taskRepository from '../storage/taskRepository';
import { useThemeColors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Task } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>;

export default function MapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      const allTasks = await taskRepository.getAllTasks();
      // Only show tasks that have coordinates
      const tasksWithCoords = allTasks.filter(
        (task) => task.location.latitude !== undefined && task.location.longitude !== undefined
      );
      setTasks(tasksWithCoords);
    } catch {
      // Silently handle - could add error state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTasks();
  }, [loadTasks]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={styles.emptyTitle}>No locations yet</Text>
        <Text style={styles.emptySubtitle}>
          Tasks with coordinates will appear here. Add coordinates when creating or editing a task.
        </Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: tasks[0].location.latitude!,
    longitude: tasks[0].location.longitude!,
    latitudeDelta: 20,
    longitudeDelta: 20,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        accessibilityLabel="Map of task locations"
      >
        {tasks.map((task) => (
          <Marker
            key={task.id}
            coordinate={{
              latitude: task.location.latitude!,
              longitude: task.location.longitude!,
            }}
            title={task.title}
            description={task.location.address}
            onCalloutPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
          />
        ))}
      </MapView>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      backgroundColor: colors.background,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
