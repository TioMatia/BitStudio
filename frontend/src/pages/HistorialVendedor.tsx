import { useEffect, useState } from "react";
import { orderApi } from "../api/axios";
import "../styles/historialVendedor.css";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  userName: string;
  createdAt: string;
  total: number | string; 
  status: string;
  items: OrderItem[];
  orderNumber: string;
  deliveryMethod: "pickup" | "delivery";
}

const HistorialVendedor = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const storeId = localStorage.getItem("storeId");

  useEffect(() => {
    if (!storeId) return;

    orderApi
      .get(`/orders/store/${storeId}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error cargando órdenes:", err));
  }, [storeId]);

  const formatCurrency = (value: number | string) => {
    const numberValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numberValue)) return "N/A";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(numberValue);
  };

  const handleStatusToggle = async (order: Order) => {
    const isPending = order.status === "pendiente";

    const newStatus =
      isPending
        ? (order.deliveryMethod === "pickup"
            ? "Disponible para retiro"
            : "Disponible para delivery")
        : "pendiente";

    try {
      const res = await orderApi.patch(`/orders/${order.id}/status`, { status: newStatus });

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: res.data.status } : o))
      );
    } catch (err) {
      console.error("Error al cambiar el estado:", err);
      alert("❌ No se pudo actualizar el estado.");
    }
  };

  return (
    <div className="historial-container">
      <h2>Historial de Ventas</h2>
      {orders.length === 0 ? (
        <p>No hay ventas registradas.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-details">
              <p><strong>Número de orden:</strong> {order.orderNumber}</p>
              <p><strong>Comprador:</strong> {order.userName}</p>
              <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={item.id}>
                    - Producto: {item.name} - Cantidad: {item.quantity} - {formatCurrency(item.price)}
                  </li>
                ))}
              </ul>
            </div>

           
            <div className="order-actions">
              <div className="order-status">
                {order.status}
              </div>

              <button
                className="status-btn"
                onClick={() => handleStatusToggle(order)}
              >
                {order.status === "pendiente"
                  ? order.deliveryMethod === "pickup"
                    ? "Marcar como listo para retiro"
                    : "Marcar como listo para delivery"
                  : "Revertir a pendiente"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default HistorialVendedor;
