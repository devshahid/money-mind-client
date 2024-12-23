import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";

interface ICategory {
  name: string;
  items: {
    name: string;
    expectedAmount: number;
    actualAmount: number;
    paid: boolean;
    date: string;
    isSameAsExpected: boolean;
  }[];
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${theme.breakpoints.down("sm")}`]: {
    minWidth: 60,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const data: ICategory[] = [
  {
    name: "Personal",
    items: [
      {
        name: "Food",
        expectedAmount: 5000,
        actualAmount: 4500,
        paid: true,
        date: "2024-11-20",
        isSameAsExpected: false,
      },
      {
        name: "Shopping",
        expectedAmount: 2000,
        actualAmount: 2200,
        paid: false,
        date: "2024-11-25",
        isSameAsExpected: false,
      },
      {
        name: "Entertainment",
        expectedAmount: 1000,
        actualAmount: 800,
        paid: true,
        date: "2024-11-28",
        isSameAsExpected: false,
      },
    ],
  },
  {
    name: "EMI's",
    items: [
      {
        name: "Home Loan",
        expectedAmount: 30000,
        actualAmount: 30000,
        paid: true,
        date: "2024-11-28",
        isSameAsExpected: true,
      },
      {
        name: "Personal Loan",
        expectedAmount: 10000,
        actualAmount: 10000,
        paid: true,
        date: "2024-11-30",
        isSameAsExpected: true,
      },
      {
        name: "Car Loan",
        expectedAmount: 15000,
        actualAmount: 15000,
        paid: true,
        date: "2024-12-01",
        isSameAsExpected: true,
      },
    ],
  },
];

const ExpenseTable: React.FC = () => {
  const handleActualAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    itemId: string,
  ) => {
    // Update the actual amount in the data
    const updatedData = data.map((category) => ({
      ...category,
      items: category.items.map((item) =>
        item.name === itemId
          ? { ...item, actualAmount: Number(event.target.value) }
          : item,
      ),
    }));
    // Update the state or re-render the component here
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Category</StyledTableCell>
            <StyledTableCell>Item</StyledTableCell>
            <StyledTableCell align="right">Expected Amount</StyledTableCell>
            <StyledTableCell align="right">Actual Amount</StyledTableCell>
            <StyledTableCell align="center">Same as Expected</StyledTableCell>
            <StyledTableCell align="center">Paid</StyledTableCell>
            <StyledTableCell align="right">Date</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((category) => (
            <>
              <TableRow>
                <StyledTableCell rowSpan={category.items.length}>
                  {category.name}
                </StyledTableCell>
              </TableRow>
              {category.items.map((item) => (
                <StyledTableRow key={item.name}>
                  <StyledTableCell>{item.name}</StyledTableCell>
                  <StyledTableCell align="right">
                    {item.expectedAmount}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <TextField
                      type="number"
                      value={item.actualAmount}
                      onChange={(event) =>
                        handleActualAmountChange(event, item.name)
                      }
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Checkbox checked={item.isSameAsExpected} />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Checkbox checked={item.paid} />
                  </StyledTableCell>
                  <StyledTableCell align="right">{item.date}</StyledTableCell>
                </StyledTableRow>
              ))}
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ExpenseTable;
