import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    pendingCount: 0,
  },
  reducers: {
    setPendingCount: (state, action) => {
      state.pendingCount = action.payload;
    },
  },
});

export const { setPendingCount } = notificationSlice.actions;
export default notificationSlice.reducer;
