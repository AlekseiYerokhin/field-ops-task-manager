import { mergeTasks, mergeLocation, isConflict } from './conflictResolver';
import type { Task } from '../types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    title: 'Task',
    description: 'Description',
    dueDate: '2024-12-31T00:00:00.000Z',
    location: { address: 'Location' },
    status: 'New',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    syncStatus: 'pending',
    ...overrides,
  };
}

describe('conflictResolver', () => {
  describe('mergeTasks', () => {
    it('returns local when local is newer', () => {
      const local = makeTask({ title: 'Local Edit', updatedAt: '2024-01-02T00:00:00.000Z' });
      const remote = makeTask({ title: 'Remote Edit', updatedAt: '2024-01-01T00:00:00.000Z' });

      expect(mergeTasks(local, remote)).toEqual(local);
    });

    it('returns remote when remote is newer', () => {
      const local = makeTask({ title: 'Local Edit', updatedAt: '2024-01-01T00:00:00.000Z' });
      const remote = makeTask({ title: 'Remote Edit', updatedAt: '2024-01-02T00:00:00.000Z' });

      expect(mergeTasks(local, remote)).toEqual(remote);
    });

    it('merges field-by-field when timestamps are equal', () => {
      const local = makeTask({ title: 'Local Title', updatedAt: '2024-01-01T00:00:00.000Z' });
      const remote = makeTask({
        title: 'Remote Title',
        description: 'Remote Description',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const merged = mergeTasks(local, remote);

      // Scalar fields prefer remote on equal timestamps
      expect(merged.title).toBe('Remote Title');
      expect(merged.description).toBe('Remote Description');
      expect(merged.id).toBe('1');
    });

    it('preserves local location address when remote only has coordinates', () => {
      const local = makeTask({
        location: { address: 'Local Address' },
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      const remote = makeTask({
        location: { address: '', latitude: 40.7, longitude: -74.0 },
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const merged = mergeTasks(local, remote);

      expect(merged.location.address).toBe('Local Address');
      expect(merged.location.latitude).toBe(40.7);
      expect(merged.location.longitude).toBe(-74.0);
    });

    it('keeps id from local', () => {
      const local = makeTask({ id: 'local-id' });
      const remote = makeTask({ id: 'remote-id' });

      const merged = mergeTasks(local, remote);

      expect(merged.id).toBe('local-id');
    });
  });

  describe('mergeLocation', () => {
    it('prefers remote address when present', () => {
      const local = { address: 'Local' };
      const remote = { address: 'Remote', latitude: 1, longitude: 2 };

      expect(mergeLocation(local, remote)).toEqual(remote);
    });

    it('falls back to local address when remote is empty', () => {
      const local = { address: 'Local', latitude: 5, longitude: 6 };
      const remote = { address: '', latitude: 7, longitude: 8 };

      expect(mergeLocation(local, remote)).toEqual({
        address: 'Local',
        latitude: 7,
        longitude: 8,
      });
    });

    it('fills missing coordinates from local', () => {
      const local = { address: 'Local', latitude: 5, longitude: 6 };
      const remote = { address: 'Remote' };

      expect(mergeLocation(local, remote)).toEqual({
        address: 'Remote',
        latitude: 5,
        longitude: 6,
      });
    });
  });

  describe('isConflict', () => {
    it('returns true when title differs', () => {
      expect(isConflict(makeTask({ title: 'A' }), makeTask({ title: 'B' }))).toBe(true);
    });

    it('returns false for identical tasks', () => {
      expect(isConflict(makeTask(), makeTask())).toBe(false);
    });

    it('returns true when status differs', () => {
      expect(isConflict(makeTask({ status: 'New' }), makeTask({ status: 'Completed' }))).toBe(true);
    });
  });
});
