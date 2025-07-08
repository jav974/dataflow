import { io, Socket } from "socket.io-client";
import { AbstractExecutionController, Callback, Executor, ExecutorReturn, RemoteExecutionData } from "./base.controller";
import { ClientToServerEvents, ServerToClientEvents } from "@dataflow-core/realtime/socket-types";
import { eventBus } from "@dataflow-core/events/events";
import { Log } from "@dataflow-core/engine/types";
import { AppConfig } from "@dataflow-core/config/schema";
import { KeyValue } from "@dataflow-core/engine/context";

/**
 * Used in client side react app to control flow execution of graph
 * 
 * Sends "pause" | "resume" | "cancel" events to WS server
 * Receives "writeTo" event from WS server
 * 
 * Waits for WS server to acknowledge each event before proceeding to local state update
 */
export class RemoteExecutionController extends AbstractExecutionController {
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
}