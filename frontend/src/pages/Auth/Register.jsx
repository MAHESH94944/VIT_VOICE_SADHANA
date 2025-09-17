import React from "react";
import { Navigate } from "react-router-dom";

export default function Register() {
  // Single auth page: forward /register to the Google login page
  return <Navigate to="/login" replace />;
}
