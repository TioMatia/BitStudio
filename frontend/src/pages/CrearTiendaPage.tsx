import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeApi } from "../api/axios";

const CrearTiendaPage: React.FC = () => {
const [form, setForm] = useState({
name: "",
owner: "",
location: "",
});
const navigate = useNavigate();

const userId = localStorage.getItem("userId");

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
try {
await storeApi.post("/store", { ...form, owner: userId });
navigate("/seller/inventory");
} catch (err: any) {
console.error("❌ Error al crear tienda:", err);
}
};

return (
<div className="create-store-page">
<h2>Crear Tienda</h2>
<form onSubmit={handleSubmit}>
<input name="name" placeholder="Nombre de la tienda" value={form.name} onChange={handleChange} required />
<input name="location" placeholder="Ubicación" value={form.location} onChange={handleChange} required />
<button type="submit">Crear tienda</button>
</form>
</div>
);
};

export default CrearTiendaPage;