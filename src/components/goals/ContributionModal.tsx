import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { IGoal } from "../../types/goal";
import { useAppDispatch } from "../../hooks/slice-hooks";
import { recordContribution } from "../../store/goalSlice";
import { useSnackbar } from "../../contexts/SnackBarContext";

interface ContributionModalProps {
    open: boolean;
    onClose: () => void;
    goal: IGoal | null;
}

interface ContributionFormValues {
    amount: number;
    date: string;
    transactionId: string;
}

const ContributionModal: React.FC<ContributionModalProps> = ({ open, onClose, goal }) => {
    const dispatch = useAppDispatch();
    const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

    const { control, handleSubmit, reset } = useForm<ContributionFormValues>({
        defaultValues: {
            amount: 0,
            date: new Date().toISOString().split("T")[0],
            transactionId: "",
        },
    });

    const onSubmit = (data: ContributionFormValues): void => {
        if (!goal) return;

        dispatch(
            recordContribution({
                goalId: goal._id,
                amount: data.amount,
                date: data.date,
                ...(data.transactionId ? { transactionId: data.transactionId } : {}),
            }),
        )
            .unwrap()
            .then(() => {
                showSuccessSnackbar("Contribution recorded successfully");
                reset();
                onClose();
            })
            .catch(() => {
                showErrorSnackbar("Failed to record contribution");
            });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Record Contribution{goal ? ` — ${goal.name}` : ""}</DialogTitle>
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
                        name="date"
                        control={control}
                        rules={{ required: "Date is required" }}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Date"
                                type="date"
                                fullWidth
                                slotProps={{ inputLabel: { shrink: true } }}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
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
                                helperText="Enter a transaction ID to link this contribution to an existing transaction"
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
                        Record Contribution
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ContributionModal;
