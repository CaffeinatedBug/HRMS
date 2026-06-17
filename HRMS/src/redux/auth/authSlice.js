import { createSlice } from "@reduxjs/toolkit";

import {
  loginUser,
  getProfile,
  logoutUser,
} from "./authThunk";

const user = JSON.parse(
  localStorage.getItem("user")
);

const token =
  localStorage.getItem("token");

const initialState = {
  user: user || null,
  token: token || null,
  loading: false,
  error: null,
  isAuthenticated:
    !!token,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      /*
      =========================
      LOGIN
      =========================
      */

      .addCase(
        loginUser.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        loginUser.fulfilled,
        (
          state,
          action
        ) => {
          state.loading = false;

          state.user =
            action.payload.user;

          state.token =
            action.payload.token;

          state.isAuthenticated =
            true;
        }
      )

      .addCase(
        loginUser.rejected,
        (
          state,
          action
        ) => {
          state.loading = false;

          state.error =
            action.payload;
        }
      )

      /*
      =========================
      PROFILE
      =========================
      */

      .addCase(
        getProfile.fulfilled,
        (
          state,
          action
        ) => {
          state.user =
            action.payload;
        }
      )

      /*
      =========================
      LOGOUT
      =========================
      */

      .addCase(
        logoutUser.fulfilled,
        (state) => {
          state.user = null;

          state.token = null;

          state.isAuthenticated =
            false;
        }
      );
  },
});

export default authSlice.reducer;
