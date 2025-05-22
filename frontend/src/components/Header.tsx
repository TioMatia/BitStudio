import React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

import "../styles/header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const cartItems = useSelector((state: RootState) => state.cart.items);

  const handleLogout = () => {
 
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="header-container">
      <div className="header-title">BITSTUDIO</div>
      <div className="header-cart">
        <button className="cart-button" onClick={() => navigate("/cart")}>
          <FaShoppingCart className="cart-icon" />
          <span className="cart-text">Ver Carrito</span>
          {cartItems.length > 0 && <span className="cart-indicator" />}
        </button>

        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Header;
