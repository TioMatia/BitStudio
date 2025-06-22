import { useEffect, useState } from "react";
import { orderApi } from "../../api/axios";

const AdminCustomersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await orderApi.get("/orders");
      setOrders(data);
    };
    fetch();
  }, []);

  const resumenClientes = Object.values(
    orders.reduce((acc: any, order: any) => {
      if (!acc[order.userName]) acc[order.userName] = { total: 0, cantidad: 0 };
      acc[order.userName].total += Number(order.total);
      acc[order.userName].cantidad += 1;
      return acc;
    }, {})
  ).map((val: any, i: number) => ({ nombre: Object.keys(orders.reduce((acc, o) => { acc[o.userName] = true; return acc }, {}))[i], ...val }));

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Resumen por Cliente</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Órdenes</th>
            <th>Total Gastado</th>
          </tr>
        </thead>
        <tbody>
          {resumenClientes.map((cliente: any) => (
            <tr key={cliente.nombre}>
              <td>{cliente.nombre}</td>
              <td>{cliente.cantidad}</td>
              <td>${cliente.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCustomersPage;