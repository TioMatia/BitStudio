import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { clearCart } from "../store/carritoTienda";

const CarritoPage: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <div className="cart-page">
      <h2>🛒 Tu Carrito</h2>
      {cart.items.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <>
          <ul>
            {cart.items.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong><br />
                Precio: ${item.price.toFixed(2)}<br />
                Cantidad: {item.quantity}<br />
                Subtotal: ${(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <hr />
          <h3>
            Total: $
            {cart.items
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toFixed(2)}
          </h3>
          <button onClick={handleClearCart}>Vaciar carrito</button>
        </>
      )}
    </div>
  );
};

export default CarritoPage;
