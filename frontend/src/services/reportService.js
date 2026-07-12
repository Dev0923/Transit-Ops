import api from "./api";

export const reportService = {
  getSummary: () => api.get("/reports/summary"),
  getFleetUtilization: () => api.get("/reports/fleet-utilization"),
  getFuelEfficiency: () => api.get("/reports/fuel-efficiency"),
  exportCSV: (type) =>
    api.get(`/reports/export/${type}`, { responseType: "blob" }),
};
