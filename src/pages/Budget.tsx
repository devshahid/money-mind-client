import { Box, Typography } from "@mui/material";
import { JSX, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { LayoutContextType } from "../layouts/main";

const BudgetPage = (): JSX.Element => {
    const { setHeader } = useOutletContext<LayoutContextType>();

    useEffect(() => {
        setHeader("Budget", "Manage your monthly budgets");
    }, [setHeader]);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5">Budget</Typography>
        </Box>
    );
};

export default BudgetPage;
