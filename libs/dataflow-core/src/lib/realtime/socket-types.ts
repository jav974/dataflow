import { Log } from "@dataflow-core/engine/types";

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
}

export interface ClientToServerEvents {
    registerExecutor: (data: { executorId: string, clientSocketId: string }, ack: (ack: AckResponse) => void) => void;
    pause: (callback: () => void) => void;
    resume: (callback: () => void) => void;
    cancel: (callback: () => void) => void;
    writeTo: (data: Log, ack: (ack: AckResponse) => void) => void;
}
