import { useEffect } from "react";
import { useRealTimeContext } from "../contexts/RealTimeContext";
import { ServerToClientEvents } from "../realtime/socket-types";

type EventName = keyof ServerToClientEvents;

export default function useWebSocketEvent<E extends EventName>(
    event: E,
    listener: ServerToClientEvents[E]
) {
    const { socket } = useRealTimeContext();

    useEffect(() => {
        // @ts-expect-error: TypeScript cannot infer the correct overload, but this is safe
        socket?.on(event, listener);

        return () => {
            // @ts-expect-error: TypeScript cannot infer the correct overload, but this is safe
            socket?.off(event, listener);
        }
    }, [socket]);
}
