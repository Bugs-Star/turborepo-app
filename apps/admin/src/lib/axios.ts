import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

console.log("✅ axios baseURL:", process.env.NEXT_PUBLIC_API_URL);
console.log(
  "👉 최종 요청 URL:",
  `${axiosInstance.defaults.baseURL}/admin/login`
);

export default axiosInstance;
