import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeApi } from "../api/axios";
import "../styles/interfazComprador.css";
import defaultStoreImage from "../assets/FotoPredeterminadaTienda.png";
import { motion, AnimatePresence } from "framer-motion";

interface Store {
  id: number;
  name: string;
  description?: string;
  image?: string;
  deliveryFee?: number;
  rating?: number;
  estimatedTime?: string;
}

const InterfazComprador: React.FC = () => {
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
      console.error("❌ Error al obtener tiendas:", err);
      setError("Error al cargar tiendas. Intenta nuevamente.");
    }
  };
  fetchStores();
}, []);

const filteredStores = stores.filter((store) =>
store.name.toLowerCase().includes(search.toLowerCase())
);

return (
  <div className="page">
      <header className="comprador-header">
        <div className="header-top">
          <h1>TIENDAS</h1>
        </div>
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
    onClick={() => navigate(`/shop/${store.id}`)}
    >
    <img
    src={store.image || defaultStoreImage}
    alt={store.name}
    />
    <div className="info">
    <h3>{store.name}</h3>
    <div className="meta">
    <span>{store.estimatedTime || "20–30 min"}</span>
    <span>⭐ {store.rating ?? "4.5"}</span>
    <span>${store.deliveryFee?.toFixed(2) ?? "2.99"} envío</span>
    </div>
    </div>
    </motion.div>
    ))}
    </AnimatePresence>
    </div>
    </section>
      <footer className="comprador-footer">
        <p>© 2025 BitStudio. Todos los derechos reservadoss.</p>
      </footer>
  </div>
);
};

export default InterfazComprador;