import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { inventoryApi, storeApi } from "../api/axios";
import "../styles/inventarioTienda.css";
import defaultStoreImage from "../assets/FotoPredeterminadaTienda.png";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { addItem, setItemQuantity, removeItem } from "../store/carritoTienda";
import { FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";

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
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);

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

  return (
    <div className="inventario-page">
      <button onClick={() => navigate("/shop")} className="back-button">
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
        {filteredItems.map((item) => {
          const itemInCart = cart.items.find((ci) => ci.id === item.id);
          const quantityValue = quantities[item.id] ?? itemInCart?.quantity ?? 1;

          return (
            <motion.div
              key={item.id}
              className="inventory-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p><strong>${item.price.toFixed(2)}</strong></p>
              <p>{item.quantity} disponibles</p>

              {itemInCart ? (
                <>
                  <label>
                    Cantidad:{" "}
                    <input
                      type="number"
                      min={1}
                      max={item.quantity}
                      value={quantityValue}
                      onChange={(e) => {
                        const value = Math.min(
                          item.quantity,
                          Math.max(1, parseInt(e.target.value) || 1)
                        );
                        setQuantities((prev) => ({ ...prev, [item.id]: value }));
                      }}
                      onBlur={() => {
                        dispatch(
                          setItemQuantity({
                            itemId: item.id,
                            quantity: quantityValue,
                          })
                        );
                      }}
                      style={{ width: "60px", marginRight: "0.5rem" }}
                    />
                    
                  </label>
                   <button disabled style={{ backgroundColor: "#d4edda", color: "#155724", marginLeft: "1.5rem", marginTop:"1rem"}}>
                     Producto agregado
                  </button>
         
                  <button
                    onClick={() => dispatch(removeItem(item.id))}
                    title="Eliminar del carrito"
                    style={{
                      backgroundColor: "#f8d7da",
                      color: "#721c24",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.5rem",
                      marginLeft: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    <FaTrash />
                  </button>
                  
                </>
              ) : (
                <button
                  onClick={() => {
                    const currentStoreId = cart.storeId;
                    const newStoreId = Number(storeId);

                    // Si ya hay productos en el carrito y son de otra tienda
                    if (currentStoreId && currentStoreId !== newStoreId) {
                      const confirmClear = window.confirm(
                        "Este producto es de otra tienda. Se eliminará el carrito actual. ¿Desea continuar?"
                      );
                      if (!confirmClear) return;

                      // Limpiar carrito si el usuario acepta
                      dispatch({ type: "cart/clearCart" });
                    }

                    // Agregar el nuevo producto
                    dispatch(
                      addItem({
                        storeId: newStoreId,
                        item: {
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          quantity: 1,
                        },
                      })
                    );
                    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
                  }}
                >
                  Agregar al carrito
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InventarioTienda;
