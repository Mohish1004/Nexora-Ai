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
    <div className={`min-h-screen bg-background text-foreground flex ${themeClass}`}>
      {/* Background ambient blobs */}
      <div className="liquid-bg">
        <div className="liquid-blob liquid-blob-cyan"></div>
        <div className="liquid-blob liquid-blob-emerald"></div>
        <div className="liquid-blob liquid-blob-purple"></div>
      </div>

      {/* Mobile overlay when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation - slideable */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - desktop only */}
        <div className="hidden lg:block">
          <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        
        {/* Main scrolling slot */}
        <main className={`flex-1 lg:mt-20 p-4 lg:p-8 overflow-y-auto min-h-screen lg:min-h-[calc(100vh-5rem)] pb-24 lg:pb-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation + AI button */}
      <MobileBottomNav />

      {/* Hamburger toggle for mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg glass-card border border-white/10 flex items-center justify-center text-gray-300 hover:text-white"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}
