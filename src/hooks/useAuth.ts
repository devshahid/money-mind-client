import { useSelector } from "react-redux";
import { RootState } from "../store";

const useAuth = () => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  return { isAuthenticated: !!accessToken };
};

export default useAuth;
