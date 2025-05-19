import React from "react";
import { useSelector } from "react-redux";
import type{ RootState } from "../store";

const CartPreview: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);

  if (cart.items.length === 0) {
    return <p>El carrito está vacío.</p>;
  }

  return (
    <div style={{ padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "8px", marginBottom: "1rem" }}>
      <h3>🛒 Carrito</h3>
      <ul>
        {cart.items.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.price.toFixed(2)} x {item.quantity}
          </li>
        ))}
      </ul>
      <p><strong>Tienda ID:</strong> {cart.storeId}</p>
    </div>
  );
};

export default CartPreview;
