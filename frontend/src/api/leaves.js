import client from "./client";

export const getLeaveTypes = () =>
  client.get("/leave-types/").then((r) => r.data.results ?? r.data);

export const createLeaveType = (data) => client.post("/leave-types/", data).then((r) => r.data);

export const updateLeaveType = (id, data) =>
  client.patch(`/leave-types/${id}/`, data).then((r) => r.data);

export const deleteLeaveType = (id) => client.delete(`/leave-types/${id}/`).then((r) => r.data);

export const getBalances = () =>
  client.get("/balances/").then((r) => r.data.results ?? r.data);

export const getMyLeaves = (params = {}) =>
  client.get("/leaves/", { params }).then((r) => r.data);

export const getAllLeaves = (params = {}) =>
  client.get("/leaves/all/", { params }).then((r) => r.data);

export const applyLeave = (data) => client.post("/leaves/", data).then((r) => r.data);

export const updateLeave = (id, data) => client.patch(`/leaves/${id}/`, data).then((r) => r.data);

export const cancelLeave = (id) => client.post(`/leaves/${id}/cancel/`).then((r) => r.data);

export const approveLeave = (id, remarks = "") =>
  client.post(`/leaves/${id}/approve/`, { remarks }).then((r) => r.data);

export const rejectLeave = (id, remarks = "") =>
  client.post(`/leaves/${id}/reject/`, { remarks }).then((r) => r.data);

export const getSummaryReport = () => client.get("/reports/summary/").then((r) => r.data);

export const getByDepartmentReport = () =>
  client.get("/reports/by-department/").then((r) => r.data);

export const downloadExport = async () => {
  const response = await client.get("/reports/export/", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "leave_requests.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
