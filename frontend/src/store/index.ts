
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./carritoTienda";

const savedCart = localStorage.getItem("cart");
const preloadedState = savedCart ? { cart: JSON.parse(savedCart) } : {};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  localStorage.setItem("cart", JSON.stringify(store.getState().cart));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
