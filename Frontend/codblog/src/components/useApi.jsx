import axios from "axios";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const useApi = () => {
  const token = useSelector((state) => state.auth.access_token);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: `http://localhost:8000/api/`,
    });

    instance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, [token]);

  return api
};

export default useApi
