import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../styles/header.css";

const HeaderVendedor: React.FC = () => {
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
      <div className="header-title">BITSTUDIO</div>
      <div className="header-actions">
        {currentPath !== "/seller/mystore" && (
          <button className="provider-button" onClick={() => navigate("/seller/mystore")}>
            Mi Tienda
          </button>
        )}
        {currentPath !== "/seller/historial" && (
          <button className="provider-button" onClick={() => navigate("/seller/historial")}>
            Historial Ventas
          </button>
        )}
        {currentPath !== "/seller/proveedores" && (
          <button className="provider-button" onClick={() => navigate("/seller/proveedores")}>
            Administrar Proveedores
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

export default HeaderVendedor;
