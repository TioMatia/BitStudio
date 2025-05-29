import React, { useState } from "react";
import { inventoryApi } from "../api/axios";
import axios from "axios";
import "../styles/modals.css"

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: number;
  onProductAdded: () => void;
}

const AddProductModal: React.FC<Props> = ({ open, onClose, storeId, onProductAdded }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "image" && e.target.files) {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = "";
    if (form.image) {
      const uploadData = new FormData();
      uploadData.append("file", form.image);
      uploadData.append("upload_preset", "tienda_unsigned"); // Reemplaza con el preset real

      const res = await axios.post(`https://api.cloudinary.com/v1_1/dffrle1y3/image/upload`, uploadData);
      imageUrl = res.data.secure_url;
    }

    await inventoryApi.post("/inventory", {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      storeId,
      ...(imageUrl.trim() !== "" && { image: imageUrl }),
    });
    
    setForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      image: null,
    });

    onProductAdded();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Agregar producto</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
          <input name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />
          <input name="price" placeholder="Precio" type="number" min="0" value={form.price} onChange={handleChange} required />
          <input name="quantity" placeholder="Cantidad" type="number" min="1" value={form.quantity} onChange={handleChange} required />
          <input name="image" type="file" accept="image/*" onChange={handleChange} />
          <button type="submit">Agregar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
