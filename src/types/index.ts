export type TaskStatus = 'New' | 'In Progress' | 'Completed' | 'Cancelled';
export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface TaskLocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  location: TaskLocation;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface TaskWithAttachments extends Task {
  attachments: Attachment[];
}

export interface CreateTaskInput {
  title: string;
  description: string;
  dueDate: string;
  location: TaskLocation;
  status?: TaskStatus;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  status?: TaskStatus;
}

export interface Attachment {
  id: string;
  taskId: string;
  uri: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface CreateAttachmentInput {
  taskId: string;
  uri: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export type HistoryActionType =
  | 'created'
  | 'edited'
  | 'status_changed'
  | 'attachment_added'
  | 'attachment_removed'
  | 'deleted'
  | 'synced';

export interface HistoryLog {
  id: string;
  taskId: string;
  timestamp: string;
  actionType: HistoryActionType;
  description: string;
}

export interface CreateHistoryLogInput {
  taskId: string;
  actionType: HistoryActionType;
  description: string;
}
