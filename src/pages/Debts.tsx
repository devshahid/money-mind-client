import { Box, Typography } from "@mui/material";
import { JSX, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { LayoutContextType } from "../layouts/main";

const DebtsPage = (): JSX.Element => {
    const { setHeader } = useOutletContext<LayoutContextType>();

    useEffect(() => {
        setHeader("Debts", "Manage your loans and EMI schedules");
    }, [setHeader]);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5">Debts</Typography>
        </Box>
    );
};

export default DebtsPage;
