import api from "./api";

export const signup = async (userData) => {
    const response = await api.post("/auth/signup", userData);
    if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        if (response.data.user && response.data.user.role) {
            localStorage.setItem("role", response.data.user.role);
        }
    }
    return response.data;
};

export const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        if (response.data.user && response.data.user.role) {
            localStorage.setItem("role", response.data.user.role);
        }
    }
    return response.data;
};

export const googleLogin = async (token) => {
    const response = await api.post("/auth/google", { token });
    if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        if (response.data.user && response.data.user.role) {
            localStorage.setItem("role", response.data.user.role);
        }
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
};

export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};

export const getUserRole = () => {
    return localStorage.getItem("role");
};
