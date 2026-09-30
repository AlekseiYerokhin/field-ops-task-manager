import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import TaskDetailScreen from './TaskDetailScreen';
import * as taskRepository from '../storage/taskRepository';
import * as historyRepository from '../storage/historyRepository';
import { useTaskStore } from '../store/taskStore';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      taskId: '1',
    },
  }),
}));

// Mock repositories
jest.mock('../storage/taskRepository');
jest.mock('../storage/historyRepository');

// Mock the task store
jest.mock('../store/taskStore');

const mockedTaskRepository = taskRepository as jest.Mocked<typeof taskRepository>;
const mockedHistoryRepository = historyRepository as jest.Mocked<typeof historyRepository>;
const mockedUseTaskStore = useTaskStore as jest.MockedFunction<typeof useTaskStore>;

describe('TaskDetailScreen', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'New' as const,
    dueDate: '2024-12-31T00:00:00.000Z',
    location: { address: 'Test Location' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    syncStatus: 'synced' as const,
  };

  const mockHistory = [
    {
      id: '1',
      taskId: '1',
      timestamp: '2024-01-01T00:00:00.000Z',
      actionType: 'created' as const,
      description: 'Task created',
    },
  ];

  const mockDeleteTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedTaskRepository.getTask.mockResolvedValue(mockTask);
    mockedHistoryRepository.getLogsByTask.mockResolvedValue(mockHistory);

    mockedUseTaskStore.mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
      sortBy: 'dueDate',
      fetchTasks: jest.fn(),
      setSortBy: jest.fn(),
      deleteTask: mockDeleteTask,
    } as any);
  });

  it('renders loading state initially', async () => {
    await render(<TaskDetailScreen />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders task details after loading', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeTruthy();
      expect(screen.getByText('Test Description')).toBeTruthy();
      expect(screen.getByText('New')).toBeTruthy();
    });
  });

  it('fetches task data on mount', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(mockedTaskRepository.getTask).toHaveBeenCalledWith('1');
      expect(mockedHistoryRepository.getLogsByTask).toHaveBeenCalledWith('1');
    });
  });

  it('displays task location', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Test Location')).toBeTruthy();
    });
  });

  it('displays due date', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Dec 31, 2024/)).toBeTruthy();
    });
  });

  it('displays attachments count', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('0 attachments')).toBeTruthy();
    });
  });

  it('displays history entries count', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('1 entries')).toBeTruthy();
    });
  });

  it('displays edit button', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeTruthy();
    });
  });

  it('displays change status button', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Change Status')).toBeTruthy();
    });
  });

  it('displays delete button', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeTruthy();
    });
  });

  it('navigates to edit screen when edit button is pressed', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      const editButton = screen.getByText('Edit');
      fireEvent.press(editButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('TaskEdit', { taskId: '1' });
  });

  it('shows error state when task not found', async () => {
    mockedTaskRepository.getTask.mockResolvedValue(null);

    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Task not found')).toBeTruthy();
    });
  });

  it('displays section titles', async () => {
    await render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Description')).toBeTruthy();
      expect(screen.getByText('Due Date')).toBeTruthy();
      expect(screen.getByText('Location')).toBeTruthy();
      expect(screen.getByText('Attachments')).toBeTruthy();
      expect(screen.getByText('History')).toBeTruthy();
    });
  });
});
