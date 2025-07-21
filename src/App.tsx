
// Datoteka: src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DebugPanel } from "@/components/DebugPanel";
import { useAppStability } from "@/hooks/useAppStability";
import { useAppRecovery } from "@/hooks/useAppRecovery";
import { centralizedEventService } from "@/services/centralizedEventService";

// Stranice
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EvaluatorDashboard from "./pages/evaluator/EvaluatorDashboard";
import EventDetail from "./pages/admin/event/EventDetail";
import EventsPage from "./pages/admin/events/EventsPage";
import NewEvent from "./pages/admin/events/NewEvent";
import ProductsPage from "./pages/admin/products/ProductsPage";
import NewProductType from "./pages/admin/products/NewProductType";
import EditProductType from "./pages/admin/products/EditProductType";
import UsersPage from "./pages/admin/users/UsersPage";
import Evaluation from "./pages/evaluator/Evaluation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('🚨 Mutation error:', error);
      },
    },
  },
});

// Initialize centralized event service with query client
centralizedEventService.setQueryClient(queryClient);

const AppContent = () => {
  useAppStability();
  useAppRecovery(); // BULLETPROOF RECOVERY
  return (
    <>
      <Toaster />
      <SonnerToaster />
      <DebugPanel />
      {/* React Query DevTools - only shows in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      <Routes>
        {/* JAVNE RUTE */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ZAŠTIĆENE RUTE - SVAKA JE OMOTANA U PROTECTEDROUTE */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/admin/events/new" element={<ProtectedRoute><NewEvent /></ProtectedRoute>} />
        <Route path="/admin/events/:eventId" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/admin/products/new" element={<ProtectedRoute><NewProductType /></ProtectedRoute>} />
        <Route path="/admin/products/edit/:productTypeId" element={<ProtectedRoute><EditProductType /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />

        <Route path="/evaluator" element={<ProtectedRoute><EvaluatorDashboard /></ProtectedRoute>} />
        <Route path="/evaluator/evaluate/:eventId" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />

        {/* 404 RUTA */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
