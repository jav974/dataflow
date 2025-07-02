import React, { createContext, useContext, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@dataflow-ide/dataflow-core";
import { useRefState } from "../hooks/useRefState";

interface RealTimeProviderProps {
    url?: string;
    children: React.ReactNode;
}

interface RealTimeProviderType {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
}

export const RealTimeContext = createContext<RealTimeProviderType | null>(null);

export function RealTimeProvider({ url, children }: RealTimeProviderProps) {
    const socketRef = useRefState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

    useEffect(() => {
        if (!url) return ;

        const socket = io(url, { path: "/ws", transports: ["websocket"] });
        socketRef.update(socket);

        socket.on("connect", () => {
            console.log("Connected to Socket.IO server");
        });

        return () => {
            socket.disconnect();
        };
    }, [url, socketRef]);

    return (
        <RealTimeContext.Provider value={{
            socket: socketRef.current,
        }}>
            {children}
        </RealTimeContext.Provider>
    );
}

export function useRealTimeContext() {
    const context = useContext(RealTimeContext);
    if (!context) {
        throw new Error('useRealTimeContext must be used within a RealtimeProvider');
    }
    return context;
}
