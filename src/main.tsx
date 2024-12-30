import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import { SnackbarProvider } from "notistack";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SnackbarProvider
        maxSnack={2}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        <App />
      </SnackbarProvider>
    </BrowserRouter>
  </StrictMode>
);
