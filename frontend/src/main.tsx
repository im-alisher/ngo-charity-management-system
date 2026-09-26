import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppRouter } from '@/routes/router';
import { createQueryClient } from '@/lib/query-client';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/context/toast-context';
import { ToastViewport } from '@/components/feedback/toast-viewport';

import '@/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found in index.html.');

// The client is created once per page load; React Query owns its own cache.
const queryClient = createQueryClient();

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
          <ToastViewport />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
