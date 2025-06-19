import { Log } from "../engine/types";

export interface ServerToClientEvents {
    hello: (id: string) => void;
    writeTo: (data: Log) => void;
    paused: () => void;
    resumed: () => void;
    canceled: () => void;
}

export interface ClientToServerEvents {
    registerExecutor: (data: { executorId: string, clientSocketId: string }) => void;
    pause: (callback: () => void) => void;
    resume: (callback: () => void) => void;
    cancel: (callback: () => void) => void;
    writeTo: (data: Log) => void;
}
