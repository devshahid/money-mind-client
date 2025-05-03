// components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }): JSX.Element => {
    const location = useLocation();

    if (!isAuthenticated()) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
};

export default ProtectedRoute;
