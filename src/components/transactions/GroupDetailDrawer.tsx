import React from "react";
import { Box, Button, Chip, Divider, Drawer, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ITransactionGroup } from "../../types/transactionGroup";
import { ITransactionLogs } from "../../store/transactionSlice";
import { useAppDispatch } from "../../hooks/slice-hooks";
import { removeFromGroup, dissolveGroup } from "../../store/transactionGroupSlice";
import dayjs from "dayjs";

interface GroupDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    group: ITransactionGroup | null;
    transactions: ITransactionLogs[];
    onAddTransaction?: () => void;
    onTransactionClick?: (tx: ITransactionLogs) => void;
}

const GroupDetailDrawer: React.FC<GroupDetailDrawerProps> = ({ open, onClose, group, transactions, onAddTransaction, onTransactionClick }) => {
    const dispatch = useAppDispatch();

    if (!group) return null;

    const memberTransactions = transactions.filter((tx) => group.transactionIds.includes(tx._id));

    const handleRemove = (transactionId: string): void => {
        void dispatch(removeFromGroup({ groupId: group._id, transactionId }));
    };

    const handleDissolve = (): void => {
        void dispatch(dissolveGroup(group._id));
        onClose();
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: { xs: "100%", sm: 420 } } }}
        >
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">{group.name}</Typography>
                    <IconButton
                        onClick={onClose}
                        aria-label="Close drawer"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Balance:
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color={group.groupBalance >= 0 ? "success.main" : "error.main"}
                    >
                        ₹ {group.groupBalance.toFixed(2)}
                    </Typography>
                    {group.isSettled && (
                        <Chip
                            icon={<CheckCircleIcon />}
                            label="Settled"
                            size="small"
                            color="success"
                            variant="outlined"
                        />
                    )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle2">Transactions ({memberTransactions.length})</Typography>
                    {onAddTransaction && (
                        <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={onAddTransaction}
                        >
                            Add
                        </Button>
                    )}
                </Box>

                <List dense>
                    {memberTransactions.map((tx) => (
                        <ListItem
                            key={tx._id}
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={() => handleRemove(tx._id)}
                                    aria-label={`Remove ${tx.narration} from group`}
                                >
                                    <RemoveCircleOutlineIcon
                                        fontSize="small"
                                        color="error"
                                    />
                                </IconButton>
                            }
                            sx={{ cursor: onTransactionClick ? "pointer" : "default" }}
                            onClick={() => onTransactionClick?.(tx)}
                        >
                            <ListItemText
                                primary={tx.narration}
                                secondary={`${dayjs(tx.transactionDate).format("DD/MM/YYYY")} · ₹${Number(tx.amount).toFixed(2)} · ${tx.isCredit ? "Credit" : "Debit"}`}
                            />
                        </ListItem>
                    ))}
                    {memberTransactions.length === 0 && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 2, textAlign: "center" }}
                        >
                            No transactions in this group.
                        </Typography>
                    )}
                </List>

                <Divider sx={{ my: 2 }} />

                <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={handleDissolve}
                >
                    Dissolve Group
                </Button>
            </Box>
        </Drawer>
    );
};

export default GroupDetailDrawer;
