import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none';

  const variants = {
    default: 'bg-[#163A5F] text-white',
    secondary: 'bg-[#245B85] text-white',
    success: 'bg-[#0F766E] text-white',
    // WCAG 2.2 AA accessible Gold pairing: Gold background paired with dark #172B3A text
    warning: 'bg-[#C49A3A] text-[#172B3A]',
    destructive: 'bg-[#B91C1C] text-white',
    outline: 'border border-[#DCE3EA] text-[#172B3A]',
  };

  return <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props} />;
};
