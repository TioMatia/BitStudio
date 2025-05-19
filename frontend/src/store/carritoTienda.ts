import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  storeId: number | null;
  items: CartItem[];
}

const initialState: CartState = {
  storeId: null,
  items: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<{ storeId: number; item: CartItem }>
    ) => {
      const { storeId, item } = action.payload;

      if (state.storeId && state.storeId !== storeId) {
        state.items = [];
      }

      state.storeId = storeId;

      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
    },
    clearCart: (state) => {
      state.storeId = null;
      state.items = [];
    },
  },
});

export const { addItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
