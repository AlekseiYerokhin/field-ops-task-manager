import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTaskStore } from '../store/taskStore';
import * as taskRepository from '../storage/taskRepository';
import * as attachmentRepository from '../storage/attachmentRepository';
import * as historyRepository from '../storage/historyRepository';
import { useImagePicker } from '../hooks';
import type { RootStackParamList } from '../navigation/types';
import type { TaskStatus, TaskLocation, Attachment } from '../types';
import type { PickedImage } from '../hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskCreate' | 'TaskEdit'>;
type RoutePropType = RouteProp<RootStackParamList, 'TaskCreate' | 'TaskEdit'>;

export default function TaskFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { createTask, updateTask } = useTaskStore();
  const { pickImage } = useImagePicker();

  const isEditMode = route.name === 'TaskEdit';
  const taskId = isEditMode ? (route.params as { taskId: string }).taskId : undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [status, setStatus] = useState<TaskStatus>('New');
  const [isLoading, setIsLoading] = useState(false);
  const [newAttachments, setNewAttachments] = useState<PickedImage[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);

  const loadTask = useCallback(async () => {
    if (!taskId) return;

    try {
      const [task, attachments] = await Promise.all([
        taskRepository.getTask(taskId),
        attachmentRepository.getAttachmentsByTask(taskId),
      ]);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(new Date(task.dueDate));
        setLocationAddress(task.location.address);
        setStatus(task.status);
      }
      setExistingAttachments(attachments);
    } catch {
      Alert.alert('Error', 'Failed to load task');
      navigation.goBack();
    }
  }, [taskId, navigation]);

  useEffect(() => {
    if (isEditMode && taskId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadTask();
    }
  }, [isEditMode, taskId, loadTask]);

  const handleAddAttachment = async () => {
    const image = await pickImage();
    if (image) {
      setNewAttachments([...newAttachments, image]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setNewAttachments(newAttachments.filter((_, i) => i !== index));
  };

  const handleRemoveExistingAttachment = async (attachmentId: string) => {
    try {
      await attachmentRepository.removeAttachment(attachmentId);
      if (taskId) {
        await historyRepository.addLogEntry({
          taskId,
          actionType: 'attachment_removed',
          description: 'Attachment removed',
        });
      }
      setExistingAttachments(
        existingAttachments.filter((attachment) => attachment.id !== attachmentId)
      );
    } catch {
      Alert.alert('Error', 'Failed to remove attachment');
    }
  };

  const saveAttachments = async (taskId: string) => {
    for (const image of newAttachments) {
      await attachmentRepository.addAttachment({
        taskId,
        uri: image.uri,
        fileName: image.fileName,
        mimeType: image.mimeType,
        size: image.size,
      });
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Description is required');
      return false;
    }
    if (!locationAddress.trim()) {
      Alert.alert('Validation Error', 'Location is required');
      return false;
    }
    if (dueDate <= new Date()) {
      Alert.alert('Validation Error', 'Due date must be in the future');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const location: TaskLocation = {
        address: locationAddress.trim(),
      };

      const taskData = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate.toISOString(),
        location,
        status,
      };

      let savedTaskId = taskId;
      if (isEditMode && taskId) {
        await updateTask({ id: taskId, ...taskData });
        if (newAttachments.length > 0) {
          await historyRepository.addLogEntry({
            taskId,
            actionType: 'attachment_added',
            description: `${newAttachments.length} attachment(s) added`,
          });
        }
        Alert.alert('Success', 'Task updated successfully');
      } else {
        const task = await createTask(taskData);
        savedTaskId = task.id;
        await historyRepository.addLogEntry({
          taskId: task.id,
          actionType: 'attachment_added',
          description: `${newAttachments.length} attachment(s) added`,
        });
        Alert.alert('Success', 'Task created successfully');
      }

      if (savedTaskId) {
        await saveAttachments(savedTaskId);
      }

      navigation.goBack();
    } catch {
      Alert.alert('Error', isEditMode ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setDueDate(selectedDate);
      }
    } else {
      if (selectedDate) {
        setDueDate(selectedDate);
      }
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Due Date *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{formatDate(dueDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
            />
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={locationAddress}
            onChangeText={setLocationAddress}
            placeholder="Enter location address"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            {(['New', 'In Progress', 'Completed', 'Cancelled'] as TaskStatus[]).map(
              (statusOption) => (
                <TouchableOpacity
                  key={statusOption}
                  style={[
                    styles.statusButton,
                    status === statusOption && styles.statusButtonActive,
                  ]}
                  onPress={() => setStatus(statusOption)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === statusOption && styles.statusButtonTextActive,
                    ]}
                  >
                    {statusOption}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Attachments</Text>
          <TouchableOpacity style={styles.attachButton} onPress={handleAddAttachment}>
            <Text style={styles.attachButtonText}>+ Add Image</Text>
          </TouchableOpacity>

          {existingAttachments.length > 0 && (
            <View style={styles.attachmentSection}>
              <Text style={styles.attachmentSectionLabel}>Existing</Text>
              <View style={styles.previewContainer}>
                {existingAttachments.map((attachment) => (
                  <View key={attachment.id} style={styles.previewItem}>
                    <Image source={{ uri: attachment.uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveExistingAttachment(attachment.id)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {newAttachments.length > 0 && (
            <View style={styles.attachmentSection}>
              <Text style={styles.attachmentSectionLabel}>New</Text>
              <View style={styles.previewContainer}>
                {newAttachments.map((image, index) => (
                  <View key={index} style={styles.previewItem}>
                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveAttachment(index)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  attachButton: {
    backgroundColor: '#e0e7ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  attachButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
  },
  attachmentSection: {
    marginTop: 8,
  },
  attachmentSectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewItem: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
});
