import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTaskStore } from '../store/taskStore';
import { AnimatedIn } from '../components';
import { useThemeColors } from '../theme';
import type { Colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Task, TaskStatus } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
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

function getStatusColor(status: string, colors: Colors): string {
  switch (status) {
    case 'New':
      return colors.badgeBlue;
    case 'In Progress':
      return colors.badgeAmber;
    case 'Completed':
      return colors.badgeGreen;
    case 'Cancelled':
      return colors.badgeRed;
    default:
      return colors.textTertiary;
  }
}

function TaskCard({
  task,
  onPress,
  colors,
  styles,
}: {
  task: Task;
  onPress: () => void;
  colors: Colors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <AnimatedIn>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${task.title}, status ${task.status}`}
        accessibilityHint="Opens task details"
      >
        <View style={styles.cardHeader}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {task.title}
          </Text>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status, colors) }]}
            accessible={false}
          >
            <Text style={styles.statusText}>{task.status}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Due:</Text>
            <Text style={styles.infoValue}>
              {formatDate(task.dueDate)} at {formatTime(task.dueDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {task.location.address}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedIn>
  );
}

function EmptyState({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No tasks yet</Text>
      <Text style={styles.emptySubtitle}>Tap the + button to create your first task</Text>
    </View>
  );
}

export default function TaskListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { tasks, fetchTasks, isLoading, sortBy, setSortBy } = useTaskStore();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetail', { taskId });
  };

  const handleCreateTask = () => {
    navigation.navigate('TaskCreate');
  };

  const handleRefresh = () => {
    fetchTasks();
  };

  const filteredTasks = tasks.filter((task) => {
    if (searchText.trim() && !task.title.toLowerCase().includes(searchText.trim().toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'All' && task.status !== statusFilter) {
      return false;
    }
    const taskDate = new Date(task.dueDate);
    if (dateFrom && taskDate < dateFrom) {
      return false;
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (taskDate > endOfDay) {
        return false;
      }
    }
    return true;
  });

  const clearFilters = () => {
    setSearchText('');
    setStatusFilter('All');
    setDateFrom(null);
    setDateTo(null);
  };

  const onChangeDateFrom = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDateFromPicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      setDateFrom(selectedDate);
    }
  };

  const onChangeDateTo = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDateToPicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      setDateTo(selectedDate);
    }
  };

  const formatDateShort = (date: Date): string =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const hasActiveFilters =
    searchText.trim() !== '' || statusFilter !== 'All' || dateFrom !== null || dateTo !== null;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by title..."
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Search tasks by title"
        />
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
            accessibilityRole="button"
            accessibilityLabel="Clear filters"
          >
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusFilterScroll}
        >
          <View style={styles.statusFilterRow}>
            {(['All', 'New', 'In Progress', 'Completed', 'Cancelled'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                onPress={() => setStatusFilter(status)}
                accessibilityRole="button"
                accessibilityState={{ selected: statusFilter === status }}
                accessibilityLabel={`Filter by status ${status}`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    statusFilter === status && styles.filterChipTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.dateRangeBar}>
        <TouchableOpacity
          style={styles.dateFilterButton}
          onPress={() => setShowDateFromPicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Set from date filter"
        >
          <Text style={styles.dateFilterText}>
            {dateFrom ? `From: ${formatDateShort(dateFrom)}` : 'From'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateFilterButton}
          onPress={() => setShowDateToPicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Set to date filter"
        >
          <Text style={styles.dateFilterText}>
            {dateTo ? `To: ${formatDateShort(dateTo)}` : 'To'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDateFromPicker && (
        <DateTimePicker
          value={dateFrom || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDateFrom}
        />
      )}
      {showDateToPicker && (
        <DateTimePicker
          value={dateTo || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDateTo}
        />
      )}

      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'dueDate' && styles.sortButtonActive]}
            onPress={() => setSortBy('dueDate')}
            accessibilityRole="button"
            accessibilityState={{ selected: sortBy === 'dueDate' }}
            accessibilityLabel="Sort by due date"
          >
            <Text
              style={[styles.sortButtonText, sortBy === 'dueDate' && styles.sortButtonTextActive]}
            >
              Due Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'createdAt' && styles.sortButtonActive]}
            onPress={() => setSortBy('createdAt')}
            accessibilityRole="button"
            accessibilityState={{ selected: sortBy === 'createdAt' }}
            accessibilityLabel="Sort by date added"
          >
            <Text
              style={[styles.sortButtonText, sortBy === 'createdAt' && styles.sortButtonTextActive]}
            >
              Date Added
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'status' && styles.sortButtonActive]}
            onPress={() => setSortBy('status')}
            accessibilityRole="button"
            accessibilityState={{ selected: sortBy === 'status' }}
            accessibilityLabel="Sort by status"
          >
            <Text
              style={[styles.sortButtonText, sortBy === 'status' && styles.sortButtonTextActive]}
            >
              Status
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item.id)}
            colors={colors}
            styles={styles}
          />
        )}
        ListEmptyComponent={<EmptyState styles={styles} />}
        contentContainerStyle={
          filteredTasks.length === 0 ? styles.emptyListContent : styles.listContent
        }
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateTask}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Create new task"
        accessibilityHint="Opens the create task form"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    searchInput: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      color: colors.text,
    },
    clearFiltersButton: {
      marginLeft: 8,
      padding: 12,
      justifyContent: 'center',
    },
    clearFiltersText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    filterBar: {
      backgroundColor: colors.surface,
      paddingTop: 8,
    },
    statusFilterScroll: {
      flexGrow: 0,
    },
    statusFilterRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 8,
      paddingBottom: 8,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: colors.surface,
    },
    dateRangeBar: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 8,
    },
    dateFilterButton: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
    },
    dateFilterText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    sortBar: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sortLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    sortButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    sortButton: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
    },
    sortButtonActive: {
      backgroundColor: colors.primary,
    },
    sortButtonText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    sortButtonTextActive: {
      color: colors.surface,
    },
    listContent: {
      padding: 16,
      paddingBottom: 80,
    },
    emptyListContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    taskTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.surface,
    },
    cardBody: {
      gap: 8,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginRight: 8,
    },
    infoValue: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
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
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      right: 24,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    fabIcon: {
      fontSize: 32,
      color: colors.surface,
      fontWeight: '300',
      lineHeight: 34,
    },
  });
}
