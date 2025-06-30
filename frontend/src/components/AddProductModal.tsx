// AddProductModal.tsx
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

interface Category {
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  useEffect(() => {
    if (open) {
      storeApi.get(`/stores/${storeId}/providers`)
        .then(res => setProviders(res.data))
        .catch(err => console.error("Error al cargar proveedores:", err));

      inventoryApi.get(`/categories/store/${storeId}`)
        .then(res => setCategories(res.data))
        .catch(err => console.error("Error al cargar categorías:", err));
    }
  }, [open, storeId]);

  useEffect(() => {
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    const exists = categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      alert("La categoría ya existe");
      return;
    }

    try {
      const res = await inventoryApi.post("/categories", {
        name: trimmedName,
        storeId,
      });

      const newCat = res.data;
      setCategories(prev => [...prev, newCat]);
      setSelectedCategories(prev => [...prev, newCat.id]);
      setNewCategoryName("");
    } catch (error) {
      console.error("Error al crear categoría:", error);
      alert("No se pudo crear la categoría.");
    }
  };

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

  const handleDeleteCategory = async (categoryId: number) => {
    const categoryName = categories.find(c => c.id === categoryId)?.name ?? "la categoría";
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar ${categoryName}? Esta acción no se puede deshacer.`);
    if (!confirmDelete) return;

    try {
      await inventoryApi.delete(`/categories/${categoryId}`);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      alert("No se pudo eliminar la categoría.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNumber = parseFloat(form.price);
    const quantityNumber = parseInt(form.quantity);

    if (priceNumber < 0 || quantityNumber < 0) {
      alert("Precio o cantidad no pueden ser negativos.");
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
      categoryIds: selectedCategories,
    });

    setForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      providerId: "",
      image: null,
    });
    setSelectedCategories([]);
    setNewCategoryName("");
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
          <textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />
          <div className="input-with-prefix">
            <input name="price" type="text" value={formatCLP(form.price)} onChange={handlePriceChange} placeholder="$0" required />
          </div>
          <input name="quantity" type="number" min="1" placeholder="Cantidad" value={form.quantity} onChange={handleChange} required />

          <label>Categorías:</label>
          <div className="categories-container">
            <div className="categories-list">
              {categories.map((cat) => (
                <div key={cat.id} className="category-item">
                  <div className="category-content">
                    <input
                      type="checkbox"
                      id={`cat-${cat.id}`}
                      value={cat.id}
                      checked={selectedCategories.includes(cat.id)}
                      onChange={(e) => {
                        const id = parseInt(e.target.value);
                        if (e.target.checked) {
                          setSelectedCategories((prev) => [...prev, id]);
                        } else {
                          setSelectedCategories((prev) => prev.filter((catId) => catId !== id));
                        }
                      }}
                    />
                    <label htmlFor={`cat-${cat.id}`}>{cat.name}</label>
                  </div>

                  <button
                    type="button"
                    className="delete-category-button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    aria-label={`Eliminar categoría ${cat.name}`}
                  >
                    ×
                  </button>
                </div>

              ))}
            </div>

            <div className="selected-category-tags">
              {selectedCategories.map((catId) => {
                const cat = categories.find((c) => c.id === catId);
                if (!cat) return null;
                return (
                  <span key={cat.id} className="category-tag removable">
                    {cat.name}
                    <button type="button" onClick={() => setSelectedCategories((prev) => prev.filter((id) => id !== cat.id))}>×</button>
                  </span>
                );
              })}
            </div>

            <div className="new-category-wrapper">
              <input
                type="text"
                className="new-category-input"
                placeholder="Nueva categoría"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
              />
              <button type="button" className="new-category-button" onClick={handleAddCategory}>
                + Agregar categoría
              </button>
            </div>
          </div>

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
