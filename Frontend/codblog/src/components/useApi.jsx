import axios from "axios";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const useApi = () => {
  const token = useSelector((state) => state.auth.access_token);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
    });

    instance.interceptors.request.use(
      (config) => {
        const tokenFromRedux = token;
        if (tokenFromRedux) {
          config.headers.Authorization = `Bearer ${tokenFromRedux}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, [token]);

  return api
};

export default useApi;
