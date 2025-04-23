import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "./contexts/ThemeContext";

import Layout from "./routes/layout";
import DashboardPage from "./routes/dashboard/Page";
import TransactionLogs from "./pages/TransactionLogs";
import DebtTable from "./components/Debt";
import Goals from "./components/Goals";

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: "transactions",
                    element: <TransactionLogs />,
                },
                {
                    path: "debts",
                    element: <DebtTable />,
                },
                {
                    path: "goals",
                    element: <Goals />,
                },
                {
                    path: "budget",
                    element: <h1 className="title">Budget</h1>,
                },
                {
                    path: "analytics",
                    element: <h1 className="title">Analytics</h1>,
                },
                {
                    path: "settings",
                    element: <h1 className="title">Settings</h1>,
                },
            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
