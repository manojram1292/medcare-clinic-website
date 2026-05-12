'use client';
import { ReactNode } from 'react';

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  confirm: string;
  className?: string;
  children?: ReactNode;
};

// Wraps a server-action form with a JS confirm() — keeps the inline
// onClick out of server components.
export default function DeleteButton({ action, id, confirm: confirmMsg, className, children }: Props) {
  return (
    <form action={action} style={{ display: 'inline' }}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={className ?? 'btn btn-danger'}
        onClick={(e) => { if (!window.confirm(confirmMsg)) e.preventDefault(); }}
      >
        {children ?? 'Delete'}
      </button>
    </form>
  );
}
