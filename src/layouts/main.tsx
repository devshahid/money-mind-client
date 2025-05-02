import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const headerHeight = 64; // You can change it based on your Header
const drawerWidthOpen = 240;
const drawerWidthClosed = 70;

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                flexGrow: 1,
            }}
        >
            {/* Sidebar */}
            <Box>
                <Sidebar
                // isOpen={isSidebarOpen}
                // toggleSidebar={toggleSidebar}
                // drawerWidthOpen={drawerWidthOpen}
                // drawerWidthClosed={drawerWidthClosed}
                />
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    transition: "all 0.3s ease",
                    minHeight: "100vh",
                    overflowY: "auto", // Enable vertical scrolling
                }}
            >
                {/* Header/Navbar */}
                <Header
                    heading="Transactions"
                    subheading="Overview of your activities"
                    // isOpen={isSidebarOpen}
                    // toggleSidebar={toggleSidebar}
                    // drawerWidthOpen={drawerWidthOpen}
                    // drawerWidthClosed={drawerWidthClosed}
                />

                {/* Page Content */}
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
