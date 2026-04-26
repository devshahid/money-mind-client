import { Alert, AlertTitle, Stack } from "@mui/material";
import { JSX } from "react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { IDebt } from "../../types/debt";

interface DebtSliceState {
    debts: IDebt[];
}

const EMIReminderBanner = (): JSX.Element | null => {
    const debts = useSelector((state: { debts?: DebtSliceState }) => state.debts?.debts ?? []);

    const today = dayjs();
    const upcomingDebts = debts.filter((d) => {
        if (d.status !== "ACTIVE" || !d.nextPaymentDate) return false;
        const diff = dayjs(d.nextPaymentDate).diff(today, "day");
        return diff >= 0 && diff <= 5;
    });

    if (upcomingDebts.length === 0) return null;

    return (
        <Stack
            spacing={1}
            sx={{ px: 2, pt: 1 }}
        >
            {upcomingDebts.map((debt) => {
                const daysLeft = dayjs(debt.nextPaymentDate).diff(today, "day");
                return (
                    <Alert
                        key={debt._id}
                        severity="warning"
                        variant="outlined"
                    >
                        <AlertTitle>EMI Due Soon — {debt.debtName}</AlertTitle>₹{debt.monthlyExpectedEMI.toLocaleString()} due to {debt.lender} in{" "}
                        {daysLeft === 0 ? "today" : `${daysLeft} day${daysLeft > 1 ? "s" : ""}`}
                    </Alert>
                );
            })}
        </Stack>
    );
};

export default EMIReminderBanner;
