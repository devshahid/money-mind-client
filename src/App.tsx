import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "./contexts/ThemeContext";

import Layout from "./routes/layout";
import DashboardPage from "./routes/dashboard/Page";

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
                    element: <h1 className="title">Transaction Logs</h1>,
                },
                {
                    path: "debts",
                    element: <h1 className="title">Debts</h1>,
                },
                {
                    path: "goals",
                    element: <h1 className="title">Goals</h1>,
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
