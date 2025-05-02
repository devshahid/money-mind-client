import { Box, Stack, Card, CardContent, Typography } from "@mui/material";
import { CreditCard, DollarSign, Package, Users } from "lucide-react";

import "./Dashboard.css";
import { useOutletContext } from "react-router-dom";
import { LayoutContextType } from "../layouts/main";
import { useEffect } from "react";

const DashboardPage = () => {
    const { setHeader } = useOutletContext<LayoutContextType>();

    useEffect(() => {
        setHeader("Welcome Back, Shahid", "It is the best time to manage your finances");
    }, [setHeader]);

    return (
        <Box>
            <Stack
                direction="row"
                // spacing={4}
                gap={2}
                padding={2}
                flexWrap="wrap"
            >
                {[
                    { icon: Package, title: "Total Balance", value: "$25,154", subHeading: "12.1% vs last month" },
                    { icon: DollarSign, title: "Income", value: "$16,000", subHeading: "12.1% vs last month" },
                    { icon: Users, title: "Expense", value: "15,400k", subHeading: "12.1% vs last month" },
                    { icon: CreditCard, title: "Goals", value: "12,340", subHeading: "12.1% vs last month" },
                ].map((item, idx) => (
                    <Card
                        key={idx}
                        sx={{
                            flex: "1 1 250px", // 👈 flex-grow: 1, flex-shrink: 1, flex-basis: 250px
                            minWidth: 250, // 👈 ensure a minimum width
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex" }}>
                                <item.icon size={26} />
                                <Typography variant="h6">{item.title}</Typography>
                            </Box>
                            <Typography variant="h5">{item.value}</Typography>
                            <Typography variant="h6">{item.subHeading}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
            <Stack
                flexWrap={"wrap"}
                gap={2}
                padding={2}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap", // enables wrapping on smaller screens
                        gap: 2, // spacing between chart and content
                    }}
                >
                    {/* loop over size */}

                    {/* Chart Section - 60% on medium and up, full width on small */}
                    <Box
                        sx={{
                            flex: { xs: "100%", md: "50%" },
                            minWidth: 0, // prevent overflow
                        }}
                    >
                        {/* Replace with your chart */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Chart Area</Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Content Section - 40% on medium and up, full width on small */}
                    <Box
                        sx={{
                            flex: { xs: "100%", md: "30%" },
                            minWidth: 0,
                        }}
                    >
                        {/* Replace with your content */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Content Area</Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Stack>
            <Stack
                flexWrap={"wrap"}
                gap={2}
                padding={2}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap", // enables wrapping on smaller screens
                        gap: 2, // spacing between chart and content
                    }}
                >
                    {/* loop over size */}

                    {/* Chart Section - 60% on medium and up, full width on small */}
                    <Box
                        sx={{
                            flex: { xs: "100%", md: "50%" },
                            minWidth: 0, // prevent overflow
                        }}
                    >
                        {/* Replace with your chart */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Recent Transactions</Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Content Section - 40% on medium and up, full width on small */}
                    <Box
                        sx={{
                            flex: { xs: "100%", md: "30%" },
                            minWidth: 0,
                        }}
                    >
                        {/* Replace with your content */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Saving Goals</Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
};

export default DashboardPage;
