import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LayoutProvider } from "./contexts/LayoutContext.tsx";
import { SnackbarProvider } from "./contexts/SnackBarContext.tsx";
import GlobalSnackbar from "./components/GlobalSnackbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
    typography: {
        fontFamily: "Lufga, sans-serif",
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <SnackbarProvider>
        <LayoutProvider>
            <ThemeProvider theme={theme}>
                <Provider store={store}>
                    <CssBaseline />
                    <App />
                    <GlobalSnackbar />
                </Provider>
            </ThemeProvider>
            ,
        </LayoutProvider>
        ,
    </SnackbarProvider>,
    // </React.StrictMode>,
);
