import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { TaskRow } from '../Tasks/TaskRow';
import { TaskFormModal } from '../modals/TaskFormModal';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { AlertVariant } from '../../types/ui';
import type { TaskItem } from '../../types/tasks';

export function TasksPage() {
  const { isAuthenticated, isRestoringSession } = useAuth();
  const { tasks, isLoading, error, createTask, updateTask, toggleComplete, removeTask } = useTasks();
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isRestoringSession) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const openAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: { title: string; description: string }) => {
    if (editingTask) {
      await updateTask(editingTask.id, {
        title: values.title,
        description: values.description,
        isCompleted: editingTask.isCompleted,
      });
    } else {
      await createTask(values);
    }
  };

  const openTasks = tasks.filter((task) => !task.isCompleted);

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ink">My Tasks</h1>
        <Button onClick={openAddModal}>Add Task</Button>
      </div>

      {error && (
        <div className="mt-4">
          <Alert variant={AlertVariant.Danger}>{error}</Alert>
        </div>
      )}

      {isLoading ? (
        <p className="mt-6 text-ink-soft">Loading…</p>
      ) : openTasks.length === 0 ? (
        <p className="mt-6 text-ink-soft">No open tasks — add one to get started.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {openTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleComplete={toggleComplete}
              onEdit={openEditModal}
              onDelete={removeTask}
            />
          ))}
        </ul>
      )}

      {isModalOpen && (
        <TaskFormModal task={editingTask} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
      )}
    </section>
  );
}
