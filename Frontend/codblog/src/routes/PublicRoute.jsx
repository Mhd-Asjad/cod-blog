import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const is_login = useSelector((state) => state.auth.is_login);

  if (is_login) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
