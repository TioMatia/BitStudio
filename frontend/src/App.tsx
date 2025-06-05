import { Routes, Route } from 'react-router-dom';

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

function App() {

  return (
    
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      

        {/* Rutas protegidas solo para comprador */}
      <Route element={<PrivateRouteComprador />}>
        <Route element={<ShopLayout />}>
          <Route path="/shop" >
            <Route index element={<InterfazComprador />} />
            <Route path=":storeId" element={<InventarioTienda />} />
          </Route>
          <Route path="/cart" element={<CarritoPage />} />
        </Route>
      </Route>

      <Route element={<PrivateRouteLocatario />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller/crear-tienda" element={<CrearTiendaPage />} />
            <Route path="/seller/mystore" element={<MyStorePage />} />
            <Route path= "/seller/historial" element ={<HistorialVendedor />} />
            <Route path= "/seller/proveedores" element ={<Proveedores />} />
          </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>

  );
}

export default App;
