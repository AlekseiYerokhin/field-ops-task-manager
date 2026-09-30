import { getDatabase } from './database';
import type { HistoryLog, CreateHistoryLogInput } from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function addLogEntry(input: CreateHistoryLogInput): Promise<HistoryLog> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const log: HistoryLog = {
    id: generateId(),
    taskId: input.taskId,
    timestamp: now,
    actionType: input.actionType,
    description: input.description,
  };

  await db.runAsync(
    `INSERT INTO history_logs (id, taskId, timestamp, actionType, description)
     VALUES (?, ?, ?, ?, ?)`,
    [log.id, log.taskId, log.timestamp, log.actionType, log.description]
  );

  return log;
}

export async function getLogsByTask(taskId: string): Promise<HistoryLog[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<any>(
    'SELECT * FROM history_logs WHERE taskId = ? ORDER BY timestamp DESC',
    [taskId]
  );

  return results.map(mapRowToHistoryLog);
}

export async function getAllLogs(limit: number = 100): Promise<HistoryLog[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<any>(
    'SELECT * FROM history_logs ORDER BY timestamp DESC LIMIT ?',
    [limit]
  );

  return results.map(mapRowToHistoryLog);
}

export async function removeLogsByTask(taskId: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM history_logs WHERE taskId = ?', [taskId]);
  return result.changes;
}

function mapRowToHistoryLog(row: any): HistoryLog {
  return {
    id: row.id,
    taskId: row.taskId,
    timestamp: row.timestamp,
    actionType: row.actionType,
    description: row.description,
  };
}
