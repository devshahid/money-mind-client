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
    Modal,
} from "@mui/material";
import { useEffect, useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const labelOptions = ["Repair", "Purchase", "Personal"];
const categoryOptions = ["Shopping", "Food", "Grocery"];

const TableControls = () => {
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [uploadModal, setUploadModal] = useState(false);
    const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        dateFrom: "",
        dateTo: "",
        amount: "",
        bankName: "",
        transactionType: "",
        category: "",
        labels: [] as string[],
        type: "",
    });

    const toggleFilterDrawer = () => {
        setFilterOpen(!filterOpen);
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

    const handleLabelChange = (event: any) => {
        const {
            target: { value },
        } = event;
        console.log("filter value", value);
        setSelectedLabels(typeof value === "string" ? value.split(",") : value);
    };

    const handleResetFilters = () => {
        setFilters({
            dateFrom: "",
            dateTo: "",
            amount: "",
            bankName: "",
            transactionType: "",
            category: "",
            labels: [],
            type: "",
        });
        setSelectedLabels([]);
        setActiveFiltersCount(0);
        setFilterOpen(false);
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
                    label="Search"
                    variant="outlined"
                    sx={{ flex: "1 1 160px", minWidth: "140px" }}
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

                {/* All Transactions Dropdown */}
                <FormControl
                    size="small"
                    sx={{ flex: "1 1 160px", minWidth: "140px" }}
                >
                    <InputLabel>All Transactions</InputLabel>
                    <Select
                        label="All Transactions"
                        defaultValue=""
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="money_in">Money In</MenuItem>
                        <MenuItem value="money_out">Money Out</MenuItem>
                    </Select>
                </FormControl>

                {/* Category Dropdown */}
                <FormControl
                    size="small"
                    sx={{ flex: "1 1 160px", minWidth: "140px" }}
                >
                    <InputLabel>Category</InputLabel>
                    <Select
                        label="All Transactions"
                        defaultValue=""
                    >
                        <MenuItem value="">Shopping</MenuItem>
                        <MenuItem value="money_in">Food</MenuItem>
                        <MenuItem value="money_out">Personal</MenuItem>
                    </Select>
                </FormControl>

                {/* Type Dropdown */}
                <FormControl
                    size="small"
                    sx={{ flex: "1 1 160px", minWidth: "140px" }}
                >
                    <InputLabel>Type</InputLabel>
                    <Select
                        label="Type"
                        defaultValue=""
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="debit">Debit</MenuItem>
                        <MenuItem value="credit">Credit</MenuItem>
                    </Select>
                </FormControl>

                {/* Upload Button */}
                <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setUploadModal(true)}
                    sx={{ flex: "0 0 200px", minWidth: "210px" }}
                >
                    Upload Statement
                </Button>
            </Box>

            {/* Filter Sidebar */}
            <Drawer
                anchor="right"
                open={filterOpen}
                onClose={toggleFilterDrawer}
                PaperProps={{ sx: { width: { xs: "100%", sm: 350 } } }}
            >
                <Box sx={{ p: 3 }}>
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
                    />

                    {/* Amount */}
                    <TextField
                        fullWidth
                        label="Amount"
                        variant="outlined"
                        type="number"
                        sx={{ mb: 2 }}
                        name="amount"
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
                        >
                            <MenuItem value="online">Online</MenuItem>
                            <MenuItem value="cash">Cash</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Category */}
                    <FormControl
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <InputLabel>Category</InputLabel>
                        <Select
                            label="Category"
                            defaultValue=""
                            name="category"
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            {categoryOptions.map((cat) => (
                                <MenuItem
                                    key={cat}
                                    value={cat}
                                >
                                    {cat}
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
                            value={selectedLabels}
                            onChange={handleLabelChange}
                            input={<OutlinedInput label="Labels" />}
                            renderValue={(selected) => (selected as string[]).join(", ")}
                        >
                            {labelOptions.map((label) => (
                                <MenuItem
                                    key={label}
                                    value={label}
                                >
                                    <Checkbox checked={selectedLabels.indexOf(label) > -1} />
                                    <ListItemText primary={label} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Clear All Button */}
                    <Button
                        variant="text"
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
                        onClick={toggleFilterDrawer}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Drawer>
            <Modal
                open={uploadModal}
                onClose={() => {
                    setUploadModal(false);
                    setUploadedFileContent(null); // Clear content when closing
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
                        width: uploadedFileContent ? "90%" : 400,
                        height: uploadedFileContent ? "90%" : "auto",
                        overflow: "auto",
                        borderRadius: 2,
                    }}
                >
                    {!uploadedFileContent ? (
                        <Box textAlign="center">
                            <Typography
                                variant="h6"
                                mb={2}
                            >
                                Upload a file
                            </Typography>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                            >
                                Choose File
                                <input
                                    type="file"
                                    hidden
                                    // onChange={handleFileChange}
                                />
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            <Typography
                                variant="h6"
                                mb={2}
                            >
                                Uploaded File Content
                            </Typography>
                            <Box
                                sx={{
                                    backgroundColor: "#f5f5f5",
                                    p: 2,
                                    borderRadius: 1,
                                    maxHeight: "75vh",
                                    overflow: "auto",
                                }}
                            >
                                <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{uploadedFileContent}</pre>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default TableControls;
