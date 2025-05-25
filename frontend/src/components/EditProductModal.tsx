import React, { useState, useEffect } from "react";
import { inventoryApi } from "../api/axios";
import "../styles/modals.css"

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: any; // Puedes tipar mejor si tienes una interfaz InventoryItem
  onProductUpdated: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ open, onClose, product, onProductUpdated }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: ""
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price.toString(),
        quantity: product.quantity.toString(),
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.patch(`/inventory/${product.id}`, {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
      });
      if (parseFloat(form.price) < 0 || parseInt(form.quantity) < 0) {
        alert("❌ Precio o cantidad no pueden ser negativos.");
        return;
        }
      onProductUpdated();
      onClose();
    } catch (err) {
      console.error("❌ Error al actualizar producto:", err);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Editar Producto</h3>
        <form onSubmit={handleSubmit}>
            
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="Nombre" 
            required />

          <textarea name="description" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="Descripción" />

          <input
            name="price"
            type="number"
            value={form.price}
            min="0"
            onChange={handleChange}
            placeholder="Precio"
            required
            />
            <input
            name="quantity"
            type="number"
            value={form.quantity}
            min="0"
            onChange={handleChange}
            placeholder="Cantidad"
            required
            />

          <div className="modal-actions">
            <button type="submit" className="button button-primary">Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
