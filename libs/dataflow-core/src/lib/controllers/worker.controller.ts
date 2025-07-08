import { io, Socket } from "socket.io-client";
import { AbstractExecutionController, ExecutorReturn } from "./base.controller";
import { ClientToServerEvents, ServerToClientEvents } from "@dataflow-core/realtime/socket-types";
import { ReliableEmitter } from "@dataflow-core/realtime/emitter";
import { Log } from "@dataflow-core/engine/types";
import { eventBus } from "@dataflow-core/events/events";

/**
 * Used in serverside nextjs app to control flow execution of graph
 * 
 * Sends "writeTo" event to WS server
 * Receives "paused" | "resumed" | "canceled" events from WS server
 * 
 * Reflects state based on WS server events received
 */
export class WorkerExecutionController extends AbstractExecutionController {
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
        super();
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