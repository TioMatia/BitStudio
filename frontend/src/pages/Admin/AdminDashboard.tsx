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
import { orderApi, storeApi } from "../../api/axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import "../../styles/AdminDashboard.css";

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

interface ClienteResumen {
  nombre: string;
  totalGastado: number;
  cantidadOrdenes: number;
}

const pageSizeOrders = 10;
const pageSizeClientes = 10;

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Órdenes
  const [currentPageOrders, setCurrentPageOrders] = useState(1);
  const [totalPagesOrders, setTotalPagesOrders] = useState(1);
  const [ventasPorTienda, setVentasPorTienda] = useState<{ storeId: number, ventas: number }[]>([]);
  const [resumenGeneral, setResumenGeneral] = useState({
    totalVentas: 0,
    cantidadOrdenes: 0,
    promedio: 0,
  });
  // Resumen clientes
  const [resumenPorCliente, setResumenPorCliente] = useState<ClienteResumen[]>([]);
  const [currentPageClientes, setCurrentPageClientes] = useState(1);
  const [sortKey, setSortKey] = useState<keyof ClienteResumen>("cantidadOrdenes");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
      const fetchStores = async () => {
        try {
          const res = await storeApi.get("/stores");
          setStores(res.data);
        } catch (error) {
          console.error("Error al cargar tiendas:", error);
        }
      };
      fetchStores();
    }, []);
  

  useEffect(() => {
    const fetchResumenGeneral = async () => {
      try {
        const params: any = {};
        if (selectedStoreId) params.storeId = selectedStoreId;
        if (dateRange.start) params.startDate = dateRange.start;
        if (dateRange.end) params.endDate = dateRange.end;

        const res = await orderApi.get("/orders/summary", { params });
        setResumenGeneral(res.data);
      } catch (error) {
        console.error("Error al cargar resumen general:", error);
      }
    };

    fetchResumenGeneral();
  }, [selectedStoreId, dateRange]);

  useEffect(() => {
    const fetchVentasPorTienda = async () => {
      try {
        const params: any = {};
        if (selectedStoreId) params.storeId = selectedStoreId;
        if (dateRange.start) params.startDate = dateRange.start;
        if (dateRange.end) params.endDate = dateRange.end;

        const res = await orderApi.get("/orders/sales-by-store", { params });
        setVentasPorTienda(res.data);
      } catch (error) {
        console.error("Error al cargar ventas por tienda:", error);
      }
    };

    fetchVentasPorTienda();
  }, [selectedStoreId, dateRange]);


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPageOrders,
          limit: pageSizeOrders,
        };
        if (selectedStoreId) params.storeId = selectedStoreId;
        if (dateRange.start) params.startDate = dateRange.start;
        if (dateRange.end) params.endDate = dateRange.end;

        const res = await orderApi.get("/orders", { params });
        setOrders(res.data.data);
        setTotalPagesOrders(res.data.pageCount);
      } catch (error) {
        console.error("Error al cargar órdenes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPageOrders, selectedStoreId, dateRange]);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const params: any = {};
        if (selectedStoreId) params.storeId = selectedStoreId;
        if (dateRange.start) params.startDate = dateRange.start;
        if (dateRange.end) params.endDate = dateRange.end;

        const res = await orderApi.get("/orders/summary-by-client", { params });

        const parsedResumen: ClienteResumen[] = res.data.map((cliente: any) => ({
          nombre: cliente.nombre,
          totalGastado: parseFloat(cliente.totalGastado),
          cantidadOrdenes: parseInt(cliente.cantidadOrdenes),
        }));

        parsedResumen.sort((a, b) => {
          const valueA = a[sortKey];
          const valueB = b[sortKey];
          if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
          if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        });

        setResumenPorCliente(parsedResumen);
        setCurrentPageClientes(1); // reset al cambiar filtros
      } catch (error) {
        console.error("Error al cargar resumen por cliente:", error);
      }
    };

    fetchResumen();
  }, [selectedStoreId, dateRange, sortKey, sortDirection]);


const ordersByStore = stores.map((store) => {
  const found = ventasPorTienda.find((v) => v.storeId === store.id);
  const ventas = found ? Number(found.ventas) : 0;
  return {
    name: store.name,
    ventas: isNaN(ventas) || ventas < 0 ? 0 : ventas,
  };
});

console.log("ordersByStore", ordersByStore);

const maxVentas = Math.max(...ordersByStore.map(o => o.ventas));


  const exportExcel = async () => {
    try {
      const params: any = {};
      if (selectedStoreId) params.storeId = selectedStoreId;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const res = await orderApi.get("/orders/export", { params });

      const data = res.data.map((o: Order) => ({
        ID: o.id,
        Orden: o.orderNumber,
        Tienda: stores.find((s) => s.id === o.storeId)?.name || "",
        Cliente: o.userName,
        Total: o.total,
        Estado: o.status,
        Fecha: new Date(o.createdAt).toLocaleDateString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "ordenes_filtradas.xlsx");
    } catch (error) {
      console.error("Error al exportar órdenes:", error);
    }
  };


  const toggleSort = (key: keyof ClienteResumen) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const paginatedClientes = resumenPorCliente.slice(
    (currentPageClientes - 1) * pageSizeClientes,
    currentPageClientes * pageSizeClientes
  );
  const totalPagesClientes = Math.ceil(resumenPorCliente.length / pageSizeClientes);

  if (loading) return <p className="text-center mt-10">Cargando estadísticas...</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Panel de Estadísticas</h1>

      <div className="admin-filters">
        <div>
          <label>Filtrar por tienda:</label>
          <select
            value={selectedStoreId ?? ""}
            onChange={(e) => {
              setCurrentPageOrders(1);
              setSelectedStoreId(e.target.value ? Number(e.target.value) : null);
            }}
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
          <label>Desde:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
          />
        </div>
        <div>
          <label>Hasta:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
          />
        </div>
      </div>

      <div className="admin-summary">
        <div>Total ventas: <strong>${resumenGeneral.totalVentas.toFixed(2)}</strong></div>
        <div>Órdenes: <strong>{resumenGeneral.cantidadOrdenes}</strong></div>
        <div>Promedio: <strong>${resumenGeneral.promedio.toFixed(2)}</strong></div>
        <button onClick={exportExcel}>Exportar Excel</button>
      </div>

      <div className="admin-chart">
        <h2>Ventas por Tienda</h2>
        <ResponsiveContainer width="100%" height={300}>
        <BarChart data={ordersByStore}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            domain={[0, maxVentas]}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
          <Bar dataKey="ventas" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
      </div>

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
            {orders.map((order) => (
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
        <div className="pagination">
          <button disabled={currentPageOrders === 1} onClick={() => setCurrentPageOrders((p) => p - 1)}>
            Anterior
          </button>
          <span>
            Página {currentPageOrders} de {totalPagesOrders}
          </span>
          <button
            disabled={currentPageOrders === totalPagesOrders}
            onClick={() => setCurrentPageOrders((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>

      <div className="admin-table mt-6">
        <h2>Resumen por Cliente</h2>
        <table>
          <thead>
            <tr>
              <th>
                Cliente
                <button
                  className="sort-button"
                  onClick={() => toggleSort("nombre")}
                  aria-label="Ordenar por Cliente"
                >
                  {sortKey === "nombre" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
                </button>
              </th>
              <th>
                Órdenes
                <button
                  className="sort-button"
                  onClick={() => toggleSort("cantidadOrdenes")}
                  aria-label="Ordenar por Órdenes"
                >
                  {sortKey === "cantidadOrdenes" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
                </button>
              </th>
              <th>
                Total Gastado
                <button
                  className="sort-button"
                  onClick={() => toggleSort("totalGastado")}
                  aria-label="Ordenar por Total Gastado"
                >
                  {sortKey === "totalGastado" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedClientes.map((cliente) => (
              <tr key={cliente.nombre}>
                <td>{cliente.nombre}</td>
                <td>{cliente.cantidadOrdenes}</td>
                <td>${cliente.totalGastado.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button disabled={currentPageClientes === 1} onClick={() => setCurrentPageClientes((p) => p - 1)}>
            Anterior
          </button>
          <span>
            Página {currentPageClientes} de {totalPagesClientes}
          </span>
          <button
            disabled={currentPageClientes === totalPagesClientes}
            onClick={() => setCurrentPageClientes((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
