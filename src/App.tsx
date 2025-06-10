
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";
import { Properties } from "./pages/Properties";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<Index />} />
            <Route 
              path="/properties" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Properties />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rentals" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900">Rentals</h1>
                      <p className="text-gray-600 mt-2">Rental management coming soon</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payments" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                      <p className="text-gray-600 mt-2">Payment management coming soon</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tenants" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
                      <p className="text-gray-600 mt-2">Tenant management coming soon</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                      <p className="text-gray-600 mt-2">Settings coming soon</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
