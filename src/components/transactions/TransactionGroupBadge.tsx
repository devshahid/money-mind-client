import React from "react";
import { Chip } from "@mui/material";
import GroupWorkIcon from "@mui/icons-material/GroupWork";

interface TransactionGroupBadgeProps {
    groupName?: string;
    onClick?: () => void;
}

const TransactionGroupBadge: React.FC<TransactionGroupBadgeProps> = ({ groupName, onClick }) => {
    if (!groupName) return null;

    return (
        <Chip
            icon={<GroupWorkIcon fontSize="small" />}
            label={groupName}
            size="small"
            color="primary"
            variant="outlined"
            onClick={onClick}
            sx={{ cursor: onClick ? "pointer" : "default", maxWidth: 150 }}
        />
    );
};

export default TransactionGroupBadge;
