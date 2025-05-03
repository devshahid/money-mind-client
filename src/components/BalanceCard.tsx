import { Card, CardContent, Typography, Box, styled } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid grey",
    padding: "4px 10px",
}));

const BalanceCard = ({ heading, amount, percentChange, subheading }) => {
    return (
        <StyledCard>
            <CardContent sx={{ p: 3 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                    >
                        {heading}
                    </Typography>
                    <ArrowUpwardIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography
                    variant="h4"
                    component="span"
                    fontWeight="bold"
                    mt={2}
                >
                    {amount}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={1}
                >
                    {percentChange.includes("+") ? (
                        <span
                            style={{
                                color: "#6FAA75",
                                backgroundColor: "#E4F9E6",
                                borderRadius: "20px",
                                padding: "3px",
                            }}
                        >
                            <ArrowUpwardIcon sx={{ fontSize: 12, color: "#6FAA75" }} /> {percentChange}
                        </span>
                    ) : (
                        <span
                            style={{
                                color: "#ee6e6d",
                                backgroundColor: "#ffebec",
                                borderRadius: "20px",
                                padding: "3px",
                            }}
                        >
                            <ArrowUpwardIcon sx={{ fontSize: 12, color: "#ee6e6d" }} /> {percentChange}
                        </span>
                    )}
                    {` ${subheading}`}
                </Typography>
            </CardContent>
        </StyledCard>
    );
};

export default BalanceCard;
