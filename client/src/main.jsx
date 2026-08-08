import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App.jsx";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Root element with id "root" was not found.'
  );
}

if (!googleClientId) {
  console.warn(
    "VITE_GOOGLE_CLIENT_ID is not configured. Google authentication will not work."
  );
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={googleClientId}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);