import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "./socket-types";
import pkg from '@next/env';
const { loadEnvConfig } = pkg;

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(3001, {
    path: "/ws",
    cors: { origin: "*" },
});

const clientToExecutor = new Map<string, string>();
const executorToClient = new Map<string, string>();

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.emit("hello", socket.id);

    socket.on("registerExecutor", (data) => {
        console.log("Register", data.executorId, socket.id, "for client", data.clientSocketId);
        clientToExecutor.set(data.clientSocketId, socket.id);
        executorToClient.set(socket.id, data.clientSocketId);
    });

    // Listen for events from client
    socket.on("pause", (ack) => {
        console.log("Received pause from react client");
        const executorSocketId = clientToExecutor.get(socket.id);
        
        if (executorSocketId) {
            io.to(executorSocketId).emit("paused");
        }
        ack();
    });

    socket.on("resume", (ack) => {
        console.log("Received resume from react client");
        const executorSocketId = clientToExecutor.get(socket.id);
        
        if (executorSocketId) {
            io.to(executorSocketId).emit("resumed");
        }
        ack();
    });

    socket.on("cancel", (ack) => {
        console.log("Received cancel from react client");
        const executorSocketId = clientToExecutor.get(socket.id);
        
        if (executorSocketId) {
            io.to(executorSocketId).emit("canceled");
        }
        ack();
    });

    socket.on("writeTo", (data, ack) => {
        const clientSocketId = executorToClient.get(socket.id);

        if (clientSocketId) {
            io.to(clientSocketId).emit("writeTo", data);
        }

        ack({status: "ok"});
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        
        for (const [key, value] of clientToExecutor.entries()) {
            if (value === socket.id) {
                console.log("Executor disconnected");
                clientToExecutor.delete(key);
                break ;
            }
        }

        executorToClient.delete(socket.id);
    });
});

const websocketServerUrl = process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL;

console.log(`Socket.IO server running at ${websocketServerUrl}/ws`);
