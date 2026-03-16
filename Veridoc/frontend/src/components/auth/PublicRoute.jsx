import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/services/authService";

const PublicRoute = ({ children }) => {
    if (isAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
