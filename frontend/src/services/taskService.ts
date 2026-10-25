import { apiClient } from './apiClient';
import type { CreateTaskRequest, TaskItem, UpdateTaskRequest } from '../types/tasks';

export const taskService = {
  async getAll(): Promise<TaskItem[]> {
    const response = await apiClient.get<TaskItem[]>('/tasks');
    return response.data;
  },

  async create(request: CreateTaskRequest): Promise<TaskItem> {
    const response = await apiClient.post<TaskItem>('/tasks', request);
    return response.data;
  },

  async update(taskId: string, request: UpdateTaskRequest): Promise<void> {
    await apiClient.put(`/tasks/${taskId}`, request);
  },

  async remove(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};
