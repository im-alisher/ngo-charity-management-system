import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/feedback';
import { useAuth } from '@/context/auth-store';

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist or has moved."
        action={
          <Button onClick={() => window.location.assign(isAuthenticated ? '/dashboard' : '/login')}>
            {isAuthenticated ? 'Back to dashboard' : 'Go to sign in'}
          </Button>
        }
      />
    </div>
  );
}
