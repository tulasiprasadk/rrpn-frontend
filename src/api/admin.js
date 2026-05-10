import API from "./index";

export const adminLogin = async (payload) => {
  try {
    const { data } = await API.post("/api/admin/login", payload);
    return data;
  } catch (err) {
    throw err;
  }
};
