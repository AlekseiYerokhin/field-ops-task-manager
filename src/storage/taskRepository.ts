import { getDatabase } from './database';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const task: Task = {
    id: generateId(),
    title: input.title,
    description: input.description,
    dueDate: input.dueDate,
    location: input.location,
    status: input.status || 'New',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
  };

  await db.runAsync(
    `INSERT INTO tasks (id, title, description, dueDate, locationAddress, locationLatitude, locationLongitude, status, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.title,
      task.description,
      task.dueDate,
      task.location.address,
      task.location.latitude || null,
      task.location.longitude || null,
      task.status,
      task.createdAt,
      task.updatedAt,
      task.syncStatus,
    ]
  );

  return task;
}

export async function getTask(id: string): Promise<Task | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<any>('SELECT * FROM tasks WHERE id = ?', [id]);
  
  if (!result) return null;
  
  return mapRowToTask(result);
}

export async function getAllTasks(sortBy: 'createdAt' | 'dueDate' | 'status' = 'dueDate'): Promise<Task[]> {
  const db = await getDatabase();
  
  let orderBy = 'dueDate ASC';
  if (sortBy === 'createdAt') orderBy = 'createdAt DESC';
  else if (sortBy === 'status') orderBy = 'status ASC, dueDate ASC';
  
  const results = await db.getAllAsync<any>(`SELECT * FROM tasks ORDER BY ${orderBy}`);
  
  return results.map(mapRowToTask);
}

export async function updateTask(input: UpdateTaskInput): Promise<Task | null> {
  const db = await getDatabase();
  const existing = await getTask(input.id);
  
  if (!existing) return null;
  
  const updated: Task = {
    ...existing,
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    dueDate: input.dueDate ?? existing.dueDate,
    location: input.location ?? existing.location,
    status: input.status ?? existing.status,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };

  await db.runAsync(
    `UPDATE tasks SET title = ?, description = ?, dueDate = ?, locationAddress = ?, locationLatitude = ?, locationLongitude = ?, status = ?, updatedAt = ?, syncStatus = ? WHERE id = ?`,
    [
      updated.title,
      updated.description,
      updated.dueDate,
      updated.location.address,
      updated.location.latitude || null,
      updated.location.longitude || null,
      updated.status,
      updated.updatedAt,
      updated.syncStatus,
      updated.id,
    ]
  );

  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  return result.changes > 0;
}

function mapRowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.dueDate,
    location: {
      address: row.locationAddress,
      latitude: row.locationLatitude,
      longitude: row.locationLongitude,
    },
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    syncStatus: row.syncStatus,
  };
}
