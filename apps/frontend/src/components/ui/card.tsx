import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={twMerge(clsx('rounded-md border border-[#DCE3EA] bg-white text-[#172B3A] shadow-sm', className))}
    {...props}
  />
);

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={twMerge(clsx('flex flex-col space-y-1.5 p-6 border-b border-[#DCE3EA]', className))} {...props} />
);

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={twMerge(clsx('font-semibold leading-none tracking-tight text-[#163A5F] text-lg', className))} {...props} />
);

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={twMerge(clsx('text-sm text-[#172B3A]/70', className))} {...props} />
);

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={twMerge(clsx('p-6', className))} {...props} />
);

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={twMerge(clsx('flex items-center p-6 pt-0', className))} {...props} />
);
