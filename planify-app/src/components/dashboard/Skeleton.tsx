import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: 'rect' | 'circle' | 'pill';
}

export function Skeleton({ className, shape = 'rect', ...rest }: SkeletonProps) {
  const shapeClass = {
    rect: 'rounded-md',
    circle: 'rounded-full aspect-square',
    pill: 'rounded-full',
  }[shape];

  return (
    <div
      className={cn(
        'dash-shimmer',
        shapeClass,
        'bg-surface-800',
        className,
      )}
      aria-hidden="true"
      {...rest}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
