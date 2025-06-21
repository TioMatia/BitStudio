import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { orderApi, storeApi } from "../api/axios";
import Papa from "papaparse";
import { saveAs } from "file-saver";

interface Order {
  id: number;
  storeId: number;
  orderNumber: string;
  total: string | number;
  status: string;
  createdAt: string;
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
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

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
    const isStoreMatch =
      selectedStoreId === null || o.storeId === selectedStoreId;
    const isDateMatch =
      (!dateRange.start || new Date(o.createdAt) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(o.createdAt) <= new Date(dateRange.end));
    return isStoreMatch && isDateMatch;
  });

  const ordersByStore = selectedStoreId
    ? [
        {
          name: stores.find((s) => s.id === selectedStoreId)?.name || "Tienda",
          ventas: filteredOrders.reduce((sum, o) => sum + Number(o.total), 0),
        },
      ]
    : stores.map((store) => {
        const storeOrders = filteredOrders.filter((o) => o.storeId === store.id);
        const totalSales = storeOrders.reduce(
          (sum, o) => sum + Number(o.total),
          0
        );
        return { name: store.name, ventas: totalSales };
      });

  const resumen = {
    totalVentas: filteredOrders.reduce((sum, o) => sum + Number(o.total), 0),
    cantidadOrdenes: filteredOrders.length,
    promedio: filteredOrders.length
      ? filteredOrders.reduce((sum, o) => sum + Number(o.total), 0) /
        filteredOrders.length
      : 0,
  };

  const exportCSV = () => {
    const csv = Papa.unparse(
      filteredOrders.map((o) => ({
        ID: o.id,
        Tienda: stores.find((s) => s.id === o.storeId)?.name || "",
        Orden: o.orderNumber,
        Total: o.total,
        Estado: o.status,
        Fecha: new Date(o.createdAt).toLocaleDateString(),
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "ordenes.csv");
  };

  if (loading) {
    return <p className="text-center mt-10">Cargando estadísticas...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Panel de Estadísticas
      </h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Filtrar por tienda:</label>
          <select
            value={selectedStoreId ?? ""}
            onChange={(e) =>
              setSelectedStoreId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full p-2 border rounded"
          >
            <option value="">Todas las tiendas</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Desde:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Hasta:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
        <div>Total de ventas: <strong>${resumen.totalVentas.toFixed(2)}</strong></div>
        <div>Cantidad de órdenes: <strong>{resumen.cantidadOrdenes}</strong></div>
        <div>Promedio por orden: <strong>${resumen.promedio.toFixed(2)}</strong></div>
        <button
          className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={exportCSV}
        >
          Exportar CSV
        </button>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Ventas</h2>
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

      {/* Tabla */}
      {filteredOrders.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Órdenes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Tienda</th>
                  <th className="px-4 py-2 border">Orden</th>
                  <th className="px-4 py-2 border">Total</th>
                  <th className="px-4 py-2 border">Estado</th>
                  <th className="px-4 py-2 border">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="text-center">
                    <td className="px-4 py-2 border">
                      {stores.find((s) => s.id === order.storeId)?.name || ""}
                    </td>
                    <td className="px-4 py-2 border">{order.orderNumber}</td>
                    <td className="px-4 py-2 border">${order.total}</td>
                    <td className="px-4 py-2 border">{order.status}</td>
                    <td className="px-4 py-2 border">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
