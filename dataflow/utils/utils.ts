import { AppConfig, ConnectionConfig, ConnectorConfig } from "../config/schema";
import { KeyValue } from "../engine/context";
import { GraphExecutor, GraphResult } from "../engine/types";

// Create a GraphExecutor that calls a remote server via fetch
export function createUrlGraphExecutor(serverUrl: string): GraphExecutor {
    return async (graph: AppConfig, params?: KeyValue, clientSocketId?: string): Promise<GraphResult | undefined> => {
        const res = await fetch(serverUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ graph, params, clientSocketId }),
        });
        const response = await res.json();
        if (!res.ok || res.status === 499) throw new Error((response as Error).message);
        return response;
    };
}

export function isEditableElement(el: Element | null): boolean {
    return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
    );
};

export function getRemoveConnectionsPredicate(from?: ConnectorConfig, to?: ConnectorConfig) {
    let predicate: ((conn: ConnectionConfig) => boolean) | undefined;

    if (from && to) {
        predicate = (conn: ConnectionConfig): boolean => (conn.from.id === from.id && conn.from.pin === from.pin && conn.to.id === to.id && conn.to.pin === to.pin);
    } else if (from) {
        predicate = (conn: ConnectionConfig): boolean => (conn.from.id === from.id && conn.from.pin === from.pin);
    } else if (to) {
        predicate = (conn: ConnectionConfig) => (conn.to.id === to.id && conn.to.pin === to.pin);
    }

    return predicate;
}
