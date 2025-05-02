import { Box, Button } from "@mui/material";
import axiosClient from "../services/axiosClient";
import { useState } from "react";

type Props = {};

function Account({}: Props) {
    const handleDeleteAll = async () => {
        try {
            const response = await axiosClient.delete("transaction-logs/delete-all-transactions");
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div>
            <h1>Account</h1>
            <Box>
                <Button
                    variant="outlined"
                    onClick={handleDeleteAll}
                >
                    Delete All Transactions
                </Button>
            </Box>
        </div>
    );
}

export default Account;
