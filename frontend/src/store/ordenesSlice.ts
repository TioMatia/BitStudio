import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderApi } from "../api/axios";

export const fetchActiveOrders = createAsyncThunk(
  "ordenes/fetchActiveOrders",
  async (storeId: string | null) => {
    if (!storeId) return false;

    const res = await orderApi.get(`/orders/store/${storeId}`);
    const orders = Array.isArray(res.data) ? res.data : res.data.data;

    const hasActive = orders.some((order: any) =>
      ["Pendiente", "Disponible para retiro", "Disponible para delivery"].includes(order.status)
    );

    return hasActive;
  }
);

const ordenesSlice = createSlice({
  name: "ordenes",
  initialState: {
    hasActiveOrders: false,
  },
  reducers: {
    clearActiveOrders: (state) => {
      state.hasActiveOrders = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchActiveOrders.fulfilled, (state, action) => {
      state.hasActiveOrders = action.payload;
    });
  },
});

export const { clearActiveOrders } = ordenesSlice.actions;
export default ordenesSlice.reducer;