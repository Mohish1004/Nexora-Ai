import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import MobileBottomNav from '../components/dashboard/MobileBottomNav';
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

      {/* Sidebar navigation - desktop only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - desktop only */}
        <div className="hidden lg:block">
          <Topbar />
        </div>
        
        {/* Main scrolling slot */}
        <main className="flex-1 lg:mt-20 p-4 lg:p-8 lg:ml-64 overflow-y-auto min-h-screen lg:min-h-[calc(100vh-5rem)] pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation + AI button */}
      <MobileBottomNav />
    </div>
  );
}
