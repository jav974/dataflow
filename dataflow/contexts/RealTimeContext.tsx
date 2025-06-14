import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Log } from "../engine/types";
import { eventBus } from "../events/events";
import { ClientToServerEvents, ServerToClientEvents } from "../realtime/socket-types";

interface RealTimeProviderProps {
    url?: string;
    children: React.ReactNode;
}

interface RealTimeProviderType {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
}

export const RealTimeContext = createContext<RealTimeProviderType | null>(null);

export function RealTimeProvider({ url, children }: RealTimeProviderProps) {
    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

    useEffect(() => {
        if (!url) return ;

        const socket = io(url, { path: "/ws" });
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected to Socket.IO server");
        });

        socket.on("writeTo", (data: Log) => {
            eventBus.emit<Log>('io_write', data);
        });

        return () => {
            socket.disconnect();
        };
    }, [url]);

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
