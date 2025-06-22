import { useEffect, useState } from "react";
import { orderApi, storeApi } from "../../api/axios";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [o, s] = await Promise.all([
        orderApi.get("/orders"),
        storeApi.get("/stores")
      ]);
      setOrders(o.data);
      setStores(s.data);
    };
    fetch();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Órdenes registradas</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Tienda</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>{stores.find((s) => s.id === o.storeId)?.name}</td>
              <td>{o.userName}</td>
              <td>${o.total}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrdersPage;
