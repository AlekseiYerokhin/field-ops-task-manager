import React from 'react';
import { render } from '@testing-library/react-native';
import HistoryScreen from './HistoryScreen';
import * as historyRepository from '../storage/historyRepository';

// Mock the history repository
jest.mock('../storage/historyRepository');

const mockedHistoryRepository = historyRepository as jest.Mocked<typeof historyRepository>;

describe('HistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing during loading', async () => {
    mockedHistoryRepository.getAllLogs.mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    // Should render without errors
    await render(<HistoryScreen />);
  });

  it('calls getAllLogs on mount', async () => {
    mockedHistoryRepository.getAllLogs.mockResolvedValue([]);

    await render(<HistoryScreen />);

    expect(mockedHistoryRepository.getAllLogs).toHaveBeenCalled();
  });

  it('renders with empty logs', async () => {
    mockedHistoryRepository.getAllLogs.mockResolvedValue([]);

    await render(<HistoryScreen />);

    // Component should render without errors
    expect(mockedHistoryRepository.getAllLogs).toHaveBeenCalled();
  });

  it('renders with history logs', async () => {
    const mockLogs = [
      {
        id: '1',
        taskId: 'task-1',
        timestamp: '2024-01-01T10:00:00.000Z',
        actionType: 'created' as const,
        description: 'Task created',
      },
      {
        id: '2',
        taskId: 'task-1',
        timestamp: '2024-01-01T11:00:00.000Z',
        actionType: 'status_changed' as const,
        description: 'Status changed from New to In Progress',
      },
    ];

    mockedHistoryRepository.getAllLogs.mockResolvedValue(mockLogs);

    await render(<HistoryScreen />);

    expect(mockedHistoryRepository.getAllLogs).toHaveBeenCalled();
  });

  it('handles error when loading logs', async () => {
    mockedHistoryRepository.getAllLogs.mockRejectedValue(new Error('Failed to load'));

    // Should not crash even if there's an error
    await render(<HistoryScreen />);

    expect(mockedHistoryRepository.getAllLogs).toHaveBeenCalled();
  });
});
