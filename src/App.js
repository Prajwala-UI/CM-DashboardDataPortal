import React from 'react';
import { HashRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { AuthProvider } from './Routes/AuthContext';
import { LoaderProvider } from './Layout/LoaderContext';
import AppShell from './Layout/AppShell';
import AppRoutes from './Routes';
import { useInactivityTimer } from './Hooks/useInactivityTimer';

const App = () => {
  // Angular InactivityService is created with the root component, so it also runs on the login page.
  useInactivityTimer();

  return (
    <QueryClientProvider client={queryClient}>
      {/* HashRouter keeps the Angular HashLocationStrategy URLs (e.g. /CM-DashboardDP/#/home) */}
      <HashRouter>
        <AuthProvider>
          <LoaderProvider>
            <AppShell>
              <AppRoutes />
            </AppShell>
          </LoaderProvider>
        </AuthProvider>
      </HashRouter>
    </QueryClientProvider>
  );
};

export default App;
