import api from "./api";

export const getMe = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const updateMe = async (userData) => {
    const response = await api.put("/auth/me", userData);
    return response.data;
};

export const uploadProfilePhoto = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/auth/upload-photo", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};
