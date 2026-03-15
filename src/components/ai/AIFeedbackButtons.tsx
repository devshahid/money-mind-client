import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface AIFeedbackButtonsProps {
    onAccept: () => void;
    onReject: () => void;
    disabled?: boolean;
    acceptLabel?: string;
    rejectLabel?: string;
}

const AIFeedbackButtons: React.FC<AIFeedbackButtonsProps> = ({
    onAccept,
    onReject,
    disabled = false,
    acceptLabel = "Accept suggestion",
    rejectLabel = "Reject suggestion",
}) => {
    return (
        <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={acceptLabel}>
                <span>
                    <IconButton
                        size="small"
                        color="success"
                        onClick={onAccept}
                        disabled={disabled}
                        aria-label={acceptLabel}
                    >
                        <CheckCircleIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title={rejectLabel}>
                <span>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={onReject}
                        disabled={disabled}
                        aria-label={rejectLabel}
                    >
                        <CancelIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
};

export default AIFeedbackButtons;
