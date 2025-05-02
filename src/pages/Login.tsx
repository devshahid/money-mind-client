// import { useState } from "react";
// import { Container, Typography } from "@mui/material";
// import InputField from "../components/InputField";
// import CustomButton from "../components/Button";
// import { useDispatch } from "react-redux";
// import { login } from "../store/authSlice";
// import { useNavigate } from "react-router-dom";
// import { loginUser } from "../services/authService";

// const Login = () => {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const handleLogin = async () => {
//         try {
//             const data = await loginUser(email, password);
//             dispatch(login(data.output.accessToken));
//             localStorage.setItem("accessToken", data.output.accessToken);
//             navigate("/");
//         } catch (error) {
//             console.error("Login failed", error);
//         }
//     };

//     return (
//         <Container maxWidth="sm">
//             <Typography
//                 variant="h4"
//                 gutterBottom
//             >
//                 Login
//             </Typography>
//             <InputField
//                 label="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//             />
//             <InputField
//                 label="Password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//             />
//             <CustomButton
//                 text="Login"
//                 onClick={handleLogin}
//             />
//         </Container>
//     );
// };

// export default Login;

import React from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import InvestmentIllustration from "../assets/illustration/FinanceApp.png";
import AppLogo from "../assets/images/money-mind-logo.png";
import { useNavigate } from "react-router-dom";

const SignInPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <>
            <Box
                px={{ xs: 1, sm: 2, md: 3 }}
                py={{ xs: 1, sm: 1.5 }}
                display="flex"
                alignItems="center"
            >
                <Box
                    sx={{
                        // backgroundColor: "#000",
                        borderRadius: "50%",
                        width: isMobile ? 48 : 56,
                        height: isMobile ? 48 : 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: isMobile ? 1 : 2,
                        fontWeight: "bold",
                    }}
                >
                    <img
                        src={AppLogo}
                        alt="Money Mind logo"
                        width={isMobile ? 56 : 72}
                        height={isMobile ? 56 : 72}
                        style={{ borderRadius: "50%" }}
                    />
                </Box>
                <Typography
                    variant="h5"
                    fontWeight={600}
                    sx={{
                        fontSize: {
                            xs: "1.2rem", // mobile
                            sm: "1.5rem", // tablets
                            md: "1.8rem", // desktop
                        },
                    }}
                >
                    Money Mind
                </Typography>
            </Box>

            <Box
                display="flex"
                flexDirection={isMobile ? "column" : "row"}
            >
                {/* Left Panel */}
                <Box
                    flex={1}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    px={isMobile ? 3 : 10}
                    minHeight="80vh"
                >
                    <Box
                        width="100%"
                        maxWidth={400}
                    >
                        <Typography
                            variant="h4"
                            fontWeight={600}
                            gutterBottom
                            textAlign="center"
                            sx={{
                                fontSize: {
                                    xs: "1.8rem", // phones
                                    sm: "2rem", // tablets
                                    md: "2.4rem", // desktop
                                },
                            }}
                        >
                            Sign in
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            mb={4}
                            sx={{
                                fontSize: {
                                    xs: "0.9rem",
                                    sm: "1rem",
                                    md: "1.1rem",
                                },
                            }}
                        >
                            Welcome there! Sign in to continue with Money Mind
                        </Typography>

                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            placeholder="Enter your Email address"
                            sx={{
                                fontSize: {
                                    xs: "0.9rem",
                                    md: "1rem",
                                },
                                input: {
                                    fontSize: {
                                        xs: "0.9rem",
                                        md: "1rem",
                                    },
                                },
                            }}
                        />

                        <FormControl
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            sx={{
                                "& input": {
                                    fontSize: {
                                        xs: "0.9rem",
                                        md: "1rem",
                                    },
                                },
                                "& label": {
                                    fontSize: {
                                        xs: "0.9rem",
                                        md: "1rem",
                                    },
                                },
                            }}
                        >
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <OutlinedInput
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword((show) => !show)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Password"
                            />
                        </FormControl>

                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            mt={1}
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                            >
                                <Checkbox
                                    defaultChecked
                                    color="primary"
                                />
                                <Typography variant="body2">Keep me logged in</Typography>
                            </Box>
                            <Typography
                                variant="body2"
                                color="primary"
                                sx={{ cursor: "pointer" }}
                            >
                                Forgot Password?
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                py: { xs: 1, md: 1.5 },
                                fontSize: {
                                    xs: "0.9rem",
                                    md: "1rem",
                                },
                                backgroundColor: "#9B7CFF",
                                borderRadius: 8,
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            Sign in
                        </Button>

                        <Typography
                            mt={4}
                            textAlign="center"
                            variant="body2"
                        >
                            Don’t have an account?{" "}
                            <Typography
                                component="span"
                                color="primary"
                                sx={{ cursor: "pointer" }}
                                onClick={() => navigate("/register")}
                            >
                                Sign up
                            </Typography>
                        </Typography>
                    </Box>
                </Box>

                {/* Right Panel - Illustration */}
                {!isMobile && (
                    <Box>
                        <img
                            src={InvestmentIllustration}
                            alt="illustration"
                            style={{ width: "90%", maxWidth: 600 }}
                        />
                    </Box>
                )}
            </Box>
        </>
    );
};

export default SignInPage;
