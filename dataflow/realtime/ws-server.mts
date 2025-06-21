import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "./socket-types";

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

    socket.on("writeTo", (data) => {
        const clientSocketId = executorToClient.get(socket.id);

        if (clientSocketId) {
            io.to(clientSocketId).emit("writeTo", data);
        }
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

console.log("Socket.IO server running at ws://localhost:3001/ws");