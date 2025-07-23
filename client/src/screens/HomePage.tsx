import React from "react";
import Home from "./Home";

// Wrap Home component with error boundary
export default function HomePage() {
  try {
    return <Home />;
  } catch (error) {
    console.error("Error in HomePage:", error);
    return <div className="min-h-screen flex items-center justify-center"><p>Error loading home page</p></div>;
  }
}
