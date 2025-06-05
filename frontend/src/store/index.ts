import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./carritoTienda";
import authReducer from "./auth";

const loadCart = () => {
  try {
    const saved = localStorage.getItem("cart");
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error("❌ Error al cargar carrito:", err);
  }
  return undefined;
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
  preloadedState: {
    cart: loadCart(),
  },
});

store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem("cart", JSON.stringify(state.cart));
  } catch (err) {
    console.error("❌ Error al guardar carrito:", err);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
