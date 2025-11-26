import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";

const RequireAdmin = ({ children }) => {
  const location = useLocation();

  // Token stocké ?
  const token = localStorage.getItem("token");

  // User stocké dans localStorage ?
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  // Pas de token → pas connecté
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Données utilisateur manquantes → login
  if (!storedUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Vérification rôle admin
  const isAdmin =
    storedUser?.is_admin === true ||
    storedUser?.is_admin === 1 ||
    String(storedUser?.role || "").toLowerCase() === "admin" ||
    (Array.isArray(storedUser?.role_names) &&
      storedUser.role_names
        .map((r) => String(r).toLowerCase())
        .includes("admin"));

  if (!isAdmin) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAdmin;
