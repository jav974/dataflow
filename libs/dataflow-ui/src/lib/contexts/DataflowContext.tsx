import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createUrlGraphExecutor } from "../utils/utils";
import { AppConfig, Executor, runGraphWithController } from "@dataflow-ide/dataflow-core";

type DataflowAuth = {
    apiKey?: string;
    setApiKey: (key: string) => void;
};

type DataflowExec = {
    remoteExecutor?: Executor;
    localExecutor?: Executor;
    mode?: "remote" | "local" | "react";
    serverUrl?: string; // Optional: if provided, use as remoteExecutor
};

type DataflowUtils = {
    fetchGraph: (graphId: string) => Promise<AppConfig | null>;
    setMode: (mode: "remote" | "local" | "react") => void;
}

type DataflowContextType = DataflowAuth & DataflowExec & DataflowUtils & {
    selectedExecutor: Executor | undefined;
};

const DataflowContext = createContext<DataflowContextType | undefined>(undefined);

interface DataflowProviderProps extends DataflowExec {
    children: React.ReactNode;
}

const getLocalStorageGraphKey = (name: string) => {
    // Replace any non-alphanumeric characters with hyphens and convert to lowercase
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `dataflow-graph-${safeName}`;
};

export function DataflowProvider({ children, remoteExecutor, localExecutor = runGraphWithController, mode: initialMode = "react", serverUrl }: DataflowProviderProps) {
    const [apiKey, setApiKey] = useState<string | undefined>(undefined);
    const [mode, setMode] = useState<"remote" | "local" | "react">(initialMode);

    // If serverUrl is provided, use it to create a remoteExecutor
    const effectiveRemoteExecutor = useMemo(() => {
        if (remoteExecutor) return remoteExecutor;
        if (serverUrl) return createUrlGraphExecutor(serverUrl);
        return undefined;
    }, [remoteExecutor, serverUrl]);

    const fetchGraph = useCallback(async (graphId: string): Promise<AppConfig | null> => {
        try {
            if (mode === "local") {
                const graphKey = getLocalStorageGraphKey(graphId);
                return localStorage.getItem(graphKey) ? JSON.parse(localStorage.getItem(graphKey)!) : null;
            } else if (mode === "remote") {
                console.warn("Remote graph fetching is not implemented yet.");
                // TODO: Implement remote graph fetching logic
            }
        } catch (error) {
            console.error("Error fetching graph:", error);
        }
        return null;
    }, [mode]);

    const selectedExecutor = useMemo((): Executor | undefined => {
        if (mode === "remote" && effectiveRemoteExecutor) {
            return effectiveRemoteExecutor;
        }
        if ((mode === "local" || mode === "react") && localExecutor) {
            return localExecutor;
        }
        return undefined;
    }, [mode, effectiveRemoteExecutor, localExecutor]);

    return (
        <DataflowContext.Provider value={{
            apiKey,
            setApiKey,
            remoteExecutor: effectiveRemoteExecutor,
            localExecutor,
            mode,
            serverUrl,
            setMode,
            fetchGraph,
            selectedExecutor
        }}>
            {children}
        </DataflowContext.Provider>
    );
};

export function useDataflowContext(): DataflowContextType {
    const ctx = useContext(DataflowContext);
    if (!ctx) throw new Error("useDataflow must be used within a DataflowProvider");
    return ctx;
};
