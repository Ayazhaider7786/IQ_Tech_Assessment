import { useCallback, useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import { extractApiError } from '../utils/apiErrors';
import type { CreateTaskRequest, TaskItem, UpdateTaskRequest } from '../types/tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await taskService.getAll();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load tasks.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(
    async (values: CreateTaskRequest) => {
      try {
        await taskService.create(values);
        await loadTasks();
      } catch (err) {
        setError(extractApiError(err, 'Failed to create the task.'));
      }
    },
    [loadTasks],
  );

  const updateTask = useCallback(
    async (taskId: string, values: UpdateTaskRequest) => {
      try {
        await taskService.update(taskId, values);
        await loadTasks();
      } catch (err) {
        setError(extractApiError(err, 'Failed to update the task.'));
      }
    },
    [loadTasks],
  );

  const toggleComplete = useCallback(
    async (task: TaskItem) => {
      await updateTask(task.id, {
        title: task.title,
        description: task.description ?? '',
        isCompleted: !task.isCompleted,
      });
    },
    [updateTask],
  );

  const removeTask = useCallback(
    async (task: TaskItem) => {
      try {
        await taskService.remove(task.id);
        await loadTasks();
      } catch (err) {
        setError(extractApiError(err, 'Failed to delete the task.'));
      }
    },
    [loadTasks],
  );

  return { tasks, isLoading, error, createTask, updateTask, toggleComplete, removeTask, reload: loadTasks };
}
