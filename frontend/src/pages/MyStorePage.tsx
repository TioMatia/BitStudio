import React, { useEffect, useState } from "react";
import { storeApi, inventoryApi } from "../api/axios";
import defaultInventoryImage from "../assets/FotoPredeterminadaInventario.png";
import defaultStoreImage from "../assets/FotoPredeterminadaTienda.png";
import "../styles/myStore.css";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import mpLogo from '../assets/logo_MercadoPago.png';

import { useDispatch } from "react-redux";
import { fetchActiveOrders } from "../store/ordenesSlice";
import type { AppDispatch } from '../store'
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { AnimatePresence, motion } from "framer-motion";

interface Owner {
  firstName: string;
  lastName: string;
  email?: string;
  mpAccessToken?: string;
}

interface Store {
  id: number;
  name: string;
  location: string;
  phone?: string;
  description?: string;
  image?: string;
  deliveryFee?: number;
  rating?: number;
  estimatedTime?: string;
  score?: number;
  owner?: Owner;
  shippingMethod?: "pickup" | "delivery" | "both";
}

interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  providerName?: string;
  categories?: { id: number; name: string }[];
}

interface Provider {
  id: number;
  name: string;
}

const MP_CLIENT_ID = "3932883698958169"
const REDIRECT_URI = "https://aadc-186-9-144-62.ngrok-free.app/payment/mercadopago/oauth/callback";

const MyStorePage: React.FC = () => {
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<InventoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteQuantity, setDeleteQuantity] = useState<number>(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const userId = localStorage.getItem("userId");
  const isMPLinked = !!store?.owner?.mpAccessToken;
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | "">( "");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch<AppDispatch>()
  
  const fetchStoreAndInventory = async () => {
  try {
    const res = await storeApi.get(`/stores/user/${userId}`);
    setStore(res.data);
    localStorage.setItem("storeId", res.data.id.toString());

    dispatch(fetchActiveOrders(res.data.id.toString()));

    const invRes = await inventoryApi.get(`/inventory/store/${res.data.id}`);
    setItems(invRes.data);

    const catRes = await inventoryApi.get(`/categories/store/${res.data.id}`);
    setCategories(catRes.data);

    const provRes = await storeApi.get(`/stores/${res.data.id}/providers`);
    setProviders(provRes.data);
  } catch (err) {
    console.error("Error al cargar datos de la tienda:", err);
  }
};

  useEffect(() => {
    if (userId) fetchStoreAndInventory();
  }, [userId]);

  useEffect(() => {
    if (items.length > 0) {
      const prices = items.map((item) => item.price);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setMinPrice(min);
      setMaxPrice(max);
      setPriceRange([min, max]);
    }
  }, [items]);

  useEffect(() => {
    const uniqueCategories: { id: number; name: string }[] = [];
    const categorySet = new Set<number>();

    items.forEach(item => {
      item.categories?.forEach(cat => {
        if (!categorySet.has(cat.id)) {
          categorySet.add(cat.id);
          uniqueCategories.push(cat);
        }
      });
    });

    setCategories(uniqueCategories);
  }, [items]);

  const handleDelete = async (item: InventoryItem) => {
    if (deletingId !== item.id) {
      setDeletingId(item.id);
      setDeleteQuantity(1);
      return;
    }
    const quantityToDelete = Math.min(deleteQuantity, item.quantity);
    const confirm = window.confirm(
      `¿Estás seguro que deseas eliminar ${quantityToDelete} unidad(es) de "${item.name}"?`
    );
    if (!confirm) return;

    try {
      if (quantityToDelete >= item.quantity) {
        await inventoryApi.delete(`/inventory/${item.id}`);
      } else {
        await inventoryApi.patch(`/inventory/${item.id}`, {
          quantity: item.quantity - quantityToDelete,
        });
      }
      await fetchStoreAndInventory();
      setDeletingId(null);
    } catch (err) {
      console.error("Error al eliminar producto:", err);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditMode(item);
    setEditModalOpen(true);
  };

  const handleConnectMP = () => {
    const authUrl = `https://auth.mercadopago.cl/authorization?client_id=${MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${userId}`;
    window.location.href = authUrl;
  };

  const getShippingMethodText = (method: string | undefined) => {
    switch (method) {
      case "delivery":
        return "Solo delivery";
      case "pickup":
        return "Solo retiro en tienda";
      case "both":
        return "Delivery y retiro en tienda";
      default:
        return "No especificado";
    }
  };


  return (
    <div className="my-store-page">
      <h2>Mi Tienda</h2>
      <button
        className={`mp-button ${isMPLinked ? 'linked' : ''}`}
        onClick={handleConnectMP}
        disabled={isMPLinked}
      >
        {isMPLinked ? 'Cuenta Mercado Pago vinculada' : 'Conectar con Mercado Pago'}
        {!isMPLinked && <img src={mpLogo} alt="Mercado Pago" className="mp-icon" />}
      </button>

      {store && (
        <>
          <div className="store-details">
            <img
              src={store.image || defaultStoreImage}
              alt={store.name}
              className="store-image"
            />
            <div className="store-info">
              <h3>{store.name}</h3>
              {store.owner && (
                <p><strong>Propietario:</strong> {store.owner.firstName} {store.owner.lastName}</p>
              )}
              <p><strong>Ubicación:</strong> {store.location}</p>
              {store.phone && <p><strong>Teléfono:</strong> {store.phone}</p>}
              {store.description && <p><strong>Descripción:</strong> {store.description}</p>}
              <p><strong>Rating:</strong> ⭐ {store.rating ?? 0}</p>
              <p><strong>Método de envío:</strong> {getShippingMethodText(store.shippingMethod)}</p>

              {(store.shippingMethod === "delivery" || store.shippingMethod === "both") && (
                <>
                  {store.estimatedTime && (
                    <p><strong>Tiempo estimado:</strong> {store.estimatedTime} minutos</p>
                  )}
                  <p><strong>Envío:</strong>{" "} 
                    {store.deliveryFee?.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }) ?? "0"}
                  </p>
                </>
              )}
            </div>
          </div>
           
          <div className="inventory-section">
              <div className="inventory-toolbar limited-width">
                <div className="filters-container">
                  <div className="top-filters-row">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o descripción"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
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

                    {providers.length > 0 && (
                      <div className="filter-provider">
                        <select
                          id="providerFilter"
                          value={selectedProviderId}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Number(e.target.value);
                            setSelectedProviderId(val);
                          }}
                        >
                          <option value="">Filtrar por proveedor</option>
                          {providers.map((prov) => (
                            <option key={prov.id} value={prov.id}>
                              {prov.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="bottom-filter-row">
                    {items.length > 1 && (
                      <div className="filter-price-range">
                        <label>Filtrar por precio:</label>
                        <Slider
                          range
                          min={minPrice}
                          max={maxPrice}
                          step={10}
                          value={priceRange}
                          onChange={(value) => setPriceRange(value as [number, number])}
                        />
                        <div className="price-labels">
                          <span>${priceRange[0].toLocaleString("es-CL")}</span>
                          <span>${priceRange[1].toLocaleString("es-CL")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={() => setModalOpen(true)} className="add-product-button">
                  Agregar producto(s)
                </button>
              </div>
            <div className="inventory-grid">
              <AnimatePresence>
                {items
                  .filter(
                    (item) =>
                      (selectedProviderId === "" || item.providerName === providers.find(p => p.id === selectedProviderId)?.name) &&
                      (selectedCategoryIds.length === 0 || item.categories?.some(cat => selectedCategoryIds.includes(cat.id))) &&
                      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
                      item.price >= priceRange[0] &&
                      item.price <= priceRange[1]
                  )
                  .map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="inventory-card-horizontal"
                    >
                      <img
                        src={item.image?.trim() ? item.image : defaultInventoryImage}
                        alt={item.name}
                        className="product-image-horizontal"
                      />
                      <div className="inventory-info">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <p>
                          <strong>Precio:</strong>{" "}
                          {item.price.toLocaleString("es-CL", {
                            style: "currency",
                            currency: "CLP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </p>
                        {item.categories && item.categories.length > 0 && (
                            <p>
                              <strong>Categorías:</strong> {item.categories.map(cat => cat.name).join(', ')}
                            </p>
                          )}
                        <p><strong>Cantidad:</strong> {item.quantity}</p>
                        {item.providerName && (
                          <p><strong>Proveedor:</strong> {item.providerName}</p>
                        )}
                      </div>

                      <div className="inventory-actions">
                        <button
                          onClick={() => handleEdit(item)}
                          className="edit-button"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>

                        {deletingId === item.id ? (
                          <div className="delete-confirmation">
                            <input
                              type="number"
                              min={1}
                              max={item.quantity}
                              value={deleteQuantity}
                              onChange={(e) => {
                                const val = Math.max(
                                  1,
                                  Math.min(item.quantity, Number(e.target.value))
                                );
                                setDeleteQuantity(val);
                              }}
                            />
                            <div className="delete-buttons">
                              <button onClick={() => handleDelete(item)} className="confirm-button">
                                Aceptar
                              </button>
                              <button onClick={() => setDeletingId(null)} className="cancel-button">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDelete(item)}
                            className="delete-button"
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>

          </div>
        </>
      )}

      <AddProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        storeId={store?.id || 0}
        onProductAdded={fetchStoreAndInventory}
      />

      <EditProductModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        product={editMode}
        onProductUpdated={fetchStoreAndInventory}
      />
    </div>
  );
};

export default MyStorePage;
