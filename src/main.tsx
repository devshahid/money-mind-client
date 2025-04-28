import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <ThemeProvider theme={theme}>
        <Provider store={store}>
            <App />
        </Provider>
    </ThemeProvider>,
    // </React.StrictMode>,
);
