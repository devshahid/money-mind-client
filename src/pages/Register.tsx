// import { useState } from "react";
// import { Container, Typography } from "@mui/material";
// import InputField from "../components/InputField";
// import CustomButton from "../components/Button";
// import { useNavigate } from "react-router-dom";
// import { registerUser } from "../services/authService";

// const Register = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleRegister = async () => {
//     try {
//       await registerUser(email, password);
//       navigate("/login");
//     } catch (error) {
//       console.error("Registration failed", error);
//     }
//   };

//   return (
//     <Container maxWidth="sm">
//       <Typography variant="h4" gutterBottom>
//         Register
//       </Typography>
//       <InputField
//         label="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <InputField
//         label="Password"
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <CustomButton text="Register" onClick={handleRegister} />
//     </Container>
//   );
// };

// export default Register;

import React, { useState } from "react";
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

const RegisterPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const validatePassword = (password: string) => {
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return pattern.test(password);
    };

    const handleSubmit = () => {
        let newErrors = {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        };

        if (!name.trim()) newErrors.name = "Name is required";
        if (!email.trim()) newErrors.email = "Email is required";
        if (!password.trim()) newErrors.password = "Password is required";
        else if (!validatePassword(password))
            newErrors.password = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character";
        if (!confirmPassword.trim()) newErrors.confirmPassword = "Confirm Password is required";
        else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);

        const hasError = Object.values(newErrors).some(Boolean);
        if (!hasError) {
            // Submit the data (API call or further logic)
            console.log("Signup Success:", { name, email, password });
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
                <img
                    src={AppLogo}
                    alt="Money Mind logo"
                    width={isMobile ? 40 : 48}
                    height={isMobile ? 40 : 48}
                    style={{ marginRight: isMobile ? 6 : 10 }}
                />
                <Typography
                    variant="h5"
                    fontWeight={600}
                    sx={{
                        fontSize: {
                            xs: "1.2rem",
                            sm: "1.5rem",
                            md: "1.8rem",
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
                                    xs: "1.6rem",
                                    sm: "1.8rem",
                                    md: "2rem",
                                },
                            }}
                        >
                            Welcome to Money Mind!
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
                            Sign up and start managing your finances now
                        </Typography>

                        <TextField
                            label="Name"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={Boolean(errors.name)}
                            helperText={errors.name}
                        />

                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={Boolean(errors.email)}
                            helperText={errors.email}
                        />

                        <FormControl
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            error={Boolean(errors.password)}
                        >
                            <InputLabel htmlFor="signup-password">Password</InputLabel>
                            <OutlinedInput
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            <Typography
                                variant="caption"
                                color="error"
                            >
                                {errors.password}
                            </Typography>
                        </FormControl>

                        <FormControl
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            error={Boolean(errors.confirmPassword)}
                        >
                            <InputLabel htmlFor="confirm-password">Confirm Password</InputLabel>
                            <OutlinedInput
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword((show) => !show)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Confirm Password"
                            />
                            <Typography
                                variant="caption"
                                color="error"
                            >
                                {errors.confirmPassword}
                            </Typography>
                        </FormControl>

                        <Box
                            display="flex"
                            alignItems="center"
                            mt={1}
                        >
                            <Checkbox
                                defaultChecked
                                color="primary"
                            />
                            <Typography variant="body2">I agree to the terms & conditions</Typography>
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
                            onClick={handleSubmit}
                        >
                            Sign up
                        </Button>

                        <Typography
                            mt={4}
                            textAlign="center"
                            variant="body2"
                        >
                            Already have an account?
                            <Typography
                                component="span"
                                color="primary"
                                sx={{ cursor: "pointer" }}
                                onClick={() => navigate("/login")}
                            >
                                Sign in
                            </Typography>
                        </Typography>
                    </Box>
                </Box>

                {/* Right Panel */}
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

export default RegisterPage;
