import React, { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245B85] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none min-h-[44px] px-4 py-2 text-sm';
    
    const variants = {
      default: 'bg-[#163A5F] text-white hover:bg-[#122e4c]',
      secondary: 'bg-[#245B85] text-white hover:bg-[#1d496b]',
      outline: 'border border-[#DCE3EA] bg-white text-[#172B3A] hover:bg-[#F4F7FA]',
      destructive: 'bg-[#B91C1C] text-white hover:bg-[#991b1b]',
      ghost: 'text-[#172B3A] hover:bg-[#F4F7FA]',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-11 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
