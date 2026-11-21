import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-[#DCE3EA] bg-white px-3 py-2 text-sm text-[#172B3A] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#172B3A]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245B85] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error && 'border-[#B91C1C] focus-visible:ring-[#B91C1C]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
