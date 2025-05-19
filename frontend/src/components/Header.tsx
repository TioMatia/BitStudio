import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import "../styles/header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  return (
    <div className="header-container">
      <button
        className="cart-button"
        onClick={() => navigate("/cart")}
      >
        <FaShoppingCart className="cart-icon" />
        <span className="cart-text">Ver Carrito</span>
        {cartItems.length > 0 && <span className="cart-indicator" />}
      </button>
    </div>
  );
};

export default Header;
