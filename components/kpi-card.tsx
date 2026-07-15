'use client';

import { motion } from 'framer-motion';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type KpiCardProps = {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  gradient: string;
  delay?: number;
};

export function KpiCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  gradient,
  delay = 0,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card group relative overflow-hidden p-5 premium-shadow"
    >
      <div
        className={cn(
          'absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40',
          gradient
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg',
            gradient
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {change && (
        <div className="relative mt-3 flex items-center gap-1.5">
          {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-success" />}
          {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
          <span
            className={cn(
              'text-xs font-medium',
              trend === 'up' && 'text-success',
              trend === 'down' && 'text-destructive',
              trend === 'neutral' && 'text-muted-foreground'
            )}
          >
            {change}
          </span>
        </div>
      )}
    </motion.div>
  );
}
