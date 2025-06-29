import React, { useEffect, useState } from "react";
import { inventoryApi, storeApi } from "../api/axios";
import axios from "axios";
import "../styles/modals.css";

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: number;
  onProductAdded: () => void;
}

interface Provider {
  id: number;
  name: string;
}

function formatCLP(value: string) {
  if (!value) return "";
  const onlyNums = value.replace(/[^0-9.,]/g, '');
  const normalized = onlyNums.replace(',', '.');
  const number = parseFloat(normalized);
  if (isNaN(number)) return "";
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

function unformatCLP(value: string) {
  if (!value) return "";
  return value.replace(/[^0-9,]/g, '').replace(/\./g, '').replace(/,/g, '.');
}

const AddProductModal: React.FC<Props> = ({ open, onClose, storeId, onProductAdded }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    providerId: "",
    image: null as File | null,
  });

  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    if (open) {
      storeApi.get(`/stores/${storeId}/providers`)
        .then(res => setProviders(res.data))
        .catch(err => console.error("Error al cargar proveedores:", err));
    }
  }, [open, storeId]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const clean = unformatCLP(input);
    setForm(prev => ({ ...prev, price: clean }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files) {
      setForm(prev => ({ ...prev, image: files[0] }));
    } else if (name !== "price") {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNumber = parseFloat(form.price);
    const quantityNumber = parseInt(form.quantity);

    if (priceNumber < 0 || quantityNumber < 0) {
      alert("❌ Precio o cantidad no pueden ser negativos.");
      return;
    }

    let imageUrl = "";
    if (form.image) {
      const uploadData = new FormData();
      uploadData.append("file", form.image);
      uploadData.append("upload_preset", "tienda_unsigned");

      const res = await axios.post("https://api.cloudinary.com/v1_1/dffrle1y3/image/upload", uploadData);
      imageUrl = res.data.secure_url;
    }

    await inventoryApi.post("/inventory", {
      name: form.name,
      description: form.description,
      price: priceNumber,
      quantity: quantityNumber,
      storeId,
      ...(form.providerId && { providerId: parseInt(form.providerId) }),
      ...(imageUrl && { image: imageUrl }),
    });

    setForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      providerId: "",
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
          <input
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
          />

          <div className="input-with-prefix">
            <input
              name="price"
              type="text"
              value={formatCLP(form.price)}
              onChange={handlePriceChange}
              placeholder="$0"
              required
            />
          </div>

          <input
            name="quantity"
            type="number"
            min="1"
            placeholder="Cantidad"
            value={form.quantity}
            onChange={handleChange}
            required
          />

          <select name="providerId" value={form.providerId} onChange={handleChange}>
            <option value="">Seleccionar proveedor ↴</option>
            {providers.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>

          <input name="image" type="file" accept="image/*" onChange={handleChange} />

          <div className="modal-actions">
            <button type="submit">Agregar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;