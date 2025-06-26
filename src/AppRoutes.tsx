
import { Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import { UserRole } from "@/types";

// Page imports
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EvaluatorDashboard from "./pages/evaluator/EvaluatorDashboard";
import EventsPage from "./pages/admin/events/EventsPage";
import NewEvent from "./pages/admin/events/NewEvent";
import EventDetail from "./pages/admin/event/EventDetail";
import ProductsPage from "./pages/admin/products/ProductsPage";
import NewProductType from "./pages/admin/products/NewProductType";
import EditProductType from "./pages/admin/products/EditProductType";
import UsersPage from "./pages/admin/users/UsersPage";
import ReportsPage from "./pages/admin/reports/ReportsPage";
import Evaluation from "./pages/evaluator/Evaluation";
import NotFound from "./pages/NotFound";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* JAVNE RUTE */}
      <Route path="/login" element={<Login />} />
      
      {/* ADMIN RUTE - Zaštićene AuthGuard-om */}
      <Route element={<AuthGuard role={UserRole.ADMIN} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<EventsPage />} />
        <Route path="/admin/events/new" element={<NewEvent />} />
        <Route path="/admin/events/:eventId" element={<EventDetail />} />
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/admin/products/new" element={<NewProductType />} />
        <Route path="/admin/products/edit/:productTypeId" element={<EditProductType />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
      </Route>

      {/* EVALUATOR RUTE - Zaštićene AuthGuard-om */}
      <Route element={<AuthGuard role={UserRole.EVALUATOR} />}>
        <Route path="/evaluator" element={<EvaluatorDashboard />} />
        <Route path="/evaluator/evaluate/:eventId" element={<Evaluation />} />
      </Route>
      
      {/* DEFAULT I 404 RUTE */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
