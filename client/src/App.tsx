import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import LoginPage from "@/pages/login";
import POSPage from "@/pages/pos";
import ProductsPage from "@/pages/products";
import ReportsPage from "@/pages/reports";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <ProtectedRoute>
          <POSPage />
        </ProtectedRoute>
      )} />
      <Route path="/login" component={LoginPage} />
      <Route path="/pos" component={() => (
        <ProtectedRoute>
          <POSPage />
        </ProtectedRoute>
      )} />
      <Route path="/products" component={() => (
        <ProtectedRoute>
          <ProductsPage />
        </ProtectedRoute>
      )} />
      <Route path="/reports" component={() => (
        <ProtectedRoute>
          <ReportsPage />
        </ProtectedRoute>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="mobile-container">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
