import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeApi } from "../../api/axios";
import "../../styles/interfazComprador.css";
import defaultStoreImage from "../../assets/FotoPredeterminadaTienda.png";
import { motion, AnimatePresence } from "framer-motion";

interface Store {
  id: number;
  name: string;
  description?: string;
  image?: string;
  deliveryFee?: number;
  rating?: number;
  estimatedTime?: string;
  shippingMethod: "pickup" | "delivery" | "both";
}

const AdminStoresPages: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await storeApi.get("/stores");
        setStores(res.data);
      } catch (err: any) {
        console.error("Error al obtener tiendas:", err);
        setError("Error al cargar tiendas. Intenta nuevamente.");
      }
    };
    fetchStores();
  }, []);

  const handleDelete = async (storeId: number) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta tienda? Esta acción no se puede deshacer.");
    if (!confirmDelete) return;

    try {
      await storeApi.delete(`/stores/${storeId}`);
      setStores(prev => prev.filter(store => store.id !== storeId));
    } catch (err: any) {
      console.error("Error al eliminar tienda:", err);
      alert("Hubo un error al eliminar la tienda.");
    }
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <header className="comprador-header">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Buscar tiendas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <section className="store-list">
        <h2>Tiendas disponibles</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="store-grid">
          <AnimatePresence>
            {filteredStores.map((store) => (
              <motion.div
                key={store.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="store-card"
              >
                <img
                  src={store.image || defaultStoreImage}
                  alt={store.name}
                  onClick={() => navigate(`/admin/stores/${store.id}`)}
                />
                <div className="info">
                  <h3>{store.name}</h3>
                  <div className="meta">
                    {store.estimatedTime && (
                      <p><strong>Tiempo estimado:</strong> {store.estimatedTime} minutos</p>
                    )}
                    <span>⭐ {store.rating}</span>
                    {store.shippingMethod === "pickup" ? (
                      <span>Solo retiro en tienda</span>
                    ) : (
                      <span>
                        {store.deliveryFee?.toLocaleString("es-CL", {
                          style: "currency",
                          currency: "CLP",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }) ?? "0"}{" "}envío
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(store.id)}
                    className="delete-store-button"

                  >
                    Eliminar tienda
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <footer className="comprador-footer">
        <p>© 2025 BitStudio. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default AdminStoresPages;
