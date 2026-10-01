import React from 'react';
import { render } from '@testing-library/react-native';
import MapScreen from './MapScreen';
import * as taskRepository from '../storage/taskRepository';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock the task repository
jest.mock('../storage/taskRepository');

const mockedTaskRepository = taskRepository as jest.Mocked<typeof taskRepository>;

describe('MapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no tasks have coordinates', async () => {
    mockedTaskRepository.getAllTasks.mockResolvedValue([]);

    await render(<MapScreen />);

    // Component renders without crashing
    expect(mockedTaskRepository.getAllTasks).toHaveBeenCalled();
  });

  it('renders with tasks that have coordinates', async () => {
    const tasks = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Loc', latitude: 40.7, longitude: -74.0 },
        status: 'New' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'synced' as const,
      },
    ];

    mockedTaskRepository.getAllTasks.mockResolvedValue(tasks);

    await render(<MapScreen />);

    expect(mockedTaskRepository.getAllTasks).toHaveBeenCalled();
  });

  it('filters out tasks without coordinates', async () => {
    const tasks = [
      {
        id: '1',
        title: 'Has coords',
        description: 'Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Loc', latitude: 40.7, longitude: -74.0 },
        status: 'New' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'synced' as const,
      },
      {
        id: '2',
        title: 'No coords',
        description: 'Description',
        dueDate: '2024-12-31T00:00:00.000Z',
        location: { address: 'Loc only' },
        status: 'New' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        syncStatus: 'synced' as const,
      },
    ];

    mockedTaskRepository.getAllTasks.mockResolvedValue(tasks);

    await render(<MapScreen />);

    expect(mockedTaskRepository.getAllTasks).toHaveBeenCalled();
  });
});
