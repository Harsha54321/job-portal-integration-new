import axios from "axios";

const baseURL = "http://127.0.0.1:8000/api/";
// const baseURL = "http://54.183.89.14/api/";

// const baseURL= "https://jobportal.stacklycloud.com/api/"


console.log("API Base URL:", baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 60000,
});

const publicEndpoints = [
  "/login/",
  "/register/",
  "/signup/",
  "/send-email-otp/",
  "/verify-email-otp/",
  "/send-login-otp/",
  "/token/refresh/",
  "/token/",
  "/companies/",
  "/admin-login/",
  "/admin/login/send-otp/",
  "/admin-2fa/login/verify-otp/",
  "/auth/forgot-password/",
  "/auth/admin/forgot-password/",
];

const redirectToHome = () => {
  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
  sessionStorage.removeItem("user_type");
  sessionStorage.removeItem("user_data");
  sessionStorage.removeItem("user_id");
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("admin_id");
  sessionStorage.removeItem("adminActiveTab");
  sessionStorage.removeItem("adminSubTab");
  sessionStorage.removeItem("umIsDetailView");
  sessionStorage.removeItem("umSelectedUser");

  window.location.href = "/";
};

// REQUEST interceptor
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access");
    const requestUrl = config.url || "";

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    if (!config.headers["Content-Type"]) {
      if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
      } else {
        config.headers["Content-Type"] = "application/json";
      }
    }

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔐 Request to ${requestUrl}: Token added`);
    } else if (isPublicEndpoint) {
      console.log(`🌐 Public request to ${requestUrl}: No token needed`);
    } else {
      console.log(`⚠️ Request to ${requestUrl}: No token available`);
    }

    console.log(`📤 ${config.method?.toUpperCase()} ${requestUrl}`);

    const isSensitiveEndpoint = ["login", "register", "signup", "admin-login"].some((endpoint) =>
      requestUrl.toLowerCase().includes(endpoint)
    );

    if (config.data && !(config.data instanceof FormData) && !isSensitiveEndpoint) {
      console.log("Request data:", config.data);
    } else if (config.data && isSensitiveEndpoint) {
      console.log("Request data: [PROTECTED - SENSITIVE DATA HIDDEN]");
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// RESPONSE interceptor
api.interceptors.response.use(
  (response) => {
    console.log(
      `${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(
      `${error.config?.method?.toUpperCase()} ${error.config?.url} - Error:`,
      error.response?.status
    );
    console.error("Error details:", error.response?.data);

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    if (isPublicEndpoint) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      let refreshToken = sessionStorage.getItem("refresh");
      if (!refreshToken) {
        console.log("No refresh token available - Redirecting to home page");
        redirectToHome();
        return Promise.reject(error);
      }

      try {
        console.log("🔄 Attempting to refresh access token...");

        const response = await axios.post(`${baseURL}token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh;

        sessionStorage.setItem("access", newAccessToken);

        // ✅ CRITICAL FIX: Update refresh token if backend returns new one
        if (newRefreshToken) {
          sessionStorage.setItem("refresh", newRefreshToken);
          console.log("✅ Refresh token also updated (ROTATE_REFRESH_TOKENS enabled)");
        }

        console.log("✅ Token refreshed successfully");

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        // ✅ Clear tokens and redirect
        redirectToHome();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      console.error("Authentication failed - Redirecting to home page");
      redirectToHome();
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      console.error("Forbidden - User doesn't have permission");
    } else if (error.response?.status === 404) {
      console.error("Not found - Endpoint doesn't exist");
    } else if (error.response?.status === 500) {
      console.error("Server error - Please try again later");
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout - Please check your connection");
    } else if (!error.response) {
      console.error("Network error - Please check your connection");
    }

    return Promise.reject(error);
  }
);

export const isAuthenticated = () => {
  const token = sessionStorage.getItem("access");
  return !!token;
};

export const getUserType = () => {
  return sessionStorage.getItem("user_type");
};

export const logout = () => {
  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
  sessionStorage.removeItem("user_type");
  sessionStorage.removeItem("user_data");
  sessionStorage.removeItem("user_id");
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("admin_id");
  sessionStorage.removeItem("adminActiveTab");
  sessionStorage.removeItem("adminSubTab");
  sessionStorage.removeItem("umIsDetailView");
  sessionStorage.removeItem("umSelectedUser");

  window.location.href = "/";
};

export default api;