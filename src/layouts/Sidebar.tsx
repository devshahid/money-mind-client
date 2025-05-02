import React, { useContext, useState } from "react";
import { Box, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Tooltip, Typography, Avatar, ListItemButton } from "@mui/material";
import {
    Dashboard,
    AccountBalanceWallet,
    TrendingUp,
    Settings,
    PieChart,
    ArrowBackIosNew,
    ArrowForwardIos,
    AccountBalance,
    AccountTree,
    AccountCircle,
    DarkMode,
    WbSunny,
} from "@mui/icons-material";

import AppLogo from "/money-mind-logo.png"; // Adjust the path to your logo
import { NavLink, useNavigate } from "react-router-dom";
import { ColorModeContext } from "../contexts/ThemeContext";

const drawerWidth = 240;

const navItems = [
    { label: "Dashboard", icon: <Dashboard />, path: "/" },
    { label: "Transactions", icon: <AccountTree />, path: "/transactions" },
    { label: "Debts", icon: <AccountBalanceWallet />, path: "/debts" },
    { label: "Goals", icon: <TrendingUp />, path: "/goals" },
    { label: "Budget", icon: <AccountBalance />, path: "/budget" },
    { label: "Analytics", icon: <PieChart />, path: "/analytics" },
    { label: "Settings", icon: <Settings />, path: "/settings" },
    { label: "Account", icon: <AccountCircle />, path: "/account" },
];

const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { mode, toggleMode } = useContext(ColorModeContext);
    const navigate = useNavigate();
    const toggleSidebar = () => setCollapsed(!collapsed);

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: collapsed ? 100 : drawerWidth,
                flexShrink: 0,
                overflowX: "hidden", // Prevent horizontal scrollbar when collapsed
                "& .MuiDrawer-paper": {
                    width: collapsed ? 100 : drawerWidth,
                    boxSizing: "border-box",
                    background: mode === "light" ? "#f3f1fb" : "#222126",
                    display: "flex",
                    flexDirection: "column", // Ensure items stack vertically
                    alignItems: "center", // Center items horizontally
                },
            }}
        >
            <Box
                onClick={() => navigate("/")}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 2,
                    borderBottom: "1px solid #ddd",
                    cursor: "pointer", // Changed to pointer for better UX
                    width: "100%", // Ensure the box takes full width
                }}
            >
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Avatar
                        src={AppLogo}
                        sx={{
                            bgcolor: "black",
                            width: 40,
                            height: 40,
                        }}
                    />
                    {!collapsed && (
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            fontSize="1rem"
                        >
                            Money Mind
                        </Typography>
                    )}
                </Box>
                <Box>
                    <IconButton
                        onClick={toggleSidebar}
                        sx={{
                            ml: collapsed ? 0 : 1,
                            border: "1px solid #ddd",
                            background: mode === "light" ? "#f3f1fb" : "#222126",
                            color: mode === "light" ? "#000" : "#fff",
                            "&:hover": {
                                backgroundColor: "#f0f0f0",
                            },
                        }}
                    >
                        {collapsed ? (
                            <ArrowForwardIos
                                fontSize="small"
                                sx={{ width: "10px", height: "10px" }}
                            />
                        ) : (
                            <ArrowBackIosNew
                                fontSize="small"
                                sx={{ width: "10px", height: "10px" }}
                            />
                        )}
                    </IconButton>
                </Box>
            </Box>
            <List
                sx={{
                    width: "100%", // Make the list take full width of the drawer
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center", // Center items horizontally
                    padding: 1,
                }}
            >
                {navItems.map((item, index) => (
                    <Tooltip
                        key={index}
                        title={collapsed ? item.label : ""}
                        placement="right"
                    >
                        {/*#453f64 */}
                        <ListItem
                            key={index}
                            disablePadding
                            sx={{
                                mx: 1,
                                my: 0.5,
                                borderRadius: "30px",
                                width: "100%", // Make each list item take full width
                                justifyContent: "center", // Center content within the ListItem
                                "&:hover": { backgroundColor: mode === "light" ? "#dcd6ff" : "#453f64" },
                            }}
                        >
                            <NavLink
                                to={item.path}
                                style={({ isActive }) => ({
                                    textDecoration: "none",
                                    color: mode === "light" ? "#000" : "#fff",
                                    width: collapsed ? 0 : "100%", // Make the NavLink take full width
                                    display: "flex",
                                    justifyContent: "center", // Center the ListItemButton inside
                                    backgroundColor: isActive ? "#8470FF" : "transparent",
                                    borderRadius: "30px",
                                })}
                            >
                                <ListItemButton
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: "center", // Center content horizontally
                                        px: 2.5,
                                        gap: collapsed ? 0 : 1, // Adjust gap based on collapse state
                                        width: "100%", // Make the button take full width
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: collapsed ? "auto" : 3, // Adjust margin based on collapse state
                                            justifyContent: "center",
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {!collapsed && <ListItemText primary={item.label} />}
                                </ListItemButton>
                            </NavLink>
                        </ListItem>
                    </Tooltip>
                ))}
            </List>
            <Box
                sx={{
                    my: 2,
                    py: 1,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        border: "1px solid grey",
                        borderRadius: "50px",
                        padding: collapsed ? "4px" : "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: collapsed ? 0 : 1,
                        transition: "all 0.3s ease-in-out",
                    }}
                >
                    {collapsed ? (
                        <IconButton
                            size="large"
                            disableRipple
                            disableFocusRipple
                            onClick={toggleMode}
                            sx={{
                                backgroundColor: "#8470FF",
                                color: "#fff",
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                    backgroundColor: "#8470FF",
                                },
                            }}
                        >
                            {mode === "light" ? <WbSunny /> : <DarkMode />}
                        </IconButton>
                    ) : (
                        <>
                            <IconButton
                                size="large"
                                disableRipple
                                disableFocusRipple
                                onClick={() => mode !== "light" && toggleMode()}
                                sx={{
                                    backgroundColor: mode === "light" ? "#8470FF" : "transparent",
                                    color: mode === "light" ? "#fff" : "#8470FF",
                                    transition: "all 0.3s ease-in-out",
                                    "&:hover": {
                                        backgroundColor: mode === "light" ? "#8470FF" : "transparent",
                                    },
                                    transform: mode === "light" ? "rotate(0deg)" : "rotate(-20deg)",
                                }}
                            >
                                <WbSunny />
                            </IconButton>
                            <IconButton
                                size="large"
                                disableRipple
                                disableFocusRipple
                                onClick={() => mode !== "dark" && toggleMode()}
                                sx={{
                                    backgroundColor: mode === "dark" ? "#8470FF" : "transparent",
                                    color: mode === "dark" ? "#fff" : "#8470FF",
                                    transition: "all 0.3s ease-in-out",
                                    "&:hover": {
                                        backgroundColor: mode === "dark" ? "#8470FF" : "transparent",
                                    },
                                    transform: mode === "dark" ? "rotate(0deg)" : "rotate(20deg)",
                                }}
                            >
                                <DarkMode />
                            </IconButton>
                        </>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
