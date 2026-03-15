import { Box } from "@mui/material";
import { JSX, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { LayoutContextType } from "../layouts/main";
import AIChatPanel from "../components/ai/AIChatPanel";

const AIChatPage = (): JSX.Element => {
    const { setHeader } = useOutletContext<LayoutContextType>();

    useEffect(() => {
        setHeader("AI Assistant", "Ask questions about your finances");
    }, [setHeader]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
                p: 2,
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <AIChatPanel />
            </Box>
        </Box>
    );
};

export default AIChatPage;
