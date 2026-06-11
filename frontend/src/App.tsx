import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import AppRoutes from './routes/AppRoutes';
import { useAppStore } from './store/appStore';

export default function App() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const dataLoaded = useAppStore((s) => s.dataLoaded);
  const fetchAllData = useAppStore((s) => s.fetchAllData);

  useEffect(() => {
    if (isAuthenticated && !dataLoaded) {
      fetchAllData();
    }
  }, [isAuthenticated, dataLoaded, fetchAllData]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Analytics />
    </BrowserRouter>
  );
}
