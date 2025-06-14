import { AppConfig } from "../config/schema";
import { KeyValue } from "../engine/context";
import { GraphExecutor, GraphResult } from "../engine/types";

// Create a GraphExecutor that calls a remote server via fetch
export function createUrlGraphExecutor(serverUrl: string): GraphExecutor {
    return async (graph: AppConfig, params?: KeyValue): Promise<GraphResult | undefined> => {
        const res = await fetch(serverUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ graph, params }),
        });
        const response = await res.json();
        if (!res.ok) throw new Error((response as Error).message);
        return response;
    };
}
