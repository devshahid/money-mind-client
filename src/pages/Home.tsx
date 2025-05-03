import { Container, Typography } from "@mui/material";
import CustomButton from "../components/Button";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <Container maxWidth="sm">
            <Typography
                variant="h4"
                gutterBottom
            >
                Welcome to MoneyMind
            </Typography>
            <CustomButton
                text="Logout"
                onClick={handleLogout}
            />
        </Container>
    );
};

export default Home;
