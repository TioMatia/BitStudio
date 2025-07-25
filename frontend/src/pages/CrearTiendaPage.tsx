import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [shippingMethod, setShippingMethod] = useState<"delivery" | "pickup" | "both">("pickup");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const uploadImageToCloudinary = async (): Promise<string | undefined> => {
    if (!imageFile) return undefined;
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", "tienda_unsigned");

    try {
      const res = await axios.post("https://api.cloudinary.com/v1_1/dffrle1y3/image/upload", data);
      return res.data.secure_url;
    } catch (error) {
      console.error("Error al subir imagen a Cloudinary", error);
      return undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    if ((shippingMethod === "delivery" || shippingMethod === "both")) {
      if (!form.deliveryFee || parseFloat(form.deliveryFee) <= 0) {
        alert("El costo de envío es obligatorio y debe ser mayor a 0.");
        return;
      }
      if (!form.estimatedTime) {
        alert("El tiempo estimado es obligatorio.");
        return;
      }
    }

    const imageUrl = await uploadImageToCloudinary();

    try {
      await storeApi.post("/stores", {
        name: form.name,
        location: form.location,
        phone: form.phone || undefined,
        description: form.description || undefined,
        image: imageUrl,
        deliveryFee: form.deliveryFee ? parseFloat(form.deliveryFee) : undefined,
        estimatedTime: form.estimatedTime || undefined,
        userId: parseInt(userId),
        owner: userId.toString(),
        rating: 0,
        shippingMethod, 
      });

      navigate("/seller/mystore", { replace: true });
    } catch (err: any) {
      console.error("Error al crear tienda:", err.response?.data || err);
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
            <span>Imagen de la tienda (opcional)</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <div className="field">
            <span>Método de envío</span>
            <select
              name="shippingMethod"
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value as "pickup" | "delivery" | "both")}
              className="select-crear-tienda"
            >
              <option value="pickup">Solo retiro en tienda</option>
              <option value="delivery">Solo delivery</option>
              <option value="both">Ambos (retiro y delivery)</option>
            </select>
          </div>

          {(shippingMethod === "delivery" || shippingMethod === "both") && (
            <>
              <div className="field">
                <span>
                  Costo de envío <strong style={{ color: "red" }}>*</strong>
                </span>
                <input
                  type="number"
                  name="deliveryFee"
                  min="0"
                  step="0.01"
                  value={form.deliveryFee}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <span>
                  Tiempo estimado (min) <strong style={{ color: "red" }}>*</strong>
                </span>
                <input
                  name="estimatedTime"
                  type="number"
                  min="1"
                  value={form.estimatedTime}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

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