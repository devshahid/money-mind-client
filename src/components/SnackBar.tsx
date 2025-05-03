import * as React from "react";
import Button from "@mui/material/Button";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { JSX } from "react";

export default function CustomizedSnackbars(): JSX.Element {
    const [open, setOpen] = React.useState(false);

    const handleClick = (): void => {
        setOpen(true);
    };

    const handleClose = (_?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason): void => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    return (
        <div>
            <Button onClick={handleClick}>Open Snackbar</Button>
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity="success"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    This is a success Alert inside a Snackbar!
                </Alert>
            </Snackbar>
        </div>
    );
}
