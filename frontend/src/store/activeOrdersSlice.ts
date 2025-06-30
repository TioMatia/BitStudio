// src/store/activeOrdersSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderApi } from "../api/axios";

export const fetchActiveOrders = createAsyncThunk(
  "orders/fetchActiveOrders",
  async (userId: string, thunkAPI) => {
    try {
      const res = await orderApi.get(`/orders/user/${userId}`, {
        params: { limit: 5 },
      });

      const orders = res.data.data || [];

      return orders.some((order: any) =>
        ["Pendiente", "Disponible para retiro", "Disponible para delivery"].includes(order.status)
      );
    } catch (err) {
      console.error("Error al verificar órdenes activas:", err);
      return false;
    }
  }
);

const activeOrdersSlice = createSlice({
  name: "activeOrders",
  initialState: {
    hasActiveOrders: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchActiveOrders.fulfilled, (state, action) => {
      state.hasActiveOrders = action.payload;
    });
  },
});

export default activeOrdersSlice.reducer;
