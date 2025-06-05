import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { clearCart } from "../store/carritoTienda";
import { storeApi, orderApi } from "../api/axios";
import "../styles/carrito.css";

interface Store {
  id: number;
  name: string;
  deliveryFee: number;
  userId: number;
  location: string;
}

const CarritoPage: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const [shippingMethod, setShippingMethod] = useState<"delivery" | "pickup">("delivery");
  const [userAddress, setUserAddress] = useState("");
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

  const handlePago = async () => {
    try {
      const items = cart.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const response = await orderApi.post("/payment/create", {
        items,
        sellerId: storeData?.userId,
      });

      const { init_point } = response.data;
      window.location.href = init_point;
    } catch (err) {
      console.error("❌ Error al crear preferencia de pago:", err);
      alert("Ocurrió un error al intentar iniciar el pago.");
    }
  };

const user = useSelector((state: RootState) => state.auth.user);

const handleCrearOrden = async () => {
  try {
    if (!storeData || (shippingMethod === "delivery" && userAddress.trim() === "")) {
      alert("Por favor, completa la dirección de entrega.");
      return;
    }

    const items = cart.items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = shippingMethod === "delivery" ? storeData.deliveryFee : 0;
    const finalTotal = total + deliveryFee;

    const dto = {
      storeName: storeData.name,
      storeId: storeData.id,
      storeAddress: storeData.location,
      userId: user?.id,
      userName: user ? `${user.firstName} ${user.lastName}` : "",
      userAddress,
      items,
      total: finalTotal,
      status: "pendiente",
      deliveryMethod: shippingMethod,
    };

    const res = await orderApi.post("/orders", dto);
    alert(`✅ Orden creada exitosamente\nNúmero de orden: ${res.data.orderNumber}`);
    dispatch(clearCart());
  } catch (err) {
    console.error("❌ Error al crear orden:", err);
    alert("Ocurrió un error al crear la orden.");
  }
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
          <div className="cart-summary">
            <h3>Resumen del Pedido</h3>

            
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

            
            {shippingMethod === "delivery" && (
              <div className="address-input">
                <label>Dirección de entrega:</label>
                <input
                  type="text"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                />
              </div>
            )}

            
            <div className="line">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="line">
              <span>Envío:</span>
              <span>
                {shippingMethod === 'delivery'
                  ? `$${storeData?.deliveryFee?.toFixed(2) || '0.00'}`
                  : '$0.00'}
              </span>
            </div>
            <div className="line total">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>

            
            <div className="buttons">
              <button className="orden-button" onClick={handleCrearOrden}>
                Hacer orden
              </button>
              <button className="pay-button" onClick={handlePago}>
                Ir a pagar
              </button>
              <button className="clear-button" onClick={handleClearCart}>
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
  </div>
  );
};

export default CarritoPage;
