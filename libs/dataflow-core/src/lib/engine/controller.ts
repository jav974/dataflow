import { io, Socket } from "socket.io-client";
import { eventBus } from "../events/events";
import { GraphResult, Log } from "./types";
import { ClientToServerEvents, ServerToClientEvents } from "@dataflow-core/realtime/socket-types";
import { AppConfig } from "../config/schema";
import { KeyValue } from "./context";
import { ReliableEmitter } from "../realtime/emitter";

type Callback = () => void;
type ExecutorReturn = Promise<GraphResult | undefined>;
type Executor = (graph: AppConfig, params?: KeyValue, clientSocketId?: string) => ExecutorReturn;

export interface IExecutionController {
    started: boolean;
    paused: boolean;
    start(executor: Executor, graph: AppConfig, params?: KeyValue, clientSocketId?: string): ExecutorReturn;
    pause(onPaused?: Callback): void;
    resume(onResumed?: Callback): void;
    cancel(onCanceled?: Callback): void;
    clear(): void;
    waitIfPaused(): Promise<void>;
}

/**
 * Used in clientside react app to control the flow execution of graph
 */
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

/**
 * Used in serverside nestjs app to control flow execution of graph
 */
export class RunnerExecutionController implements IExecutionController {
    started = true;
    paused = false;

    constructor(private clientSocketId: string) {}

    start(executor: Executor, graph: AppConfig, params?: KeyValue): ExecutorReturn {
        throw new Error("RunnerExecutionController does not support start method directly.");
    }

    clear(): void {
        this.started = false;
        this.paused = false;
    }

    pause(onPaused?: Callback): void {
        this.paused = true;
        if (onPaused) onPaused();
    }

    resume(onResumed?: Callback): void {
        this.paused = false;
        if (onResumed) onResumed();
    }

    cancel(onCanceled?: Callback): void {
        this.clear();
        if (onCanceled) onCanceled();
    }

    async waitIfPaused(): Promise<void> {
        while (this.paused) {
            await this.wait();
        }
    }

    wait(timeout: number = 50) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    async waitForPendingLogs() {
        // while (!eventBus.listenerCount('io_write_' + this.clientSocketId)) {
        //     await this.wait();
        // }
    }
}

/**
 * Used in serverside nextjs app to control flow execution of graph
 * 
 * Sends "writeTo" event to WS server
 * Receives "paused" | "resumed" | "canceled" events from WS server
 * 
 * Reflects state based on WS server events received
 */
export class WorkerExecutionController implements IExecutionController {
    started = true;
    paused = false;
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private clientSocketId: string;
    private workerSocketId: string | undefined;
    private emitter: ReliableEmitter<Log>;
    private registrationEmitter: ReliableEmitter<{executorId: string, clientSocketId: string}>;
    private websocketServerUrl: string | undefined;
    private connectionError: boolean = false;
    private registered: boolean = false;

    constructor(clientSocketId: string) {
        this.clientSocketId = clientSocketId;
        this.websocketServerUrl = process.env.WEBSOCKET_SERVER_URL;
        this.socket = io(this.websocketServerUrl, {
            path: "/ws",
            transports: ["polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            forceNew: true
        });

        this.emitter = new ReliableEmitter(this.socket, "writeTo", (log) => log.createdAt.toString());
        this.registrationEmitter = new ReliableEmitter(this.socket, "registerExecutor", (payload) => {
            return payload.executorId;
        }, (ack) => {
            if (ack.status === "ok") {
                this.registered = true;
            }
        });

        this.socket.on("connect", () => {
            console.log("ExecutionController connected to WebSocket server");
            // Register as executor with a unique ID (could be hostname, PID, etc.)
            const executorId = process.env.EXECUTOR_ID || `executor-${process.pid}`;
            this.registrationEmitter.enqueue({ executorId, clientSocketId: this.clientSocketId });
        });

        this.socket.on("hello", (id) => {
            console.log("WorkerController: Received hello from server:", id);
            this.workerSocketId = id;
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
            console.log("WorkerExecutionController disconnected from WebSocket server");
        });

        // Forward IO writes to websocket server
        eventBus.on('io_write_' + this.clientSocketId, this.forwardIOWrites);

        this.socket.on("connect_error", () => {
            this.clear();
            this.connectionError = true;
        });
    }

    private forwardIOWrites = (log: Log) => {
        this.emitter.enqueue(log);
    };

    start(): ExecutorReturn {
        throw new Error();
    }

    pause(): void {
        throw new Error();
    }

    resume(): void {
        throw new Error();
    }

    cancel(): void {
        throw new Error();
    }

    clear(): void {
        eventBus.off('io_write_' + this.clientSocketId, this.forwardIOWrites);
        this.started = false;
        this.paused = false;
        this.socket.disconnect();
    }

    wait(timeout: number = 50) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    async waitIfPaused(): Promise<void> {
        while (this.paused) {
            await this.wait();
        }
    }

    async waitForWorkerSocketId() {
        while (!this.registered || !this.workerSocketId) {
            if (this.connectionError) {
                throw new Error("Connection error from worker to ws-server on URL: " + this.websocketServerUrl);
            }
            await this.wait();
        }
    }

    async waitForPendingLogs() {
        while (!this.emitter.isEmpty()) {
            await this.wait();
        }
    }
}

type RemoteExecutionData = {completed: boolean, result: GraphResult | undefined, error?: string};

/**
 * Used in client side react app to control flow execution of graph
 * 
 * Sends "pause" | "resume" | "cancel" events to WS server
 * Receives "writeTo" event from WS server
 * 
 * Waits for WS server to acknowledge each event before proceeding to local state update
 */
export class RemoteExecutionController implements IExecutionController {
    started = false;
    paused = false;
    private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
    private clientSocketId: string | undefined;
    private data: RemoteExecutionData | undefined;

    private initSocket() {
        this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL, { path: "/ws", transports: ["websocket"] });

        this.socket.on("connect", () => {
            console.log("Connected to remote WS server");
        });

        this.socket.on("hello", (id) => {
            this.clientSocketId = id;
        });

        this.socket.on("disconnect", () => {
            console.log("RemoteExecutionController disconnected from WebSocket server");
        });

        this.socket.on("writeTo", (data) => {
            eventBus.emit<Log>("io_write", data);
        });
    }

    async waitForClientSocketId() {
        while (!this.clientSocketId) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    async start(executor: Executor, graph: AppConfig, params?: KeyValue): ExecutorReturn {
        if (!this.socket) {
            this.clientSocketId = undefined;
            this.initSocket();
        } else if (!this.socket.connected) {
            this.clientSocketId = undefined;
            this.socket?.connect();
        }

        await this.waitForClientSocketId();

        this.data = { completed: false, result: undefined, error: undefined };
        this.socket?.on("executed", (data) => {
            console.log("RemoteExecutionController: Received executed event:", data);
            if (data.error) {
                eventBus.emit<Log>('io_write', { type: "error", message: data.error, createdAt: Date.now() } as Log);
            }

            this.data = {...data, completed: true};
            this.socket?.off("executed");
        });

        this.socket?.emit("start", { graph, params }, () => {
            this.started = true;
        });

        while (!this.data.completed) {
            await this.wait();
        }

        this.clear();
        return this.data.result;

        // return executor(graph, params, this.clientSocketId).finally(() => this.clear());
    }

    wait(timeout: number = 50) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    clear(): void {
        this.started = false;
        this.paused = false;
        this.clientSocketId = undefined;
        this.socket?.disconnect();
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
            // this.clear();
            if (onCanceled) onCanceled();
        });
    }

    async waitIfPaused(): Promise<void> {
        while (this.paused) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

/**
 * Used in clientside react app to control flow execution of graph
 * 
 * Returns the appropriate controller based on user preference:
 *  - LocalExecutionController when mode = "local"
 *  - RemoteExecutionController when mode = "remote"
 */
class ExecutionController implements IExecutionController {
    private controller: IExecutionController | null = null;
    private mode: "local" | "remote" = "local";

    private getController() {
        if (this.controller) return this.controller;

        return this.controller = this.mode === "local"
            ? new LocalExecutionController()
            : new RemoteExecutionController()
        ;
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

export { controller }
