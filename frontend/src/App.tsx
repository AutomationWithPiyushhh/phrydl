import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { LandingPage } from "@/pages/public/LandingPage";
import { AllProperties } from "@/pages/public/AllProperties";
import { PropertyDetails } from "@/pages/public/PropertyDetails";
import { Login } from "@/pages/auth/Login";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardOverview } from "@/pages/dashboard/Overview";
import { PropertyManagement } from "@/pages/properties/PropertyManagement";
import { RegionManagement } from "@/pages/properties/RegionManagement";
import { TenantManagement } from "@/pages/tenants/TenantManagement";
import { RoomAllocation } from "@/pages/rooms/RoomAllocation";
import { PaymentCenter } from "@/pages/financials/PaymentCenter";
import { ExpenseManagement } from "@/pages/financials/ExpenseManagement";
import { TenantLedger } from "@/pages/financials/TenantLedger";
import { ComplaintBoard } from "@/pages/complaints/ComplaintBoard";
import { LeadManagement } from "@/pages/dashboard/LeadManagement";
import { AIAssistant } from "@/pages/intelligence/AIAssistant";
import { Forecasting } from "@/pages/intelligence/Forecasting";
import { Notifications } from "@/pages/intelligence/Notifications";
import { Settings } from "@/pages/settings/Settings";
import { TenantLayout } from "@/components/layout/TenantLayout";
import { TenantHome } from "@/pages/tenant-app/TenantHome";
import { TenantPayments } from "@/pages/tenant-app/TenantPayments";
import { TenantComplaints } from "@/pages/tenant-app/TenantComplaints";
import { TenantProfile } from "@/pages/tenant-app/TenantProfile";
import { TenantDigitalId } from "@/pages/tenant-app/TenantDigitalId";
import { TenantSettings } from "@/pages/tenant-app/TenantSettings";
import { TenantSupport } from "@/pages/tenant-app/TenantSupport";
import { TenantNotifications } from "@/pages/tenant-app/TenantNotifications";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessDenied } from "@/pages/auth/AccessDenied";
import { Toaster } from "sonner";

import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-accent/30 selection:text-accent-foreground">
              <Toaster position="top-right" richColors />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/properties" element={<AllProperties />} />
                <Route path="/property/:slug" element={<PropertyDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/403" element={<AccessDenied />} />

                {/* Protected Dashboard Routes */}
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<DashboardOverview />} />
                    <Route path="/complaints" element={<ComplaintBoard />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Route>
                </Route>

                {/* Manager & Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/leads" element={<LeadManagement />} />
                    <Route path="/properties" element={<PropertyManagement />} />
                    <Route path="/tenants" element={<TenantManagement />} />
                    <Route path="/rooms" element={<RoomAllocation />} />
                    <Route path="/payments" element={<PaymentCenter />} />
                    <Route path="/ledger" element={<TenantLedger />} />
                  </Route>
                </Route>

              {/* Admin & Super Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/expenses" element={<ExpenseManagement />} />
                  <Route path="/ai" element={<AIAssistant />} />
                  <Route path="/forecasting" element={<Forecasting />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/regions" element={<RegionManagement />} />
                </Route>
              </Route>

              {/* Tenant Routes */}
              <Route element={<ProtectedRoute allowedRoles={['TENANT']} />}>
                <Route path="/tenant" element={<TenantLayout />}>
                  <Route index element={<TenantHome />} />
                  <Route path="payments" element={<TenantPayments />} />
                  <Route path="complaints" element={<TenantComplaints />} />
                  <Route path="profile" element={<TenantProfile />} />
                  <Route path="id" element={<TenantDigitalId />} />
                  <Route path="settings" element={<TenantSettings />} />
                  <Route path="support" element={<TenantSupport />} />
                  <Route path="notifications" element={<TenantNotifications />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
