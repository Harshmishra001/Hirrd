import { ClerkProvider } from "@clerk/clerk-react";
import { shadesOfPurple } from "@clerk/themes";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Add error handling for Clerk initialization
const handleClerkError = (error) => {
  console.error("Clerk initialization error:", error);
  // Render a fallback UI when Clerk fails to initialize
  ReactDOM.createRoot(document.getElementById("root")).render(
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Authentication Service Unavailable</h1>
      <p>We're experiencing issues with our authentication service. Please try again later.</p>
    </div>
  );
};

try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <ClerkProvider
        appearance={{
          baseTheme: shadesOfPurple,
        }}
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
} catch (error) {
  handleClerkError(error);
}
