import { useSelector } from "react-redux";
import { RootState } from "../store";

const useAuth = (): { isAuthenticated: boolean } => {
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    return { isAuthenticated: !!accessToken };
};

export default useAuth;
