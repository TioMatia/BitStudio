import { useEffect, useState } from 'react';
import { storeApi } from '../api/axios';
import '../styles/proveedores.css';

interface Provider {
  id: number;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  registeredAt: string;
}

const Proveedores = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const [formData, setFormData] = useState<Omit<Provider, 'id' | 'registeredAt'>>({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: ''
  });

  const storeId = localStorage.getItem('storeId');
  if (!storeId) return <p>No hay tienda seleccionada.</p>;

  const fetchProviders = () => {
    storeApi.get(`/stores/${storeId}/providers`)
      .then(res => setProviders(res.data))
      .catch(err => console.error('Error cargando proveedores:', err));
  };

  useEffect(() => {
    fetchProviders();
  }, [storeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const url = editingProvider
      ? `/stores/${storeId}/providers/${editingProvider.id}`
      : `/stores/${storeId}/providers`;

    const method = editingProvider ? 'put' : 'post';

    storeApi[method](url, formData)
      .then(() => {
        setFormData({ name: '', contactName: '', phone: '', email: '', address: '' });
        setEditingProvider(null);
        setShowForm(false);
        fetchProviders();
      })
      .catch(err => alert('Error al guardar proveedor: ' + err.message));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('¿Eliminar proveedor?')) return;
    storeApi.delete(`/stores/${storeId}/providers/${id}`)
      .then(fetchProviders)
      .catch(err => alert('Error eliminando proveedor: ' + err.message));
  };

  const startEditing = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      contactName: provider.contactName,
      phone: provider.phone,
      email: provider.email,
      address: provider.address
    });
    setShowForm(true);
  };

  return (
    <div className="proveedores-page">
      <div className="proveedor-lista">
        <div className="header">
          <h2>Proveedores</h2>
          <button className="add-btn" onClick={() => { setEditingProvider(null); setShowForm(true); }}>+ Agregar</button>
        </div>
        
        {providers.length === 0 ? (
          <p>No hay proveedores registrados.</p>
        ) : (
          providers.map((p) => (
            <div key={p.id} className="proveedor-card">
              <h4>{p.name}</h4>
              <p><strong>Contacto:</strong> {p.contactName}</p>
              <p><strong>Teléfono:</strong> {p.phone}</p>
              <p><strong>Email:</strong> {p.email}</p>
              <p><strong>Dirección:</strong> {p.address}</p>
              <div className="acciones">
                <button onClick={() => startEditing(p)}>Editar</button>
                <button onClick={() => handleDelete(p.id)} className="eliminar">Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="form-panel">
          <h3>{editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
          <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nombre del proveedor" />
          <input name="contactName" value={formData.contactName} onChange={handleInputChange} placeholder="Nombre de contacto" />
          <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Teléfono" />
          <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
          <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Dirección" />
          <button onClick={handleSubmit}>{editingProvider ? 'Guardar cambios' : 'Crear proveedor'}</button>
          <button className="cancelar" onClick={() => setShowForm(false)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
