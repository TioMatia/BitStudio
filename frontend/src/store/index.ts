import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./carritoTienda";

// Cargar desde localStorage
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
  },
  preloadedState: {
    cart: loadCart(),
  },
});

// Guardar automáticamente en localStorage cuando cambia el carrito
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
