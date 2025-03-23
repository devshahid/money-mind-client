import * as React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Button,
  CircularProgress,
  Typography,
  Modal,
  Box,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import axiosClient from "../services/axiosClient";

// Define debt data interface
interface DebtDetails {
  debtName: string;
  startDate: string;
  expectedEndDate: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  debtStatus: string;
  monthlyExpectedEMI: number;
  monthlyActualEMI: number;
  partPayment: number;
  paymentDate: string;
  lender: string;
}

const columns = [
  { id: "debtName", label: "Debt Name", minWidth: 150, align: "center" },
  { id: "startDate", label: "Start Date", minWidth: 150, align: "center" },
  {
    id: "expectedEndDate",
    label: "Expected End Date",
    minWidth: 150,
    align: "center",
  },
  { id: "totalAmount", label: "Total Amount", minWidth: 120, align: "center" },
  {
    id: "remainingAmount",
    label: "Remaining Amount",
    minWidth: 120,
    align: "center",
  },
  {
    id: "interestRate",
    label: "Interest Rate",
    minWidth: 120,
    align: "center",
  },
  { id: "debtStatus", label: "Status", minWidth: 120, align: "center" },
];

export default function DebtTable(): React.ReactElement {
  const [debts, setDebts] = React.useState<DebtDetails[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<DebtDetails>();

  React.useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      // // Sample debt data (You can replace this with an API call)
      // const debtData = [
      //   {
      //     debtName: "Aditya Birla Loan",
      //     startDate: "2022-02-25T00:00:00.000Z",
      //     expectedEndDate: "2027-10-09T00:00:00.000Z",
      //     totalAmount: 180000,
      //     remainingAmount: 50000,
      //     interestRate: 12.5,
      //     debtStatus: "ACTIVE",
      //     monthlyExpectedEMI: 5054,
      //     monthlyActualEMI: 5054,
      //     partPayment: 10000,
      //     paymentDate: "2025-01-05T00:00:00.000Z",
      //     lender: "Bank",
      //   },
      //   // More sample data entries can be added here
      // ];
      const response = await axiosClient.get("debt/list-debts");
      const debtData = response.data.output.map((item) => {
        return {
          ...item.debtDetails,
          _id: item._id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });
      setDebts(debtData);
    } catch (error) {
      console.error("Error fetching debts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDebt = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    reset();
  };

  const onSubmit = (data: DebtDetails) => {
    console.log("Debt Created:", data);
    setDebts([...debts, data]);
    handleCloseModal();
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%", padding: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateDebt}
        sx={{ marginBottom: 2 }}
      >
        Create Debt
      </Button>

      {loading ? (
        <CircularProgress />
      ) : debts.length === 0 ? (
        <Typography variant="h6" align="center">
          No debt details available
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="debt table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align as "center"}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {debts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover key={index}>
                    <TableCell align="center">{row.debtName}</TableCell>
                    <TableCell align="center">
                      {new Date(row.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(row.expectedEndDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">{row.totalAmount}</TableCell>
                    <TableCell align="center">{row.remainingAmount}</TableCell>
                    <TableCell align="center">{row.interestRate}%</TableCell>
                    <TableCell align="center">{row.debtStatus}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={debts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* MODAL FOR CREATING DEBT */}
      <Modal open={openModal} onClose={handleCloseModal}>
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create Debt
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Debt Name"
              fullWidth
              {...register("debtName")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("startDate")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Expected End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("expectedEndDate")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Total Amount"
              type="number"
              fullWidth
              {...register("totalAmount")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Remaining Amount"
              type="number"
              fullWidth
              {...register("remainingAmount")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Interest Rate"
              type="number"
              fullWidth
              {...register("interestRate")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Debt Status"
              fullWidth
              {...register("debtStatus")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Monthly Expected EMI"
              type="number"
              fullWidth
              {...register("monthlyExpectedEMI")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Monthly Actual EMI"
              type="number"
              fullWidth
              {...register("monthlyActualEMI")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Part Payment"
              type="number"
              fullWidth
              {...register("partPayment")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Payment Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("paymentDate")}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Lender"
              fullWidth
              {...register("lender")}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit
            </Button>
          </form>
        </Box>
      </Modal>
    </Paper>
  );
}
