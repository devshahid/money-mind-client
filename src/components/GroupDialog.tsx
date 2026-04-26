import React, { JSX, useEffect, useState, useMemo } from "react";
import {
    Box,
    Button,
    IconButton,
    TextField,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
    Divider,
    Tooltip,
    Chip,
    Autocomplete,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CalculateIcon from "@mui/icons-material/Calculate";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import CustomModal from "./CustomModal";
import type { IMember } from "../store/groupSlice";
import { ITransactionLogs } from "../store/transactionSlice";
import { SplitType, SPLIT_TYPE_LABELS, SPLIT_TYPE_DESCRIPTIONS } from "../types/splitTypes";
import { calculateShares, calculateTotalDebits, getSplitTypeExplanation } from "../utils/splitCalculations";

interface GroupDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; involvedParty: string; members: IMember[]; notes: string; splitType: SplitType }) => void;
    initialData?: {
        name: string;
        involvedParty: string;
        members: IMember[];
        notes: string;
        splitType?: SplitType;
    };
    mode: "create" | "edit";
    transactions: ITransactionLogs[];
}

const emptyMember = (): IMember => ({ name: "", share: 0, paid: 0, percentage: 0 });

const GroupDialog = ({ open, onClose, onSubmit, initialData, mode, transactions }: GroupDialogProps): JSX.Element => {
    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [members, setMembers] = useState<IMember[]>([emptyMember()]);
    const [nameError, setNameError] = useState("");
    const [splitType, setSplitType] = useState<SplitType>(SplitType.EQUAL_INCLUDE_PAYER);

    // Get logged-in user and all groups from Redux
    const currentUser = useSelector((state: RootState) => state.auth.userData.fullName);
    const allGroups = useSelector((state: RootState) => state.groups.groups);

    const totalDebits = calculateTotalDebits(transactions);

    // Extract unique member names from all groups
    const memberSuggestions = useMemo(() => {
        const uniqueNames = new Set<string>();

        // Add current user first if available
        if (currentUser) {
            uniqueNames.add(currentUser);
        }

        // Add all members from existing groups
        allGroups.forEach((group) => {
            group.members?.forEach((member) => {
                if (member.name.trim()) {
                    uniqueNames.add(member.name.trim());
                }
            });
        });

        return Array.from(uniqueNames).sort();
    }, [allGroups, currentUser]);

    useEffect(() => {
        if (!open) return;

        if (initialData && mode === "edit") {
            setName(initialData.name);
            setNotes(initialData.notes);
            setMembers(initialData.members.length > 0 ? initialData.members : [emptyMember()]);
            setSplitType(initialData.splitType || SplitType.EQUAL_INCLUDE_PAYER);
        } else if (mode === "create") {
            setName("");
            setNotes("");
            setSplitType(SplitType.EQUAL_INCLUDE_PAYER);

            // Auto-populate logged-in user for equal split types
            if (currentUser) {
                setMembers([
                    {
                        name: currentUser,
                        share: 0,
                        paid: totalDebits, // Auto-fill with total amount
                        percentage: 0,
                    },
                ]);
            } else {
                setMembers([emptyMember()]);
            }
        }
        setNameError("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialData, mode]); // currentUser and totalDebits intentionally excluded to avoid re-initialization

    // Handle split type changes - auto-populate user if switching to equal split
    const handleSplitTypeChange = (newSplitType: SplitType): void => {
        setSplitType(newSplitType);

        // If switching to equal split and no members have names, add current user
        if (currentUser && mode === "create") {
            if (newSplitType === SplitType.EQUAL_INCLUDE_PAYER || newSplitType === SplitType.EQUAL_EXCLUDE_PAYER) {
                const hasNamedMember = members.some((m) => m.name.trim());
                if (!hasNamedMember) {
                    setMembers([
                        {
                            name: currentUser,
                            share: 0,
                            paid: totalDebits,
                            percentage: 0,
                        },
                    ]);
                }
            }
        }
    };

    const updateMember = (index: number, field: keyof IMember, value: string | number): void => {
        setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
    };

    const addMember = (): void => {
        setMembers((prev) => [...prev, emptyMember()]);
    };

    const removeMember = (index: number): void => {
        setMembers((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCalculateShares = (): void => {
        const updatedMembers = calculateShares(members, splitType, totalDebits);
        setMembers(updatedMembers);
    };

    const handleSubmit = (): void => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError("Group name is required");
            return;
        }
        const validMembers = members
            .filter((m) => m.name.trim())
            .map((m) => ({
                name: m.name.trim(),
                share: Number(m.share) || 0,
                paid: Number(m.paid) || 0,
                percentage: Number(m.percentage) || 0,
            }));

        if (validMembers.length === 0) {
            setNameError("At least one member is required");
            return;
        }

        const involvedParty = validMembers.map((m) => m.name).join(", ");
        onSubmit({
            name: trimmedName,
            involvedParty,
            members: validMembers,
            notes: notes.trim(),
            splitType,
        });
    };

    const handleClose = (): void => {
        setNameError("");
        onClose();
    };

    const getSplitTypeHelperText = (): string => {
        if (members.filter((m) => m.name.trim()).length === 0) {
            return "Add members to see split calculation";
        }
        return getSplitTypeExplanation(splitType, totalDebits, members.filter((m) => m.name.trim()).length);
    };

    const shouldShowShareField = (): boolean => {
        return splitType === SplitType.CUSTOM_AMOUNTS || splitType === SplitType.ITEMIZED;
    };

    const shouldShowPercentageField = (): boolean => {
        return splitType === SplitType.PERCENTAGE_SPLIT;
    };

    const getTotalPaid = (): number => {
        return members.reduce((sum, m) => sum + (Number(m.paid) || 0), 0);
    };

    const getTotalShares = (): number => {
        return members.reduce((sum, m) => sum + (Number(m.share) || 0), 0);
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

                {/* Total Amount Info */}
                <Alert
                    severity="info"
                    sx={{ mb: 2 }}
                    icon={<InfoOutlinedIcon />}
                >
                    <Typography variant="body2">
                        <strong>Total Debits:</strong> ₹{totalDebits.toFixed(2)}
                    </Typography>
                    <Typography
                        variant="caption"
                        display="block"
                    >
                        {transactions.length} transaction(s) selected
                    </Typography>
                </Alert>

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

                {/* Split Type Selection */}
                <FormControl
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    <InputLabel>Split Type</InputLabel>
                    <Select
                        value={splitType}
                        label="Split Type"
                        onChange={(e) => handleSplitTypeChange(e.target.value as SplitType)}
                    >
                        {Object.entries(SPLIT_TYPE_LABELS).map(([key, label]) => (
                            <MenuItem
                                key={key}
                                value={key}
                            >
                                <Box>
                                    <Typography variant="body2">{label}</Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {SPLIT_TYPE_DESCRIPTIONS[key as SplitType]}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Split Explanation */}
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                >
                    <Typography variant="body2">{getSplitTypeHelperText()}</Typography>
                </Alert>

                {/* Members section */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                >
                    <Typography variant="subtitle2">Members</Typography>
                    <Box
                        display="flex"
                        gap={1}
                    >
                        {splitType !== SplitType.LOAN && (
                            <Tooltip title="Auto-calculate shares based on split type and adjust as members are added">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<CalculateIcon />}
                                    onClick={handleCalculateShares}
                                    color="primary"
                                >
                                    Calculate Shares
                                </Button>
                            </Tooltip>
                        )}
                        <IconButton
                            size="small"
                            onClick={addMember}
                            color="primary"
                            aria-label="Add member"
                        >
                            <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {members.map((member, index) => (
                    <Box
                        key={index}
                        sx={{
                            p: 1.5,
                            mb: 1.5,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            bgcolor: "background.default",
                        }}
                    >
                        <Box
                            display="flex"
                            gap={1}
                            alignItems="flex-start"
                            mb={1}
                        >
                            <Autocomplete
                                freeSolo
                                options={memberSuggestions}
                                value={member.name}
                                onChange={(_, newValue) => {
                                    // Handle selection from dropdown
                                    if (newValue && typeof newValue === "string" && newValue.startsWith("➕ Add")) {
                                        // Extract the name from "➕ Add "name""
                                        const extractedName = newValue.replace(/➕ Add "(.+)"/, "$1");
                                        updateMember(index, "name", extractedName);
                                    } else {
                                        updateMember(index, "name", newValue || "");
                                    }
                                }}
                                onInputChange={(_, newInputValue) => {
                                    // Handle typing new value
                                    updateMember(index, "name", newInputValue);
                                }}
                                filterOptions={(options, params) => {
                                    const filtered = options.filter((option) => option.toLowerCase().includes(params.inputValue.toLowerCase()));

                                    const { inputValue } = params;
                                    // Suggest creating a new member if value doesn't exist
                                    const isExisting = options.some((option) => option.toLowerCase() === inputValue.toLowerCase());
                                    if (inputValue !== "" && !isExisting) {
                                        filtered.push(`➕ Add "${inputValue}"`);
                                    }

                                    return filtered;
                                }}
                                getOptionLabel={(option) => {
                                    // Keep the option as-is for display in dropdown
                                    return option;
                                }}
                                renderOption={(props, option) => {
                                    // Extract key from props to avoid React 18.3+ warning about spreading key
                                    // Material UI's renderOption props include key, but we need to separate it
                                    // eslint-disable-next-line react/prop-types
                                    const { key, ...otherProps } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
                                    // Style the "Add new" option differently
                                    const isAddNew = typeof option === "string" && option.startsWith("➕ Add");
                                    return (
                                        <Box
                                            component="li"
                                            key={key}
                                            {...otherProps}
                                            sx={{
                                                fontWeight: isAddNew ? 600 : 400,
                                                color: isAddNew ? "primary.main" : "inherit",
                                            }}
                                        >
                                            {option}
                                        </Box>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Name"
                                        placeholder="Select existing or type new name"
                                        required
                                        helperText={
                                            member.name && !memberSuggestions.includes(member.name) && !member.name.startsWith("➕")
                                                ? "✨ New member - will be saved when you create group"
                                                : undefined
                                        }
                                    />
                                )}
                                sx={{ flex: 1 }}
                                size="small"
                            />
                            <IconButton
                                size="small"
                                onClick={() => removeMember(index)}
                                disabled={members.length <= 1}
                                color="error"
                                aria-label={`Remove member ${member.name || index + 1}`}
                            >
                                <RemoveCircleOutlineIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Box
                            display="flex"
                            gap={1}
                        >
                            <TextField
                                label="Paid"
                                type="number"
                                value={member.paid || ""}
                                onChange={(e) => updateMember(index, "paid", parseFloat(e.target.value) || 0)}
                                size="small"
                                sx={{ flex: 1 }}
                                slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                            />
                            {shouldShowPercentageField() && (
                                <TextField
                                    label="Percentage %"
                                    type="number"
                                    value={(typeof member.percentage === "number" ? member.percentage : "") as string | number}
                                    onChange={(e) => updateMember(index, "percentage", parseFloat(e.target.value) || 0)}
                                    size="small"
                                    sx={{ flex: 1 }}
                                    slotProps={{ htmlInput: { min: 0, max: 100, step: 0.1 } }}
                                />
                            )}
                            {shouldShowShareField() && (
                                <TextField
                                    label="Share"
                                    type="number"
                                    value={member.share || ""}
                                    onChange={(e) => updateMember(index, "share", parseFloat(e.target.value) || 0)}
                                    size="small"
                                    sx={{ flex: 1 }}
                                    slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                                />
                            )}
                            {!shouldShowShareField() && !shouldShowPercentageField() && (
                                <TextField
                                    label="Share (auto)"
                                    type="number"
                                    value={member.share || ""}
                                    size="small"
                                    sx={{ flex: 1 }}
                                    disabled
                                    helperText="Click Calculate to auto-fill"
                                />
                            )}
                        </Box>
                        {member.name && (
                            <Box
                                mt={1}
                                display="flex"
                                gap={1}
                                justifyContent="flex-end"
                            >
                                <Chip
                                    label={`Net: ₹${((member.paid || 0) - (member.share || 0)).toFixed(2)}`}
                                    size="small"
                                    color={member.paid - member.share > 0.01 ? "error" : member.paid - member.share < -0.01 ? "warning" : "success"}
                                    variant="outlined"
                                />
                            </Box>
                        )}
                    </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Summary */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    mb={2}
                    p={1}
                    bgcolor="action.hover"
                    borderRadius={1}
                >
                    <Typography variant="body2">
                        <strong>Total Paid:</strong> ₹{getTotalPaid().toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Total Shares:</strong> ₹{getTotalShares().toFixed(2)}
                    </Typography>
                </Box>

                {Math.abs(getTotalPaid() - totalDebits) > 0.01 && (
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}
                    >
                        Total paid (₹{getTotalPaid().toFixed(2)}) doesn&apos;t match transaction total (₹
                        {totalDebits.toFixed(2)})
                    </Alert>
                )}

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
                    {mode === "create" ? "Create Group" : "Save Changes"}
                </Button>
            </Box>
        </CustomModal>
    );
};

export default GroupDialog;
