const baseURLs = {
  auth: import.meta.env.VITE_AUTH_API || 'http://localhost:3001',
  store: import.meta.env.VITE_STORE_API || 'http://localhost:3002',
  inventory: import.meta.env.VITE_INVENTORY_API || 'http://localhost:3003',
  order: import.meta.env.VITE_ORDER_API || 'http://localhost:3004',
};

export default baseURLs;
