import React, { useEffect, useState } from "react";
import { storeApi, inventoryApi } from "../api/axios";
import defaultInventoryImage from "../assets/FotoPredeterminadaInventario.png";
import defaultStoreImage from "../assets/FotoPredeterminadaTienda.png"
import "../styles/myStore.css";
import AddProductModal from "../components/AddProductModal";
import { FaEdit, FaTrash} from "react-icons/fa";
import EditProductModal from "../components/EditProductModal";

interface Owner {
  firstName: string;
  lastName: string;
  email?: string;
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
}

interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
}

const MyStorePage: React.FC = () => {
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<InventoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteQuantity, setDeleteQuantity] = useState<number>(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const userId = localStorage.getItem("userId");

  const fetchStoreAndInventory = async () => {
    try {
      const res = await storeApi.get(`/stores/user/${userId}`);
      setStore(res.data);
      const invRes = await inventoryApi.get(`/inventory/store/${res.data.id}`);
      setItems(invRes.data);
    } catch (err) {
      console.error("❌ Error al cargar datos de la tienda:", err);
    }
  };

  useEffect(() => {
    fetchStoreAndInventory();
  }, [userId]);

  const handleDelete = async (item: InventoryItem) => {
    if (deletingId !== item.id) {
      setDeletingId(item.id);
      setDeleteQuantity(1);
      return;
    }
    const quantityToDelete = Math.min(deleteQuantity, item.quantity);
    const confirm = window.confirm(`¿Estás seguro que deseas eliminar ${quantityToDelete} unidad(es) de "${item.name}"?`);
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
        console.error("❌ Error al eliminar producto:", err);
    }
    };

    const handleEdit = (item: InventoryItem) => {
    setEditMode(item);
    setEditModalOpen(true);
    };

  return (
    <div className="my-store-page">
      <h2>Mi Tienda</h2>
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
                <p>
                  <strong>Propietario:</strong> {store.owner.firstName}{" "}
                  {store.owner.lastName}
                </p>
              )}
              <p>
                <strong>Ubicación:</strong> {store.location}
              </p>
              {store.phone && (
                <p>
                  <strong>Teléfono:</strong> {store.phone}
                </p>
              )}
              {store.description && (
                <p>
                  <strong>Descripción:</strong> {store.description}
                </p>
              )}
              {store.estimatedTime && (
                <p>
                  <strong>Tiempo estimado:</strong> {store.estimatedTime}
                </p>
              )}
              <p>
                <strong>Rating:</strong> ⭐ {store.rating ?? 0}
              </p>
              <p>
                <strong>Envío:</strong> ${store.deliveryFee?.toFixed(2) ?? "0.00"}
              </p>
            </div>
          </div>

          <div className="inventory-section">
            <button
              onClick={() => setModalOpen(true)}
              className="add-product-button"
            >
              Agregar producto(s) 
            </button>

            <div className="inventory-grid"> 
              {items.map((item) => (
                <div key={item.id} className="inventory-card-horizontal">
                  <img
                    src={item.image || defaultInventoryImage}
                    alt={item.name}
                    className="product-image-horizontal"
                  />
                  <div className="inventory-info">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <p>
                      <strong>Precio:</strong> ${item.price.toFixed(2)}
                    </p>
                    <p>
                      <strong>Cantidad:</strong> {item.quantity}
                    </p>
                  </div>
                  <div className="inventory-actions">
                    <button onClick={() => handleEdit(item)} className="edit-button" title="Editar">
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
                                const val = Math.max(1, Math.min(item.quantity, Number(e.target.value)));
                                setDeleteQuantity(val);
                            }}
                            />
                            <div className="delete-buttons"> 
                                <button onClick={() => handleDelete(item)} className="confirm-button"> Aceptar </button> 
                                <button onClick={() => setDeletingId(null)} className="cancel-button"> Cancelar </button>
                            </div> 
                    </div> ) : 
                        ( <button onClick={() => handleDelete(item)} className="delete-button" title="Eliminar" > 
                        <FaTrash />
                        </button> )}
                  </div>
                </div>
              ))}
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
