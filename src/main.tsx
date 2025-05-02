import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import { LayoutProvider } from "./contexts/LayoutContext.tsx";
import { SnackbarProvider } from "./contexts/SnackBarContext.tsx";
import GlobalSnackbar from "./components/GlobalSnackbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import { ColorContextProvider } from "./contexts/ThemeContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <SnackbarProvider>
        <LayoutProvider>
            <ColorContextProvider>
                <Provider store={store}>
                    <CssBaseline />
                    <App />
                    <GlobalSnackbar />
                </Provider>
            </ColorContextProvider>
            ,
        </LayoutProvider>
        ,
    </SnackbarProvider>,
    // </React.StrictMode>,
);
