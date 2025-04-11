
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EvaluatorDashboard from "./pages/evaluator/EvaluatorDashboard";
import Evaluation from "./pages/evaluator/Evaluation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth route */}
            <Route path="/login" element={<Login />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Evaluator routes */}
            <Route path="/evaluator" element={<EvaluatorDashboard />} />
            <Route path="/evaluator/evaluate/:eventId" element={<Evaluation />} />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
