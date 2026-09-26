import { cn } from '@/lib/cn';

export interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-lg border border-neutral-200 bg-white shadow-card', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: CardProps) {
  return <h2 className={cn('text-base font-semibold text-ink', className)}>{children}</h2>;
}

export function CardBody({ className, children }: CardProps) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
