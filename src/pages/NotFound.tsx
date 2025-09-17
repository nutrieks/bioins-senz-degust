
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e1a] via-[#1a1f3a] to-[#2a3a5c]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
                <p className="text-xl text-white/80 mb-4">Ups! Stranica nije pronađena</p>
                <Link to="/" className="text-blue-300 hover:text-blue-100 underline">
          Povratak na početnu
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
