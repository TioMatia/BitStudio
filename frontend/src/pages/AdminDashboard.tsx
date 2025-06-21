import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { orderApi, storeApi } from "../api/axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import "../styles/AdminDashboard.css";

interface Order {
  id: number;
  storeId: number;
  orderNumber: string;
  total: string | number;
  status: string;
  createdAt: string;
  userName: string;
}

interface Store {
  id: number;
  name: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, storesRes] = await Promise.all([
          orderApi.get("/orders"),
          storeApi.get("/stores"),
        ]);
        setOrders(ordersRes.data);
        setStores(storesRes.data);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const isStoreMatch = selectedStoreId === null || o.storeId === selectedStoreId;
    const isDateMatch =
      (!dateRange.start || new Date(o.createdAt) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(o.createdAt) <= new Date(dateRange.end));
    return isStoreMatch && isDateMatch;
  });

  const resumen = {
    totalVentas: filteredOrders.reduce((sum, o) => sum + Number(o.total), 0),
    cantidadOrdenes: filteredOrders.length,
    promedio: filteredOrders.length
      ? filteredOrders.reduce((sum, o) => sum + Number(o.total), 0) / filteredOrders.length
      : 0,
  };

  const ordersByStore = selectedStoreId
    ? [{
        name: stores.find((s) => s.id === selectedStoreId)?.name || "Tienda",
        ventas: resumen.totalVentas,
      }]
    : stores.map((store) => {
        const storeOrders = filteredOrders.filter((o) => o.storeId === store.id);
        const totalSales = storeOrders.reduce((sum, o) => sum + Number(o.total), 0);
        return { name: store.name, ventas: totalSales };
      });

  const resumenPorCliente = Object.values(
    filteredOrders.reduce((acc: any, order) => {
      if (!acc[order.userName]) {
        acc[order.userName] = {
          nombre: order.userName,
          totalGastado: 0,
          cantidadOrdenes: 0,
        };
      }
      acc[order.userName].totalGastado += Number(order.total);
      acc[order.userName].cantidadOrdenes += 1;
      return acc;
    }, {})
  );

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredOrders.map((o) => ({
        ID: o.id,
        Orden: o.orderNumber,
        Tienda: stores.find((s) => s.id === o.storeId)?.name || "",
        Cliente: o.userName,
        Total: o.total,
        Estado: o.status,
        Fecha: new Date(o.createdAt).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "ordenes.xlsx");
  };

  if (loading) return <p className="text-center mt-10">Cargando estadísticas...</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Panel de Estadísticas</h1>

      <div className="admin-filters">
        <div>
          <label>Filtrar por tienda:</label>
          <select
            value={selectedStoreId ?? ""}
            onChange={(e) => setSelectedStoreId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Todas las tiendas</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Desde:</label>
          <input type="date" value={dateRange.start} onChange={(e) =>
            setDateRange((prev) => ({ ...prev, start: e.target.value }))} />
        </div>
        <div>
          <label>Hasta:</label>
          <input type="date" value={dateRange.end} onChange={(e) =>
            setDateRange((prev) => ({ ...prev, end: e.target.value }))} />
        </div>
      </div>

      <div className="admin-summary">
        <div>Total ventas: <strong>${resumen.totalVentas.toFixed(2)}</strong></div>
        <div>Órdenes: <strong>{resumen.cantidadOrdenes}</strong></div>
        <div>Promedio: <strong>${resumen.promedio.toFixed(2)}</strong></div>
        <button onClick={exportExcel}>Exportar Excel</button>
      </div>

      <div className="admin-chart">
        <h2>Ventas por Tienda</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ordersByStore}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Bar dataKey="ventas" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de órdenes */}
      {filteredOrders.length > 0 && (
        <div className="admin-table">
          <h2>Órdenes</h2>
          <table>
            <thead>
              <tr>
                <th>Tienda</th>
                <th>Orden</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{stores.find((s) => s.id === order.storeId)?.name}</td>
                  <td>{order.orderNumber}</td>
                  <td>{order.userName}</td>
                  <td>${order.total}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumen por cliente */}
      <div className="admin-table mt-6">
        <h2>Resumen por Cliente</h2>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Órdenes</th>
              <th>Total Gastado</th>
            </tr>
          </thead>
          <tbody>
            {resumenPorCliente.map((cliente: any) => (
              <tr key={cliente.nombre}>
                <td>{cliente.nombre}</td>
                <td>{cliente.cantidadOrdenes}</td>
                <td>${cliente.totalGastado.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
