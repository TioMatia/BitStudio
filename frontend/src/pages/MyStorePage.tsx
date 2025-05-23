import React, { useEffect, useState } from "react";
import { storeApi } from "../api/axios";
import { useNavigate } from "react-router-dom";
import defaultStoreImage from "../assets/FotoPredeterminadaTienda.png";
import "../styles/myStore.css";

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

const MyStorePage: React.FC = () => {
const [store, setStore] = useState<Store | null>(null);
const navigate = useNavigate();
const userId = localStorage.getItem("userId");

useEffect(() => {
const fetchStore = async () => {
try {
const res = await storeApi.get( `/stores/user/${userId} `);
setStore(res.data);
} catch (err) {
console.error("Error al cargar tienda", err);
}
};
fetchStore();
}, [userId]);

if (!store) {
return <p>Cargando información de la tienda...</p>;
}

return (
<div className="my-store-page">
<h2>Mi Tienda</h2>
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
{store.estimatedTime && (
<p><strong>Tiempo estimado:</strong> {store.estimatedTime}</p>
)}
<p><strong>Rating:</strong> ⭐ {store.rating ?? 0}</p>
<p><strong>Envío:</strong> ${store.deliveryFee?.toFixed(2) ?? "0.00"}</p>
</div>
</div>
</div>
);
};

export default MyStorePage;