import React, { useState, useEffect } from "react";
import { inventoryApi, storeApi } from "../api/axios";
import "../styles/modals.css";

interface Provider {
  id: number;
  name: string;
}

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: any;
  onProductUpdated: () => void;
}

function formatCLP(value: string) {
  if (!value) return "";
  // Quitar todo excepto dígitos y coma/punto decimal
  const onlyNums = value.replace(/[^0-9.,]/g, '');
  // Normalizar coma a punto para parsear
  const normalized = onlyNums.replace(',', '.');
  const number = parseFloat(normalized);
  if (isNaN(number)) return "";
  // Formatear sin decimales, estilo CLP
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

function unformatCLP(value: string) {
  if (!value) return "";
  // Quitar símbolos, puntos y espacios
  return value.replace(/[^0-9,]/g, '').replace(/\./g, '').replace(/,/g, '.');
}

const EditProductModal: React.FC<EditProductModalProps> = ({ open, onClose, product, onProductUpdated }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "", // precio como string formateado
    quantity: "",
    providerId: "",
  });

  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    if (open && product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price !== undefined ? product.price.toString() : "",
        quantity: product.quantity?.toString() || "",
        providerId: product.providerId ? product.providerId.toString() : "",
      });

      if (product.storeId) {
        storeApi.get(`/stores/${product.storeId}/providers`)
          .then(res => setProviders(res.data))
          .catch(err => console.error("Error al cargar proveedores:", err));
      }
    }
  }, [open, product]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Guardar valor sin formato (limpio)
    const cleanValue = unformatCLP(input);
    setForm(prev => ({ ...prev, price: cleanValue }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "price") return; // price lo manejamos aparte
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parsear precio float desde string limpio
    const priceNumber = parseFloat(form.price);
    const quantityNumber = parseInt(form.quantity);

    if (priceNumber < 0 || quantityNumber < 0) {
      alert("❌ Precio o cantidad no pueden ser negativos.");
      return;
    }

    try {
      await inventoryApi.patch(`/inventory/${product.id}`, {
        name: form.name,
        description: form.description,
        price: priceNumber,
        quantity: quantityNumber,
        providerId: form.providerId ? parseInt(form.providerId) : null,
      });

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
          <label> Nombre:
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
          </label>

          <label> Descripción:
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción"
            />
          </label>

          <label> Precio:
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
          </label>

          <label> Cantidad:
            <input
              name="quantity"
              type="number"
              value={form.quantity}
              min="0"
              onChange={handleChange}
              placeholder="Cantidad"
              required
            />
          </label>

          <label> Proveedor:
            <select
              name="providerId"
              value={form.providerId}
              onChange={handleChange}
            >
              <option value="">-- Sin proveedor --</option>
              {providers.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
          </label>

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
