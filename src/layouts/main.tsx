import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export interface LayoutContextType {
    setHeader: (heading: string, subheading: string) => void;
}

const Layout: React.FC = () => {
    const [heading, setHeading] = useState("Welcome Back");
    const [subheading, setSubheading] = useState("It is the best time to manage your finances");

    const setHeader = (h: string, s: string): void => {
        setHeading(h);
        setSubheading(s);
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
                <Sidebar />
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
                    heading={heading}
                    subheading={subheading}
                />

                {/* Page Content */}
                <Outlet context={{ setHeader }} />
            </Box>
        </Box>
    );
};

export default Layout;
