import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BadgeProps } from '../../types/components';

const badgeVariantClasses: Record<string, string> = {
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
  outline: 'text-foreground border-border',
  success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
  warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  danger: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
  info: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/50',
};

export const badgeVariants = ({ variant = 'default', className = '' }: any = {}) => {
  return twMerge(
    clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
      badgeVariantClasses[variant] || badgeVariantClasses.default,
      className
    )
  );
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className,
  ...rest
}) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
          badgeVariantClasses[variant] || badgeVariantClasses.default,
          className
        )
      )}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Badge;
