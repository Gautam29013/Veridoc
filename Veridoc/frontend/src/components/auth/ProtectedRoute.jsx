import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/services/authService";

const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
