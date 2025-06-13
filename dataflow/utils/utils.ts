import { AppConfig } from "../config/schema";
import { KeyValue } from "../engine/context";
import { GraphExecutor } from "../engine/types";

// Create a GraphExecutor that calls a remote server via fetch
export function createUrlGraphExecutor(serverUrl: string): GraphExecutor {
    return async (graph: AppConfig, params?: KeyValue) => {
        const res = await fetch(serverUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ graph, params }),
        });
        if (!res.ok) throw new Error("Server error");
        return await res.json();
    };
}
