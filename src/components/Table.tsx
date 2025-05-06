import {
    Box,
    Checkbox,
    IconButton,
    PaperTypeMap,
    SxProps,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    Typography,
} from "@mui/material";
import React, { JSX, useContext } from "react";
import { ColorModeContext } from "../contexts/ThemeContext";
import { columnHeaderOptions, commonTableHeadingStyles, getExpenseCategories } from "../constants";
import { ITransactionLogs } from "../store/transactionSlice";
import EditIcon from "@mui/icons-material/Edit";
import { useAppSelector } from "../hooks/slice-hooks";
import { RootState } from "../store";
import { OverridableComponent } from "@mui/material/OverridableComponent";

type Props = {
    type: "mini" | "full";
    selectedIds?: string[];
    isSelected?: (x: string) => boolean;
    handleSelectOne?: (x: string) => void;
    editButtonClickEvents?: (x: ITransactionLogs) => void;
    handleSelectAll?: () => void;
    sx?: SxProps<Theme>;
    component?: OverridableComponent<PaperTypeMap<object, "div">>;
};

const CustomTable = ({
    type,
    selectedIds,
    isSelected,
    handleSelectOne,
    editButtonClickEvents,
    handleSelectAll,
    sx,
    component,
}: Props): JSX.Element => {
    const { mode } = useContext(ColorModeContext);

    const { transactions } = useAppSelector((state: RootState) => state.transactions);
    const tableLabelStyles = {
        padding: "4px 8px", // Adjusted padding
        borderRadius: "8px", // More rounded corners
        backgroundColor: "#e0e0e0", // Light background for labels
        color: "#424242", // Darker text for contrast
        border: "1px solid #bdbdbd", // Subtle border
        display: "inline-flex", // Use inline-flex for better alignment
        alignItems: "center",
        margin: "2px",
    };

    return (
        <>
            <TableContainer
                sx={sx}
                {...(component && { component })}
            >
                <Table
                    stickyHeader
                    aria-label="sticky table"
                >
                    <TableHead>
                        <TableRow>
                            {selectedIds && type === "full" && (
                                <TableCell sx={{ backgroundColor: mode === "dark" ? "#222126" : "#F6F5FF" }}>
                                    <Checkbox
                                        color="primary"
                                        indeterminate={selectedIds.length > 0 && selectedIds.length < transactions.length}
                                        checked={transactions.length > 0 && selectedIds.length === transactions.length}
                                        onChange={handleSelectAll}
                                        sx={{
                                            color: "#8578e5",
                                            "&.Mui-checked": {
                                                color: "#8578e5",
                                            },
                                            "&.MuiCheckbox-indeterminate": {
                                                color: "#8578e5",
                                            },
                                            "&.MuiCheckbox-root:hover": {
                                                backgroundColor: "transparent",
                                            },
                                        }}
                                    />
                                </TableCell>
                            )}
                            {columnHeaderOptions.map((option, i) => (
                                <TableCell
                                    key={i}
                                    sx={{ ...commonTableHeadingStyles(mode) }}
                                >
                                    {option}
                                </TableCell>
                            ))}
                            {type === "full" && <TableCell sx={{ ...commonTableHeadingStyles(mode) }}>Action</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((tx: ITransactionLogs) => (
                            <TableRow
                                key={tx._id}
                                hover
                                selected={isSelected ? !!isSelected(tx._id) : false}
                            >
                                {type === "full" && (
                                    <TableCell>
                                        <Checkbox
                                            color="primary"
                                            checked={isSelected ? isSelected(tx._id) : false}
                                            onChange={() => handleSelectOne?.(tx._id)}
                                        />
                                    </TableCell>
                                )}

                                <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>{tx.transactionDate}</TableCell>
                                <TableCell sx={{ fontSize: "1rem" }}>{tx.narration}</TableCell>
                                <TableCell sx={{ fontSize: "1rem" }}>{tx.notes}</TableCell>

                                {/* Category Component */}
                                <CategoryTransactionRow tx={tx} />

                                <TableCell>
                                    {tx.label.map((label, index) => (
                                        <Typography
                                            key={index}
                                            variant="body2"
                                            sx={{ ...tableLabelStyles }}
                                        >
                                            {label}
                                        </Typography>
                                    ))}
                                </TableCell>
                                <TableCell sx={{ fontSize: "1rem" }}>{tx.bankName}</TableCell>
                                <TableCell sx={{ fontSize: "1rem" }}>{tx.isCredit ? "Credit" : "Debit"}</TableCell>
                                <TableCell
                                    sx={{
                                        whiteSpace: "nowrap",
                                        textAlign: "center",
                                        fontSize: "1rem",
                                        width: { xs: "80px", sm: "100px", md: "150px" }, // Responsive widths
                                    }}
                                    style={{ color: tx.isCredit ? "#4CAF50" : "#F44336", textAlign: "center", fontWeight: "bold" }}
                                >
                                    ₹ {Number(tx.amount).toFixed(2)}
                                </TableCell>
                                {type === "full" && (
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => editButtonClickEvents?.(tx)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

const CategoryTransactionRow = ({ tx }: { tx: ITransactionLogs }): JSX.Element => {
    const categoryData = getExpenseCategories().find((cat) => cat.name === tx.category);
    const displayCategory = tx.category ? tx.category.charAt(0).toUpperCase() + tx.category.slice(1) : "";
    return (
        <TableCell sx={{ fontSize: "1rem" }}>
            {categoryData && (
                <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    style={{
                        backgroundColor: categoryData.backgroundColor,
                        padding: "4px 8px",
                        borderRadius: "12px",
                        color: "#000",
                    }}
                >
                    <React.Fragment>
                        <categoryData.icon style={{ color: categoryData.color }} />
                        <Typography>{displayCategory}</Typography>
                    </React.Fragment>
                </Box>
            )}
            {!categoryData && displayCategory}
        </TableCell>
    );
};

export default CustomTable;
