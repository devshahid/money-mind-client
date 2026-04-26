import { Box, Typography } from "@mui/material";
import { JSX, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { LayoutContextType } from "../layouts/main";

const GoalsPage = (): JSX.Element => {
    const { setHeader } = useOutletContext<LayoutContextType>();

    useEffect(() => {
        setHeader("Goals", "Track your savings goals");
    }, [setHeader]);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5">Goals</Typography>
        </Box>
    );
};

export default GoalsPage;
