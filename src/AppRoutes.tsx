
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AuthGuard from "@/components/AuthGuard";
import { UserRole } from "@/types";

// Pages
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
import ReportsPage from "./pages/admin/reports/ReportsPage";
import Evaluation from "./pages/evaluator/Evaluation";
import NotFound from "./pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      {/* JAVNE RUTE */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ZAŠTIĆENE ADMINISTRATORSKE RUTE */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
      <Route path="/admin/events/new" element={<ProtectedRoute><NewEvent /></ProtectedRoute>} />
      <Route path="/admin/events/:eventId" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/admin/products/new" element={<ProtectedRoute><NewProductType /></ProtectedRoute>} />
      <Route path="/admin/products/edit/:productTypeId" element={<ProtectedRoute><EditProductType /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

      {/* ZAŠTIĆENE EVALUATORSKE RUTE */}
      <Route path="/evaluator" element={<ProtectedRoute><EvaluatorDashboard /></ProtectedRoute>} />
      <Route path="/evaluator/evaluate/:eventId" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />

      {/* 404 RUTA */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
