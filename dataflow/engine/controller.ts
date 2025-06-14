import { io, Socket } from "socket.io-client";
import { eventBus } from "../events/events";
import { GraphResult, Log } from "./types";
import { ClientToServerEvents, ServerToClientEvents } from "../realtime/socket-types";
import { AppConfig } from "../config/schema";
import { KeyValue } from "./context";

type Callback = () => void;
type ExecutorReturn = Promise<GraphResult | undefined>;
type Executor = (graph: AppConfig, params?: KeyValue) => ExecutorReturn;

export interface IExecutionController {
    started: boolean;
    paused: boolean;
    start(executor: Executor, graph: AppConfig, params?: KeyValue): ExecutorReturn;
    pause(onPaused?: Callback): void;
    resume(onResumed?: Callback): void;
    cancel(onCanceled?: Callback): void;
    clear(): void;
    waitIfPaused(): Promise<void>;
}

export class LocalExecutionController implements IExecutionController {
    started = false;
    paused = false;

    start(executor: Executor, graph: AppConfig, params?: KeyValue): ExecutorReturn {
        this.started = true;
        return executor(graph, params).finally(() => this.clear());
    }

    clear(): void {
        this.started = false;
        this.paused = false;
    }

    pause(onPaused?: Callback) {
        this.paused = true;
        if (onPaused) onPaused();
    }

    resume(onResumed?: Callback) {
        this.paused = false;
        if (onResumed) onResumed();
    }

    cancel(onCanceled?: Callback) {
        if (this.paused) {
            this.paused = false;
        }
        this.started = false;
        
        if (onCanceled) onCanceled();
    }

    async waitIfPaused(): Promise<void> {
        while (this.paused) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

export class RemoteExecutionController implements IExecutionController {
    started = false;
    paused = false;
    private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

    constructor(websocketServerUrl: string = "ws://localhost:3001") {
        this.initSocket(websocketServerUrl);
    }

    private initSocket(websocketServerUrl: string) {
        this.socket = io(websocketServerUrl, { path: "/ws" });

        this.socket.on("connect", () => {
            if (typeof window === "undefined") {
                console.log("ExecutionController connected to WebSocket server");
                // Register as executor with a unique ID (could be hostname, PID, etc.)
                const executorId = process.env.EXECUTOR_ID || `executor-${process.pid}`;
                this.socket?.emit("registerExecutor", { executorId });
            }
        });

        this.socket.on("paused", () => {
            this.paused = true;
        });

        this.socket.on("resumed", () => {
            this.paused = false;
        });

        this.socket.on("canceled", () => {
            this.clear();
        });

        this.socket.on("disconnect", () => {
            console.log("ExecutionController disconnected from WebSocket server");
        });

        if (typeof window === "undefined") {
            // Forward IO writes to websocket server
            eventBus.on('io_write', (log: Log) => {
                this.socket?.emit("writeTo", log);
            });
        }
    }

    start(executor: Executor, graph: AppConfig, params?: KeyValue): ExecutorReturn {
        this.started = true;
        return executor(graph, params).finally(() => this.clear());
    }

    clear(): void {
        this.started = false;
        this.paused = false;
    }

    pause(onPaused?: Callback) {
        this.socket?.emit("pause", () => {
            this.paused = true;
            if (onPaused) onPaused();
        });
    }

    resume(onResumed?: Callback) {
        this.socket?.emit("resume", () => {
            this.paused = false;
            if (onResumed) onResumed();
        });
    }

    cancel(onCanceled?: Callback) {
        this.socket?.emit("cancel", () => {
            this.clear();
            if (onCanceled) onCanceled();
        });
    }

    async waitIfPaused(): Promise<void> {
        while (this.paused) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

class ExecutionController implements IExecutionController {
    private controller: IExecutionController | null = null;
    private mode: "local" | "remote" = "local";

    private getController(): IExecutionController {
        if (this.controller) return this.controller;

        return this.controller = (this.mode === "local"
            ? new LocalExecutionController()
            : new RemoteExecutionController()
        );
    }

    get started() { return this.getController().started; }
    get paused() { return this.getController().paused; }

    setMode(mode: "local" | "remote") {
        if (mode !== this.mode) {
            this.mode = mode;
            this.controller = null;
        }
    }

    start(executor: Executor, graph: AppConfig, params?: KeyValue): ExecutorReturn {
        return this.getController().start(executor, graph, params);
    }

    pause(onPaused?: Callback): void {
        this.getController().pause(onPaused);
    }

    resume(onResumed?: Callback): void {
        this.getController().resume(onResumed);
    }

    cancel(onCanceled?: Callback): void {
        this.getController().cancel(onCanceled);
    }

    clear(): void {
        this.getController().clear();
    }

    async waitIfPaused(): Promise<void> {
        return this.getController().waitIfPaused();
    }
}

const controller = new ExecutionController();

if (typeof window === "undefined") {
    controller.setMode("remote");
}

export default controller;
