import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  inventoryId: number;
}

interface CartState {
  storeId: number | null;
  items: CartItem[];
}

const getUserId = () => localStorage.getItem("userId");

const saveCartForUser = (state: CartState) => {
  const userId = getUserId();
  if (userId) {
    localStorage.setItem(`cart_${userId}`, JSON.stringify(state));
  }
};

const initialState: CartState = {
  storeId: null,
  items: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    loadCart: (state) => {
      const userId = getUserId();
      if (!userId) {
        state.storeId = null;
        state.items = [];
      } else {
        const data = localStorage.getItem(`cart_${userId}`);
        const parsed: CartState = data
          ? JSON.parse(data)
          : { storeId: null, items: [] };
        state.storeId = parsed.storeId;
        state.items = parsed.items;
      }
    },

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
        existing.quantity = item.quantity;
      } else {
        state.items.push(item);
      }
      saveCartForUser(state);
    },

    setItemQuantity: (
      state,
      action: PayloadAction<{ itemId: number; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.itemId);
      if (item) {
        item.quantity = action.payload.quantity;
        saveCartForUser(state);
      }
    },

    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveCartForUser(state);
    },

    clearCart: (state) => {
      state.storeId = null;
      state.items = [];
      saveCartForUser(state);
    },
  },
});

export const {
  loadCart,
  addItem,
  setItemQuantity,
  removeItem,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
