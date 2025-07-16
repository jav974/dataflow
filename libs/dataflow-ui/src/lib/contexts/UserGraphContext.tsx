import { AppConfig } from "@dataflow-ide/dataflow-core";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";
import Dexie, { Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

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
    loadGraph: (id: string) => Promise<AppConfig | undefined>;
    saveGraph: (graph: AppConfig) => Promise<string>;
    deleteGraph: (id: string) => Promise<void>;
}

export const UserGraphContext = createContext<UserGraphContextType | null>(null);

export function UserGraphProvider({ children }: { children: React.ReactNode }) {
    const [graph, setGraph] = useState<AppConfig | null>(null);

    const graphs = useLiveQuery(async () => {
        const all = await graphDB.appConfigs.toArray();
        const mapped = new Map(all.map(cfg => [cfg.id, cfg.name]));
        return mapped;
    }, [], new Map());

    const loadGraph = useCallback(async (id: string): Promise<AppConfig | undefined> => {
        const config = await graphDB.appConfigs.get(id);

        localStorage.setItem("dataflow-last-graph", id);

        if (config) {
            setGraph(config);
        }
        return config;
    }, []);

    const saveGraph = useCallback(async (config: AppConfig): Promise<string> => {
        return await graphDB.appConfigs.put(config);
    }, []);

    const deleteGraph = useCallback(async (id: string): Promise<void> => {
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
    }, [graph, graphs, loadGraph]);

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
