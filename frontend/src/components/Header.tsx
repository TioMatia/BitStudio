import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { orderApi } from "../api/axios";
import "../styles/header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [hasActiveOrders, setHasActiveOrders] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchActiveOrders = async () => {
      try {
        const res = await orderApi.get(`/orders/user/${userId}`, {
          params: {
            limit: 5,
          },
        });

        const orders = res.data.data || [];

        const hasActive = orders.some((order: any) =>
          ["Pendiente", "Disponible para retiro", "Disponible para delivery"].includes(order.status)
        );

        setHasActiveOrders(hasActive);
      } catch (err) {
        console.error("❌ Error al verificar órdenes activas:", err);
      }
    };

    fetchActiveOrders();
  }, []);

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
