// src/contexts/SnackbarContext.tsx
import React, { createContext, useState, useContext } from "react";
import { AlertColor } from "@mui/material/Alert";

interface SnackbarState {
    open: boolean;
    message: string;
    severity: AlertColor | undefined;
}

interface SnackbarContextValue {
    snackbar: SnackbarState;
    showSnackbar: (message: string, severity?: AlertColor) => void;
    hideSnackbar: () => void;
    showSuccessSnackbar: (message: string) => void;
    showWarningSnackbar: (message: string) => void;
    showErrorSnackbar: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useSnackbar = (): SnackbarContextValue => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackbar must be used within a SnackbarProvider");
    }
    return context;
};

interface SnackbarProviderProps {
    children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
        severity: undefined,
    });

    const showSnackbar = (message: string, severity: AlertColor = "success"): void => {
        setSnackbar({ open: true, message, severity });
    };

    const hideSnackbar = (): void => {
        setSnackbar({ ...snackbar, open: false });
    };

    const showSuccessSnackbar = (message: string): void => {
        showSnackbar(message, "success");
    };

    const showWarningSnackbar = (message: string): void => {
        showSnackbar(message, "warning");
    };

    const showErrorSnackbar = (message: string): void => {
        showSnackbar(message, "error");
    };

    return (
        <SnackbarContext.Provider
            value={{
                snackbar,
                showSnackbar,
                hideSnackbar,
                showSuccessSnackbar,
                showWarningSnackbar,
                showErrorSnackbar,
            }}
        >
            {children}
        </SnackbarContext.Provider>
    );
};
