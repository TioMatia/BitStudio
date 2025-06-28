import React, { useEffect, useState } from "react";
import { orderApi } from "../api/axios";
import "../styles/HistorialCompras.css";
import RatingModal from "../components/RatingModal";

interface Order {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  storeName: string;
  rated: boolean;
  items?: { name: string; price: number; quantity: number }[];
}

const pageSize = 10;

const HistorialDeCompras: React.FC = () => {
  const userId = localStorage.getItem("userId");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Order>("createdAt");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          limit: pageSize,
          sortKey,
          sortDir,
        };
        if (dateRange.start) params.startDate = dateRange.start;
        if (dateRange.end) params.endDate = dateRange.end;

        const res = await orderApi.get(`/orders/user/${userId}`, { params });
        setOrders(Array.isArray(res.data.data) ? res.data.data : []);
        setTotalPages(res.data.pageCount ?? 1);
      } catch (error) {
        console.error("Error al obtener historial:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, currentPage, sortKey, sortDir, dateRange]);

  const toggleSort = (key: keyof Order) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortKey(key);
      setSortDir("DESC");
    }
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!selectedOrder) return;
    try {
      await orderApi.patch(`/orders/${selectedOrder.id}/rate`, {
        rating,
        comment,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, rated: true } : o
        )
      );
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error al enviar valoración", err);
      alert("❌ No se pudo enviar la valoración.");
    }
  };

  return (
    <div className="historial-dashboard">
      <h1 className="historial-title">Historial de Compras</h1>

      <div className="historial-filters">
        <div>
          <label>Desde:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
          />
        </div>
        <div>
          <label>Hasta:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center mt-10">Cargando historial...</p>
      ) : orders.length === 0 ? (
        <p>No hay órdenes registradas.</p>
      ) : (
        <div className="historial-table">
          <table>
            <thead>
            <tr>
              <th></th> {/* columna para la flecha */}
              <th>Tienda</th>
              <th>Número de orden</th>
              <th>
                Total
                <button className="sort-button" onClick={() => toggleSort("total")}>
                  {sortKey === "total" ? (sortDir === "ASC" ? "▲" : "▼") : "↕"}
                </button>
              </th>
              <th>
                Estado
                <button className="sort-button" onClick={() => toggleSort("status")}>
                  {sortKey === "status" ? (sortDir === "ASC" ? "▲" : "▼") : "↕"}
                </button>
              </th>
              <th>
                Fecha
                <button className="sort-button" onClick={() => toggleSort("createdAt")}>
                  {sortKey === "createdAt" ? (sortDir === "ASC" ? "▲" : "▼") : "↕"}
                </button>
              </th>
              <th>Acción</th>
            </tr>
          </thead>

            <tbody>
  {orders.map((order) => (
    <React.Fragment key={order.id}>
      <tr>
        <td>
          <button
            className="toggle-detail-button"
            onClick={() =>
              setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
            }
          >
            {expandedOrderId === order.id ? "▲" : "▼"}
          </button>
        </td>
        <td>{order.storeName}</td>
        <td>{order.orderNumber}</td>
        <td>
          {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(Number(order.total))}
        </td>
        <td>{order.status}</td>
        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
        <td>
          {order.status === "Entregado" && !order.rated ? (
            <button
              className="rate-button"
              onClick={() => setSelectedOrder(order)}
            >
              Calificar pedido
            </button>
          ) : (
            order.rated && <span className="rated-tag">Calificado</span>
          )}
        </td>
      </tr>

      {expandedOrderId === order.id && (
        <tr className="order-detail-row">
          <td colSpan={7}>
            <div className="order-details-expanded">
              <h4>Detalle del pedido</h4>
              <ul>
                {order.items?.map((item, index) => (
                  <li key={index}>
                    {item.name} - {item.quantity} x ${item.price.toFixed(0)} = $
                    {(item.price * item.quantity).toFixed(0)}
                  </li>
                ))}
              </ul>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>
          </table>


          <div className="historial-pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <RatingModal
          storeName={selectedOrder.storeName}
          onClose={() => setSelectedOrder(null)}
          onSubmit={handleSubmitRating}
        />
      )}
    </div>
  );
};

export default HistorialDeCompras;
