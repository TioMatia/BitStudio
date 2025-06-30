import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { clearCart,setItemQuantity, removeItem  } from "../store/carritoTienda";
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
    const confirmClear = window.confirm("¿Estás seguro de que deseas vaciar el carrito?");
    if (confirmClear) {
      dispatch(clearCart());
    }
  };

const handlePago = async () => {
  try {
    if (!storeData) {
      alert("No se encontró la tienda");
      return;
    }

  
    const items = cart.items.map((item) => ({
      id: item.id,         
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const payload = { items, sellerId: storeData.userId };

    console.log("Payload a /payment/create:", payload);

    const { data } = await orderApi.post("/payment/create", payload);

  
    window.location.href = data.init_point;
  } catch (error: any) {
    console.error("Error al crear preferencia:", error.response?.data || error);
    alert(error.response?.data?.message ?? "Error al iniciar el pago.");
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
      status: "Pendiente",
      deliveryMethod: shippingMethod,
      deliveryFee,
    };

    const res = await orderApi.post("/orders", dto);
    alert(`Orden creada exitosamente\nNúmero de orden: ${res.data.order.orderNumber}`);
    dispatch(clearCart());
  } catch (err) {
    console.error("Error al crear orden:", err);
    alert("Ocurrió un error al crear la orden.");
  }
};

  const deliveryFee = shippingMethod === "delivery" && storeData ? storeData.deliveryFee : 0;
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = total + deliveryFee;

  return (
    <div className="cart-page">
      <div className="cart-items">
          {storeData && cart.items.length > 0 && (
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
              <p>Precio unitario: {" "} {item.price.toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }) }
              </p>
              <div className="cart-quantity-controls">
                <button
                  onClick={() => {
                    if (item.quantity > 1) {
                      dispatch(setItemQuantity({ itemId: item.id, quantity: item.quantity - 1 }));
                    } else {
                      const confirmDelete = window.confirm("¿Estás seguro que quieres eliminar este producto del carrito?");
                      if (confirmDelete) {
                        dispatch(removeItem(item.id));
                      }
                    }
                  }}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                  <button
                    onClick={() => {
                      if (item.quantity < item.stock) {
                        dispatch(setItemQuantity({ itemId: item.id, quantity: item.quantity + 1 }));
                      }
                    }}
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
              </div>
              <p>Subtotal: {" "} {(item.price*item.quantity).toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }) }
              </p>
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
                  Delivery: {" "} {storeData && `(+${storeData?.deliveryFee.toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })})`}
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
            <span>{total.toLocaleString("es-CL", {
              style: "currency",
              currency: "CLP",
              minimumFractionDigits: 0
            })}</span>
          </div>
          <div className="line">
            <span>Envío:</span>
            <span>{shippingMethod === 'delivery'
              ? storeData?.deliveryFee?.toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0
                }) ?? '$0'
              : '$0'}</span>
          </div>
          <div className="line total">
            <span>Total:</span>
            <span>{finalTotal.toLocaleString("es-CL", {
              style: "currency",
              currency: "CLP",
              minimumFractionDigits: 0
            })}</span>
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
