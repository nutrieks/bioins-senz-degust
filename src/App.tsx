
// Datoteka: src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import "./App.css";

// Create a client with optimized default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly known as cacheTime)
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

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

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
