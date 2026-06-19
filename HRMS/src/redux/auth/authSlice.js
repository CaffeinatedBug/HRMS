import { createSlice } from "@reduxjs/toolkit";

import {
  loginUser,
  registerUser,
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
  initialized: !token,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
          state.initialized =
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
          state.initialized =
            true;
        }
      )
      .addCase(
        registerUser.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        registerUser.fulfilled,
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
          state.initialized =
            true;
        }
      )
      .addCase(
        registerUser.rejected,
        (
          state,
          action
        ) => {
          state.loading = false;
          state.error =
            action.payload;
          state.initialized =
            true;
        }
      )
      .addCase(
        getProfile.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        getProfile.fulfilled,
        (
          state,
          action
        ) => {
          state.loading = false;
          state.error = null;
          state.user =
            action.payload;
          state.isAuthenticated =
            true;
          state.initialized =
            true;
        }
      )
      .addCase(
        getProfile.rejected,
        (
          state,
          action
        ) => {
          localStorage.removeItem(
            "token"
          );
          localStorage.removeItem(
            "user"
          );

          state.loading = false;
          state.user = null;
          state.token = null;
          state.error =
            action.payload || null;
          state.isAuthenticated =
            false;
          state.initialized =
            true;
        }
      )
      .addCase(
        logoutUser.fulfilled,
        (state) => {
          state.user = null;
          state.token = null;
          state.error = null;
          state.isAuthenticated =
            false;
          state.initialized =
            true;
        }
      );
  },
});

export default authSlice.reducer;
