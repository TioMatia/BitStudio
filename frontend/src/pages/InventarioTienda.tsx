import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { inventoryApi, storeApi } from "../api/axios";
import "../styles/inventarioTienda.css";
import defaultStoreImage from "../assets/FotoPredeterminadaTienda.png";
import defaultInventoryImage from "../assets/FotoPredeterminadaInventario.png";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { addItem, setItemQuantity, removeItem } from "../store/carritoTienda";
import { FaTrash } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';


interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string; 
  categories?: { id: number; name: string }[];
}



interface Owner {
firstName: string;
lastName: string;
email?: string;
}

interface Store {
  id: number;
  name: string;
  description?: string;
  image?: string;
  deliveryFee?: number;
  rating?: number;
  estimatedTime?: string;
  owner?: Owner;
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

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

    useEffect(() => {
      const prices = items.map(item => item.price);
      if (prices.length > 0) {
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setMinPrice(min);
        setMaxPrice(max);
        setPriceRange([min, max]); 
      }
    }, [items]);

    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const res = await inventoryApi.get(`/categories/store/${storeId}`);
          setCategories(res.data);
        } catch (err) {
          console.error("Error al cargar categorías:", err);
        }
      };

      if (storeId) {
        fetchCategories();
      }
    }, [storeId]);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      item.price >= priceRange[0] &&
      item.price <= priceRange[1] &&
      (selectedCategoryIds.length === 0 || 
      item.categories?.some((cat) => selectedCategoryIds.includes(cat.id)))
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
              {store.owner && (
              <p><strong>Propietario:</strong> {store.owner.firstName} {store.owner.lastName}</p>
              )}
              <p><strong>Ubicación:</strong> {store.location}</p>
              {store.phone && <p><strong>Teléfono:</strong> {store.phone}</p>}
              {store.estimatedTime && (
              <p><strong>Tiempo estimado:</strong> {store.estimatedTime} minutos</p>
              )}
              <p><strong>Rating:</strong> ⭐ {store.rating ?? 0}</p>
              <p><strong>Envío:</strong>{" "} {store.deliveryFee?.toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }) ?? "0"}</p>
              <p><strong>Creado el:</strong> {new Date(store.createdAt || "").toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="filter-toolbar">
        <input
          type="text"
          className="search-bar"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="category-dropdown-wrapper">
          <button
            className="category-toggle-button"
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
          >
            Filtrar por categorías ⌄
          </button>
          {categoryDropdownOpen && (
            <div className="category-dropdown">
              {categories.map((cat) => (
                <label key={cat.id} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategoryIds((prev) => [...prev, cat.id]);
                      } else {
                        setSelectedCategoryIds((prev) =>
                          prev.filter((id) => id !== cat.id)
                        );
                      }
                    }}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {maxPrice > minPrice && (
        <div className="price-filter">
          <h4>Filtrar por precio</h4>
          <Slider
            range
            min={minPrice}
            max={maxPrice}
            step={10}
            value={priceRange}
            onChange={(value) => setPriceRange(value as [number, number])}
          />
          <div className="price-labels">
            <span>${priceRange[0].toFixed(0)}</span>
            <span>${priceRange[1].toFixed(0)}</span>
          </div>
        </div>
      )}
          <div className="inventory-grid">
            <AnimatePresence>
              {filteredItems.map((item) => {
                const itemInCart = cart.items.find((ci) => ci.id === item.id);
                const quantityValue = quantities[item.id] ?? itemInCart?.quantity ?? 1;

                return (
                  <motion.div
                    key={item.id}
                    className="inventory-card-horizontal"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }} 
                    transition={{ duration: 0.3 }}
                    layout 
                  >
            <img
              src={item.image || defaultInventoryImage}
              alt={item.name}
              className="inventory-image-horizontal"
            />
            

            <div className="inventory-info">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p><strong>  {item.price.toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
              })} </strong></p>
              <p>{item.quantity} disponibles</p>
            </div>
                  <div className="inventory-actions-right">
                      {itemInCart ? (
                        <>
                          <label className="quantity-label">
                            Cantidad:
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
                              className="quantity-input"
                            />
                          </label>
                          <div className="added-message">✅ Producto agregado</div>
                          <button
                            onClick={() => dispatch(removeItem(item.id))}
                            title="Eliminar del carrito"
                            className="remove-button"
                          >
                            <FaTrash /> Quitar
                          </button>
                        </>
                      ) : (
                        <button
                          className="add-button"
                          onClick={() => {
                            const currentStoreId = cart.storeId;
                            const newStoreId = Number(storeId);

                            if (currentStoreId && currentStoreId !== newStoreId) {
                              const confirmClear = window.confirm(
                                "Este producto es de otra tienda. Se eliminará el carrito actual. ¿Desea continuar?"
                              );
                              if (!confirmClear) return;
                              dispatch({ type: "cart/clearCart" });
                            }

                            dispatch(
                              addItem({
                                storeId: newStoreId,
                                item: {
                                  id: item.id,
                                  name: item.name,
                                  price: item.price,
                                  quantity: 1,
                                  inventoryId: item.id, 
                                  stock: item.quantity,
                                },
                              })
                            );
                            setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
                          }}
                        >
                          Agregar al carrito
                        </button>
                      )}
                    </div>
                  </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
    </div>
  );
};

export default InventarioTienda;
