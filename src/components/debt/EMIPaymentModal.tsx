import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { IDebt } from "../../types/debt";
import { useAppDispatch } from "../../hooks/slice-hooks";
import { recordEMIPayment } from "../../store/debtSlice";
import { useSnackbar } from "../../contexts/SnackBarContext";

interface EMIPaymentModalProps {
    open: boolean;
    onClose: () => void;
    debt: IDebt | null;
}

interface EMIPaymentFormValues {
    amount: number;
    paymentDate: string;
    isPartPayment: boolean;
    transactionId: string;
}

const EMIPaymentModal: React.FC<EMIPaymentModalProps> = ({ open, onClose, debt }) => {
    const dispatch = useAppDispatch();
    const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

    const { control, handleSubmit, reset } = useForm<EMIPaymentFormValues>({
        defaultValues: {
            amount: 0,
            paymentDate: new Date().toISOString().split("T")[0],
            isPartPayment: false,
            transactionId: "",
        },
    });

    const onSubmit = (data: EMIPaymentFormValues): void => {
        if (!debt) return;

        dispatch(
            recordEMIPayment({
                debtId: debt._id,
                amount: data.amount,
                paymentDate: data.paymentDate,
                isPartPayment: data.isPartPayment,
                ...(data.transactionId ? { transactionId: data.transactionId } : {}),
            }),
        )
            .unwrap()
            .then(() => {
                showSuccessSnackbar("EMI payment recorded successfully");
                reset();
                onClose();
            })
            .catch(() => {
                showErrorSnackbar("Failed to record EMI payment");
            });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Record EMI Payment{debt ? ` — ${debt.debtName}` : ""}</DialogTitle>
            <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                    <Controller
                        name="amount"
                        control={control}
                        rules={{ required: "Amount is required", min: { value: 0.01, message: "Amount must be positive" } }}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Amount"
                                type="number"
                                fullWidth
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                        )}
                    />
                    <Controller
                        name="paymentDate"
                        control={control}
                        rules={{ required: "Payment date is required" }}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Payment Date"
                                type="date"
                                fullWidth
                                slotProps={{ inputLabel: { shrink: true } }}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="isPartPayment"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={field.value}
                                        onChange={field.onChange}
                                    />
                                }
                                label="Part payment (not full EMI)"
                            />
                        )}
                    />
                    <Controller
                        name="transactionId"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Link Transaction ID (optional)"
                                fullWidth
                                helperText="Enter a transaction ID to link this payment to an existing transaction"
                            />
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                    >
                        Record Payment
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EMIPaymentModal;
