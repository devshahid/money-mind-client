import React, { JSX, useContext, useEffect, useState } from "react";
import { addCashTransaction, ITransactionLogs, listTransactions, updateLimit, updatePage, updateTransaction } from "../store/transactionSlice";
import { useAppDispatch, useAppSelector } from "../hooks/slice-hooks";
import { RootState } from "../store";

import {
    Typography,
    Box,
    Backdrop,
    CircularProgress,
    Button,
    TextField,
    Chip,
    Autocomplete,
    Paper,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    TablePagination,
} from "@mui/material";
import TableControls from "../components/TransactionControls";
import { getExpenseCategories } from "../constants";
import { ColorModeContext } from "../contexts/ThemeContext";
import { useOutletContext } from "react-router-dom";
import { LayoutContextType } from "../layouts/main";
import CustomModel from "../components/CustomModal";
import CustomTable from "../components/Table";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // ✅ Correct path
import dayjs from "dayjs";
import { useSnackbar } from "../contexts/SnackBarContext";

export interface ITransactionFilters {
    dateFrom: string;
    dateTo: string;
    amount: string;
    bankName: string;
    transactionType: string;
    category: string[];
    labels: string[];
    type: string;
}

const TransactionLogs = (): JSX.Element => {
    // Fetching theme value from context API
    const { mode } = useContext(ColorModeContext);
    const { setHeader } = useOutletContext<LayoutContextType>();

    // Local State Declaration
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Partial<ITransactionLogs> | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [actionType, setActionType] = useState<"add" | "edit" | null>(null);
    const [errors, setErrors] = useState({
        narration: "",
        category: "",
        label: "",
        transactionDate: "",
        isCredit: "",
    });
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const [filters, setFilters] = useState<ITransactionFilters>({
        dateFrom: "",
        dateTo: "",
        amount: "",
        bankName: "",
        transactionType: "",
        category: [] as string[],
        labels: [] as string[],
        type: "",
    });

    const { showErrorSnackbar } = useSnackbar();

    const dispatch = useAppDispatch();
    const { transactions, loading, labels, page, limit, totalCount } = useAppSelector((state: RootState) => state.transactions);

    useEffect(() => {
        setHeader("Transactions", "Overview of your activities");
    }, [setHeader]);

    useEffect(() => {
        void dispatch(listTransactions({ ...filters, page: (parseInt(page) + 1).toString(), limit }));
    }, [dispatch, page, filters]);

    useEffect(() => {
        if (actionType === "add") {
            setEditingTransaction({
                ...editingTransaction,
                isCredit: false,
            });
        }
    }, [dispatch, actionType]);

    const validateFields = (): boolean => {
        let newErrors = { ...errors };
        if (!editingTransaction?.narration) {
            newErrors.narration = "Narration is required.";
        }
        if (!editingTransaction?.category) {
            newErrors.category = "Category is required.";
        }
        if (!editingTransaction?.label || editingTransaction?.label.length === 0) {
            newErrors.label = "At least one label is required.";
        }
        setErrors(newErrors);
        return Object.values(newErrors).every((error) => error === "");
    };

    const handleUpdateTransaction = (): void => {
        if (!validateFields() || !editingTransaction) {
            showErrorSnackbar("Please enter all the required fields");
            console.log("transaction: ", editingTransaction);
            return;
        }

        if (!editingTransaction.transactionDate) {
            editingTransaction.transactionDate = dayjs().format("MM/DD/YYYY");
        }
        if (actionType === "add") {
            const formattedDate = dayjs(editingTransaction.transactionDate, "MM/DD/YYYY").format("DD/MM/YYYY");
            void dispatch(addCashTransaction({ ...editingTransaction, isCash: true, transactionDate: formattedDate, bankName: "Cash" }));
        } else {
            void dispatch(updateTransaction(editingTransaction)); // Refresh the transaction list
        }

        setEditModalOpen(false);
        console.log("transaction: ", editingTransaction);
    };

    const handleSelectAll = (): void => {
        const allIds = transactions.map((tx) => tx._id);
        if (selectedIds.length === transactions.length) {
            setSelectedIds([]);
        } else setSelectedIds(allIds.filter((id): id is string => id !== undefined));
    };

    const handleSelectOne = (id: string): void => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const isSelected = (id: string): boolean => selectedIds.includes(id);

    const editButtonClickEvents = (tx: ITransactionLogs): void => {
        setEditingTransaction(tx); // Pass the transaction to edit
        setEditModalOpen(true);
    };

    const handleAddEditModalState = (
        e: React.SyntheticEvent<Element, Event> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        name?: string,
        value?: null | string | string[] | boolean,
    ): void => {
        console.log(name, value);
        if (editingTransaction || actionType === "add") {
            const target = e.target as HTMLInputElement | HTMLTextAreaElement;
            setEditingTransaction({ ...editingTransaction, [name ?? target.name]: value ?? target.value } as ITransactionLogs);
            setErrors({ ...errors, [name ?? target.name]: "" });
        }
    };

    const handlePageChange = (newPage: string): void => {
        void dispatch(updatePage(newPage));
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setRowsPerPage(parseInt(event.target.value, 10));
        void dispatch(updateLimit(event.target.value));
    };

    return (
        <Box style={{ padding: "10px", backgroundColor: mode === "dark" ? "#000" : "#fff" }}>
            <TableControls
                setActionType={setActionType}
                setEditModalOpen={setEditModalOpen}
                filters={filters}
                setFilters={setFilters}
            />

            {!loading && transactions.length === 0 ? (
                <EmptyTransactionContainer />
            ) : (
                <div style={{ width: "100%", borderRadius: 6, border: "1px solid #ccc" }}>
                    <Box sx={{ overflowX: "auto" }}>
                        <CustomTable
                            type="full"
                            editButtonClickEvents={editButtonClickEvents}
                            selectedIds={selectedIds}
                            isSelected={isSelected}
                            handleSelectOne={handleSelectOne}
                            handleSelectAll={handleSelectAll}
                            sx={{
                                maxHeight: "100vh",
                                "&::-webkit-scrollbar": {
                                    display: "none", // Chrome, Safari, Edge
                                },
                            }}
                            component={Paper}
                        />
                    </Box>
                    <TablePagination
                        component="div"
                        count={totalCount}
                        page={parseInt(page, 0)}
                        onPageChange={(_, newPage) => handlePageChange(newPage.toString())}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        rowsPerPageOptions={[25, 50, 100]}
                    />

                    {/* Loading Overlay */}
                    {loading && <LoadingBackDrop />}
                </div>
            )}

            {/* Modal to edit the transactions */}
            {(editingTransaction || actionType === "add") && (
                <CustomModel
                    modalOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setEditingTransaction(null);
                        setActionType(null);
                    }}
                >
                    <>
                        <Typography
                            variant="h6"
                            mb={2}
                        >
                            {actionType === "edit" ? "Edit Transaction" : "Add Cash Memo"}
                        </Typography>

                        {/* Notes field */}
                        <TextField
                            fullWidth
                            label="Narration"
                            disabled={actionType === "add" ? false : true}
                            value={editingTransaction?.narration || ""}
                            onChange={handleAddEditModalState}
                            sx={{ mb: 2 }}
                            name="narration"
                            error={!!errors.narration}
                            helperText={errors.narration}
                        />
                        {/* Notes field */}
                        <TextField
                            fullWidth
                            label="Notes"
                            value={editingTransaction?.notes || ""}
                            onChange={handleAddEditModalState}
                            sx={{ mb: 2 }}
                            name="notes"
                        />

                        <Autocomplete
                            freeSolo
                            options={getExpenseCategories().map((c) => c.name)} // ['Shopping', 'Medical', 'Utilities']
                            onChange={(e, newValue) => handleAddEditModalState(e, "category", newValue)}
                            onInputChange={(e, newValue) => handleAddEditModalState(e, "category", newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Category"
                                    placeholder="Select or type Category"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    name="category"
                                    error={!!errors.category}
                                    helperText={errors.category}
                                />
                            )}
                        />

                        {/* Labels field (multiselect + search) */}
                        <Autocomplete
                            multiple
                            freeSolo
                            options={labels.map((l) => l.labelName)}
                            value={editingTransaction?.label || []}
                            onChange={(e, newValue) => {
                                handleAddEditModalState(
                                    e,
                                    "label",
                                    newValue.filter((value): value is string => value !== null),
                                );
                            }}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    // eslint-disable-next-line react/jsx-key
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
                                    name="label"
                                    error={!!errors.label}
                                    helperText={errors.label}
                                />
                            )}
                            sx={{ mb: 2 }}
                        />

                        {actionType === "add" && (
                            <Box sx={{ display: "flex", gap: 4, flexWrap: "nowrap", mb: 2, justifyContent: "center", alignItems: "center" }}>
                                {/* Notes field */}
                                <TextField
                                    label="Amount"
                                    value={editingTransaction?.amount || ""}
                                    onChange={handleAddEditModalState}
                                    sx={{ mb: 2 }}
                                    name="amount"
                                />
                                {/* Transaction Type */}
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        row
                                        value={editingTransaction?.isCredit ? "credit" : "debit"}
                                        name="isCredit"
                                    >
                                        <FormControlLabel
                                            value="credit"
                                            control={<Radio />}
                                            label="Credit"
                                            onChange={(e) => handleAddEditModalState(e, "isCredit", true)}
                                        />
                                        <FormControlLabel
                                            value="debit"
                                            control={<Radio />}
                                            label="Debit"
                                            onChange={(e) => handleAddEditModalState(e, "isCredit", false)}
                                        />
                                    </RadioGroup>
                                    {errors.isCredit && (
                                        <Typography
                                            color="error"
                                            variant="caption"
                                        >
                                            {errors.isCredit}
                                        </Typography>
                                    )}
                                </FormControl>

                                {/* Date Picker */}
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Transaction Date"
                                        value={editingTransaction?.transactionDate ? dayjs(editingTransaction?.transactionDate) : dayjs()}
                                        maxDate={dayjs()}
                                        onChange={(newValue) => {
                                            const formattedValue = newValue ? newValue.format("MM/DD/YYYY") : "";
                                            handleAddEditModalState({
                                                target: { name: "transactionDate", value: formattedValue },
                                            } as unknown as React.ChangeEvent<HTMLInputElement>);
                                        }}
                                        name="transactionDate"
                                        slotProps={{
                                            textField: {
                                                error: !!errors.transactionDate,
                                                helperText: errors.transactionDate,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        )}

                        {/* Save Button */}
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleUpdateTransaction()}
                        >
                            Save Changes
                        </Button>
                    </>
                </CustomModel>
            )}
        </Box>
    );
};

const LoadingBackDrop = (): JSX.Element => {
    return (
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
    );
};

const EmptyTransactionContainer = (): JSX.Element => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%", // Ensures it takes the full height of the container
                // backgroundColor:"#000"
            }}
        >
            <Typography
                variant="h6"
                align="center"
            >
                No transactions found.
            </Typography>
        </Box>
    );
};

export default TransactionLogs;
