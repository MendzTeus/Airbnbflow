
import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
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
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const isMobile = useIsMobile();
  const { theme } = useSettings();
  const { t } = useTranslation();
  const location = useLocation();

  // Close mobile sidebar when changing screen size
  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile, location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-muted-foreground px-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Carregando suas informações...</p>
          <p className="text-xs">
            {isOnline
              ? "Isso pode levar alguns segundos."
              : "Sem conexão com a internet. Reconecte-se para continuar."}
          </p>
        </div>
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
            <h1 className="text-xl font-bold text-primary ml-2">MCRh</h1>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div key={location.pathname} className="page-fade">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
