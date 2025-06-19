import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "./socket-types";

const io = new Server<ClientToServerEvents, ServerToClientEvents>(3001, {
    path: "/ws",
    cors: { origin: "*" }, // Adjust for your needs
});

const executorMap: Map<string, string> = new Map();

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.emit("hello", socket.id);

    socket.on("registerExecutor", (data) => {
        console.log("Register executor", data.executorId, socket.id, "for client", data.clientSocketId);
        executorMap.set(data.clientSocketId, socket.id);
    });

    // Listen for events from client
    socket.on("pause", (ack) => {
        console.log("Received pause from react client");
        const executorSocketId = executorMap.get(socket.id);
        
        if (executorSocketId) {
            io.to(executorSocketId).emit("paused");
        }
        ack();
    });

    socket.on("resume", (ack) => {
        console.log("Received resume from react client");
        const executorSocketId = executorMap.get(socket.id);
        
        if (executorSocketId) {
            io.to(executorSocketId).emit("resumed");
        }
        ack();
    });

    socket.on("cancel", (ack) => {
        console.log("Received cancel from react client");
        const executorSocketId = executorMap.get(socket.id);
        
        if (executorSocketId) {
            io.to(executorSocketId).emit("canceled");
        }
        ack();
    });

    socket.on("writeTo", (data) => {
        for (const [clientSocketId, executorSocketId] of executorMap) {
            if (executorSocketId === socket.id) {
                io.to(clientSocketId).emit("writeTo", data);
                break ;
            }
        }
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