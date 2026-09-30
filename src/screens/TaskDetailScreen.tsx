import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useEffect, useState, useCallback } from 'react';
import { useTaskStore } from '../store/taskStore';
import * as taskRepository from '../storage/taskRepository';
import * as historyRepository from '../storage/historyRepository';
import type { RootStackParamList } from '../navigation/types';
import type { Task, HistoryLog } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;
type RoutePropType = RouteProp<RootStackParamList, 'TaskDetail'>;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'New':
      return '#3b82f6';
    case 'In Progress':
      return '#f59e0b';
    case 'Completed':
      return '#10b981';
    case 'Cancelled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

export default function TaskDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { taskId } = route.params;
  const { deleteTask } = useTaskStore();

  const [task, setTask] = useState<Task | null>(null);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTaskData = useCallback(async () => {
    setIsLoading(true);
    try {
      const taskData = await taskRepository.getTask(taskId);
      const historyData = await historyRepository.getLogsByTask(taskId);
      setTask(taskData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load task data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTaskData();
  }, [loadTaskData]);

  const handleEdit = () => {
    navigation.navigate('TaskEdit', { taskId });
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(taskId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleChangeStatus = () => {
    navigation.navigate('TaskEdit', { taskId });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.statusText}>{task.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{task.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Due Date</Text>
        <Text style={styles.infoText}>
          {formatDate(task.dueDate)} at {formatTime(task.dueDate)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.infoText}>{task.location.address}</Text>
        {task.location.latitude && task.location.longitude && (
          <Text style={styles.coordinatesText}>
            {task.location.latitude.toFixed(6)}, {task.location.longitude.toFixed(6)}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attachments</Text>
        <Text style={styles.infoText}>0 attachments</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>
        <Text style={styles.infoText}>{history.length} entries</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleEdit}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.changeStatusButton]}
          onPress={handleChangeStatus}
        >
          <Text style={styles.buttonText}>Change Status</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  changeStatusButton: {
    backgroundColor: '#f59e0b',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
