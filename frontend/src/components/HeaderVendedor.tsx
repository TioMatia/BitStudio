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
          <button className="logout-button" onClick={handleLogout}>
            Cerrar sesión
          </button>

          <div className="vertical-separator" />
        </div>
    </div>
  );
};

export default Header;
