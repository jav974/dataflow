import { AppConfig } from "@dataflow-core/config/schema";
import { KeyValue } from "@dataflow-core/engine/context";
import { GraphResult, Log } from "@dataflow-core/engine/types";

export type AckResponse = {
    status: "ok" | "error";
    message?: string;
}

export interface ServerToClientEvents {
    hello: (id: string) => void;
    writeTo: (data: Log) => void;
    paused: () => void;
    resumed: () => void;
    canceled: () => void;
    executed: (data: { result: GraphResult | undefined, error?: string }) => void;
}

export interface ClientToServerEvents {
    registerExecutor: (data: { executorId: string, clientSocketId: string }, ack: (ack: AckResponse) => void) => void;
    start: (data: {graph: AppConfig, params?: KeyValue}, callback: () => void) => void;
    pause: (callback: () => void) => void;
    resume: (callback: () => void) => void;
    cancel: (callback: () => void) => void;
    writeTo: (data: Log, ack: (ack: AckResponse) => void) => void;
}
