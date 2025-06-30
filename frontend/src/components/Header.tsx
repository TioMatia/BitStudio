import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import "../styles/header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const firstName = useSelector((state: RootState) => state.auth.user?.firstName);
  const hasActiveOrders = useSelector((state: RootState) => state.activeOrders.hasActiveOrders);

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro de que quieres cerrar sesión?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };
  
  return (
    <div className="header-container">
      <div className="header-title">BITSTUDIO</div>
      <div className="header-actions">
         {firstName && (
          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <span className="user-name">{firstName}</span>
          </div>
        )}

        {currentPath !== "/shop" && (
          <button className="provider-button" onClick={() => navigate("/shop")}>
            Tiendas
          </button>
        )}

        {currentPath !== "/history" && (
          <div style={{ position: "relative" }}>
            <button className="provider-button" onClick={() => navigate("/history")}>
              Historial de Compras
            </button>
            {hasActiveOrders && <span className="history-indicator" />}
          </div>
        )}

        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>

        <div className="vertical-separator" />

        <button className="cart-button" onClick={() => navigate("/cart")}>
          <FaShoppingCart className="cart-icon" />
          <span className="cart-text">Ver Carrito</span>
          {cartItems.length > 0 && <span className="cart-indicator" />}
        </button>
      </div>
    </div>
  );
};

export default Header;
