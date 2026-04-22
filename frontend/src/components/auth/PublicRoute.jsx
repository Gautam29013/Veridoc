import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "@/services/authService";

const PublicRoute = ({ children }) => {
    if (isAuthenticated()) {
        const role = getUserRole();
        if (role === "admin") {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
