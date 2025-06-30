import React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { clearCart } from "../store/carritoTienda";
import "../styles/header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPath = location.pathname;

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.auth.user);
  const hasActiveOrders = useSelector((state: RootState) => state.activeOrders.hasActiveOrders);

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro de que quieres cerrar sesión?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");

    dispatch(clearCart()); 
    navigate("/login");
  };

  return (
    <div className="header-container">
      <div className="header-title">BITSTUDIO</div>
      <div className="header-actions">
        {user && (
          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <span className="user-name">{user.firstName}</span>
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