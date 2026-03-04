// import axios from "axios";

// const api = axios.create({
//     baseURL: "http://127.0.0.1:8000/api/",
// });

// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("access");
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// export default api;
import axios from "axios";
 
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});
 
 
// REQUEST
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
 
  return config;
});
 
 
// RESPONSE (refresh)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
 
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
 
      try {
        const refresh = localStorage.getItem("refresh");
 
        const response = await api.post("/token/refresh/", { refresh });
 
        const newAccess = response.data.access;
 
        localStorage.setItem("access", newAccess);
 
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
 
        return api(originalRequest);
 
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
 
    return Promise.reject(error);
  }
);
 
export default api;
