
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Samo preusmjeravamo na login, bez čišćenja stanja,
    // kako bi se izbjegli konflikti s inicijalizacijom AuthContext-a.
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
