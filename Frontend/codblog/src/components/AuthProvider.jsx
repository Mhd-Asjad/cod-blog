import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useApi from "./useApi";
import { removeLogin, saveLogin } from "../store/slice";
import { jwtDecode } from "jwt-decode";
import { HashLoader } from "react-spinners";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const api = useApi();
  const { access_token, refresh_token, user, is_login } = useSelector(
    (state) => state.auth
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (access_token) {
          const decoded = jwtDecode(access_token);
          if (decoded.exp > Date.now() / 1000) {
            setLoading(false);
            return;
          }
        }

        if (refresh_token) {
          const response = await api.post("token/refresh/", {
            refresh: refresh_token,
          });

          const newAccess = response.data.aceess;
          const newRefresh = response.data.refresh || refresh_token;

          const decoded = jwtDecode(newAccess);
          if (decoded.exp > Date.now() / 1000) {
            dispatch(
              saveLogin({
                access_token: newAccess,
                refresh_token: newRefresh || refresh_token,
                user,
                is_login: true,
              })
            );
          } else {
            throw new Error("Refreshed token is already expired");
          }
        } else {
          dispatch(removeLogin());
        }
      } catch (error) {
        console.log(
          "Auth check failed:",
          error?.response?.data || error.message
        );
        dispatch(removeLogin());
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [access_token, refresh_token, dispatch, api, user]);

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