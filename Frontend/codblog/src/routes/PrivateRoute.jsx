import React, { useEffect, useState } from "react";
import useApi from "../components/useApi";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { removeLogin, saveLogin } from "../store/slice";
import { jwtDecode } from "jwt-decode";
import { HashLoader } from "react-spinners";

const PrivateRoute = ({ children }) => {
  const api = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { access_token, refresh_token, is_login, user } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const validateToken = async () => {
      setIsValidating(true);

      if (!access_token && !refresh_token) {
        dispatch(removeLogin());
        setIsAuthenticated(false);
        navigate("/");
        setIsValidating(false);
        return;
      }

      if (access_token) {
        const decoded = jwtDecode(access_token);
        if (decoded.exp > Date.now() / 1000) {
          setIsAuthenticated(true);
          setIsValidating(false);
          return;
        }
      }
      if (refresh_token) {
        try {
          const response = await api.post("token/refresh/", {
            refresh: refresh_token,
          });
          if (response.status === 200) {
            dispatch(
              saveLogin({
                access_token: response.data.access,
                refresh_token: response.data.refresh || refresh_token,
                user,
                is_login,
              })
            );
            setIsAuthenticated(true);
            setIsValidating(false);
            return;
          }
        } catch (error) {
          console.warn("Token validation failed", error);
          dispatch(removeLogin());
          navigate("/");
          setIsAuthenticated(false);
          setIsValidating(false);
        }
      }
    };
    validateToken();
  }, [access_token, refresh_token, api, dispatch, navigate]);

  if (isValidating) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#8a2be2" size={60} />
      </div>
    );
  }
  if (!isAuthenticated && !is_login) {
    return <Navigate to="/" replace={true} />;
  }

  return children;
};

export default PrivateRoute;
