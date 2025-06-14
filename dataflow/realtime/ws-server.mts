import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "./socket-types";

const io = new Server<ClientToServerEvents, ServerToClientEvents>(3001, {
    path: "/ws",
    cors: { origin: "*" }, // Adjust for your needs
});

const executorMap: Map<string, string> = new Map();

function broadcast(socketIds: string[], event: "paused" | "resumed" | "canceled") {
    io.to(socketIds).emit(event);
}

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("registerExecutor", (data) => {
        executorMap.set(data.executorId, socket.id);
    });

    // Listen for events from client
    socket.on("pause", (ack) => {
        console.log("Received pause from react client");
        broadcast(Array.from(executorMap.values()), "paused");
        ack();
    });

    socket.on("resume", (ack) => {
        console.log("Received resume from react client");
        broadcast(Array.from(executorMap.values()), "resumed");
        ack();
    });

    socket.on("cancel", (ack) => {
        console.log("Received cancel from react client");
        broadcast(Array.from(executorMap.values()), "canceled");
        ack();
    });

    socket.on("writeTo", (data) => {
        io.emit("writeTo", data);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        
        for (const [key, value] of executorMap.entries()) {
            if (value === socket.id) {
                console.log("Executor disconnected");
                executorMap.delete(key);
                break ;
            }
        }
    });
});

console.log("Socket.IO server running at ws://localhost:3001/ws");