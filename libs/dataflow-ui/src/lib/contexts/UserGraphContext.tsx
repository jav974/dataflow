import { AppConfig } from "@dataflow-ide/dataflow-core";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";
import Dexie, { Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import toast from 'react-hot-toast';

class GraphDB extends Dexie {
    appConfigs!: Table<AppConfig, string>;
    constructor() {
        super("GraphDB");
        this.version(1).stores({
            appConfigs: "id"
        });
    }
}

export const graphDB = new GraphDB();

interface UserGraphContextType {
    graphs: Map<string, string>;
    graph: AppConfig | null;
    isLoading: boolean;
    loadGraph: (id: string) => Promise<AppConfig | undefined>;
    saveGraph: (graph: AppConfig) => Promise<string>;
    deleteGraph: (id: string) => Promise<void>;
}

export const UserGraphContext = createContext<UserGraphContextType | null>(null);

interface UserGraphProviderProps {
    remoteLoadGraph?: (graphId: string) => Promise<AppConfig | undefined>;
    remoteSaveGraph?: (graph: AppConfig) => Promise<Response>;
    remoteDeleteGraph?: (graphId: string) => Promise<Response>;
    remoteListGraphs?: () => Promise<AppConfig[]>;
    children: React.ReactNode;
}

export function UserGraphProvider({ remoteListGraphs, remoteLoadGraph, remoteSaveGraph, remoteDeleteGraph, children }: UserGraphProviderProps) {
    const [graph, setGraph] = useState<AppConfig | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const graphs = useLiveQuery(async () => {
        let remoteGraphs: AppConfig[] = [];

        if (remoteListGraphs) {
            try {
                remoteGraphs = await remoteListGraphs();
            } catch {
            }
        }

        const all = await graphDB.appConfigs.toArray();
        const mapped = new Map(all.map(cfg => [cfg.id, cfg.name]));

        remoteGraphs.forEach(remoteGraph => {
            mapped.set(remoteGraph.id, remoteGraph.name);
        });

        return mapped;
    }, [], new Map());

    const loadGraph = useCallback(async (id: string): Promise<AppConfig | undefined> => {
        let config: AppConfig | undefined;

        setIsLoading(true);

        if (remoteLoadGraph) {
            config = await remoteLoadGraph(id);
        }

        if (!config) {
            config = await graphDB.appConfigs.get(id);
        }

        localStorage.setItem("dataflow-last-graph", id);

        if (config) {
            setGraph(config);
        }

        setIsLoading(false);

        return config;
    }, [remoteLoadGraph]);

    const saveGraph = useCallback(async (config: AppConfig): Promise<string> => {
        if (remoteSaveGraph) {
            try {
                const response = await remoteSaveGraph(config);

                if (!response.ok) {
                    throw new Error(response.statusText);
                } else {
                    toast.success("Graph saved", {className: "mt-[50px]"});
                }
            } catch (error) {
                toast.error("Failed to save graph: " + (error as Error).message, {className: "mt-[50px]"});
            }
        }

        return await graphDB.appConfigs.put(config);
    }, [remoteSaveGraph]);

    const deleteGraph = useCallback(async (id: string): Promise<void> => {
        if (remoteDeleteGraph) {
            try {
                const response = await remoteDeleteGraph(id);

                if (!response.ok) {
                    throw new Error(response.statusText);
                } else {
                    toast.success("Graph deleted", {className: "mt-[50px]"});
                }
            } catch (error) {
                toast.error("Failed to delete graph: " + (error as Error).message, {className: "mt-[50px]"});
            }
        }

        await graphDB.appConfigs.delete(id);
        if (graph?.id === id) {
            const fallbackId = localStorage.getItem("dataflow-last-graph");
            if (fallbackId && fallbackId !== id && graphs.has(fallbackId)) {
                loadGraph(fallbackId);
            } else if (graphs.size > 0) {
                loadGraph(Array.from(graphs.keys())[0]);
            } else {
                setGraph(null);
            }
        }
    }, [graph, graphs, loadGraph, remoteDeleteGraph]);

    useEffect(() => {
        const tryLoad = async () => {
            const lastOpenedGraphId = localStorage.getItem("dataflow-last-graph");

            if (lastOpenedGraphId && graphs.has(lastOpenedGraphId)) {
                await loadGraph(lastOpenedGraphId);
            } else {
                const firstGraphId =
                    (graphs.size > 0 ? Array.from(graphs.keys())[0] : null)
                ;
                if (firstGraphId) {
                    await loadGraph(firstGraphId);
                }
            }
        };
        tryLoad();
    }, [loadGraph, graphs]);

    return (
        <UserGraphContext.Provider value={{
            graphs: graphs ?? new Map(),
            graph,
            isLoading,
            loadGraph,
            saveGraph,
            deleteGraph
        }}>
            {children}
        </UserGraphContext.Provider>
    );
}

export function useUserGraphContext() {
    const context = useContext(UserGraphContext);
    if (!context) {
        throw new Error("useUserGraph must be used within a UserGraphProvider");
    }
    return context;
}
