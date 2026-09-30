import { render, screen, fireEvent } from '@testing-library/react-native';
import TaskListScreen from './TaskListScreen';
import { useTaskStore } from '../store/taskStore';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock the store
jest.mock('../store/taskStore', () => ({
  useTaskStore: jest.fn(),
}));

const mockUseTaskStore = useTaskStore as jest.MockedFunction<typeof useTaskStore>;

describe('TaskListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no tasks exist', () => {
    mockUseTaskStore.mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
      sortBy: 'dueDate',
      fetchTasks: jest.fn(),
      setSortBy: jest.fn(),
      deleteTask: jest.fn(),
    });

    render(<TaskListScreen />);

    expect(screen.getByText('No tasks yet')).toBeTruthy();
    expect(screen.getByText('Tap the + button to create your first task')).toBeTruthy();
  });

  it('renders task list when tasks exist', () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Test Task 1',
        description: 'Description 1',
        dueDate: '2026-10-15T14:00:00.000Z',
        location: { address: '123 Main St' },
        status: 'New' as const,
        createdAt: '2026-09-30T10:00:00.000Z',
        updatedAt: '2026-09-30T10:00:00.000Z',
        syncStatus: 'synced' as const,
      },
      {
        id: '2',
        title: 'Test Task 2',
        description: 'Description 2',
        dueDate: '2026-10-16T14:00:00.000Z',
        location: { address: '456 Oak Ave' },
        status: 'In Progress' as const,
        createdAt: '2026-09-30T11:00:00.000Z',
        updatedAt: '2026-09-30T11:00:00.000Z',
        syncStatus: 'synced' as const,
      },
    ];

    mockUseTaskStore.mockReturnValue({
      tasks: mockTasks,
      isLoading: false,
      error: null,
      sortBy: 'dueDate',
      fetchTasks: jest.fn(),
      setSortBy: jest.fn(),
      deleteTask: jest.fn(),
    });

    render(<TaskListScreen />);

    expect(screen.getByText('Test Task 1')).toBeTruthy();
    expect(screen.getByText('Test Task 2')).toBeTruthy();
    expect(screen.getByText('123 Main St')).toBeTruthy();
    expect(screen.getByText('456 Oak Ave')).toBeTruthy();
  });

  it('navigates to task detail when task is pressed', () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Description',
        dueDate: '2026-10-15T14:00:00.000Z',
        location: { address: '123 Main St' },
        status: 'New' as const,
        createdAt: '2026-09-30T10:00:00.000Z',
        updatedAt: '2026-09-30T10:00:00.000Z',
        syncStatus: 'synced' as const,
      },
    ];

    mockUseTaskStore.mockReturnValue({
      tasks: mockTasks,
      isLoading: false,
      error: null,
      sortBy: 'dueDate',
      fetchTasks: jest.fn(),
      setSortBy: jest.fn(),
      deleteTask: jest.fn(),
    });

    render(<TaskListScreen />);

    fireEvent.press(screen.getByText('Test Task'));

    expect(mockNavigate).toHaveBeenCalledWith('TaskDetail', { taskId: '1' });
  });

  it('navigates to task create screen when FAB is pressed', () => {
    mockUseTaskStore.mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
      sortBy: 'dueDate',
      fetchTasks: jest.fn(),
      setSortBy: jest.fn(),
      deleteTask: jest.fn(),
    });

    render(<TaskListScreen />);

    fireEvent.press(screen.getByText('+'));

    expect(mockNavigate).toHaveBeenCalledWith('TaskCreate');
  });

  it('displays sorting options', () => {
    mockUseTaskStore.mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
      sortBy: 'dueDate',
      fetchTasks: jest.fn(),
      setSortBy: jest.fn(),
      deleteTask: jest.fn(),
    });

    render(<TaskListScreen />);

    expect(screen.getByText('Due Date')).toBeTruthy();
    expect(screen.getByText('Date Added')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
  });

  it('calls setSortBy when sort option is pressed', () => {
    const mockSetSortBy = jest.fn();
    mockUseTaskStore.mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
      sortBy: 'dueDate',
      fetchTasks: jest.fn(),
      setSortBy: mockSetSortBy,
      deleteTask: jest.fn(),
    });

    render(<TaskListScreen />);

    fireEvent.press(screen.getByText('Date Added'));

    expect(mockSetSortBy).toHaveBeenCalledWith('createdAt');
  });

  it('shows loading indicator when isLoading is true', () => {
    mockUseTaskStore.mockReturnValue({
      tasks: [],
      isLoading: true,
      error: null,
      sortBy: 'dueDate',
      fetchTasks: jest.fn(),
      setSortBy: jest.fn(),
      deleteTask: jest.fn(),
    });

    render(<TaskListScreen />);

    // RefreshControl should be refreshing
    const refreshControl = screen.getByTestId('refresh-control');
    expect(refreshControl.props.refreshing).toBe(true);
  });
});
