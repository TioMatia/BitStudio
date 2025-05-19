import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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
    setItemQuantity: (
      state,
      action: PayloadAction<{ itemId: number; quantity: number }>
    ) => {
      const item = state.items.find(i => i.id === action.payload.itemId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.storeId = null;
      state.items = [];
    },

    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const { addItem, setItemQuantity, clearCart, removeItem } = cartSlice.actions;
export default cartSlice.reducer;
