// src/components/GlobalSnackbar.tsx
import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { useSnackbar } from "../contexts/SnackBarContext";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return (
        <MuiAlert
            elevation={6}
            ref={ref}
            variant="filled"
            {...props}
        />
    );
});

const GlobalSnackbar: React.FC = () => {
    const { snackbar, hideSnackbar } = useSnackbar();
    const { open, message, severity } = snackbar;

    const handleClose = (_: React.SyntheticEvent | Event, reason?: string): void => {
        if (reason === "clickaway") {
            return;
        }
        hideSnackbar();
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                sx={{ width: "100%" }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default GlobalSnackbar;
