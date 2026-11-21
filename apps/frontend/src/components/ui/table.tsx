import React, { TableHTMLAttributes, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Table: React.FC<TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table className={twMerge(clsx('w-full caption-bottom text-sm', className))} {...props} />
  </div>
);

export const TableHeader: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={twMerge(clsx('bg-[#F4F7FA] border-b border-[#DCE3EA]', className))} {...props} />
);

export const TableBody: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={twMerge(clsx('[&_tr:last-child]:border-0', className))} {...props} />
);

export const TableRow: React.FC<HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={twMerge(clsx('border-b border-[#DCE3EA] transition-colors hover:bg-[#F4F7FA]/50', className))} {...props} />
);

export const TableHead: React.FC<ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th
    className={twMerge(clsx('h-10 px-4 text-left align-middle font-semibold text-[#163A5F] [&:has([role=checkbox])]:pr-0', className))}
    {...props}
  />
);

export const TableCell: React.FC<TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={twMerge(clsx('p-4 align-middle [&:has([role=checkbox])]:pr-0', className))} {...props} />
);
