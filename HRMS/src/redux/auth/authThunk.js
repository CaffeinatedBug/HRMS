import { createAsyncThunk } from "@reduxjs/toolkit";
import BaseApiManager from "../../api/BaseApiManager";
import { AUTH } from "../../api/endpoints";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, thunkAPI) => {
    try {
      const response =
        await BaseApiManager.post(
          AUTH.LOGIN,
          credentials
        );

      localStorage.setItem(
        "token",
        response.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message ||
          error.error ||
          "Login Failed"
      );
    }
  }
);

export const registerUser =
  createAsyncThunk(
    "auth/registerUser",
    async (payload, thunkAPI) => {
      try {
        const response =
          await BaseApiManager.post(
            AUTH.REGISTER,
            payload
          );

        localStorage.setItem(
          "token",
          response.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(response.user)
        );

      return response;
    } catch (error) {
      const validationMessage =
        error.errors?.[0]
          ?.msg;

      return thunkAPI.rejectWithValue(
        validationMessage ||
        error.message ||
          error.error ||
          "Registration failed"
        );
      }
    }
  );

export const getProfile =
  createAsyncThunk(
    "auth/getProfile",
    async (_, thunkAPI) => {
      try {
        const response =
          await BaseApiManager.get(
            AUTH.PROFILE
          );

        return response.user;
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.message ||
            error.error ||
            "Failed to load profile"
        );
      }
    }
  );

export const logoutUser =
  createAsyncThunk(
    "auth/logoutUser",
    async () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      return true;
    }
  );
