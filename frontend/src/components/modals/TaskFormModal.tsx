import { createPortal } from 'react-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { TextField } from '../ui/TextField';
import { TextAreaField } from '../ui/TextAreaField';
import { Button } from '../ui/Button';
import type { TaskItem } from '../../types/tasks';

interface TaskFormValues {
  title: string;
  description: string;
}

interface TaskFormModalProps {
  task?: TaskItem | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

export function TaskFormModal({ task, onClose, onSubmit }: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ title, description });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop — z-[9998] */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />

      {/* Panel — z-[9999] */}
      <div className="fixed z-[9999] top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-ink">{task ? 'Edit Task' : 'Add Task'}</h2>

        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField
            label="Title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <TextAreaField
            label="Description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {task ? 'Save' : 'Add Task'}
            </Button>
          </div>
        </form>
      </div>
    </>,
    document.body,
  );
}
