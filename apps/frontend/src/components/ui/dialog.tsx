import React, { ReactNode } from 'react';
import { Button } from './button';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        className="w-full max-w-lg rounded-md border border-[#DCE3EA] bg-white p-6 shadow-lg"
      >
        <h2 id="dialog-title" className="text-lg font-semibold text-[#163A5F]">
          {title}
        </h2>
        <p id="dialog-description" className="mt-2 text-sm text-[#172B3A]/80">
          {description}
        </p>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={variant === 'destructive' ? 'destructive' : 'default'} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-md border border-[#DCE3EA] bg-white p-6 shadow-lg"
      >
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`mb-4 ${className}`}>{children}</div>;

export const DialogTitle: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <h2 className={`text-lg font-bold text-[#163A5F] ${className}`}>{children}</h2>;

export const DialogContent: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`my-3 text-sm text-[#172B3A] ${className}`}>{children}</div>;

export const DialogFooter: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`mt-6 flex justify-end space-x-3 ${className}`}>{children}</div>;
