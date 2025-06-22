import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../styles/header.css";

const HeaderAdmin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("storeId");
    navigate("/login");
  };

  return (
    <div className="header-container">
      <div className="header-title">Dashboard</div>
      <div className="header-actions">
        {currentPath !== "admin/dashboard" && (
          <button className="provider-button" onClick={() => navigate("admin/dashboard")}>
            Dashboard 
          </button>
        )}
        {currentPath !== "/admin/ordenes" && (
          <button className="provider-button" onClick={() => navigate("/admin/ordenes")}>
            Ordenes
          </button>
        )}
        {currentPath !== "admin/stores" && (
          <button className="provider-button" onClick={() => navigate("admin/stores")}>
            Tiendas
          </button>
        )}
        {currentPath !== "admin/customers" && (
          <button className="provider-button" onClick={() => navigate("admin/customers")}>
            Clientes
          </button>
        )}
        {currentPath !== "/admin/products" && (
          <button className="provider-button" onClick={() => navigate("/admin/products")}>
            Productos
          </button>
        )}
        {currentPath !== "admin/reports" && (
          <button className="provider-button" onClick={() => navigate("admin/reports")}>
            Reportes
          </button>
        )}
        <div className="vertical-separator" />
        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default HeaderAdmin;
