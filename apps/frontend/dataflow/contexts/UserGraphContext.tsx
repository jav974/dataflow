import { AppConfig } from "@/dataflow/config/schema";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { jsonToMap, mapToJson } from "../engine/utils";

interface UserGraphContextType {
    graphs: Map<string, string>;
    graph: AppConfig | null;
    loadGraph: (name: string) => void;
    saveGraph: (name: string, graph: AppConfig) => void;
    deleteGraph: (name: string) => void;
}

export const UserGraphContext = createContext<UserGraphContextType | null>(null);

export function UserGraphProvider({ children }: { children: React.ReactNode }) {
    const [graphs, setGraphs] = useState<Map<string, string> | null>(null);
    const [graph, setGraph] = useState<AppConfig | null>(null);

    const getLocalStorageGraphKey = useCallback((name: string) => {
        // Replace any non-alphanumeric characters with hyphens and convert to lowercase
        const safeName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        return `dataflow-graph-${safeName}`;
    }, []);
    
    const loadGraph = useCallback((id: string) => {
        const graph = localStorage.getItem(getLocalStorageGraphKey(id));

        if (graph) {
            setGraph(JSON.parse(graph));
            localStorage.setItem("dataflow-last-graph", id);
        }
    }, [getLocalStorageGraphKey]);

    const saveGraph = useCallback((id: string, graph: AppConfig) => {
        localStorage.setItem(getLocalStorageGraphKey(id), JSON.stringify(graph));

        if (!graphs) {
            setGraphs(new Map().set(id, graph.name));
        } else if (!graphs.has(id)) {
            setGraphs(new Map(graphs).set(id, graph.name));
        }
    }, [getLocalStorageGraphKey, graphs]);

    const deleteGraph = useCallback((id: string) => {
        localStorage.removeItem(getLocalStorageGraphKey(id));
        const filteredGraphs = new Map(graphs);
        filteredGraphs.delete(id);

        setGraphs(filteredGraphs);
        
        if (graph?.id === id) {
            if (filteredGraphs.size > 0) {
                const graph = filteredGraphs.entries().next().value!;
                loadGraph(graph[0]);
            } else {
                setGraph(null);
            }
        }
    }, [getLocalStorageGraphKey, graphs, graph, loadGraph]);

    useEffect(() => {
        const savedGraphs = jsonToMap<string>(localStorage.getItem("dataflow-graphs") ?? "{}");

        setGraphs(savedGraphs);

        if (savedGraphs.size > 0) {
            const lastGraph = localStorage.getItem("dataflow-last-graph");
            loadGraph(lastGraph ?? savedGraphs.entries().next().value![0]);
        }
    }, [loadGraph]);

    useEffect(() => {
        if (graphs) {
            localStorage.setItem("dataflow-graphs", mapToJson(graphs));
        }
    }, [graphs]);
    
    return <UserGraphContext.Provider value={{ graphs: graphs ?? new Map(), graph, loadGraph, saveGraph, deleteGraph }}>
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
