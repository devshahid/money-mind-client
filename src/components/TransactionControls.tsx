import {
    Box,
    Button,
    Drawer,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Divider,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Tooltip,
    IconButton,
    Modal,
    CircularProgress,
    Dialog,
    AppBar,
    Toolbar,
    TableContainer,
    Paper,
    TableHead,
    TableRow,
    Table,
    TableCell,
    TableBody,
    TablePagination,
} from "@mui/material";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import FilterListIcon from "@mui/icons-material/FilterList";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { listTransactions } from "../store/transactionSlice";
import { useAppDispatch } from "../hooks/slice-hooks";
import CancelIcon from "@mui/icons-material/Cancel";
import axiosClient from "../services/axiosClient";
import { useLayout } from "../contexts/LayoutContext";
import { getExpenseCategories } from "../constants";

const labelOptions = ["Repair", "Purchase", "Personal"];

type RowData = Record<string, string>;
const REQUIRED_HEADERS = ["date", "narration", "refNumber", "withdrawlAmount", "depositAmount", "closingBalance"];

const TableControls = () => {
    const { headerHeight } = useLayout();

    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [uploadModal, setUploadModal] = useState(false);
    const [readLoading, setReadLoading] = useState<boolean>(false);
    const [data, setData] = useState<RowData[]>([]);
    const [bankName, setBankName] = useState<string | null>(null);
    const [headers, setHeaders] = useState<string[]>(() => (data.length > 0 ? Object.keys(data[0]) : []));
    const [previewUploadedContent, setPreviewUploadedContent] = useState<boolean>(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handlePageChange = (newPage: number) => setPage(newPage);

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        if (data.length > 0) {
            setHeaders(Object.keys(data[0]));
        }
    }, [data]);

    const [filters, setFilters] = useState({
        dateFrom: "",
        dateTo: "",
        amount: "",
        bankName: "",
        transactionType: "",
        category: [] as string[],
        labels: [] as string[],
        type: "",
    });

    const dispatch = useAppDispatch();

    const toggleFilterDrawer = () => setFilterOpen(!filterOpen);

    const clearFilters = () => {
        // Only send non-empty filters
        const updatedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            if (key === "category" || key === "labels") {
                if (value.length > 0) acc[key] = value;
            } else if (value !== "") {
                acc[key] = value;
            }
            return acc;
        }, {} as any);
        return updatedFilters;
    };

    const handleApplyFilter = () => {
        dispatch(listTransactions({ ...clearFilters() }));
        setFilterOpen(false);
    };

    useEffect(() => {
        if (!filterOpen && Object.keys(filters).length > 0) {
            console.log("Filters applied:", filters);
            const activeFiltersCount = Object.values(filters).filter((value) => {
                if (Array.isArray(value)) return value.length > 0;
                return value !== "" && value !== null;
            }).length;
            setActiveFiltersCount(activeFiltersCount);
        }
    }, [filterOpen]);

    const handleMultiChange = (event: any, type: "category" | "labels") => {
        const {
            target: { value },
        } = event;
        setFilters({ ...filters, [type]: typeof value === "string" ? value.split(",") : value });
    };

    const handleResetFilters = () => {
        setFilters({
            dateFrom: "",
            dateTo: "",
            amount: "",
            bankName: "",
            transactionType: "",
            category: [],
            labels: [],
            type: "",
        });
        // setSelectedLabels([]);
        setActiveFiltersCount(0);
        setFilterOpen(false);
    };

    // call list api when filter update
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                await dispatch(listTransactions(clearFilters()));
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };
        if (!filterOpen) fetchTransactions();
    }, [filters, dispatch]);

    // Debounce function: delays execution until user stops typing for 1s
    const debounce = (callback: Function) => {
        let timeoutId: number;
        return (event: { target: { value: any } }) => {
            const value = event.target.value;
            clearTimeout(timeoutId); // clear any previous timer
            timeoutId = setTimeout(() => {
                callback(value);
            }, 1000); // 1 second delay
        };
    };

    // Actual search logic
    const handleSearch = async (searchTerm: string) => {
        console.log("Searching for:", searchTerm);
        dispatch(listTransactions({ ...clearFilters(), keyword: searchTerm }));
    };

    // const handleHeaderChange = (index: number, newValue: string) => {
    //     const updated = [...headers];
    //     updated[index] = newValue;
    //     setHeaders(updated);
    // };

    const validateHeaders = (headers: string[]): { valid: boolean; missing: string[] } => {
        const lowerCaseHeaders = headers.map((h) => h.trim().toLowerCase());
        const missing = REQUIRED_HEADERS.filter((req) => !lowerCaseHeaders.includes(req.toLowerCase()));
        return { valid: missing.length === 0, missing };
    };

    const mergeRows = (rows: any[][], headers: string[], keyField: string): RowData[] => {
        const keyIdx = headers.indexOf(keyField);
        const merged: any[][] = [];
        let currentRow: any[] | null = null;

        rows.forEach((row) => {
            if (row[keyIdx]) {
                if (currentRow) merged.push(currentRow);
                currentRow = [...row];
            } else if (currentRow) {
                currentRow = currentRow.map((val, idx) => (typeof val === "string" ? val + " " + (row[idx] || "") : val || row[idx]));
            }
        });

        if (currentRow) merged.push(currentRow);
        return merged.map((row) =>
            headers.reduce((obj: RowData, key: string, i: number) => {
                obj[key] = row[i] || "";
                return obj;
            }, {}),
        );
    };

    const handleDelete = (index: number) => {
        setData(data.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: string, value: string) => {
        const updated = [...data];
        updated[index][field] = value;
        setData(updated);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        setReadLoading(true);
        let parsedRows: RowData[] = [];

        reader.onload = (evt) => {
            try {
                const arrayBuffer = evt.target?.result as ArrayBuffer;
                const wb = XLSX.read(arrayBuffer, { type: "array" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

                const header = rawData[0];
                const body = rawData.slice(1);
                const { valid, missing } = validateHeaders(header);

                if (!valid) {
                    console.error(`Missing required headers: ${missing.join(", ")}`);
                    setReadLoading(false);
                    return;
                }

                parsedRows = mergeRows(body, header, header[0]);
            } catch (error) {
                console.error("Error parsing file:", error);
            } finally {
                setReadLoading(false);
            }
        };

        reader.onloadend = () => {
            console.log("Read complete", parsedRows);
            setReadLoading(false);
            setData(parsedRows);
            setPreviewUploadedContent(true);
            setUploadModal(false);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleSave = async () => {
        try {
            if (!bankName || (bankName && bankName.length === 0)) {
                alert("Bank Name required");
                return;
            }
            const response = await axiosClient.post("transaction-logs/upload-data-from-file", { rows: data });
            console.log("response", response.data);
            //   await axios.post("http://localhost:3001/save-statement", { rows: data });
            alert("Saved to DB!");
        } catch (err) {
            console.error(err);
            alert("Error saving data");
        }
    };

    return (
        <>
            {/* Top Controls Container */}

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                    px: 1,
                }}
            >
                {/* Search Bar */}
                <TextField
                    size="small"
                    label="Search any transaction"
                    variant="outlined"
                    sx={{ flex: "1 1 250px", minWidth: "250px" }}
                    onChange={debounce(handleSearch)}
                    name="keyword"
                />

                {/* Filter Button */}
                <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={toggleFilterDrawer}
                    sx={{ flex: "0 0 200px", minWidth: "180px" }}
                >
                    Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>

                {/* Transaction Flow Dropdown */}
                <FormControl
                    size="small"
                    sx={{ flex: "1 1 160px", minWidth: "140px" }}
                >
                    <InputLabel>Transaction Flow</InputLabel>
                    <Select
                        label="Transaction Flow"
                        defaultValue="all"
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        value={filters.type}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="credit">Credit</MenuItem>
                        <MenuItem value="debit">Debit</MenuItem>
                    </Select>
                </FormControl>

                <FormControl
                    size="small"
                    sx={{ flex: "1 1 160px", minWidth: "140px" }}
                >
                    <InputLabel>Category</InputLabel>
                    <Select
                        label="Category"
                        multiple
                        value={filters.category}
                        onChange={(e) => handleMultiChange(e, "category")}
                        input={<OutlinedInput label="Category" />}
                        renderValue={(selected) => (selected as string[]).join(", ")}
                        MenuProps={{
                            // Pass props to the Menu component
                            PaperProps: {
                                style: {
                                    maxHeight: 200, // Set the maximum height here
                                    width: "auto",
                                },
                            },
                            anchorOrigin: {
                                //add these two props
                                vertical: "bottom",
                                horizontal: "left",
                            },
                            transformOrigin: {
                                vertical: "top",
                                horizontal: "left",
                            },
                        }}
                    >
                        {getExpenseCategories().map((category, i) => (
                            <MenuItem
                                key={i}
                                value={category.name}
                            >
                                <Checkbox checked={filters.category.indexOf(category.name) > -1} />
                                <ListItemText primary={category.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* All Transactions Dropdown */}
                <FormControl
                    size="small"
                    sx={{ flex: "1 1 160px", minWidth: "140px" }}
                >
                    <InputLabel>All Transactions</InputLabel>
                    <Select
                        label="All Transactions"
                        defaultValue="all"
                        name="transactionType"
                        onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                        value={filters.transactionType} // show default value or else selected value
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="online">Online</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                    </Select>
                </FormControl>

                {/* Upload Button */}
                <Box
                    onClick={() => setUploadModal(true)}
                    sx={{ cursor: "pointer" }}
                >
                    <Tooltip
                        title="Upload Statement"
                        arrow
                    >
                        <IconButton color="primary">
                            <CloudUploadIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box
                    onClick={() => setUploadModal(true)}
                    sx={{ cursor: "pointer" }}
                >
                    <Tooltip
                        title="Add Cash Memo"
                        arrow
                    >
                        <IconButton color="primary">
                            <ReceiptLongIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Filter Sidebar */}
            <Drawer
                anchor="right"
                open={filterOpen}
                onClose={toggleFilterDrawer}
                slotProps={{
                    paper: {
                        sx: {
                            mt: `${headerHeight}px`,
                            height: `calc(100vh - ${headerHeight}px)`,
                            width: { xs: "100%", sm: 350 },
                        },
                    },
                }}
            >
                <Box sx={{ p: 3, height: "100vh", overflowY: "auto" }}>
                    <Typography
                        variant="h6"
                        gutterBottom
                    >
                        Filter Transactions
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    {/* Date From */}
                    <TextField
                        fullWidth
                        type="date"
                        label="From Date"
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                        name="dateFrom"
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        value={filters.dateFrom}
                    />

                    {/* Date To */}
                    <TextField
                        fullWidth
                        type="date"
                        label="To Date"
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                        name="dateTo"
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        value={filters.dateTo}
                    />

                    {/* Amount */}
                    <TextField
                        fullWidth
                        label="Amount"
                        variant="outlined"
                        type="number"
                        sx={{ mb: 2 }}
                        name="amount"
                        value={filters.amount}
                        onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
                    />

                    {/* Bank Name */}
                    <TextField
                        fullWidth
                        label="Bank Name"
                        variant="outlined"
                        sx={{ mb: 2 }}
                        name="bankName"
                        onChange={(e) => setFilters({ ...filters, bankName: e.target.value })}
                        value={filters.bankName}
                    />

                    {/* Transaction Type */}
                    <FormControl
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <InputLabel>Transaction Type</InputLabel>
                        <Select
                            label="Transaction Type"
                            defaultValue=""
                            name="transactionType"
                            onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                            value={filters.transactionType}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="online">Online</MenuItem>
                            <MenuItem value="cash">Cash</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Transaction Flow Type */}
                    <FormControl
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <InputLabel>Transaction Flow</InputLabel>
                        <Select
                            label="Transaction Flow"
                            defaultValue=""
                            name="type"
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            value={filters.type}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="debit">Debit</MenuItem>
                            <MenuItem value="credit">Credit</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Category Multi-Select */}
                    <FormControl
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <InputLabel>Category</InputLabel>
                        <Select
                            multiple
                            value={filters.category}
                            onChange={(e) => handleMultiChange(e, "category")}
                            input={<OutlinedInput label="Category" />}
                            renderValue={(selected) => (selected as string[]).join(", ")}
                        >
                            {getExpenseCategories().map((category, i) => (
                                <MenuItem
                                    key={i}
                                    value={category.name}
                                >
                                    <Checkbox checked={filters.category.indexOf(category.name) > -1} />
                                    <ListItemText primary={category.name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Labels Multi-Select */}
                    <FormControl
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <InputLabel>Labels</InputLabel>
                        <Select
                            multiple
                            value={filters.labels}
                            onChange={(e) => handleMultiChange(e, "labels")}
                            input={<OutlinedInput label="Labels" />}
                            renderValue={(selected) => (selected as string[]).join(", ")}
                        >
                            {labelOptions.map((label) => (
                                <MenuItem
                                    key={label}
                                    value={label}
                                >
                                    <Checkbox checked={filters.labels.indexOf(label) > -1} />
                                    <ListItemText primary={label} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ py: 2, px: 3, gap: 1, display: "flex", flexDirection: "column" }}>
                    {/* Clear All Button */}
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleResetFilters}
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Clear All
                    </Button>
                    {/* Apply Filter Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleApplyFilter}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Drawer>

            {/* Upload Statement Modal */}
            <Modal
                open={uploadModal}
                onClose={(_, reason) => {
                    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
                        setUploadModal(false);
                        setData([]);
                    }
                }}
                disableEscapeKeyDown
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 3,
                        width: { xs: "90%", sm: "80%", md: 500 }, // responsive width
                        maxHeight: "90vh",
                        overflowY: "auto",
                        borderRadius: 2,
                    }}
                >
                    {/* Close Button */}
                    <IconButton
                        onClick={() => {
                            setUploadModal(false);
                            setData([]);
                        }}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CancelIcon />
                    </IconButton>
                    {/* Modal Content */}
                    <div>
                        <Typography
                            variant="h6"
                            mb={2}
                        >
                            Upload Bank Statement
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={!readLoading && <CloudUploadIcon />}
                                fullWidth
                                sx={{ mt: 2 }}
                                disabled={readLoading}
                            >
                                {!readLoading ? "Choose File" : <CircularProgress />}
                                <input
                                    type="file"
                                    accept=".xls,.xlsx"
                                    hidden
                                    onChange={handleFileUpload}
                                />
                            </Button>
                        </Box>
                    </div>
                </Box>
            </Modal>

            {/* Upload Preview */}
            {previewUploadedContent && (
                <Box textAlign="center">
                    <Box>
                        <Typography
                            variant="h6"
                            mb={2}
                        >
                            Uploaded File Content
                        </Typography>

                        <Dialog
                            fullScreen
                            open={previewUploadedContent}
                            onClose={() => {
                                setPreviewUploadedContent(false);
                                setData([]);
                            }}
                        >
                            <AppBar sx={{ position: "relative" }}>
                                <Toolbar>
                                    <Typography
                                        sx={{ flex: 1 }}
                                        variant="h6"
                                        component="div"
                                    >
                                        Preview Uploaded Data
                                    </Typography>
                                    <IconButton
                                        edge="end"
                                        color="inherit"
                                        onClick={() => {
                                            setPreviewUploadedContent(false);
                                            setData([]);
                                        }}
                                        aria-label="close"
                                    >
                                        <CancelIcon />
                                    </IconButton>
                                </Toolbar>
                            </AppBar>
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                                <TextField
                                    label="Bank Name"
                                    variant="outlined"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                />
                                <Box
                                    textAlign="right"
                                    ml={2}
                                >
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                    >
                                        Save to DB
                                    </Button>
                                </Box>
                            </Box>
                            <Box sx={{ p: { xs: 2, md: 4 } }}>
                                <TableContainer component={Paper}>
                                    <Table
                                        size="small"
                                        stickyHeader
                                    >
                                        <TableHead>
                                            <TableRow>
                                                {headers.map((header, idx) => (
                                                    <TableCell
                                                        key={idx}
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        <TextField
                                                            fullWidth
                                                            variant="standard"
                                                            value={header}
                                                            disabled
                                                            sx={{
                                                                "& .MuiInputBase-root::before": { borderBottom: "none" },
                                                                "& .MuiInputBase-root:hover:not(.Mui-disabled)::before": {
                                                                    borderBottom: "none",
                                                                },
                                                                "& .MuiInputBase-root.Mui-focused::after": {
                                                                    borderBottom: "none",
                                                                },
                                                                textAlign: "center",
                                                            }}
                                                        />
                                                    </TableCell>
                                                ))}
                                                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => (
                                                <TableRow key={i}>
                                                    {headers.map((key, idx) => {
                                                        return (
                                                            <TableCell key={idx}>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    variant="outlined"
                                                                    value={row[key]}
                                                                    sx={
                                                                        key === "withdrawlAmount"
                                                                            ? { backgroundColor: "#FFD6D6", width: "100px" }
                                                                            : key === "depositAmount"
                                                                              ? { backgroundColor: "#DFF5E1	", width: "100px" }
                                                                              : key === "closingBalance"
                                                                                ? { width: "140px", textAlign: "right", backgroundColor: "#FFF9DB" }
                                                                                : ["date", "valueDate", "refNumber"].includes(key)
                                                                                  ? { width: "100px" }
                                                                                  : key === "narration"
                                                                                    ? { width: "500px" }
                                                                                    : { fontWeight: 600 }
                                                                    }
                                                                    onChange={(e) => handleChange(page * rowsPerPage + i, key, e.target.value)}
                                                                />
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => handleDelete(page * rowsPerPage + i)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    <TablePagination
                                        component="div"
                                        count={data.length}
                                        page={page}
                                        onPageChange={(_, newPage) => handlePageChange(newPage)}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={handleRowsPerPageChange}
                                        rowsPerPageOptions={[10, 25]}
                                    />
                                </TableContainer>
                            </Box>
                        </Dialog>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default TableControls;
