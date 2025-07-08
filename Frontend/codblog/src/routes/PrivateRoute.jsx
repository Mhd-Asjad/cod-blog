// routes/PrivateRoute.jsx

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const PrivateRoute = ({ children }) => {
  const hasShownToast = useRef(false);
  const { is_login } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!is_login && !hasShownToast.current) {
      toast.error("Please login to access this page.");
      hasShownToast.current = true;
    }
  }, [is_login]);

  if (!is_login) {
    return <Navigate to="/" replace={true} />;
  }

  return children;
};

export default PrivateRoute;
