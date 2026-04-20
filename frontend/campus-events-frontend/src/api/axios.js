import axios from "axios";

// Change 8080 to match whatever port your Spring Boot runs on.
// If you set server.port in application.properties, use that port here.
// Default Spring Boot port is 8080. Our application.properties says ${PORT:8081}.
// Check your Spring Boot console — it prints "Tomcat started on port(s): XXXX"
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT Bearer token to every request
api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      config.headers["Authorization"] = `Bearer ${user.token}`;
    }
  } catch (_) {}
  return config;
});

// 401 = token expired or invalid → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;