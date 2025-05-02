import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "./contexts/ThemeContext";

import Layout from "./layouts/main";
import DashboardPage from "./pages/Dashboard";
import TransactionLogs from "./pages/TransactionLogs";
import DebtTable from "./components/Debt";
import Goals from "./components/Goals";
import Login from "./pages/Login";
import Account from "./pages/Account";
import RegisterPage from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: (
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            ),
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
                {
                    path: "account",
                    element: <Account />,
                },
            ],
        },
        {
            path: "login",
            element: (
                <GuestRoute>
                    <Login />
                </GuestRoute>
            ),
        },
        {
            path: "register",
            element: (
                <GuestRoute>
                    <RegisterPage />
                </GuestRoute>
            ),
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
