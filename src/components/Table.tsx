import * as React from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Button,
    CircularProgress,
    Typography,
    Modal,
    Box,
    TextField,
    MenuItem,
    FormControlLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axiosClient from "../services/axiosClient";

interface Expense {
    category: string;
    itemName: string;
    expectedAmount: number;
    actualAmount: number;
    isPaid: boolean;
    emiDate: number;
    paidDate: string;
    recurring: "ONE_TIME" | "MONTHLY" | "YEARLY";
}

const columns = [
    { id: "items", label: "Items", minWidth: 120, align: "center" },
    {
        id: "expectedAmount",
        label: "Expected Amount",
        minWidth: 120,
        align: "center",
    },
    {
        id: "actualAmount",
        label: "Actual Amount",
        minWidth: 120,
        align: "center",
    },
    { id: "isPaid", label: "Is Paid", minWidth: 120, align: "center" },
    { id: "emiDate", label: "EMI Date", minWidth: 120, align: "center" },
    { id: "paidDate", label: "Paid Date", minWidth: 120, align: "center" },
    { id: "recurring", label: "Recurring Type", minWidth: 120, align: "center" },
];

export default function ExpenseTable(): React.ReactElement {
    const [expenses, setExpenses] = React.useState<Expense[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [openModal, setOpenModal] = React.useState<boolean>(false);
    const { register, handleSubmit, control, reset } = useForm<Expense>();

    React.useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get("/expense/list-items");
            setExpenses([] || response.data.output);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExpense = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        reset();
    };

    const onSubmit = async (data: Expense) => {
        console.log("Expense Created:", data);
        setExpenses([...expenses, data]);

        // Call api
        const response = await axiosClient.post("/expense/create-category", {
            categoryName: data.category,
            itemDetails: {
                itemName: data.itemName,
                expectedAmount: data.expectedAmount,
                actualAmount: data.actualAmount,
                isPaid: data.isPaid,
                expenseFixedDate: data.emiDate,
                paymentDate: data.paidDate,
                recurring: data.recurring,
            },
        });
        console.log("Response: ", response.data);
        handleCloseModal();
    };

    return (
        <Paper sx={{ width: "100%", padding: 2 }}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleCreateExpense}
                sx={{ marginBottom: 2 }}
            >
                Create Expense
            </Button>

            {loading ? (
                <CircularProgress />
            ) : expenses.length === 0 ? (
                <Typography
                    variant="h6"
                    align="center"
                >
                    No expense
                </Typography>
            ) : (
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table
                        stickyHeader
                        aria-label="sticky table"
                    >
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align as "center"}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {expenses.map((row, index) => (
                                <TableRow
                                    hover
                                    key={index}
                                >
                                    {columns.map((column) => {
                                        const value = row[column.id as keyof Expense];
                                        return (
                                            <TableCell
                                                key={column.id}
                                                align={column.align as "center"}
                                            >
                                                {column.id === "isPaid" ? (
                                                    <Checkbox checked={value as boolean} />
                                                ) : column.id === "emiDate" ? (
                                                    value
                                                ) : column.id === "paidDate" ? (
                                                    new Date(value as string).toLocaleDateString()
                                                ) : (
                                                    value
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* MODAL FOR CREATING EXPENSE */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ mb: 2 }}
                    >
                        Create Expense
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            label="Category Name"
                            fullWidth
                            {...register("category")}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Item Name"
                            fullWidth
                            {...register("itemName")}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Expected Amount"
                            type="number"
                            fullWidth
                            {...register("expectedAmount")}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Actual Amount"
                            type="number"
                            fullWidth
                            {...register("actualAmount")}
                            sx={{ mb: 2 }}
                        />

                        <FormControlLabel
                            control={
                                <Controller
                                    name="isPaid"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            {...field}
                                            checked={field.value}
                                        />
                                    )}
                                />
                            }
                            label="Is Paid"
                        />

                        <TextField
                            label="Expense Fixed Date"
                            type="number"
                            fullWidth
                            inputProps={{ min: 1, max: 31 }}
                            {...register("emiDate")}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            label="Payment Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            {...register("paidDate")}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            select
                            label="Recurring Type"
                            fullWidth
                            {...register("recurring")}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="ONE_TIME">One Time</MenuItem>
                            <MenuItem value="MONTHLY">Monthly</MenuItem>
                            <MenuItem value="YEARLY">Yearly</MenuItem>
                        </TextField>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                        >
                            Submit
                        </Button>
                    </form>
                </Box>
            </Modal>
        </Paper>
    );
}
