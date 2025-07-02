import { useEffect, useState } from "react";
import { useDataflowContext } from "../contexts/DataflowContext";
import { AppConfig, GraphResult, KeyValue } from "@dataflow-ide/dataflow-core";

export function useDataflowGraph(graph: string | AppConfig, params?: KeyValue) {
    const { apiKey, mode, localExecutor, remoteExecutor, fetchGraph } = useDataflowContext();
    const [result, setResult] = useState<GraphResult | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!apiKey && mode === "remote") {
            setError(new Error("API key is required for remote execution"));
            return;
        }
        if ((!mode || mode === "local") && !localExecutor) {
            setError(new Error("Local executor is not available"));
            return;
        }
        if (mode === "remote" && !remoteExecutor) {
            setError(new Error("Remote executor is not available"));
            return;
        }

        setLoading(true);
        setError(null);

        const executor = mode === "remote" ? remoteExecutor : localExecutor;

        if (!executor) {
            setError(new Error("No executor available for the current mode"));
            setLoading(false);
            return;
        }

        if (typeof graph === "string") {
            // If graph is a string, fetch it from the server
            fetchGraph(graph)
                .then(fetchedGraph => {
                    if (!fetchedGraph) {
                        throw new Error(`Graph with ID ${graph} not found`);
                    }
                    return fetchedGraph;
                })
                .then(fetchedGraph => {
                    // Ensure the fetched graph is an AppConfig object
                    const appConfig = fetchedGraph as AppConfig;
                    return executor(appConfig, params);
                })
                .then(res => setResult(res))
                .catch(setError)
                .finally(() => setLoading(false));
        } else {
            // If graph is already an AppConfig object, use it directly
            executor(graph, params)
                .then(res => setResult(res))
                .catch(setError)
                .finally(() => setLoading(false))
            ;
        }
    }, [apiKey, graph, params, fetchGraph, localExecutor, mode, remoteExecutor]);

    return { result, loading, error };
}
