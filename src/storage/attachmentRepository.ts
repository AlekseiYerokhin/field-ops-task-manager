import { getDatabase } from './database';
import type { Attachment, CreateAttachmentInput } from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function addAttachment(input: CreateAttachmentInput): Promise<Attachment> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const attachment: Attachment = {
    id: generateId(),
    taskId: input.taskId,
    uri: input.uri,
    fileName: input.fileName,
    mimeType: input.mimeType,
    size: input.size,
    createdAt: now,
  };

  await db.runAsync(
    `INSERT INTO attachments (id, taskId, uri, fileName, mimeType, size, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      attachment.id,
      attachment.taskId,
      attachment.uri,
      attachment.fileName,
      attachment.mimeType,
      attachment.size,
      attachment.createdAt,
    ]
  );

  return attachment;
}

export async function getAttachmentsByTask(taskId: string): Promise<Attachment[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<any>(
    'SELECT * FROM attachments WHERE taskId = ? ORDER BY createdAt DESC',
    [taskId]
  );

  return results.map(mapRowToAttachment);
}

export async function getAttachment(id: string): Promise<Attachment | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<any>('SELECT * FROM attachments WHERE id = ?', [id]);

  if (!result) return null;

  return mapRowToAttachment(result);
}

export async function removeAttachment(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM attachments WHERE id = ?', [id]);
  return result.changes > 0;
}

export async function removeAttachmentsByTask(taskId: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM attachments WHERE taskId = ?', [taskId]);
  return result.changes;
}

function mapRowToAttachment(row: any): Attachment {
  return {
    id: row.id,
    taskId: row.taskId,
    uri: row.uri,
    fileName: row.fileName,
    mimeType: row.mimeType,
    size: row.size,
    createdAt: row.createdAt,
  };
}
