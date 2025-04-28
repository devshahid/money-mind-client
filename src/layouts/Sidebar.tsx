import React from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Typography, useMediaQuery, Theme } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import FlagIcon from "@mui/icons-material/Flag";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SavingsIcon from "@mui/icons-material/Savings";
import AppLogo from "/money-mind-logo.png"; // Adjust the path to your logo
import { NavLink } from "react-router-dom";
interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    drawerWidthClosed: number;
    drawerWidthOpen: number;
}

const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Transactions", icon: <AccountBalanceWalletIcon />, path: "/transactions" },
    { text: "Debts", icon: <CreditCardIcon />, path: "/debts" },
    { text: "Goals", icon: <FlagIcon />, path: "/goals" },
    { text: "Budget", icon: <SavingsIcon />, path: "/budget" },
    { text: "My Account", icon: <AccountCircleIcon />, path: "/account" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, drawerWidthOpen, drawerWidthClosed }) => {
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

    return (
        <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isOpen}
            onClose={toggleSidebar}
            sx={{
                width: isOpen ? drawerWidthOpen : drawerWidthClosed,
                flexShrink: 0,
                whiteSpace: "nowrap",
                "& .MuiDrawer-paper": {
                    width: isOpen ? drawerWidthOpen : drawerWidthClosed,
                    // transition: "width 0.3s",
                    overflowX: "hidden",
                    boxSizing: "border-box",
                },
            }}
        >
            <Box sx={{ p: 2, transition: "all 0.3s" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: isOpen ? "flex-start" : "center" }}>
                    {/* Logo or Title */}
                    <Box
                        component="img"
                        src={AppLogo}
                        alt="Logo"
                        sx={{ height: 70, ml: isOpen ? 0 : 2.5 }}
                    />
                    <Typography
                        variant="h6"
                        noWrap={isOpen ? false : true}
                        sx={{
                            ml: isOpen ? 0 : 2,
                            opacity: isOpen ? 1 : 0,
                            // transition: "opacity 0.3s, margin 0.3s",
                            fontWeight: "bold",
                            color: "#000",
                            fontSize: "1.5rem",
                            lineHeight: "1.5rem",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Money Mind
                    </Typography>
                </Box>
                <Divider />
                <List>
                    {menuItems.map((item, index) => (
                        <ListItem
                            key={index}
                            disablePadding
                            sx={{ display: "block" }}
                        >
                            <NavLink
                                to={item.path} // <-- your menuItems should have a `path` field
                                style={({ isActive }) => ({
                                    textDecoration: "none",
                                    color: isActive ? "#1976d2" : "inherit", // highlight active link
                                })}
                            >
                                <ListItemButton
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: isOpen ? "initial" : "center",
                                        px: 2.5,
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: isOpen ? 3 : "auto",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {isOpen && <ListItemText primary={item.text} />}
                                </ListItemButton>
                            </NavLink>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
