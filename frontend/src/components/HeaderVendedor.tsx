import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchActiveOrders } from "../store/ordenesSlice"; // tu thunk
import "../styles/header.css";

const HeaderVendedor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const dispatch = useDispatch<AppDispatch>();
  const hasActiveOrders = useSelector((state: RootState) => state.ordenes.hasActiveOrders);
  const storeId = localStorage.getItem("storeId");

  useEffect(() => {
    if (storeId) {
      dispatch(fetchActiveOrders(storeId));
    }
  }, [dispatch, storeId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("storeId");
    navigate("/login");
  };

  return (
    <div className="header-container">
      <div className="header-title">BITSTUDIO</div>
      <div className="header-actions">
        {currentPath !== "/seller/mystore" && (
          <button className="provider-button" onClick={() => navigate("/seller/mystore")}>
            Mi Tienda
          </button>
        )}
        {currentPath !== "/seller/historial" && (
          <div className="indicator-wrapper">
            <button className="provider-button" onClick={() => navigate("/seller/historial")}>
              Ventas
            </button>
            {hasActiveOrders && <span className="order-indicator" />}
          </div>
        )}
        {currentPath !== "/seller/proveedores" && (
          <button className="provider-button" onClick={() => navigate("/seller/proveedores")}>
            Administrar Proveedores
          </button>
        )}
        <div className="vertical-separator" />
        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default HeaderVendedor;
