import { createContext, useContext } from "react";

interface DashboardContextType {
    
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
    children: React.ReactNode;
}

export function DashboardProvider({children}: DashboardProviderProps) {
    return <DashboardContext.Provider value={{

    }}>
        {children}
    </DashboardContext.Provider>;
}

export function useDashboardContext() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboardContext must be used within a DashboardProvider');
    }
    return context;
}
