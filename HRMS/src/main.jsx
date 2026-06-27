import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { Provider } from "react-redux";
import { store } from "./app/store";

import { BrowserRouter } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import ErrorBoundary from "./components/common/ErrorBoundary";

import "react-toastify/dist/ReactToastify.css";
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
          />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);