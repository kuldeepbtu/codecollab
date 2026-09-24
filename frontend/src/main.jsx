import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/global.css";
import App from "./App";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-right" />
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);