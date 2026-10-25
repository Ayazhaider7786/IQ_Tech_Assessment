import { Button } from '../ui/Button';
import type { TaskItem } from '../../types/tasks';

interface TaskRowProps {
  task: TaskItem;
  onToggleComplete: (task: TaskItem) => void;
  onEdit?: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
}

export function TaskRow({ task, onToggleComplete, onEdit, onDelete }: TaskRowProps) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface-raised p-4">
      <div>
        <p className={`font-medium ${task.isCompleted ? 'text-muted line-through' : 'text-ink'}`}>{task.title}</p>
        {task.description && <p className="text-sm text-ink-soft">{task.description}</p>}
      </div>
      <div className="flex gap-2">
        <Button variant={task.isCompleted ? 'secondary' : 'primary'} onClick={() => onToggleComplete(task)}>
          {task.isCompleted ? 'Reopen' : 'Complete'}
        </Button>
        {onEdit && (
          <Button variant="ghost" onClick={() => onEdit(task)}>
            Edit
          </Button>
        )}
        <Button variant="ghost" onClick={() => onDelete(task)}>
          Delete
        </Button>
      </div>
    </li>
  );
}
