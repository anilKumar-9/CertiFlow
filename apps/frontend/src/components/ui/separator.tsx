import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Separator: React.FC<SeparatorProps> = ({
  className,
  orientation = 'horizontal',
  ...props
}) => (
  <div
    className={cn(
      'shrink-0 bg-[#DCE3EA]',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className
    )}
    {...props}
  />
);
