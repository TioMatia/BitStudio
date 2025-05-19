import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InterfazComprador from './pages/InterfazComprador';
import InventarioTienda from './pages/InventarioTienda';
import PrivateRouteComprador from "./Restricciones/PrivateRouteComprador";
import NotFound from './pages/NotFound';
import CarritoPage from "./pages/CarritoPage";
import ShopLayout from './layouts/shopLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Layout con header para secciones del comprador */}
      <Route element={<ShopLayout />}>
        <Route path="/shop" element={<PrivateRouteComprador />}>
          <Route index element={<InterfazComprador />} />
          <Route path=":storeId" element={<InventarioTienda />} />
        </Route>
        <Route path="/cart" element={<CarritoPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
