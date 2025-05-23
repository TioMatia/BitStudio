import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { clearCart } from "../store/carritoTienda";
import { storeApi } from "../api/axios";
import "../styles/carrito.css";

interface Store {
  id: number;
  name: string;
  deliveryFee: number;
}

const CarritoPage: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const [shippingMethod, setShippingMethod] = useState<"delivery" | "pickup">("delivery");
  const [storeData, setStoreData] = useState<Store | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      if (cart.storeId) {
        try {
          const res = await storeApi.get<Store>(`/stores/${cart.storeId}`);
          setStoreData(res.data);
        } catch (err) {
          console.error("Error al cargar la tienda del carrito", err);
        }
      } else {
        setStoreData(null);
      }
    };

    fetchStore();
  }, [cart.storeId]);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const deliveryFee = shippingMethod === "delivery" && storeData ? storeData.deliveryFee : 0;
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = total + deliveryFee;

  return (
    <div className="cart-page">
      <div className="cart-items">
        {storeData && (
          <h2 className="store-title">
            Tienda: <a href={`/shop/${cart.storeId}`}>{storeData.name}</a>
          </h2>
        )}
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
        <>
          <div className="shipping-method">
            <h4>Método de envío:</h4>
            <label>
              <input
                type="radio"
                name="shipping"
                value="pickup"
                checked={shippingMethod === "pickup"}
                onChange={() => setShippingMethod("pickup")}
              />
              Retiro en tienda
            </label>
            <label>
              <input
                type="radio"
                name="shipping"
                value="delivery"
                checked={shippingMethod === "delivery"}
                onChange={() => setShippingMethod("delivery")}
              />
              Delivery {storeData && `(+$${storeData.deliveryFee.toFixed(2)})`}
            </label>
          </div>

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
              <button className="clear-button" onClick={handleClearCart}>
                Vaciar carrito
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CarritoPage;
