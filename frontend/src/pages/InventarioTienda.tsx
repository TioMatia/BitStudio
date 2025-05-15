import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { inventoryApi } from "../api/axios";

interface InventoryItem {
id: number;
name: string;
description?: string;
price: number;
quantity: number;
}

const InventarioTienda: React.FC = () => {
const { storeId } = useParams<{ storeId: string }>();
const navigate = useNavigate();
const [items, setItems] = useState<InventoryItem[]>([]);
const [error, setError] = useState("");

useEffect(() => {
const fetchInventory = async () => {
try {
const res = await inventoryApi.get(`/inventory/store/${storeId}`);
setItems(res.data);
} catch (err: any) {
console.error("❌ Error al cargar inventario:", err);
setError("No se pudo cargar el inventario.");
}
};
if (storeId) {
fetchInventory();
}
}, [storeId]);

return (
<div className="page">
<button onClick={() => navigate(-1)} className="button">
← Volver a tiendas
</button>
<h2>Inventario</h2>
{error && <p style={{ color: "red" }}>{error}</p>}
<ul>
{items.map((item) => (
<li key={item.id}>
<strong>{item.name}</strong> - ${item.price} ({item.quantity} disponibles)
</li>
))}
</ul>
</div>
);
};

export default InventarioTienda;