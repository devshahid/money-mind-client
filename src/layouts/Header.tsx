import React from "react";
import { Box, Typography, IconButton, Badge, Avatar, useMediaQuery, useTheme, Stack, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useAppSelector } from "../hooks/slice-hooks";
import { RootState } from "../store";
import { stringAvatar } from "../utils/common";

interface HeaderProps {
    heading: string;
    subheading: string;
    notifications?: number;
}

const Header: React.FC<HeaderProps> = ({ heading, subheading, notifications = 0 }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const { userData } = useAppSelector((state: RootState) => state.auth);

    return (
        <Paper
            elevation={0}
            sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
            {/* Left: Title and Subtitle */}
            <Box>
                <Typography
                    variant="h5"
                    fontWeight="bold"
                >
                    {heading}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {subheading}
                </Typography>
            </Box>

            {/* Right: Icons and User Info */}
            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
            >
                <IconButton>
                    <SearchIcon />
                </IconButton>
                <IconButton>
                    <Badge
                        badgeContent={notifications}
                        color="error"
                    >
                        <NotificationsNoneIcon />
                    </Badge>
                </IconButton>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #e0e0e0",
                        borderRadius: "999px",
                        p: "4px 8px",
                    }}
                >
                    <Avatar
                        {...stringAvatar(userData.fullName || "Test User")}
                        sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    {!isSmallScreen && (
                        <Box>
                            <Typography
                                variant="body2"
                                fontWeight={500}
                            >
                                {userData.fullName || "Test User"}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {userData.email}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
};

export default Header;
