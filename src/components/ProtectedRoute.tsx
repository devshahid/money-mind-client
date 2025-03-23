import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const ProtectedRoute = () => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  return localStorage.getItem("accessToken") || accessToken ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
