import { Routes, Route,Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InterfazComprador from './pages/InterfazComprador';
import InventarioTienda from './pages/InventarioTienda';
import PrivateRouteComprador from "./Restricciones/PrivateRouteComprador";
import NotFound from './pages/Control/NotFound';
import CarritoPage from "./pages/CarritoPage";
import ForbiddenPage from "./pages/Control/Forbidden";
import CrearTiendaPage from "./pages/CrearTiendaPage";
import MyStorePage from './pages/MyStorePage';
import PrivateRouteLocatario from './Restricciones/PrivateRouteLocatario';

import ShopLayout from './layouts/ShopLayout';
import SellerLayout from './layouts/SellerLayout';
import HistorialVendedor from './pages/HistorialVendedor';
import Proveedores from './pages/Proveedores';

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminStoresPage from "./pages/Admin/AdminStoresPage";
import AdminLayout from "./layouts/AdminLayout";
import PrivateRouteAdmin from "./Restricciones/PrivateRouteAdmin";
import HistorialDeCompras from './pages/HistorialDeCompras';
import AdminInventoryPage from './pages/Admin/AdminInventoryPage';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setCredentials } from './store/auth';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    if (token && userString) {
      const user = JSON.parse(userString);
      dispatch(setCredentials({ user, token }));
    }
  }, [dispatch]);
  
  return (
    
    <Routes>
       <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      

       
      <Route element={<PrivateRouteComprador />}>
        <Route element={<ShopLayout />}>
          <Route path="/shop" >
            <Route index element={<InterfazComprador />} />
            <Route path=":storeId" element={<InventarioTienda />} />
          </Route>
          <Route path="/cart" element={<CarritoPage />} />
          <Route path="/history" element ={<HistorialDeCompras/>} />
        </Route>
      </Route>

      <Route element={<PrivateRouteLocatario />}>
      <Route path="/seller/crear-tienda" element={<CrearTiendaPage />} />
          <Route element={<SellerLayout />}>
            <Route path="/seller/mystore" element={<MyStorePage />} />
            <Route path= "/seller/historial" element ={<HistorialVendedor />} />
            <Route path= "/seller/proveedores" element ={<Proveedores />} />
          </Route>
      </Route>
      <Route element={<PrivateRouteAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          <Route path="/admin/stores">
            <Route index element={<AdminStoresPage />} />
            <Route path=":storeId" element={<AdminInventoryPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
