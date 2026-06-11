import { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import MobileBottomNav from '../components/dashboard/MobileBottomNav';
import { useAppStore } from '../store/appStore';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { activeWorkspace } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const themeClass = activeWorkspace === 'business' ? 'theme-business' : 'theme-personal';

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-[280px_1fr] grid-rows-[72px_1fr] min-h-screen bg-background text-foreground ${themeClass}`}>
      {/* Background ambient blobs */}
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-cyan"></div>
        <div className="liquid-blob liquid-blob-emerald"></div>
        <div className="liquid-blob liquid-blob-purple"></div>
      </div>

      {/* Mobile overlay when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Topbar - spans full width (1st row, both columns) */}
      <header className="col-span-1 lg:col-span-2 z-20 hidden lg:block">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </header>

      {/* Sidebar - 2nd row, 1st column on desktop; slideable overlay on mobile */}
      <aside
        className={`row-start-2 col-span-1 ${
          sidebarOpen ? 'fixed inset-y-0 left-0 z-40 w-[85vw] max-w-[280px] lg:static lg:w-full' : 'hidden lg:block'
        } transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content - 2nd row, 2nd column on desktop */}
      <main className="row-start-2 col-span-1 lg:col-span-1 p-4 lg:p-8 overflow-y-auto min-h-screen pb-24 lg:pb-8">
        {children}
      </main>

      {/* Mobile bottom navigation + AI button */}
      <MobileBottomNav />

      {/* Hamburger toggle for mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg glass-card flex items-center justify-center text-gray-300 hover:text-white"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}
