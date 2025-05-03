import { Box, Typography, Link } from "@mui/material";
import { JSX } from "react";

export const Footer = (): JSX.Element => {
    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", pt: 4, gap: 4 }}>
            <Typography
                variant="body2"
                sx={{ color: "text.primary" }}
            >
                © 2024 XD Code All Rights Reserved
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
                <Link
                    href="#"
                    sx={{ textDecoration: "none", color: "primary.main" }}
                >
                    Privacy Policy
                </Link>
                <Link
                    href="#"
                    sx={{ textDecoration: "none", color: "primary.main" }}
                >
                    Terms of Service
                </Link>
            </Box>
        </Box>
    );
};
