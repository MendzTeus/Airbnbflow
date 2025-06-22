
import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "@/hooks/use-translation";

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { theme } = useSettings();
  const { t } = useTranslation();

  // Close mobile sidebar when changing screen size
  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Desktop sidebar (always visible) */}
      {!isMobile && <Sidebar isMobile={false} />}

      {/* Mobile sidebar */}
      {isMobile && mobileSidebarOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20" 
            onClick={toggleMobileSidebar}
          ></div>
          
          {/* Sidebar */}
          <Sidebar isMobile={true} toggleMobileSidebar={toggleMobileSidebar} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile only) */}
        {isMobile && (
          <div className="h-16 border-b bg-background flex items-center px-4">
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar}>
              <Menu size={24} />
            </Button>
            <h1 className="text-xl font-bold text-primary ml-2">airbnbFlow</h1>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
