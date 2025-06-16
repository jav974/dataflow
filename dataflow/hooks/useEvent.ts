import { useEffect, useState } from "react";
import { subscribe, unsubscribe } from "../events/events";

export function useEvent<T>(name: string, listener: (payload: T) => void): void;
export function useEvent<T>(name: string, listener: (payload: T | null) => void): void;
export function useEvent<T>(name: string, listener: (payload: T | undefined) => void): void;
export function useEvent<T>(name: string, listener: (payload: T | null | undefined) => void): void {
    useEffect(() => {
        subscribe(name, listener);

        return () => {
            unsubscribe(name, listener);
        }
    }, [name, listener]);
}

export function useEventState<T>(name: string): T;
export function useEventState<T>(name: string): T | null;
export function useEventState<T>(name: string): T | undefined;
export function useEventState<T>(name: string): T | null | undefined {
    const [state, setState] = useState<T | null | undefined>();
    useEvent<T>(name, setState);

    return state;
}
