import React, { createContext, useContext, useState } from "react";
import { ThemeProvider as StyledThemeProvider, DefaultTheme } from "styled-components";

const lightTheme: DefaultTheme = {
    background: "#f9f9f9",
    text: "#333",
    headerBg: "#e6e6e6",
    hoverBg: "#dcdcdc",
};

const darkTheme: DefaultTheme = {
    background: "#292b2f",
    text: "#fff",
    headerBg: "#1f2023",
    hoverBg: "#3a3b3f",
};

interface ThemeContextType {
    isLight: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isLight: true,
    toggleTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLight, setIsLight] = useState(true);
    const toggleTheme = () => setIsLight((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isLight, toggleTheme }}>
            <StyledThemeProvider theme={isLight ? lightTheme : darkTheme}>{children}</StyledThemeProvider>
        </ThemeContext.Provider>
    );
};
