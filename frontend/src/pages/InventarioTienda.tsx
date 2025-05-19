import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


import { inventoryApi, storeApi } from "../api/axios";
import "../styles/inventarioTienda.css";
import defaultStoreImage from "../assets/FotoPredeterminadaTienda.png";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { addItem, clearCart } from "../store/carritoTienda";

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
  owner?: string;
  location?: string;
  phone?: string;
  score?: number;
  createdAt?: string;
}

const InventarioTienda: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);

  // Guardar cantidad seleccionada por producto
  const [quantities, setQuantities] = useState<Record<number, number>>({});

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

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuantityChange = (itemId: number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleAddToCart = (item: InventoryItem) => {
    const quantity = quantities[item.id] || 1;
    const currentStoreId = Number(storeId);

    if (quantity > item.quantity) {
      alert(`Solo hay ${item.quantity} unidades disponibles.`);
      return;
    }

    if (cart.storeId && cart.storeId !== currentStoreId) {
      const confirmed = window.confirm("Ya tienes productos de otra tienda. ¿Quieres reemplazar el carrito?");
      if (!confirmed) return;

      dispatch(clearCart());
    }

    dispatch(
      addItem({
        storeId: currentStoreId,
        item: {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity,
        },
      })
    );
  };

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
              <p><strong>Propietario:</strong> {store.owner}</p>
              <p><strong>Ubicación:</strong> {store.location}</p>
              <p><strong>Teléfono:</strong> {store.phone}</p>
              <p><strong>Tiempo estimado:</strong> {store.estimatedTime}</p>
              <p><strong>Rating:</strong> ⭐ {store.rating}</p>
              <p><strong>Envío:</strong> ${store.deliveryFee?.toFixed(2)}</p>
              <p><strong>Score:</strong> {store.score}</p>
              <p><strong>Creado el:</strong> {new Date(store.createdAt || "").toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      <input
        type="text"
        className="search-bar"
        placeholder="Buscar productos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="inventory-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className="inventory-card">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p><strong>${item.price.toFixed(2)}</strong></p>
            <p>{item.quantity} disponibles</p>
            <label>
              Cantidad:{" "}
              <input
                type="number"
                min={1}
                max={item.quantity}
                value={quantities[item.id] || 1}
                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                style={{ width: "60px", marginRight: "0.5rem" }}
              />
            </label>
            <button onClick={() => handleAddToCart(item)}>Agregar al carrito</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventarioTienda;
