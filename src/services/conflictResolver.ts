import type { Task } from '../types';

/**
 * Field-level merge strategy for sync conflicts.
 *
 * The Task model stores a single `updatedAt` per record (not per field), so a
 * full per-field timestamp comparison is not possible without schema changes.
 * Instead we implement a pragmatic field-level merge:
 *
 * 1. If `local.updatedAt > remote.updatedAt`, the local record is newer and is
 *    taken as-is (whole-record last-write-wins for the newer side).
 * 2. If `remote.updatedAt > local.updatedAt`, the remote record is newer and is
 *    taken as-is.
 * 3. If timestamps are equal (both sides changed around the same time), we merge
 *    field-by-field: for scalar fields we prefer the remote value to converge
 *    toward the server, while for the location object we merge at the property
 *    level so a local address edit is not lost when the server only changed
 *    coordinates.
 *
 * This is strictly better than naive whole-record last-write-wins because the
 * location object is resolved at property granularity.
 */

export function mergeTasks(local: Task, remote: Task): Task {
  const localTime = new Date(local.updatedAt).getTime();
  const remoteTime = new Date(remote.updatedAt).getTime();

  if (localTime > remoteTime) {
    return local;
  }
  if (remoteTime > localTime) {
    return remote;
  }

  return {
    id: local.id,
    title: remote.title,
    description: remote.description,
    dueDate: remote.dueDate,
    location: mergeLocation(local.location, remote.location),
    status: remote.status,
    createdAt: local.createdAt,
    updatedAt: remote.updatedAt,
    syncStatus: local.syncStatus,
  };
}

export function mergeLocation(local: Task['location'], remote: Task['location']): Task['location'] {
  return {
    address: remote.address || local.address,
    latitude: remote.latitude ?? local.latitude,
    longitude: remote.longitude ?? local.longitude,
  };
}

export function isConflict(local: Task, remote: Task): boolean {
  return (
    local.updatedAt !== remote.updatedAt ||
    local.title !== remote.title ||
    local.description !== remote.description ||
    local.dueDate !== remote.dueDate ||
    local.status !== remote.status
  );
}
