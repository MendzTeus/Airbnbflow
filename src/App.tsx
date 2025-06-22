
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Data Context Provider for sharing data across components
import { DataProvider } from "@/contexts/DataContext";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Main pages
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Property pages
import PropertiesPage from "./pages/properties/PropertiesPage";
import PropertyForm from "./pages/properties/PropertyForm";
import PropertyDetail from "./pages/properties/PropertyDetail";

// Employee pages
import EmployeesPage from "./pages/employees/EmployeesPage";
import EmployeeForm from "./pages/employees/EmployeeForm";

// Checklist pages
import ChecklistsPage from "./pages/checklists/ChecklistsPage";
import ChecklistForm from "./pages/checklists/ChecklistForm";

// Access Codes pages
import AccessCodesPage from "./pages/access-codes/AccessCodesPage";
import AccessCodeForm from "./pages/access-codes/AccessCodeForm";

// Maintenance pages
import MaintenancePage from "./pages/maintenance/MaintenancePage";
import MaintenanceForm from "./pages/maintenance/MaintenanceForm";

// Calendar page
import CalendarPage from "./pages/calendar/CalendarPage";

// Profile page
import ProfilePage from "./pages/profile/ProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
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
                  
                  {/* Calendar route */}
                  <Route path="/calendar" element={<CalendarPage />} />
                  
                  {/* Profile route */}
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
