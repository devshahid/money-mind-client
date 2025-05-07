import React, { JSX, useState } from "react";
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
    CircularProgress,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import InvestmentIllustration from "../assets/illustration/FinanceApp.png";
import AppLogo from "../assets/images/money-mind-logo.png";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/slice-hooks";
import { IAuthenticationApiResponse, login } from "../store/authSlice";
import { loginUser } from "../services/authService";
import { AxiosError } from "axios";
import { useSnackbar } from "../contexts/SnackBarContext";

const SignInPage: React.FC = (): JSX.Element => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const { showErrorSnackbar } = useSnackbar();
    const [showPassword, setShowPassword] = React.useState(false);

    const [userData, setUserData] = useState({
        email: null,
        password: null,
    });
    const [loading, setLoading] = React.useState(false);

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handlerLoginUser = async (): Promise<void> => {
        try {
            if (!userData.email || !userData.password) {
                return;
            }
            setLoading(true);
            const data = await loginUser(userData.email, userData.password);
            void dispatch(login(data.output as IAuthenticationApiResponse));

            localStorage.setItem("accessToken", data.output.accessToken);
            // remove accessToken and set userData to localstorage without accessToken:
            localStorage.setItem("userData", JSON.stringify({ email: data.output.email, role: data.output.role, fullName: data.output.fullName }));
            navigate("/");
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error("Login failed", error);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (typeof error.response?.data?.message === "string") {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                    showErrorSnackbar(error.response.data.message);
                } else {
                    showErrorSnackbar("An unexpected error occurred");
                }
            } else {
                console.error("An unexpected error occurred", error);
            }
        } finally {
            setLoading(false);
        }
    };
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
                            name="email"
                            onChange={handleFieldChange}
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
                                name="password"
                                onChange={handleFieldChange}
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
                            // disabled={loading}
                            loading={loading}
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
                            onClick={() => void handlerLoginUser()}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={24}
                                    color="inherit"
                                />
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        <Typography
                            mt={4}
                            textAlign="center"
                            variant="body2"
                        >
                            Don’t have an account?
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
