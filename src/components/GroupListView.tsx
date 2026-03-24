import { JSX, useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { computeGroupSummary } from "../utils/groupUtils";
import type { ITransactionGroup } from "../store/groupSlice";
import type { ITransactionLogs } from "../store/transactionSlice";

type SortKey = "name" | "status" | "netAmount";

interface GroupListViewProps {
    groups: ITransactionGroup[];
    transactions: ITransactionLogs[];
    onGroupClick: (groupId: string) => void;
    onDeleteGroup: (groupId: string) => void;
}

const GroupListView = ({ groups, transactions, onGroupClick, onDeleteGroup }: GroupListViewProps): JSX.Element => {
    const [sortBy, setSortBy] = useState<SortKey>("name");
    const [deleteTarget, setDeleteTarget] = useState<ITransactionGroup | null>(null);

    const groupsWithSummary = useMemo(() => groups.map((g) => ({ group: g, summary: computeGroupSummary(g, transactions) })), [groups, transactions]);

    const sorted = useMemo(() => {
        const copy = [...groupsWithSummary];
        copy.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.group.name.localeCompare(b.group.name);
                case "status":
                    return a.summary.status.localeCompare(b.summary.status);
                case "netAmount":
                    return a.summary.netSettlement - b.summary.netSettlement;
                default:
                    return 0;
            }
        });
        return copy;
    }, [groupsWithSummary, sortBy]);

    if (groups.length === 0) {
        return (
            <Box
                textAlign="center"
                py={4}
            >
                <Typography color="text.secondary">No groups yet. Select transactions and create a group to get started.</Typography>
            </Box>
        );
    }

    return (
        <>
            <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                mb={2}
                gap={1}
            >
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Sort by:
                </Typography>
                <Select
                    size="small"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="netAmount">Net Amount</MenuItem>
                </Select>
            </Box>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Involved Party</TableCell>
                            <TableCell align="center">Transactions</TableCell>
                            <TableCell align="right">Net Settlement</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sorted.map(({ group, summary }) => (
                            <TableRow
                                key={group.id}
                                hover
                                sx={{ cursor: "pointer" }}
                                onClick={() => onGroupClick(group.id)}
                            >
                                <TableCell>{group.name}</TableCell>
                                <TableCell>{group.involvedParty || "—"}</TableCell>
                                <TableCell align="center">{group.transactionIds.length}</TableCell>
                                <TableCell align="right">₹{Math.abs(summary.netSettlement).toFixed(2)}</TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={summary.status}
                                        color={summary.status === "Settled" ? "success" : "warning"}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteTarget(group);
                                        }}
                                        aria-label={`Delete group ${group.name}`}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Delete confirmation dialog */}
            <Dialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
            >
                <DialogTitle>Delete Group</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button
                        color="error"
                        onClick={() => {
                            if (deleteTarget) onDeleteGroup(deleteTarget.id);
                            setDeleteTarget(null);
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default GroupListView;
