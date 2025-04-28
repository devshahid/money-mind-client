import React from "react";
import { AppBar, Toolbar, IconButton, Box, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";

interface NavbarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    drawerWidthOpen?: number;
    drawerWidthClosed?: number;
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, toggleSidebar, drawerWidthOpen, drawerWidthClosed }) => {
    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: "#000",
                width: isOpen ? `calc(100% - ${drawerWidthOpen}px)` : `calc(100% - ${drawerWidthClosed}px)`,
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* Sidebar toggle button */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={toggleSidebar}
                    edge="start"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Search Bar */}
                {/* <Box sx={{ flexGrow: 1 }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "none",
                        }}
                    />
                </Box> */}

                {/* Notification and Profile */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton color="inherit">
                        <NotificationsIcon />
                    </IconButton>
                    <Avatar
                        alt="User"
                        src="/profile.jpg"
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
