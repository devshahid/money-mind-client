import { useState } from "react";
import { Container, Typography } from "@mui/material";
import InputField from "../components/InputField";
import CustomButton from "../components/Button";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const data = await loginUser(email, password);
            dispatch(login(data.output.accessToken));
            localStorage.setItem("accessToken", data.output.accessToken);
            navigate("/");
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography
                variant="h4"
                gutterBottom
            >
                Login
            </Typography>
            <InputField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <CustomButton
                text="Login"
                onClick={handleLogin}
            />
        </Container>
    );
};

export default Login;
