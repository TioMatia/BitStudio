import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeApi } from "../api/axios";
import { FaStore } from "react-icons/fa";
import "../styles/crearTienda.css";
const CrearTiendaPage: React.FC = () => {
    const [form, setForm] = useState({
        name: "",
        location: "",
        phone: "",
        description: "",
        image: "",
        deliveryFee: "",
        estimatedTime: ""
    });
    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
        alert("⚠️ No se encontró el usuario logueado.");
        return;
        }
        try {
        await storeApi.post("/stores", {
            name: form.name,
            location: form.location,
            phone: form.phone || undefined,
            description: form.description || undefined,
            image: form.image || undefined,
            deliveryFee: form.deliveryFee ? parseFloat(form.deliveryFee) : undefined,
            estimatedTime: form.estimatedTime || undefined,
            userId: parseInt(userId),      
            owner: userId.toString(),       
            rating: 0                      
        });

        navigate("/seller/mystore", { replace: true });
        } catch (err: any) {
            console.error("❌ Error al crear tienda:", err.response?.data || err);
        }
    };

return (
<div className="create-store-page">
<div className="create-card">
<h2>Crear Tienda</h2>
<form onSubmit={handleSubmit} className="create-form">
<div className="field">
<span>Nombre de la tienda</span>
<input name="name" value={form.name} onChange={handleChange} required />
</div>
<div className="field">
<span>Ubicación</span>
<input name="location" value={form.location} onChange={handleChange} required />
</div>
<div className="field">
<span>Teléfono (opcional)</span>
<input name="phone" value={form.phone} onChange={handleChange} />
</div>
<div className="field">
<span>Descripción (opcional)</span>
<input name="description" value={form.description} onChange={handleChange} />
</div>
<div className="field">
<span>URL de imagen (opcional)</span>
<input name="image" value={form.image} onChange={handleChange} />
</div>
<div className="field">
<span>Costo de envío (opcional)</span>
<input type="number" name="deliveryFee" min="0" step="0.01" value={form.deliveryFee} onChange={handleChange} />
</div>
<div className="field">
<span>Tiempo estimado (opcional)</span>
<input name="estimatedTime" value={form.estimatedTime} onChange={handleChange} />
</div>
<button type="submit" className="button button-primary">
<FaStore className="icon" />
Crear tienda
</button>
</form>
</div>
</div>
);
};

export default CrearTiendaPage;