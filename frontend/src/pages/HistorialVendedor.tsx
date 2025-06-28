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
  comment?: string;
  rating?: number;
}

const pageSize = 10; 

const HistorialVendedor = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const storeId = localStorage.getItem("storeId");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (page: number) => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await orderApi.get(`/orders/store/${storeId}`, {
        params: { page, limit: pageSize },
      });

      // Ajusta según estructura real de respuesta backend
      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
      setTotalPages(res.data.pageCount ?? 1);
    } catch (err) {
      console.error("Error cargando órdenes:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "green";
    if (rating === 3) return "orange";
    return "red";
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [storeId, currentPage]);

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

  const handleMarkEntregado = async (order: Order) => {
    try {
      const res = await orderApi.patch(`/orders/${order.id}/status`, { status: "Entregado" });

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: res.data.status } : o))
      );
    } catch (err) {
      console.error("Error al marcar como Entregado:", err);
      alert("❌ No se pudo actualizar el estado.");
    }
  };

return (
  <div className="vendedor-historial-container">
    <h2>Historial de Ventas</h2>

    {loading ? (
      <p>Cargando órdenes...</p>
    ) : orders.length === 0 ? (
      <p>No hay ventas registradas.</p>
    ) : (
      <>
        {orders.map((order) => (
          <div key={order.id} className="vendedor-order-card">
            <div className="vendedor-order-details">
              <p><strong>Número de orden:</strong> {order.orderNumber}</p>
              <p><strong>Comprador:</strong> {order.userName}</p>
              <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              {order.rating !== undefined && (
                <p style={{ color: getRatingColor(order.rating) }}>
                  <strong>Calificación:</strong>{" "}
                  {"★".repeat(order.rating)}{"☆".repeat(5 - order.rating)} ({order.rating}/5)
                </p>
              )}
              <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
              <ul className="vendedor-order-items">
                {order.items.map((item) => (
                  <li key={item.id}>
                    - Producto: {item.name} - Cantidad: {item.quantity} - {formatCurrency(item.price)}
                  </li>
                ))}
              </ul>
              {order.comment && (
                <p className="vendedor-order-comment">
                  <strong>Comentario del comprador:</strong> {order.comment}
                </p>
              )}
            </div>

            <div className="vendedor-order-actions">
              <div
                className={`vendedor-order-status ${
                  order.status === "pendiente"
                    ? "status-pendiente"
                    : order.status === "Entregado"
                    ? "status-entregado"
                    : "status-disponible"
                }`}
              >
                {order.status}
              </div>

              {order.status === "pendiente" ? (
                <button className="vendedor-status-btn" onClick={() => handleStatusToggle(order)}>
                  {order.deliveryMethod === "pickup"
                    ? "Marcar como listo para retiro"
                    : "Marcar como listo para delivery"}
                </button>
              ) : order.status === "Disponible para retiro" || order.status === "Disponible para delivery" ? (
                <>
                  <button className="vendedor-status-btn entregado-btn" onClick={() => handleMarkEntregado(order)}>
                    Marcar como entregado
                  </button>
                  <button className="vendedor-status-btn volver-btn" onClick={() => handleStatusToggle(order)}>
                    Volver
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ))}

        <div className="vendedor-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Siguiente
          </button>
        </div>
      </>
    )}
  </div>
);
}
export default HistorialVendedor;
