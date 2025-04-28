import { Box, Stack, Card, CardContent, Typography, Tooltip, LinearProgress } from "@mui/material";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useTheme } from "../hooks/useTheme.ts";
import { overviewData, recentSalesData, topProducts } from "../constants/index.ts";
import { Footer } from "../layouts/Footer.tsx";
import { CreditCard, DollarSign, Package, PencilLine, Star, Trash, Users } from "lucide-react";
import "./Dashboard.css";
const DashboardPage = () => {
    const { theme } = useTheme();

    return (
        <Box className="flex flex-col gap-y-4">
            <Typography
                variant="h4"
                className="title"
            >
                Dashboard
            </Typography>
            <Stack
                direction="row"
                spacing={4}
                flexWrap="wrap"
            >
                {[
                    { icon: Package, title: "Total Products", value: "$25,154", progress: 25 },
                    { icon: DollarSign, title: "Total Paid Orders", value: "$16,000", progress: 12 },
                    { icon: Users, title: "Total Customers", value: "15,400k", progress: 15 },
                    { icon: CreditCard, title: "Sales", value: "12,340", progress: 19 },
                ].map((item, idx) => (
                    <Card
                        key={idx}
                        sx={{
                            flex: "1 1 250px", // 👈 flex-grow: 1, flex-shrink: 1, flex-basis: 250px
                            minWidth: 250, // 👈 ensure a minimum width
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                                <item.icon size={26} />
                                <Typography variant="h6">{item.title}</Typography>
                            </Box>
                            <Typography variant="h5">{item.value}</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={item.progress}
                                sx={{ height: 10, marginTop: 2 }}
                            />
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            <Stack
                direction="row"
                spacing={4}
                flexWrap="wrap"
            >
                <Card sx={{ flex: 1, minWidth: "400px" }}>
                    <CardContent>
                        <Typography variant="h6">Overview</Typography>
                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >
                            <AreaChart
                                data={overviewData}
                                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorTotal"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#2563eb"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#2563eb"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                {/* <Tooltip followCursor={false} formatter={(value) => `$${value}`} /> */}
                                {/* <XAxis dataKey="name" strokeWidth={0} stroke={theme === "light" ? "#475569" : "#94a3b8"} tickMargin={6} />
                                <YAxis dataKey="total" strokeWidth={0} stroke={theme === "light" ? "#475569" : "#94a3b8"} tickFormatter={(value) => `$${value}`} tickMargin={6} /> */}
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#2563eb"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1, minWidth: "300px" }}>
                    <CardContent>
                        <Typography variant="h6">Recent Sales</Typography>
                        <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                            {recentSalesData.map((sale) => (
                                <Box
                                    key={sale.id}
                                    sx={{ display: "flex", justifyContent: "space-between", py: 2 }}
                                >
                                    <Box sx={{ display: "flex", gap: 4 }}>
                                        <img
                                            src={sale.image}
                                            alt={sale.name}
                                            className="size-10 rounded-full object-cover"
                                        />
                                        <Box>
                                            <Typography>{sale.name}</Typography>
                                            <Typography variant="body2">{sale.email}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography>${sale.total}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Stack>
            <Card sx={{ flex: 1, minWidth: "400px" }}>
                <CardContent>
                    <Typography variant="h6">Top Orders</Typography>
                    <Box sx={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((product) => (
                                    <tr key={product.number}>
                                        <td>{product.number}</td>
                                        <td>
                                            <Box sx={{ display: "flex", gap: 4 }}>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="size-14 rounded-lg object-cover"
                                                />
                                                <Box>
                                                    <Typography>{product.name}</Typography>
                                                    <Typography variant="body2">{product.description}</Typography>
                                                </Box>
                                            </Box>
                                        </td>
                                        <td>${product.price}</td>
                                        <td>{product.status}</td>
                                        <td>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                <Star size={18} />
                                                {product.rating}
                                            </Box>
                                        </td>
                                        <td>
                                            <Box sx={{ display: "flex", gap: 4 }}>
                                                <button className="text-blue-500">
                                                    <PencilLine size={20} />
                                                </button>
                                                <button className="text-red-500">
                                                    <Trash size={20} />
                                                </button>
                                            </Box>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </CardContent>
            </Card>

            <Footer />
        </Box>
    );
};

export default DashboardPage;
