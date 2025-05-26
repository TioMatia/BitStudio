import React from "react";
import { useNavigate } from "react-router-dom";


import "../styles/header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
 
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="header-container">
      <div className="header-title">BITSTUDIO</div>
        <div className="header-actions">

          <button className="provider-button" onClick={() => navigate("/admin/proveedores")}>
              Historial Ventas
            </button>
          <button className="provider-button" onClick={() => navigate("/admin/proveedores")}>
              Administrar Proveedores
            </button>
        <div className="vertical-separator" />
          <button className="logout-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
    </div>
  );
};

export default Header;
