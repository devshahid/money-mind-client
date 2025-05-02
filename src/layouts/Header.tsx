// import React, { useEffect, useRef } from "react";
// import { AppBar, Toolbar, IconButton, Box, Avatar } from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";
// import NotificationsIcon from "@mui/icons-material/Notifications";
// import { useLayout } from "../contexts/LayoutContext";

// interface NavbarProps {
//     isOpen: boolean;
//     toggleSidebar: () => void;
//     drawerWidthOpen?: number;
//     drawerWidthClosed?: number;
// }

// const Header: React.FC<NavbarProps> = ({ isOpen, toggleSidebar, drawerWidthOpen, drawerWidthClosed }) => {
//     const headerRef = useRef<HTMLDivElement>(null);
//     const { setHeaderHeight } = useLayout();

//     useEffect(() => {
//         const updateHeight = () => {
//             if (headerRef.current) {
//                 setHeaderHeight(headerRef.current.offsetHeight);
//             }
//         };

//         updateHeight();
//         window.addEventListener("resize", updateHeight);
//         return () => window.removeEventListener("resize", updateHeight);
//     }, []);

//     return (
//         <AppBar
//             ref={headerRef}
//             position="fixed"
//             sx={{
//                 // zIndex: (theme) => theme.zIndex.drawer + 1,
//                 backgroundColor: "transparent",
//                 width: { md: isOpen ? `calc(100% - ${drawerWidthOpen}px)` : `calc(100% - ${drawerWidthClosed}px)` },
//             }}
//         >
//             <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
//                 {/* Sidebar toggle button */}
//                 <IconButton
//                     color="inherit"
//                     aria-label="open drawer"
//                     onClick={toggleSidebar}
//                     edge="start"
//                     sx={{ mr: 2 }}
//                 >
//                     <MenuIcon />
//                 </IconButton>

//                 {/* Search Bar */}
//                 {/* <Box sx={{ flexGrow: 1 }}>
//                     <input
//                         type="text"
//                         placeholder="Search..."
//                         style={{
//                             width: "100%",
//                             maxWidth: "400px",
//                             padding: "8px 12px",
//                             borderRadius: "8px",
//                             border: "none",
//                         }}
//                     />
//                 </Box> */}

//                 {/* Notification and Profile */}
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                     <IconButton color="inherit">
//                         <NotificationsIcon />
//                     </IconButton>
//                     <Avatar
//                         alt="User"
//                         src="/profile.jpg"
//                     />
//                 </Box>
//             </Toolbar>
//         </AppBar>
//     );
// };

// export default Header;

import React from "react";
import { Box, Typography, IconButton, Badge, Avatar, useMediaQuery, useTheme, Stack, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

interface HeaderProps {
    heading: string;
    subheading: string;
    notifications?: number;
    user?: {
        name: string;
        email: string;
        avatarUrl: string;
    };
}

const Header: React.FC<HeaderProps> = ({
    heading,
    subheading,
    notifications = 0,
    user = {
        name: "Adaline Lively",
        email: "adalineal@email.com",
        avatarUrl: "https://i.pravatar.cc/150?img=5",
    },
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
                        src={user.avatarUrl}
                        sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    {!isSmallScreen && (
                        <Box>
                            <Typography
                                variant="body2"
                                fontWeight={500}
                            >
                                {user.name}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {user.email}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
};

export default Header;
