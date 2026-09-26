import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins class names, letting later Tailwind utilities win over earlier ones.
 *
 * `tailwind-merge` resolves conflicts the same way the cascade does, so a
 * component can accept a `className` override without producing classes such
 * as `p-2 p-4` that depend on stylesheet order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
