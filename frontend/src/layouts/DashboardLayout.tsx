import React from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useAppStore } from '../store/appStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { activeWorkspace } = useAppStore();
  const themeClass = activeWorkspace === 'business' ? 'theme-business' : 'theme-personal';

  return (
    <div className={`min-h-screen bg-background text-foreground flex ${themeClass}`}>
      {/* Background ambient blobs */}
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-cyan"></div>
        <div className="liquid-blob liquid-blob-emerald"></div>
        <div className="liquid-blob liquid-blob-purple"></div>
      </div>

      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        
        {/* Main scrolling slot */}
        <main className="flex-1 mt-20 ml-64 p-8 overflow-y-auto min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
