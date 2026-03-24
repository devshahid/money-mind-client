import React, { JSX, useState } from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { ITransactionGroup } from "../store/groupSlice";

interface BulkActionToolbarProps {
    selectedIds: string[];
    onClearSelection: () => void;
    onAttachToLogs: () => void;
    onCreateGroup: () => void;
    onAddToGroup: (groupId: string) => void;
    groups: ITransactionGroup[];
}

const BulkActionToolbar = ({
    selectedIds,
    onClearSelection,
    onAttachToLogs,
    onCreateGroup,
    onAddToGroup,
    groups,
}: BulkActionToolbarProps): JSX.Element => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleAddToGroupClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (): void => {
        setAnchorEl(null);
    };

    const handleGroupSelect = (groupId: string): void => {
        onAddToGroup(groupId);
        handleMenuClose();
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2,
                py: 1,
                mb: 1,
                borderRadius: 1,
                bgcolor: "action.selected",
                flexWrap: "wrap",
            }}
        >
            <Typography
                variant="body2"
                sx={{ fontWeight: 500 }}
            >
                {selectedIds.length} selected
            </Typography>

            <Button
                size="small"
                variant="outlined"
                onClick={onClearSelection}
            >
                Clear Selection
            </Button>

            <Button
                size="small"
                variant="outlined"
                onClick={onAttachToLogs}
            >
                Attach to Logs
            </Button>

            <Button
                size="small"
                variant="contained"
                onClick={onCreateGroup}
                disabled={selectedIds.length < 2}
            >
                Create Group
            </Button>

            {groups.length > 0 && (
                <>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleAddToGroupClick}
                    >
                        Add to Group
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        {groups.map((group) => (
                            <MenuItem
                                key={group.id}
                                onClick={() => handleGroupSelect(group.id)}
                            >
                                {group.name}
                            </MenuItem>
                        ))}
                    </Menu>
                </>
            )}
        </Box>
    );
};

export default BulkActionToolbar;
