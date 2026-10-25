export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  isCompleted: boolean;
}
