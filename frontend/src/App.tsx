import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InterfazComprador from './pages/InterfazComprador';
import InventarioTienda from './pages/InventarioTienda';

function App() {
return (
<Routes>
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/shop" element={<InterfazComprador />} />
<Route path="/shop/:storeId" element={<InventarioTienda />} />
{/*
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/seller/inventory" element={<SellerInventory />} />
<Route path="/delivery/orders" element={<DeliveryOrders />} />
*/}
</Routes>
);
}

export default App;