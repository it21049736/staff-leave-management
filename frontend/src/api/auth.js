import client from "./client";

export const login = (username, password) =>
  client.post("/auth/login/", { username, password }).then((r) => r.data);

export const getMe = () => client.get("/auth/me/").then((r) => r.data);

export const updateMe = (data) => client.patch("/auth/me/", data).then((r) => r.data);

export const changePassword = (old_password, new_password) =>
  client.post("/auth/change-password/", { old_password, new_password }).then((r) => r.data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return client
    .post("/auth/me/avatar/", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};

export const removeAvatar = () => client.delete("/auth/me/avatar/").then((r) => r.data);
