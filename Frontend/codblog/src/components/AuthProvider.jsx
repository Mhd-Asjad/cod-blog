import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useApi from "./useApi";
import { removeLogin, saveLogin } from "../store/slice";
import { jwtDecode } from "jwt-decode";
import { HashLoader } from "react-spinners";
import { AwardIcon } from "lucide-react";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const api = useApi();
  const { access_token, refresh_token, user } = useSelector(
    (state) => state.auth
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;

    const checkAuth = async () => {
      try {
        if (!refresh_token) throw new Error("No refresh token found.");

        const response = await api.post(`token/refresh/`, {
          refresh: refresh_token,
        });

        const newAccess = response.data.access;
        const newRefresh = response.data.refresh || refresh_token;

        const decoded = jwtDecode(newAccess);

        if (decoded.exp > Date.now() / 1000) {
          dispatch(
            saveLogin({
              access_token: newAccess,
              refresh_token: newRefresh,
              user,
              is_login: true,
            })
          );
        } else {
          throw new Error("Refreshed access token is already expired");
        }
      } catch (error) {
        console.error(
          "Token refresh failed:",
          error?.response?.data || error.message
        );
        dispatch(removeLogin());
      }
    };

    const initialCheck = async () => {
      try {
        if (access_token) {
          const decoded = jwtDecode(access_token);

          if (decoded.exp > Date.now() / 1000) {
            setLoading(false);
            return;
          }
        }

        await checkAuth();
      } catch (error) {
        console.error("Initial auth check failed:", error.message);
        dispatch(removeLogin());
      } finally {
        setLoading(false);
      }
    };

    initialCheck();

    interval = setInterval(() => {
      checkAuth();
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, [access_token, refresh_token, dispatch, api, user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#8a2be2" size={60} />
      </div>
    );
  }

  return children;
};

export default AuthProvider;
