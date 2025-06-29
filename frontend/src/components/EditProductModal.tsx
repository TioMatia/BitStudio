import React, { useState, useEffect } from "react";
import { inventoryApi, storeApi } from "../api/axios";
import axios from "axios";
import "../styles/modals.css";

interface Provider {
  id: number;
  name: string;
}

interface Category {
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

const EditProductModal: React.FC<EditProductModalProps> = ({ open, onClose, product, onProductUpdated }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    providerId: "",
  });

  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

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

        inventoryApi.get(`/categories/store/${product.storeId}`)
          .then(res => setCategories(res.data))
          .catch(err => console.error("Error al cargar categorías:", err));
      }

      if (product.categories) {
        setSelectedCategories(product.categories.map((cat: Category) => cat.id));
      }
    }
  }, [open, product]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cleanValue = unformatCLP(input);
    setForm(prev => ({ ...prev, price: cleanValue }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "price") return;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    const exists = categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) return alert("La categoría ya existe");

    try {
      const res = await inventoryApi.post("/categories", {
        name: trimmedName,
        storeId: product.storeId,
      });

      const newCat = res.data;
      setCategories(prev => [...prev, newCat]);
      setSelectedCategories(prev => [...prev, newCat.id]);
      setNewCategoryName("");
    } catch (error) {
      console.error("Error al crear categoría:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm("¿Eliminar categoría?")) return;
    try {
      await inventoryApi.delete(`/categories/${categoryId}`);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    } catch (err) {
      console.error("Error al eliminar categoría:", err);
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

    let imageUrl = product.image || "";
    if (image) {
      const uploadData = new FormData();
      uploadData.append("file", image);
      uploadData.append("upload_preset", "tienda_unsigned");

      const res = await axios.post("https://api.cloudinary.com/v1_1/dffrle1y3/image/upload", uploadData);
      imageUrl = res.data.secure_url;
    }

    try {
      await inventoryApi.patch(`/inventory/${product.id}`, {
        name: form.name,
        description: form.description,
        price: priceNumber,
        quantity: quantityNumber,
        providerId: form.providerId ? parseInt(form.providerId) : null,
        image: imageUrl,
        categoryIds: selectedCategories,
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
          <label>Nombre:
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
          </label>

          <label>Descripción:
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" />
          </label>

          <label>Precio:
            <div className="input-with-prefix">
              <input name="price" type="text" value={formatCLP(form.price)} onChange={handlePriceChange} placeholder="$0" required />
            </div>
          </label>

          <label>Cantidad:
            <input name="quantity" type="number" value={form.quantity} min="0" onChange={handleChange} placeholder="Cantidad" required />
          </label>
          <label>Categorías:</label>
          <div className="categories-container">
            <div className="categories-list">
              {categories.map(cat => (
                <div key={cat.id} className="category-item">
                  <input
                    type="checkbox"
                    id={`cat-${cat.id}`}
                    checked={selectedCategories.includes(cat.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedCategories((prev) => {
                        if (checked) {
                          return [...prev, cat.id];
                        } else {
                          return prev.filter(id => id !== cat.id);
                        }
                      });
                    }}
                  />
                  <label htmlFor={`cat-${cat.id}`}>{cat.name}</label>
                  <button type="button" className="delete-category-button" onClick={() => handleDeleteCategory(cat.id)}>×</button>
                </div>
              ))}
            </div>

            <div className="new-category-wrapper">
              <input
                type="text"
                className="new-category-input"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Nueva categoría"
              />
              <button type="button" className="new-category-button" onClick={handleAddCategory}>
                + Agregar categoría
              </button>
            </div>

          <label>Proveedor:
            <select name="providerId" value={form.providerId} onChange={handleChange}>
              <option value="">-- Sin proveedor --</option>
              {providers.map(prov => (
                <option key={prov.id} value={prov.id}>{prov.name}</option>
              ))}
            </select>
          </label>

          <label>Imagen:
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
          </label>
          </div>
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
