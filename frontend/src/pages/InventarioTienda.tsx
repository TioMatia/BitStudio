import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { inventoryApi, storeApi } from "../api/axios";
import "../styles/inventarioTienda.css";
import defaultStoreImage from "../assets/FotoPredeterminadaTienda.png";

interface InventoryItem {
id: number;
name: string;
description?: string;
price: number;
quantity: number;
}

interface Store {
id: number;
name: string;
description?: string;
image?: string;
deliveryFee?: number;
rating?: number;
estimatedTime?: string;
}

const InventarioTienda: React.FC = () => {
const { storeId } = useParams<{ storeId: string }>();
const navigate = useNavigate();
const [items, setItems] = useState<InventoryItem[]>([]);
const [store, setStore] = useState<Store | null>(null);
const [search, setSearch] = useState("");
const [error, setError] = useState("");

useEffect(() => {
const fetchInventory = async () => {
try {
const res = await inventoryApi.get(`/inventory/store/${storeId}`);
setItems(res.data);
} catch (err: any) {
console.error("Error al cargar inventario:", err);
setError("No se pudo cargar el inventario.");
}
};
const fetchStore = async () => {
  try {
    const res = await storeApi.get(`/stores/${storeId}`);
    setStore(res.data);
  } catch (err: any) {
    console.error("Error al cargar tienda:", err);
  }
};

if (storeId) {
  fetchInventory();
  fetchStore();
}
}, [storeId]);

const filteredItems = items.filter(item =>
item.name.toLowerCase().includes(search.toLowerCase())
);

return (
<div className="inventario-page">
<button onClick={() => navigate(-1)} className="back-button">
← Volver
</button>
  {store && (
    <div className="store-header">
      <img
        src={store.image || defaultStoreImage}
        alt={store.name}
        className="store-image"
      />
      <div className="store-info">
        <h1>{store.name}</h1>
        <p>{store.description}</p>
        <div className="store-meta">
          <span>{store.estimatedTime}</span>
          <span>⭐ {store.rating}</span>
          <span>${store.deliveryFee?.toFixed(2)} envío</span>
          <span> </span>
        </div>
      </div>
    </div>
  )}

  <input
    type="text"
    className="search-bar"
    placeholder="Buscar productos..."
    value={search}
    onChange={e => setSearch(e.target.value)}
  />

  {error && <p style={{ color: "red" }}>{error}</p>}

  <div className="inventory-grid">
    {filteredItems.map(item => (
      <div key={item.id} className="inventory-card">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <p><strong>${item.price.toFixed(2)}</strong></p>
        <p>{item.quantity} disponibles</p>
      </div>
    ))}
  </div>
</div>
);
};

export default InventarioTienda;