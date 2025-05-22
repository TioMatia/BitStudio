import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { clearCart } from "../store/carritoTienda";
import "../styles/carrito.css";

const CarritoPage: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const deliveryFee = cart.storeId ? 2.99 : 0;
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = total + deliveryFee;

  return (
    <div className="cart-page">
      <div className="cart-items">
        {cart.items.length === 0 ? (
          <p>El carrito está vacío.</p>
        ) : (
          cart.items.map((item) => (
            <div key={item.id} className="cart-card">
              <h4>{item.name}</h4>
              <p>Precio unitario: ${item.price.toFixed(2)}</p>
              <p>Cantidad: {item.quantity}</p>
              <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))
        )}
      </div>

      {cart.items.length > 0 && (
        <div className="cart-summary">
          <h3>Resumen del pedido</h3>
          <div className="line">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="line">
            <span>Envío</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <hr />
          <div className="line total">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
          <div className="buttons">
            <button className="pay-button">Ir a pagar</button>
            <button className="clear-button" onClick={handleClearCart}>Vaciar carrito</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoPage;
