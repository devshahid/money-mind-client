import { useEffect, useState } from "react";
import { listCategories, listLabels, listTransactions, updateTransaction } from "../store/transactionSlice";
import { useAppDispatch, useAppSelector } from "../hooks/slice-hooks";
import { RootState } from "../store";

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    IconButton,
    Typography,
    Box,
    Backdrop,
    CircularProgress,
    Button,
    MenuItem,
    TextField,
    Chip,
    Autocomplete,
    Modal,
    Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Loader } from "lucide-react";
import TableControls from "../components/TransactionControls";

const TransactionLogs = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<any>(null);

    const dispatch = useAppDispatch();
    const { transactions, loading, labels, categories, totalCount } = useAppSelector((state: RootState) => state.transactions);

    useEffect(() => {
        dispatch(listTransactions({ page: currentPage.toString(), limit: "50" }));
    }, [dispatch, currentPage]);

    useEffect(() => {
        if (!loading) setIsLoadingMore(false);
    }, [loading]);

    useEffect(() => {
        dispatch(listLabels());
        dispatch(listCategories());
    }, []);

    useEffect(() => {
        if (editingTransaction) {
            console.log("editingTransaction", editingTransaction);
        }
    }, [editingTransaction]);

    console.log("totalCount: ", totalCount);
    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setCurrentPage((prev) => prev + 1); // Update page locally
    };

    const handleUpdateTransaction = (transaction: any) => {
        dispatch(updateTransaction(transaction)); // Refresh the transaction list
        setEditModalOpen(false);
    };

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const allIds = transactions.map((tx) => tx._id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const isSelected = (id: string) => selectedIds.includes(id);

    return (
        <div>
            <Box style={{ padding: "10px", backgroundColor: "#f5f5f5" }}>
                <TableControls />

                {!loading && transactions.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%", // Ensures it takes the full height of the container
                        }}
                    >
                        <Typography
                            variant="h6"
                            align="center"
                        >
                            No transactions found.
                        </Typography>
                    </Box>
                ) : (
                    <div>
                        <Box sx={{ width: "100%", overflowX: "auto" }}>
                            <TableContainer
                                sx={{ maxHeight: "100vh" }}
                                component={Paper}
                            >
                                {loading && (
                                    <Typography
                                        variant="h6"
                                        align="center"
                                    >
                                        Loading...
                                    </Typography>
                                )}

                                <Table
                                    stickyHeader
                                    aria-label="sticky table"
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <Checkbox
                                                    color="primary"
                                                    indeterminate={selectedIds.length > 0 && selectedIds.length < transactions.length}
                                                    checked={transactions.length > 0 && selectedIds.length === transactions.length}
                                                    onChange={handleSelectAll}
                                                />
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    width: { xs: "50px", sm: "80px", md: "100px" }, // Responsive widths
                                                    whiteSpace: "nowrap",
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                    fontSize: "1rem",
                                                }}
                                            >
                                                Transaction Date
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Narration</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Notes</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Category</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Labels</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Bank</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Type</TableCell>
                                            <TableCell
                                                sx={{
                                                    width: { xs: "70px", sm: "100px", md: "150px" }, // Responsive widths
                                                    whiteSpace: "nowrap",
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                    fontSize: "1rem",
                                                }}
                                            >
                                                Amount
                                            </TableCell>
                                            <TableCell
                                                align="center"
                                                sx={{ fontWeight: "bold", fontSize: "1rem" }}
                                            >
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map((tx) => (
                                            <TableRow
                                                key={tx._id}
                                                hover
                                                selected={isSelected(tx._id)}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        color="primary"
                                                        checked={isSelected(tx._id)}
                                                        onChange={() => handleSelectOne(tx._id)}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>{tx.transactionDate}</TableCell>
                                                <TableCell sx={{ fontSize: "1rem" }}>{tx.narration}</TableCell>
                                                <TableCell sx={{ fontSize: "1rem" }}>{tx.notes}</TableCell>
                                                <TableCell sx={{ fontSize: "1rem" }}>
                                                    {tx.category ? tx.category.charAt(0).toUpperCase() + tx.category.slice(1) : ""}
                                                </TableCell>
                                                <TableCell>
                                                    {tx.label.map((label, index) => (
                                                        <Typography
                                                            variant="body2"
                                                            key={index}
                                                            sx={{ fontSize: "1rem" }}
                                                        >
                                                            {label}
                                                        </Typography>
                                                    ))}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: "1rem" }}>{tx.bankName}</TableCell>
                                                <TableCell sx={{ fontSize: "1rem" }}>{tx.isCredit ? "Credit" : "Debit"}</TableCell>
                                                <TableCell
                                                    sx={{
                                                        fontSize: "1rem",
                                                        width: { xs: "80px", sm: "100px", md: "150px" }, // Responsive widths
                                                    }}
                                                    style={{ color: tx.isCredit ? "#4CAF50" : "#F44336", textAlign: "center", fontWeight: "bold" }}
                                                >
                                                    ₹ {Number(tx.amount).toFixed(2)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => {
                                                            setEditingTransaction(tx); // Pass the transaction to edit
                                                            setEditModalOpen(true);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                        {/* Loading Overlay */}
                        {loading && (
                            <Backdrop
                                open
                                sx={{
                                    zIndex: (theme) => theme.zIndex.drawer + 1,
                                    color: "#fff",
                                    // height: "auto",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <CircularProgress
                                        color="inherit"
                                        style={{ marginRight: 10 }}
                                    />
                                    Please wait...
                                </div>
                            </Backdrop>
                        )}
                        {/* add load more button */}
                        {!loading && (
                            <div style={{ textAlign: "center", margin: "20px 0" }}>
                                {!loading ? (
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "#1976d2",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: isLoadingMore ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        {isLoadingMore ? "Loading..." : "Load More"}
                                    </button>
                                ) : (
                                    <Loader />
                                )}
                            </div>
                        )}
                    </div>
                )}
                <Modal
                    open={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setEditingTransaction(null);
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            width: { xs: "90%", md: "600px" },
                            maxHeight: "90vh",
                            overflowY: "auto",
                            borderRadius: 2,
                        }}
                    >
                        {editingTransaction && (
                            <>
                                <Typography
                                    variant="h6"
                                    mb={2}
                                >
                                    Edit Transaction
                                </Typography>

                                {/* Notes field */}
                                <TextField
                                    fullWidth
                                    label="Narration"
                                    disabled
                                    value={editingTransaction.narration || ""}
                                    onChange={(e) => setEditingTransaction({ ...editingTransaction, notes: e.target.value })}
                                    sx={{ mb: 2, overflow: "auto" }}
                                />
                                {/* Notes field */}
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    value={editingTransaction.notes || ""}
                                    onChange={(e) => setEditingTransaction({ ...editingTransaction, notes: e.target.value })}
                                    sx={{ mb: 2 }}
                                />

                                <Autocomplete
                                    freeSolo
                                    options={categories.map((c) => c.categoryName)} // ['Shopping', 'Medical', 'Utilities']
                                    value={editingTransaction.category || ""}
                                    onChange={(_, newValue) => setEditingTransaction({ ...editingTransaction, category: newValue || "" })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Category"
                                            placeholder="Select or type Category"
                                            fullWidth
                                            sx={{ mb: 2 }}
                                        />
                                    )}
                                />

                                {/* Labels field (multiselect + search) */}
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={labels.map((l) => l.labelName)} // No fixed options (or you can add suggestion labels if you want)
                                    value={editingTransaction.label || []}
                                    onChange={(_, newValue) => setEditingTransaction({ ...editingTransaction, label: newValue })}
                                    renderTags={(value: string[], getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                variant="outlined"
                                                label={option}
                                                {...getTagProps({ index })}
                                            />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Labels"
                                            placeholder="Add Labels"
                                        />
                                    )}
                                    sx={{ mb: 2 }}
                                />

                                {/* Save Button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => handleUpdateTransaction(editingTransaction)}
                                >
                                    Save Changes
                                </Button>
                            </>
                        )}
                    </Box>
                </Modal>
            </Box>
        </div>
    );
};

export default TransactionLogs;
