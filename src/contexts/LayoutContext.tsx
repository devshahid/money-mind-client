import React, { createContext, useContext, useState } from "react";

const LayoutContext = createContext<{
    headerHeight: number;
    setHeaderHeight: (height: number) => void;
}>({
    headerHeight: 0,
    setHeaderHeight: () => {},
});

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [headerHeight, setHeaderHeight] = useState(0);

    return <LayoutContext.Provider value={{ headerHeight, setHeaderHeight }}>{children}</LayoutContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLayout = (): {
    headerHeight: number;
    setHeaderHeight: (height: number) => void;
} => useContext(LayoutContext);
