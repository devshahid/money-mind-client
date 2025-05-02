// components/GuestRoute.tsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const GuestRoute = ({ children }: { children: JSX.Element }) => {
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
