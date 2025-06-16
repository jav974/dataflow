import { AppConfig } from "@/dataflow/config/schema";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface UserGraphContextType {
    graphs: string[] | null;
    graph: AppConfig | null;
    loadGraph: (name: string) => void;
    saveGraph: (name: string, graph: AppConfig) => void;
    deleteGraph: (name: string) => void;
}

export const UserGraphContext = createContext<UserGraphContextType | null>(null);

export function UserGraphProvider({ children }: { children: React.ReactNode }) {
    const [graphs, setGraphs] = useState<string[] | null>(null);
    const [graph, setGraph] = useState<AppConfig | null>(null);

    const getLocalStorageGraphKey = useCallback((name: string) => {
        // Replace any non-alphanumeric characters with hyphens and convert to lowercase
        const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return `dataflow-graph-${safeName}`;
    }, []);
    
    const loadGraph = useCallback((name: string) => {
        const graph = localStorage.getItem(getLocalStorageGraphKey(name));
        
        if (graph) {
            setGraph(JSON.parse(graph));
        }
    }, [getLocalStorageGraphKey]);

    const saveGraph = useCallback((name: string, graph: AppConfig) => {
        if (graphs === null) return;
        
        localStorage.setItem(getLocalStorageGraphKey(name), JSON.stringify(graph));

        if (!graphs.includes(name)) {
            setGraphs([...graphs, name]);
        }
    }, [getLocalStorageGraphKey, graphs]);

    const deleteGraph = useCallback((name: string) => {
        if (graphs === null) return;

        localStorage.removeItem(getLocalStorageGraphKey(name));
        const filteredGraphs = graphs.filter((graph) => graph !== name);
        setGraphs(filteredGraphs);
        
        if (graph?.name === name) {
            if (filteredGraphs.length) {
                loadGraph(filteredGraphs[0]);
            } else {
                setGraph(null);
            }
        }
    }, [getLocalStorageGraphKey, graphs, graph, loadGraph]);

    useEffect(() => {
        const savedGraphs = JSON.parse(localStorage.getItem("dataflow-graphs") || "[]");
        setGraphs(savedGraphs);

        if (savedGraphs.length > 0) {
            loadGraph(savedGraphs[0]);
        }
    }, [loadGraph]);

    useEffect(() => {
        if (graphs === null) return;

        localStorage.setItem("dataflow-graphs", JSON.stringify(graphs));
    }, [graphs]);
    
    return <UserGraphContext.Provider value={{ graphs, graph, loadGraph, saveGraph, deleteGraph }}>
        {children}
    </UserGraphContext.Provider>;
}

export function useUserGraphContext() {
    const context = useContext(UserGraphContext);
    if (!context) {
        throw new Error('useUserGraph must be used within a UserGraphProvider');
    }
    return context;
}
