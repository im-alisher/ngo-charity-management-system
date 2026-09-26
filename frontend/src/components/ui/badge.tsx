import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONE_STYLES: Record<Tone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
  success: 'bg-brand-50 text-brand-800 ring-brand-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-neutral-100 text-ink-muted ring-neutral-200',
};

export interface BadgeProps {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONE_STYLES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
