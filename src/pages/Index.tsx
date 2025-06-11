
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cleanupAuthState } from "@/utils/authUtils";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clean up any existing auth state and redirect to login
    cleanupAuthState();
    navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Preusmjeravanje...</h1>
      </div>
    </div>
  );
};

export default Index;
