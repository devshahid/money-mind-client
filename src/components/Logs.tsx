import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    TextField,
    Select,
    MenuItem,
    Stack,
    Button,
    InputAdornment,
    Paper,
    Drawer,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import axiosClient from "../services/axiosClient";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const filterFields = ["Shipment Type", "Carrier", "Service", "Status", "Shipping Order Type", "Package Type", "Destination", "Transaction"];

type Transaction = {
    _id: string;
    transactionDate: string;
    narration: string;
    label: string[];
    amount: number;
    isCredit: boolean;
    isCash: boolean;
    bankName: string;
};
const TrackingDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const [filters, setFilters] = useState<Record<string, string>>({
        "Shipment Type": "",
        Carrier: "",
        Service: "",
        Status: "",
        "Shipping Order Type": "",
        "Package Type": "",
        Destination: "",
        Transaction: "",
        Date: "All Time",
        Search: "",
    });

    const handleEditClick = (row: Transaction) => {
        setSelectedTransaction(row);
    };

    const fetchTransactions = async (newPage = 1, append = false) => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: newPage.toString(),
                limit: "50",
                type: filters.type,
                bankType: filters.bankType,
                bankName: filters.bankName,
                label: filters.label,
            });

            const res = await axiosClient.get(`transaction-logs/list-transactions?${query.toString()}`);
            const response = res.data.output.result;

            if (response.length < 50) setHasMore(false);

            if (append) {
                setTransactions((prev) => [...prev, ...response]);
            } else {
                setTransactions(response);
            }
            setPage(newPage);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(1, false);
    }, [filters]);

    // Infinite scroll trigger
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchTransactions(page + 1, true);
                }
            },
            { threshold: 1 },
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
        };
    }, [page, hasMore, loading]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setSearch(value);
    };

    const resetFilters = () => {
        const cleared = Object.keys(filters).reduce(
            (acc, key) => {
                acc[key] = "";
                return acc;
            },
            {} as Record<string, string>,
        );
        setFilters(cleared);
    };

    const handleUpdate = async () => {
        try {
            await axiosClient.put(`/transaction-logs/update/${selectedTransaction?._id}`, selectedTransaction);
            const updated = transactions.map((t) => (t._id === selectedTransaction?._id ? selectedTransaction! : t));
            setTransactions(updated);
            setSelectedTransaction(null);
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const columns: GridColDef[] = [
        { field: "transactionDate", headerName: "Date", width: 120 },
        { field: "narration", headerName: "Narration", width: 400 },
        { field: "amount", headerName: "Amount", width: 100 },
        { field: "bankName", headerName: "Bank", width: 100 },
        {
            field: "label",
            headerName: "Labels",
            width: 150,
            renderCell: (params) => params.row.label.join(", "),
        },
        {
            field: "action",
            headerName: "Action",
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEditClick(params.row)}
                >
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <Container
            maxWidth="xl"
            sx={{ pt: 2 }}
        >
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newVal) => setActiveTab(newVal)}
                >
                    <Tab label="Shipments" />
                    <Tab label="Batch" />
                    <Tab label="Bulk Tracking" />
                </Tabs>
            </Box>

            {/* Filters Row */}
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
                mb={2}
            >
                <TextField
                    placeholder="Search"
                    value={filters.Search}
                    onChange={(e) => handleFilterChange("Search", e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<TuneIcon />}
                    size="small"
                    onClick={() => setDrawerOpen(true)}
                >
                    Filters
                </Button>

                <Select
                    value={filters.Date}
                    size="small"
                    onChange={(e) => handleFilterChange("Date", e.target.value)}
                    displayEmpty
                >
                    <MenuItem value="All Time">All Time</MenuItem>
                    <MenuItem value="Today">Today</MenuItem>
                    <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                    <MenuItem value="This Month">This Month</MenuItem>
                </Select>

                <Select
                    value={filters["Shipment Type"]}
                    size="small"
                    onChange={(e) => handleFilterChange("Shipment Type", e.target.value)}
                    displayEmpty
                >
                    <MenuItem value="">Shipment Type</MenuItem>
                    <MenuItem value="Express">Express</MenuItem>
                    <MenuItem value="Standard">Standard</MenuItem>
                </Select>

                <Select
                    value={filters.Carrier}
                    size="small"
                    onChange={(e) => handleFilterChange("Carrier", e.target.value)}
                    displayEmpty
                >
                    <MenuItem value="">Carrier</MenuItem>
                    <MenuItem value="FedEx">FedEx</MenuItem>
                    <MenuItem value="UPS">UPS</MenuItem>
                </Select>

                <Select
                    value={filters.Status}
                    size="small"
                    onChange={(e) => handleFilterChange("Status", e.target.value)}
                    displayEmpty
                >
                    <MenuItem value="">Status</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                    <MenuItem value="In Transit">In Transit</MenuItem>
                </Select>
            </Stack>

            {/* Data Table */}
            <Paper sx={{ width: "100%", height: "100%", overflow: "auto" }}>
                <Box sx={{ width: "100%", minWidth: "900px", overflowX: "auto" }}>
                    <DataGrid
                        getRowId={(row) => row._id}
                        rows={transactions}
                        columns={columns}
                        pageSizeOptions={[50]}
                        disableRowSelectionOnClick
                        sx={{
                            border: 0,
                            minWidth: "100%",
                            "& .MuiDataGrid-columnHeaders": {
                                position: "sticky",
                                top: 0,
                                backgroundColor: "#fff",
                                zIndex: 1,
                            },
                        }}
                    />
                </Box>
            </Paper>

            {/* Scroll detector for auto-load more */}
            <div ref={containerRef} />

            {!hasMore && (
                <Typography
                    variant="body2"
                    textAlign="center"
                    mt={2}
                >
                    No more transactions to load.
                </Typography>
            )}

            {/* Modal for Editing */}
            <Dialog
                open={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                fullWidth
            >
                <DialogTitle>Edit Transaction</DialogTitle>
                <DialogContent>
                    {selectedTransaction && (
                        <Stack
                            spacing={2}
                            mt={1}
                        >
                            <TextField
                                label="Date"
                                value={selectedTransaction.transactionDate}
                                onChange={(e) =>
                                    setSelectedTransaction({
                                        ...selectedTransaction,
                                        transactionDate: e.target.value,
                                    })
                                }
                                fullWidth
                            />
                            <TextField
                                label="Narration"
                                value={selectedTransaction.narration}
                                onChange={(e) =>
                                    setSelectedTransaction({
                                        ...selectedTransaction,
                                        narration: e.target.value,
                                    })
                                }
                                fullWidth
                            />
                            <TextField
                                label="Amount"
                                type="number"
                                value={selectedTransaction.amount}
                                onChange={(e) =>
                                    setSelectedTransaction({
                                        ...selectedTransaction,
                                        amount: +e.target.value,
                                    })
                                }
                                fullWidth
                            />
                            <TextField
                                label="Bank Name"
                                value={selectedTransaction.bankName}
                                onChange={(e) =>
                                    setSelectedTransaction({
                                        ...selectedTransaction,
                                        bankName: e.target.value,
                                    })
                                }
                                fullWidth
                            />
                            <TextField
                                label="Labels (comma separated)"
                                value={selectedTransaction.label.join(", ")}
                                onChange={(e) =>
                                    setSelectedTransaction({
                                        ...selectedTransaction,
                                        label: e.target.value.split(",").map((s) => s.trim()),
                                    })
                                }
                                fullWidth
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedTransaction(null)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdate}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Right Drawer for Advanced Filters */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box sx={{ width: 320, p: 3 }}>
                    <Typography
                        variant="h6"
                        gutterBottom
                    >
                        Filters
                    </Typography>

                    <Box
                        textAlign="right"
                        mb={2}
                    >
                        <Button
                            onClick={resetFilters}
                            size="small"
                        >
                            Clear
                        </Button>
                    </Box>

                    <Stack spacing={2}>
                        {filterFields.map((field, i) => (
                            <FormControl
                                fullWidth
                                key={i}
                                size="small"
                            >
                                <InputLabel>{field}</InputLabel>
                                <Select
                                    label={field}
                                    value={filters[field]}
                                    onChange={(e) => handleFilterChange(field, e.target.value)}
                                >
                                    <MenuItem value="">Any</MenuItem>
                                    <MenuItem value="Option 1">Option 1</MenuItem>
                                    <MenuItem value="Option 2">Option 2</MenuItem>
                                </Select>
                            </FormControl>
                        ))}
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={2}
                    >
                        <Button
                            variant="text"
                            onClick={() => setDrawerOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setDrawerOpen(false)}
                        >
                            Apply Filter
                        </Button>
                    </Stack>
                </Box>
            </Drawer>
        </Container>
    );
};

export default TrackingDashboard;
