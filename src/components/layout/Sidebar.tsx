
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Building,
  Users,
  ClipboardCheck,
  Key,
  Wrench,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Moon,
  Sun,
  Languages,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isMobile: boolean;
  toggleMobileSidebar?: () => void;
}

export function Sidebar({ isMobile, toggleMobileSidebar }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user, isRoleLoading } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme, language, setLanguage } = useSettings();
  const { t } = useTranslation();

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    {
      name: t("common.dashboard"),
      icon: Home,
      href: "/dashboard",
    },
    {
      name: t("common.timeClock"),
      icon: Clock,
      href: "/time-clock",
    },
    {
      name: t("common.properties"),
      icon: Building,
      href: "/properties",
    },
    {
      name: t("common.employees"),
      icon: Users,
      href: "/employees",
    },
    {
      name: t("common.checklists"),
      icon: ClipboardCheck,
      href: "/checklists",
    },
    {
      name: t("common.accessCodes"),
      icon: Key,
      href: "/access-codes",
    },
    {
      name: t("common.maintenance"),
      icon: Wrench,
      href: "/maintenance",
    },
    {
      name: t("common.profile"),
      icon: User,
      href: "/profile",
    },
  ];

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out bg-sidebar border-r border-sidebar-border h-screen flex flex-col",
        collapsed ? "w-16" : "w-64",
        isMobile && "fixed z-50"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <h1 className="text-xl font-bold text-primary truncate">
            MCRh
          </h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={isMobile ? toggleMobileSidebar : toggleCollapse}
        >
          {isMobile ? (
            <Menu size={20} />
          ) : collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center"
              )}
              onClick={() => {
                if (isMobile && toggleMobileSidebar) {
                  toggleMobileSidebar();
                }
              }}
            >
              <item.icon size={20} className={collapsed ? "" : "mr-3"} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-2 border-t border-sidebar-border space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            <div className="font-medium text-sidebar-foreground">{user.name}</div>
            <div>{isRoleLoading ? t("common.loading") : user.role}</div>
          </div>
        )}
        {/* Theme toggle */}
        {!collapsed ? (
          <div className="flex justify-between items-center px-3 py-2">
            <span className="text-sm font-medium text-sidebar-foreground">{t("common.darkMode")}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="ml-2"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-full flex justify-center"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        )}

        {/* Language selector */}
        {!collapsed ? (
          <div className="flex justify-between items-center px-3 py-2">
            <span className="text-sm font-medium text-sidebar-foreground">{t("common.language")}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Languages size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  {t("common.english")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("pt-br")}>
                  {t("common.portuguese")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full flex justify-center">
                <Languages size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                {t("common.english")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("pt-br")}>
                {t("common.portuguese")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Logout button */}
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            if (isMobile && toggleMobileSidebar) {
              toggleMobileSidebar();
            }
          }}
          className={cn(
            "w-full flex items-center text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            collapsed && "justify-center p-2"
          )}
        >
          <LogOut size={20} className={collapsed ? "" : "mr-2"} />
          {!collapsed && <span>{t("common.logout")}</span>}
        </Button>
        {!collapsed && user && (
          <div className="mt-2 text-xs text-muted-foreground px-3">
            {t("common.loggedInAs")}{" "}
            <span className="font-medium">{isRoleLoading ? t("common.loading") : user.role}</span>
          </div>
        )}
      </div>
    </div>
  );
}
