import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { TaskRow } from '../Tasks/TaskRow';
import { Alert } from '../ui/Alert';
import { AlertVariant } from '../../types/ui';

export function TaskHistoryPage() {
  const { isAuthenticated, isRestoringSession } = useAuth();
  const { tasks, isLoading, error, toggleComplete, removeTask } = useTasks();

  if (isRestoringSession) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const completedTasks = tasks.filter((task) => task.isCompleted);

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Task History</h1>
      <p className="mt-2 text-ink-soft">Completed tasks — reopen one to send it back to your task list.</p>

      {error && (
        <div className="mt-4">
          <Alert variant={AlertVariant.Danger}>{error}</Alert>
        </div>
      )}

      {isLoading ? (
        <p className="mt-6 text-ink-soft">Loading…</p>
      ) : completedTasks.length === 0 ? (
        <p className="mt-6 text-ink-soft">No completed tasks yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {completedTasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggleComplete={toggleComplete} onDelete={removeTask} />
          ))}
        </ul>
      )}
    </section>
  );
}
