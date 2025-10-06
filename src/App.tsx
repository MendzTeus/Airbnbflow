
import { lazy, Suspense } from "react";
import AdminTimeClockPage from "./pages/admin/time-clock/AdminTimeClockPage";
import TimeClockPage from "./pages/time-clock/TimeClockPage";
import TimesheetPage from "./pages/time-clock/TimesheetPage";
import AdjustmentsPage from "./pages/time-clock/AdjustmentsPage";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

// Data Context Provider for sharing data across components
import { DataProvider } from "@/contexts/DataContext";

const AppLayout = lazy(() =>
  import("@/components/layout/AppLayout").then((module) => ({
    default: module.AppLayout,
  }))
);

// Auth pages
const Login = lazy(() => import("./pages/auth/Login"));

// Main pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Property pages
const PropertiesPage = lazy(() => import("./pages/properties/PropertiesPage"));
const PropertyForm = lazy(() => import("./pages/properties/PropertyForm"));
const PropertyDetail = lazy(() => import("./pages/properties/PropertyDetail"));

// Employee pages
const EmployeesPage = lazy(() => import("./pages/employees/EmployeesPage"));
const EmployeeForm = lazy(() => import("./pages/employees/EmployeeForm"));

// Checklist pages
const ChecklistsPage = lazy(() => import("./pages/checklists/ChecklistsPage"));
const ChecklistForm = lazy(() => import("./pages/checklists/ChecklistForm"));

// Access Codes pages
const AccessCodesPage = lazy(() => import("./pages/access-codes/AccessCodesPage"));
const AccessCodeForm = lazy(() => import("./pages/access-codes/AccessCodeForm"));

// Maintenance pages
const MaintenancePage = lazy(() => import("./pages/maintenance/MaintenancePage"));
const MaintenanceForm = lazy(() => import("./pages/maintenance/MaintenanceForm"));

// Profile page
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));

const queryClient = new QueryClient();

const routeFallback = (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={routeFallback}>
                <Routes>
                  {/* Auth routes */}
                  <Route path="/login" element={<Login />} />

                  {/* Redirect root to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Protected routes */}
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Property routes */}
                    <Route path="/properties" element={<PropertiesPage />} />
                    <Route path="/properties/new" element={<PropertyForm />} />
                    <Route path="/properties/:id" element={<PropertyDetail />} />
                    <Route path="/properties/:id/edit" element={<PropertyForm />} />

                    {/* Time Clock routes */}
                    <Route path="/time-clock" element={<TimeClockPage />} />
                    <Route path="/time-clock/timesheet" element={<TimesheetPage />} />
                    <Route path="/time-clock/adjustments" element={<AdjustmentsPage />} />
                    <Route path="/admin/time-clock" element={<AdminTimeClockPage />} />

                    {/* Employee routes */}
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/employees/new" element={<EmployeeForm />} />
                    <Route path="/employees/:id" element={<EmployeesPage />} />
                    <Route path="/employees/:id/edit" element={<EmployeeForm />} />

                    {/* Checklist routes */}
                    <Route path="/checklists" element={<ChecklistsPage />} />
                    <Route path="/checklists/new" element={<ChecklistForm />} />
                    <Route path="/checklists/:id" element={<ChecklistsPage />} />
                    <Route path="/checklists/:id/edit" element={<ChecklistForm />} />

                    {/* Access Codes routes */}
                    <Route path="/access-codes" element={<AccessCodesPage />} />
                    <Route path="/access-codes/new" element={<AccessCodeForm />} />
                    <Route path="/access-codes/:id/edit" element={<AccessCodeForm />} />

                    {/* Maintenance routes */}
                    <Route path="/maintenance" element={<MaintenancePage />} />
                    <Route path="/maintenance/new" element={<MaintenanceForm />} />
                    <Route path="/maintenance/:id/edit" element={<MaintenanceForm />} />

                    {/* Profile route */}
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>

                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
