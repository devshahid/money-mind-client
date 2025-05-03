// components/GuestRoute.tsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { JSX } from "react";

const GuestRoute = ({ children }: { children: JSX.Element }): JSX.Element => {
    if (isAuthenticated()) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
};

export default GuestRoute;
