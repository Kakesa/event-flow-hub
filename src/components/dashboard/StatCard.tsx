import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default',
}: StatCardProps) => {
  const variants = {
    default: 'bg-card',
    primary: 'bg-primary/5 border-primary/20',
    success: 'bg-success/5 border-success/20',
    warning: 'bg-warning/5 border-warning/20',
  };

  const iconVariants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in',
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.positive ? 'text-success' : 'text-destructive'
              )}
            >
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs. mois dernier</span>
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconVariants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
