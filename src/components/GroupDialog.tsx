import { JSX, useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import CustomModal from "./CustomModal";

interface GroupDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; involvedParty: string; notes: string }) => void;
    initialData?: { name: string; involvedParty: string; notes: string };
    mode: "create" | "edit";
}

const GroupDialog = ({ open, onClose, onSubmit, initialData, mode }: GroupDialogProps): JSX.Element => {
    const [name, setName] = useState("");
    const [involvedParty, setInvolvedParty] = useState("");
    const [notes, setNotes] = useState("");
    const [nameError, setNameError] = useState("");

    useEffect(() => {
        if (open && initialData && mode === "edit") {
            setName(initialData.name);
            setInvolvedParty(initialData.involvedParty);
            setNotes(initialData.notes);
        } else if (open && mode === "create") {
            setName("");
            setInvolvedParty("");
            setNotes("");
        }
        setNameError("");
    }, [open, initialData, mode]);

    const handleSubmit = (): void => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError("Group name is required");
            return;
        }
        onSubmit({ name: trimmedName, involvedParty: involvedParty.trim(), notes: notes.trim() });
    };

    const handleClose = (): void => {
        setNameError("");
        onClose();
    };

    return (
        <CustomModal
            modalOpen={open}
            onClose={handleClose}
        >
            <Box>
                <Typography
                    variant="h6"
                    mb={2}
                >
                    {mode === "create" ? "Create Group" : "Edit Group"}
                </Typography>
                <TextField
                    fullWidth
                    label="Group Name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError("");
                    }}
                    error={!!nameError}
                    helperText={nameError}
                    sx={{ mb: 2 }}
                    required
                />
                <TextField
                    fullWidth
                    label="Involved Party"
                    value={involvedParty}
                    onChange={(e) => setInvolvedParty(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                >
                    {mode === "create" ? "Create" : "Save Changes"}
                </Button>
            </Box>
        </CustomModal>
    );
};

export default GroupDialog;
