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
  deliveryFee?: number;
}

const pageSize = 10;

const HistorialVendedor = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const storeId = localStorage.getItem("storeId");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

 
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const fetchOrders = async (page: number) => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await orderApi.get(`/orders/store/${storeId}`, {
        params: { page, limit: pageSize },
      });

      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
      setTotalPages(res.data.pageCount ?? 1);
    } catch (err) {
      console.error("Error cargando órdenes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [storeId, currentPage]);

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "green";
    if (rating === 3) return "orange";
    if (rating < 3 && rating > 0) return "red";
    return "gray";
  };

  const formatCurrency = (value: number | string) => {
    const numberValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numberValue)) return "N/A";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(numberValue);
  };

  const handleStatusToggle = async (order: Order) => {
    const isPending = order.status === "Pendiente";

    const newStatus = isPending
      ? order.deliveryMethod === "pickup"
        ? "Disponible para retiro"
        : "Disponible para delivery"
      : "Pendiente";

    try {
      const res = await orderApi.patch(`/orders/${order.id}/status`, {
        status: newStatus,
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: res.data.status } : o))
      );
    } catch (err) {
      console.error("Error al cambiar el estado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

  const handleMarkEntregado = async (order: Order) => {
    try {
      const res = await orderApi.patch(`/orders/${order.id}/status`, {
        status: "Entregado",
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: res.data.status } : o))
      );
    } catch (err) {
      console.error("Error al marcar como Entregado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

 
  const openCancelModal = (order: Order) => {
    setSelectedOrderToCancel(order);
    setCancelReason("");
    setCancelModalVisible(true);
  };


  const closeCancelModal = () => {
    setCancelModalVisible(false);
    setSelectedOrderToCancel(null);
    setCancelReason("");
  };

 
  const confirmCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Por favor ingresa el motivo de cancelación.");
      return;
    }
    if (!selectedOrderToCancel) return;

    try {
      const res = await orderApi.patch(`/orders/${selectedOrderToCancel.id}/status`, {
        status: "Cancelado",
        comment: cancelReason.trim(),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrderToCancel.id ? { ...o, status: res.data.status, comment: cancelReason.trim() } : o
        )
      );
      closeCancelModal();
    } catch (err) {
      console.error("Error al cancelar el pedido:", err);
      alert("No se pudo cancelar el pedido.");
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
                <p>
                  <strong>Número de orden:</strong> {order.orderNumber}
                </p>
                <p>
                  <strong>Comprador:</strong> {order.userName}
                </p>
                <p>
                  <strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}
                </p>
                {order.rating !== undefined && (
                  <p style={{ color: getRatingColor(order.rating) }}>
                    <strong>Calificación:</strong>{" "}
                    {"★".repeat(order.rating) + "☆".repeat(5 - order.rating)} ({order.rating}/5)
                  </p>
                )}
                {order.deliveryMethod === "delivery" && order.deliveryFee !== undefined && (
                  <p>
                    <strong>Envío:</strong> {formatCurrency(order.deliveryFee)}
                  </p>
                )}
                <p>
                  <strong>Total:</strong> {formatCurrency(order.total)}
                </p>
                <ul className="vendedor-order-items">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      - Producto: {item.name} - Cantidad: {item.quantity} - {formatCurrency(item.price)}
                    </li>
                  ))}
                </ul>
                  {order.comment && (
                    order.status === "Cancelado" ? (
                      <p className="vendedor-order-cancel-comment">
                        <strong>Motivo de cancelación:</strong> {order.comment}
                      </p>
                    ) : (
                      <p className="vendedor-order-comment">
                        <strong>Comentario del comprador:</strong> {order.comment}
                      </p>
                    )
                  )}
              </div>

              <div className="vendedor-order-actions">
                <div
                  className={`vendedor-order-status ${
                    order.status === "Pendiente"
                      ? "status-pendiente"
                      : order.status === "Entregado"
                      ? "status-entregado"
                      : order.status === "Cancelado"
                      ? "status-cancelado"
                      : "status-disponible"
                  }`}
                >
                  {order.status}
                </div>

                {order.status === "Pendiente" ? (
                  <>
                    <button className="vendedor-status-btn" onClick={() => handleStatusToggle(order)}>
                      {order.deliveryMethod === "pickup"
                        ? "Marcar como listo para retiro"
                        : "Marcar como listo para delivery"}
                    </button>
                    <button className="vendedor-status-btn cancel-btn" onClick={() => openCancelModal(order)}>
                      Cancelar pedido
                    </button>
                  </>
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
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              Siguiente
            </button>
          </div>
        </>
      )}

      
      {cancelModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancelar pedido #{selectedOrderToCancel?.orderNumber}</h3>
            <label htmlFor="cancelReason">Motivo de cancelación:</label>
            <textarea
              id="cancelReason"
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Escribe aquí el motivo..."
            />
            <div className="modal-buttons">
              <button className="modal-btn confirm-btn" onClick={confirmCancelOrder}>
                Confirmar cancelación
              </button>
              <button className="modal-btn cancel-btn" onClick={closeCancelModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialVendedor;
