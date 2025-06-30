import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import type { RootState } from "../store";
import "../styles/header.css";

const HeaderAdmin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro de que quieres cerrar sesión?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="header-container">
      <div className="header-title">Dashboard</div>
      <div className="header-actions">
        {user && (
          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <span className="user-name">{user.firstName}</span>
          </div>
        )}

        {currentPath !== "/admin/dashboard" && (
          <button className="provider-button" onClick={() => navigate("/admin/dashboard")}>
            Dashboard
          </button>
        )}

        {currentPath !== "/admin/stores" && (
          <button className="provider-button" onClick={() => navigate("/admin/stores")}>
            Tiendas
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