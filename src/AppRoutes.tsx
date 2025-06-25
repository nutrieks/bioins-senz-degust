
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

// Pages
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import EventsPage from "@/pages/admin/events/EventsPage";
import NewEvent from "@/pages/admin/events/NewEvent";
import EventDetail from "@/pages/admin/event/EventDetail";
import ProductsPage from "@/pages/admin/products/ProductsPage";
import NewProductType from "@/pages/admin/products/NewProductType";
import EditProductType from "@/pages/admin/products/EditProductType";
import UsersPage from "@/pages/admin/users/UsersPage";
import ReportsPage from "@/pages/admin/reports/ReportsPage";

// Evaluator Pages
import EvaluatorDashboard from "@/pages/evaluator/EvaluatorDashboard";
import Evaluation from "@/pages/evaluator/Evaluation";

const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: UserRole[] 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect */}
      <Route 
        path="/" 
        element={
          user ? (
            user.role === UserRole.ADMIN ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/evaluator" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/events" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <EventsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/events/new" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <NewEvent />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/events/:eventId" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <EventDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/products" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <ProductsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/products/new" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <NewProductType />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/products/:productTypeId/edit" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <EditProductType />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <UsersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <ReportsPage />
          </ProtectedRoute>
        } 
      />

      {/* Evaluator routes */}
      <Route 
        path="/evaluator" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.EVALUATOR]}>
            <EvaluatorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/evaluator/evaluate/:eventId" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.EVALUATOR]}>
            <Evaluation />
          </ProtectedRoute>
        } 
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
